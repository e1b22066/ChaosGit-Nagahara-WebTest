import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import WebSocket, { WebSocketServer } from 'ws'; 
import cors from 'cors';
import pty from 'node-pty';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const filesDirectory = '';

const wss = new WebSocketServer({ port: 6060 });

wss.on('connection', function connection(ws) {
    // ターミナルを起動
    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        cwd: process.env.HOME,
        env: process.env
    });

    // ターミナルのデータをクライアントに送信
    shell.on('data', function (data) {
        ws.send(data);
    });

    // クライアントからのメッセージをターミナルに送信
    ws.on('message', function incoming(message) {
        shell.write(message);
    });

    // クライアントが切断された際にターミナルを終了
    ws.on('close', function () {
        shell.kill();
    });
});

// シェルスクリプト実行用エンドポイント
app.post('/check-branch', (req, res) => {
    const scriptPath = './shell-scripts/checkScripts/checkMainBranch.sh';

    exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            return res.json({ success: false, message: stdout || 'Error occurred' });
        }
        res.json({ success: true, message: stdout });
    });
});

app.post('/execute-script', (req, res) => {
    const { shellScript } = req.body; 
    exec(`sh ${shellScript}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.json({ success: false, error: stderr });
        }
        console.log(`Script output: ${stdout}`);
        res.json({ success: true, output: stdout });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
