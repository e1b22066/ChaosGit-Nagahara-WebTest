const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const filesDirectory = '';

const wss = new WebSocket.Server({ port: 8080 });

app.get('/files', (req, res) => {
    const files = fs.readdirSync(filesDirectory);
    res.json(files);
});

app.get('/file/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(filesDirectory, filename);
    fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
            res.status(500).send(`Error reading file: ${err.message}`);
        } else {
            res.send(content);
        }
    });
});

app.post('/file/save', (req, res) => {
    const { filename, content } = req.body;
    const filePath = path.join(filesDirectory, filename);
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            res.status(500).send(`Error saving file: ${err.message}`);
        } else {
            res.send('File saved successfully');
        }
    });
});

app.get('/file-tree', (req, res) => {
    const dirPath = decodeURIComponent(req.query.dir || filesDirectory);
    fs.readdir(dirPath, { withFileTypes: true }, (err, items) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const result = items
                .filter(item => !item.name.startsWith('.'))  // 隠しファイルを除外
                .map(item => ({
                    name: item.name,
                    path: path.join(dirPath, item.name),
                    isDirectory: item.isDirectory()
                }));
            res.json(result);
        }
    });
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
