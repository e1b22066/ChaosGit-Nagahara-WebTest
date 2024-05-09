const express = require('express');
const fs = require('fs');
const WebSocket = require('ws');
const app = express();

// ファイルが保存されているディレクトリのパス
const filesDirectory = '/home/takeaki';

// WebSocketサーバーの設定
const wss = new WebSocket.Server({ port: 8080 });

// ファイルリストを取得するエンドポイント
app.get('/file', (req, res) => {
    const file = fs.readdirSync(filesDirectory);
    res.json(file);
});

// 選択されたファイルの内容を取得するエンドポイント
app.get('/file/:filename', (req, res) => {
    const filename = req.params.filename;
    const content = fs.readFileSync(`${filesDirectory}/${filename}`, 'utf-8');
    res.send(content);
});

// ファイルの保存を行うエンドポイント
app.post('/file/save', (req, res) => {
    const { filename, content } = req.body;
    fs.writeFileSync(`${filesDirectory}/${filename}`, content);
    res.send('File saved successfully');
});

// WebSocketサーバーの処理
wss.on('connection', function connection(ws) {
    const { spawn } = require('child_process');
    const shell = spawn('bash');

    ws.on('message', function incoming(message) {
        shell.stdin.write(message + '\n');
    });

    shell.stdout.on('data', function (data) {
        ws.send(data.toString());
    });

    shell.stderr.on('data', function (data) {
        ws.send(data.toString());
    });

    shell.on('close', function (code) {
        ws.close();
    });
});
// 

// Expressサーバーの起動
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
