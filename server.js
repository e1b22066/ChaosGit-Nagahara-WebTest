const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const cors = require('cors');
const pty = require('node-pty'); // Add this

const app = express();
app.use(bodyParser.json());
app.use(cors());

const filesDirectory = '';

const wss = new WebSocket.Server({ port: 6060 });

app.get('/files', (req, res) => {
    const files = fs.readdirSync(filesDirectory);
    res.json(files);
});

app.post('/rmGitdir', (req, res) => {
    exec('sh ./shell-scripts/rmGitdir.sh', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.status(500).send('Error destroying .git directory');
        }
        res.send(stdout);
    });
});

app.post('/execute-script', (req, res) => {
    const scriptPath = './shell-scripts/touchFile.sh';

    exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.json({ success: false, error: stderr });
        }
        console.log(`Script output: ${stdout}`);
        res.json({ success: true });
    });
});

wss.on('connection', function connection(ws) {
    // Spawn a pseudo-terminal
    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        // cols: 80,
        // rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    shell.on('data', function (data) {
        ws.send(data);
    });

    ws.on('message', function incoming(message) {
        shell.write(message);
    });

    ws.on('close', function () {
        shell.kill();
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
