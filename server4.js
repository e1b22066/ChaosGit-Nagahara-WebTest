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

// Define validation endpoints
// app.post('/validate-git-init', (req, res) => {
//   const { directory } = req.body;

//   if (!directory) {
//     return res.status(400).json({ success: false, message: 'Directory path is required.' });
//   }

//   const gitFolder = path.resolve(directory, '.git'); // Ensure path is resolved correctly

//   if (fs.existsSync(gitFolder)) {
//     res.json({ success: true, message: '.git folder found, Git initialized correctly.' });
//   } else {
//     res.json({ success: false, message: 'Git not initialized in the specified directory.' });
//   }
// });

// app.post('/execute-command', (req, res) => {
//   const { command } = req.body;
  
//   if (!command) {
//       return res.status(400).json({ error: 'Command not provided.' });
//   }

//   exec(command, (error, stdout, stderr) => {
//       if (error) {
//           return res.status(500).json({ error: stderr.trim() });
//       }
//       res.send(stdout.trim());
//   });
// });

// // You can add more validation endpoints as needed
// app.post('/validate-branch', (req, res) => {
//   const { branchName } = req.body;
//   // Example logic to validate branch creation
//   // Implement actual Git repository validation here
//   res.json({ success: true, message: `Branch ${branchName} validation not yet implemented.` });
// });

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Create a WebSocket server using the HTTP server
const wss = new WebSocketServer({ server });
let players = [];

// app.post('/check-branch', (req, res) => {
//   const scriptPath = './shell-scripts/checkScripts/checkMainBranch.sh';

//   exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
//     if (error) {
//         console.error(`Error executing script: ${stderr}`);
//         return res.json({ success: false, message: stdout || 'Error occurred' });
//     }
//     res.json({ success: true, message: stdout });
//   });
// });

// app.post('/check-init', (req, res) => {
//   const scriptPath = './shell-scripts/checkScripts/checkGitInit.sh';

//   exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing script: ${stderr}`);
//       return res.json({ success: false, message: stdout || 'Error occurred' });
//     }
//     res.json({ success: true, message: stdout });
//   });
// });

// app.post('/check-usr', (req, res) => {
//   const scriptPath = './shell-scripts/checkScripts/checkUsrRegister.sh';

//   exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error executing script: ${stderr}`);
//       return res.json({ success: false, message: stdout || 'Error occurred' });
//     }
//     res.json({ success: true, message: stdout });
//   });
// });

app.post('/check-task', (req, res) => {
  const { type } = req.body;

  if (!type) {
    return res.status(400).json({ success: false, message: 'Task type is required.' });
  }

  const scriptMap = {
    'check-init': './shell-scripts/checkScripts/checkGitInit.sh', // task1
    'check-branch': './shell-scripts/checkScripts/checkMainBranch.sh', // task2
    'check-usr': './shell-scripts/checkScripts/checkUsrRegister.sh', // task3
    'check-url': './shell-scripts/checkScripts/checkURL.sh', // task4
    'check-push': './shell-scripts/checkScripts/checkPush.sh', // task5
    'check-ignore': './shell-scripts/checkScripts/checkIgnore.sh', // task6
    'check-jcommit':'./shell-scripts/checkScripts/checkCommitJava.sh', // task7
    'check-back':'./shell-scripts/checkScripts/checkBack.sh', // task8
    'check-newbranch':'./shell-scripts/checkScripts/checkNewBranch.sh', // task9
    'check-merge':'./shell-scripts/checkScripts/checkMerge.sh' // task10
    // Add more task types and their corresponding script paths as needed
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
