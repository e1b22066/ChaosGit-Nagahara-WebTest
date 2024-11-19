import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const PORT = 8080;

// Create an Express app
const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5501' }));


// Create an HTTP server using the Express app
const server = http.createServer(app);

// Create a WebSocket server using the HTTP server
const wss = new WebSocketServer({ server });
let players = [];

const sabotageMap = {
  'sabo-pushRemote':'./shell-scripts/sabotages/pushRemote.sh',
  'sabo-addGabageFile':'./shell-scripts/sabotages/addGabageFile.sh',
  'sabo-conflict':'./shell-scripts/sabotages/conflict.sh'
};

function triggerSabotage(taskType) {
  const sabotageScript = sabotageMap[taskType];
  if (sabotageScript) {
    exec(`sh ${sabotageScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing sabotage script (${taskType}):`, stderr);
      } else {
        console.log(`Sabotage executed for task ${taskType}:`, stdout);
        broadcast({ type: 'sabotage', taskType });
      }
    });
  }
}

app.post('/check-task', (req, res) => {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ success: false, message: 'Task type is required.' });
  }

  const scriptMap = {
    'check-init': './shell-scripts/checkScripts/checkGitInit.sh', // task1
    'check-usr': './shell-scripts/checkScripts/checkUsrRegister.sh', // task2
    'check-initcommit': './shell-scripts/checkScripts/checkInitCommit.sh', // task3
    'check-branch': './shell-scripts/checkScripts/checkMainBranch.sh', // task4
    'check-url': './shell-scripts/checkScripts/checkURL.sh', // task5
    'check-push': './shell-scripts/checkScripts/checkPush.sh', // task6
    'check-ignore': './shell-scripts/checkScripts/checkIgnore.sh', // task7
    'check-jcommit':'./shell-scripts/checkScripts/checkCommitJava.sh', // task8
    'check-back':'./shell-scripts/checkScripts/checkBack.sh', // task9
    'check-newbranch':'./shell-scripts/checkScripts/checkNewBranch.sh', // task10
    'check-merge':'./shell-scripts/checkScripts/checkMerge.sh', // task11
    'check-release':'./shell-scripts/checkScripts/checkRelease.sh' // task12
  };

  const scriptPath = scriptMap[type];

  if (!scriptPath) {
    return res.status(400).json({ success: false, message: `Unknown task type: ${type}` });
  }

  exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script (${type}):`, stderr);
      return res.json({ success: false, message: stderr || 'Error occurred' });
    }

    res.json({ success: true, message: stdout });

    // Sabotage trigger
    if (type === 'check-push') { // Task6
      triggerSabotage('sabo-pushRemote');
      console.log('sabotage1 executed');
    } else if (type === 'check-back') {  // Task9
      triggerSabotage('sabo-addGabageFile');
      console.log('sabotage2 executed');
    } else if (type === 'check-newbranch') { // Task10
      triggerSabotage('sabo-conflict');
      console.log('sabotage3 executed');
    }
  });
});

wss.on('connection', (ws) => {
  players.push(ws);
  console.log(`Player connected. Total players: ${players.length}`);

  // Notify all clients about the number of connected players
  broadcast({ type: 'playerCount', count: players.length });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Start game
      if (data.type === 'startGame' && players.length >= 2) {
        broadcast({ type: 'startGame' });
      }

      // Trigger discussion phase
      if (data.type === 'reportIssue') {
        broadcast({ type: 'enterDiscussion' });
      }

    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    players = players.filter(player => player !== ws);
    console.log(`Player disconnected. Total players: ${players.length}`);
    broadcast({ type: 'playerCount', count: players.length });
  });
});

function broadcast(data) {
  players.forEach((player) => {
    player.send(JSON.stringify(data));
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is also available at ws://localhost:${PORT}`);
});
