import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import minimist from 'minimist';
import { Socket } from 'dgram';
import { count } from 'console';
import dotenv from 'dotenv';
import axios from 'axios';


// __dirname の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//ポート番号変更
//
const PORT = 8080;

const args = minimist(process.argv.slice(2));

// Create an Express app
const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5501' }));

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Create a WebSocket server using the HTTP server
const wss_system = new WebSocketServer({ server }); //8080
const wss_chat = new WebSocketServer({ port:8081 });

//global variable

let checkReport_count = 0;
let correct_count = 0;
let correct_name = [];
let discorrect_name = [];

// 障害発生時の障害内容
//   格納内容{
//     id: this.generateId(),
//     type: "reportIssue",
//     name: this.name,
//     message: document.getElementById('checkMsgInput').value
//    }    
let checkReport = [];    

// サーバーに届いたすべてのチャットメッセージ
//   格納内容{
//     id: this.generateId(),
//     type: "chat",
//     name: this.name,
//     message: document.getElementById('msgInput').value,
//     time: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
//   }  
let globalMessages = []; 

//　参加した実験者の名前
let playerName = [];    

//  投票内容
//    格納内容{
//      id: this.generateId(),
//      type: "vote",
//      name: this.name,
//      message: document.getElementById('msgInput').value,
//      time: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
//      voteCount: 0
//     }
let voteMessage = [];

let gameState = {
  currentTaskIndex: 0,
  players: [],
};

//生成AI周り

dotenv.config({ path: path.resolve(__dirname, '../APIキー/.env') });
const API_KEY = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY =", API_KEY);

//

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
    'check-release':'./shell-scripts/checkScripts/checkTag.sh' // task12
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

//Game WebSocket
wss_system.on('connection', (ws) => {
  gameState.players.push(ws);
  console.log(`Player connected. Total players: ${gameState.players.length}`);

  // Notify all clients about the number of connected players
  broadcast({ type: 'playerCount', count: gameState.players.length });

  ws.on('message', async (message) => {
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
        checkReport_count++;
        checkReport.push(data);
        const correct = "ありがとうございました。"; 
        const messages = checkReport.map(r => r.message);
        
        console.log(messages);
        /*
        if(gameState.currentTaskIndex >= 100){
          //task分け
          
        }
          */

        let result = await isCorrectMeaning(messages[checkReport_count-1], correct);
        if(result === 'YES'){
          console.log("一致");
          correct_count++;
          correct_name.push(checkReport.find(r => r.message === messages[checkReport_count - 1]));
          broadcast({ 
            type: 'clickReport',
            flag: 0,
            name: data.name,
            correct_count: correct_count
          });
        }
        else if(result === 'NO'){
          console.log("不一致");
          correct_name.push(checkReport.find(r => r.message === messages[checkReport_count - 1]));
          broadcast({ 
            type: 'clickReport',
            flag: 1,
            name: data.name,
            correct_count: correct_count
          });
        }
      }

      if(data.type === 'cancelReport'){
        checkReport_count--;
        const index = checkReport.findIndex(m => m.id === data.id);
         if (index !== -1) {
           checkReport.splice(index, 1); 
         }
        console.log("checkReport_count = " + checkReport_count);
        broadcast({ type: 'cancelReport' });
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

//Chat WebSocket
wss_chat.on('connection', (ws) => {
  //クライアント識別,wsが接続したクライアント
  const uuid = crypto.randomUUID();
  ws.send(JSON.stringify({uuid}));

  //メッセージ受信処理
  ws.on('message', (data) => {
    try {
      const json = JSON.parse(data);
      
      if(json.type === "name"){
        playerName.push(json.name);
        console.log("name is " + json.name);
      }

      if(json.type === "voteCancel"){
         const index = voteMessage.findIndex(m => m.id === json.activePps);
         if (index !== -1) {
           voteMessage.splice(index, 1);
         }

         const voteCancel = {
            type: "voteCancel",
            id: json.activePps
          };

         wss_chat.clients.forEach((client) => {
          //メッセージ送信先クライアントがメッセージ受信クライアントの判定を設定
          json.mine = ws === client;
          if(client.readyState === WebSocket.OPEN){
            //メッセージ送信
            client.send(JSON.stringify(voteCancel));
          }
        });
      }

      if(json.type === "chat"){
        if(!json.message) return;
        //Websocket 接続中のクライアント対象にメッセージ送信
        wss_chat.clients.forEach((client) => {
          //メッセージ送信先クライアントがメッセージ受信クライアントの判定を設定
          json.mine = ws === client;
          if(client.readyState === WebSocket.OPEN){
            //メッセージ送信
            client.send(JSON.stringify(json));
            globalMessages.push(json); // ← ここで保存
          }
        });
      }
      
      if(json.type === "vote"){
        if(!json.message) return;
        //Websocket 接続中のクライアント対象にメッセージ送信
        wss_chat.clients.forEach((client) => {
          //メッセージ送信先クライアントがメッセージ受信クライアントの判定を設定
          json.mine = ws === client;
          if(client.readyState === WebSocket.OPEN){
            //メッセージ送信
            client.send(JSON.stringify(json));
            //globalMessages.push(json); // ← ここで保存
            if(json.type === "vote"){
              voteMessage.push(json);
            }
          }
        });
      }

      if(json.type === "goodclickOn" || json.type === "goodclickOff"){
        const target = voteMessage.find(m => m.id === json.targetMessageId);  //どのメッセージかを識別するid
         let taskName = "null";
         let randomIndex = 0;
         let decide_flag = 0;
         
          if(json.type === "goodclickOn"){
            target.voteCount++;
          }
          if(json.type === "goodclickOff"){
            target.voteCount--;
          }

          if(target.voteCount === 3){
            while(decide_flag === 0){
              randomIndex = Math.floor(Math.random() * playerName.length);
              if(target.name !== playerName[randomIndex]){
                taskName = playerName[randomIndex];
                decide_flag = 1;
              }
            }
              console.log(`選ばれたPlayer: ${taskName}`);
          }

          const CountUpdate = {
            type: "goodclick",
            targetMessageId: target.id,
            voteCount: target.voteCount,
            taskName: taskName
          };

          wss_chat.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN){
              //メッセージ送信
              client.send(JSON.stringify(CountUpdate));
            }
          });
          const index = voteMessage.findIndex(m => m.id === json.targetMessageId);
          if (index !== -1) {
            voteMessage[index] = target;
          }
      }  
    } catch (error) {
      console.error('Error parsing message:', error);
    }
    });
});

function broadcast(data) {
  gameState.players.forEach((player) => {
    player.send(JSON.stringify(data));
  });
}

async function isSameMeaning(text1, text2, text3) {
  const prompt = `
    次の3つの文が、文体や表現が異なっていても「伝えようとしている意味が同じ」かどうかを判断してください。
    同じ意味かどうかを柔軟に考え、以下のルールに従って日本語で1語のみ出力してください。

    【出力ルール】
    ・3つすべてが伝えようとしている意味が同じの場合 → YES
    ・すべて伝えようとしている意味が異なる場合 → NO
    ・文1だけ伝えようとしている意味が異なる場合 → 1
    ・文2だけ伝えようとしている意味が異なる場合 → 2
    ・文3だけ伝えようとしている意味が異なる場合 → 3

    【例】
    文1: 今日は雨が降っているので傘を持っていこう。
    文2: 外は雨が降っています。傘を持って行ったほうがいいです。
    文3: 昨日は晴れていたので散歩した。
    → 出力：3

    【判定対象】
    文1: ${text1}
    文2: ${text2}
    文3: ${text3}

    必ず上記のルールに従って、日本語で「YES」「NO」「1」「2」「3」のいずれか1つだけ出力してください。

    `;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const result = response.data.candidates[0].content.parts[0].text.trim();
    console.log('判定結果:', result);  

    return result;  // → YES / NO / 1 / 2 / 3 のいずれか
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return 'ERROR';
  }
}

async function isCorrectMeaning(text1, text2) {
  const prompt = `
    次の3つの文が、文体や表現が異なっていても「伝えようとしている意味が同じ」かどうかを判断してください。
    同じ意味かどうかを柔軟に考え、以下のルールに従って日本語で1語のみ出力してください。

    【出力ルール】
    ・伝えようとしている意味が同じの場合 → YES
    ・伝えようとしている意味が異なる場合 → NO

    【例】
    文1: 今日は雨が降っているので傘を持っていこう。
    文2: 外は雨が降っています。傘を持って行ったほうがいいです。
    → 出力：YES

    【判定対象】
    文1: ${text1}
    文2: ${text2}

    「YES」「NO」
    `;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const result = response.data.candidates[0].content.parts[0].text.trim();
    console.log('判定結果:', result);  

    return result; 
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return 'ERROR';
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`WebSocket server is also available at ws://localhost:${PORT}`);
});