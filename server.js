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

app.post('/check-branch', (req, res) => {
    const scriptPath = './shell-scripts/checkScripts/checkMainBranch.sh';

    exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            return res.json({ success: false, message: stdout  || 'Error occurred' });
        }
        res.json({ success: true, message: stdout });
    });
});

// app.post('/check-branch', (req, res) => {
//     // シェルスクリプトの実行
//     const scriptPath = './shell-scripts/checkScripts/checkMainBranch.sh';
//     console.log('Script path:', path.resolve('./shell-scripts/checkScripts/checkMainBranch.sh'));
//     exec('bash ./shell-scripts/checkScripts/checkMainBranch.sh', (error, stdout, stderr) => {
//         if (error) {
//             console.error(`exec error: ${error}`);
//             return res.json({ success: false, message: 'シェルスクリプトの実行に失敗しました' });
//         }
//         // シェルスクリプトの出力を確認
//         if (stdout.includes('Branch name successfully changed to \'main\'.')) {
//             res.json({ success: true, message: stdout.trim() });
//         } else {
//             res.json({ success: false, message: stdout.trim() });
//         }
//     });
// });

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
