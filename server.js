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

let playerCount = 0; // Current number of players
const maxPlayers = 3; // Maximum number of players

const tasks = []; // List of tasks
const connections = {}; // List of players

// app.get('/files', (req, res) => {
//     const files = fs.readdirSync(filesDirectory);
//     res.json(files);
// });

// app.post('/rmGitdir', (req, res) => {
//     exec('sh ./shell-scripts/rmGitdir.sh', (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error executing script: ${error}`);
//             return res.status(500).send('Error destroying .git directory');
//         }
//         res.send(stdout);
//     });
// });

// app.post('/execute-script', (req, res) => {
//     const scriptPath = './shell-scripts/touchFile.sh';

//     exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error executing script: ${error}`);
//             return res.json({ success: false, error: stderr });
//         }
//         console.log(`Script output: ${stdout}`);
//         res.json({ success: true });
//     });
// });

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

app.post('/execute-script', (req, res) => {
    const { shellScript } = req.body; 
    exec(`sh ${shellScript}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error}`);
            return res.json({ success: false, error: stderr });
        }
        console.log(`Script output: ${stdout}`);
        res.json({ success: true , output: stdout});
    });
})



wss.on('connection', function connection(ws) {
    // check the number of players
    if (playerCount >= maxPlayers) {
        ws.close(1000, 'Maximum number of players reached');
        return;
    }

    // Increment the player count
    const playerId = `player_${playerCount + 1}`;
    playerCount++;
    connections[playerId] = ws;

    // Send the player ID to the client
    ws.send(JSON.stringify({
        type: 'playerInfo',
        playerId,
        message: `Welcome, ${playerId}!`
    }));

    // terminal setup
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
        delete connections[playerId];
        playerCount--;
    });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
