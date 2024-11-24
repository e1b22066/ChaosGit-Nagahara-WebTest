import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import minimist from 'minimist';

const PORT = 8080;

const args = minimist(process.argv.slice(2));

// Create an Express app
const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5501' }));


// Create an HTTP server using the Express app
const server = http.createServer(app);

// Create a WebSocket server using the HTTP server
const wss = new WebSocketServer({ server });

let gameState = {
  currentTaskIndex: 0,
  players: [],
};

// ex) node server.js --taskIndex=3
// give specific taskIndex number - 2

if (args.taskIndex !== undefined) {
  const initialTaskIndex = parseInt(args.taskIndex, 10);
  if (!isNaN(initialTaskIndex) && initialTaskIndex >= 0) {
    gameState.currentTaskIndex = initialTaskIndex;
    console.log(`Starting with specified taskIndex: ${initialTaskIndex}`);
  } else {
    console.warn(`Invalid taskIndex provided: ${args.taskIndex}. Starting with taskIndex 0.`);
  }
} else {
  console.log(`No taskIndex specified. Starting with default taskIndex: 0.`);
}

function getCurrenGameState() {
  return gameState;
}

function broadcastGameState() {
  const stateMessage = JSON.stringify({ type: 'syncState', state: gameState });
  gameState.players.forEach(player => player.send(stateMessage));
}

function advanceTask() {
  gameState.currentTaskIndex++;
  console.log(gameState.currentTaskIndex);
  broadcastGameState();
}

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
  gameState.players.push(ws);
  console.log(`Player connected. Total players: ${gameState.players.length}`);

  // Notify all clients about the number of connected players
  broadcast({ type: 'playerCount', count: gameState.players.length });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Start game
      if (data.type === 'startGame' && gameState.players.length >= 2) {
        broadcast({ type: 'startGame' });
      }

      // Synchronize task progress
      if (data.type === 'clearTask') {
        advanceTask();
        broadcastGameState();
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
    gameState.players = gameState.players.filter(player => player !== ws);
    console.log(`Player disconnected. Total players: ${gameState.players.length}`);
    broadcast({ type: 'playerCount', count: gameState.players.length });
  });
});

function broadcast(data) {
  gameState.players.forEach((player) => {
    player.send(JSON.stringify(data));
  });
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is also available at ws://localhost:${PORT}`);
});
