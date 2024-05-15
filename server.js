const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const cors = require('cors'); // cors パッケージを追加

const app = express();
app.use(bodyParser.json());
app.use(cors()); // CORS を有効にする

const filesDirectory = '/home/takeaki';

const wss = new WebSocket.Server({ port: 8080 });

app.get('/files', (req, res) => {
    const files = fs.readdirSync(filesDirectory);
    res.json(files);
});

app.get('/file/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(filesDirectory, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    res.send(content);
});

app.post('/file/save', (req, res) => {
    const { filename, content } = req.body;
    const filePath = path.join(filesDirectory, filename);
    fs.writeFileSync(filePath, content);
    res.send('File saved successfully');
});

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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
