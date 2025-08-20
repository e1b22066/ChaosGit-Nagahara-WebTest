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


// 許可するオリジンのリスト
const allowedOrigins = [
  'http://127.0.0.1:5501',  // Live Server
  'http://localhost:4200'   // localhost:4200
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // 許可されたオリジンか、またはオリジンが指定されていない場合（例: Postmanからのリクエスト）
      callback(null, true);
    } else {
      // 許可されていないオリジン
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

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
let correct_flag = 0;
let cause_flag = 0;
let chat_count = 0;
let review_sabotage_count = 0;
let first_correct_flag = 0;
let firstCorrect; 
let inventor;
let correction;
let corrector;
let correctors = [];
let usinghint = [];
let talking;
let start;
let end;

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

//タスクの基本的な振り返りデータ
let getTaskReviewData = [];

//障害発生時の振り返りデータ
let getSabotageReviewData = [];

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
      start = process.hrtime();
      console.log('sabotage1 executed');
    } else if (type === 'check-back') {  // Task9
      triggerSabotage('sabo-addGabageFile');
      start = process.hrtime();
      console.log('sabotage2 executed');
    } else if (type === 'check-newbranch') { // Task10
      triggerSabotage('sabo-conflict');
      start = process.hrtime();
      console.log('sabotage3 executed');
    }
  });
});

//終了時に表を出力している画面に遷移
app.post('/complete-task', (req, res) => {
  /* 
  **************************************************************
      実験参加者の皆様へ
  　　この下のアドレスを指定されたものに書き換えてください
      例： const angularAppUrl = "http://192.168.xx.xx:4200/review"
  **************************************************************
  */
  const angularAppUrl = "http://localhost:4200/review"
  res.redirect(angularAppUrl);
});

//タスクの振り返りデータを提供するAPIエンドポイント
app.get('/api/review-task-data', (req, res) => {
    const data = getTaskReviewData;
    res.json(data);
});

//障害発生時の振り返りデータを提供するAPIエンドポイント
app.get('/api/review-sabotage-data', (req, res) => {
    const data = getSabotageReviewData;
    res.json(data);
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
        const tasks = [
            {description:  '\nターミナルにコマンドを入力して現在のディレクトリに新規のGitリポジトリを作成してください．\nここで作成したGitリポジトリをローカルリポジトリとして開発を進めます．'},
            {description:  '\nGitで作業を記録するために，指定の名前とメールアドレスを設定してください．\nこの情報はコミット履歴に記録されます．\n名前：user\nメールアドレス：user@example.com'},
            {description: '\nMain.javaというファイルを作成し，コミットメッセージとともにコミットを作成してください．\nコミットにはコミットメッセージが必ず必要です．\nMain.javaには何も書き込まなくても構いません．\npushはまだしないでください．'},
            {description:  '\nGitのデフォルトブランチ名はmasterになっています。\nこのブランチをmainに変更してください.\n'},
            {description: '\nリモートリポジトリとローカルリポジトリが連携できるように，ローカルリポジトリに\nリモートリポジトリを登録してください．\nGitHub上でリモートリポジトリのURLを選択する際に\nHTTPSではなくSSH用のアドレスを選んで登録してください．'}, // 被験者混乱（リポジトリアクセス権の問題？）
            {description:  '\n作成したローカルリポジトリの内容をリモートリポジトリに反映させるために\nmainブランチをリモートリポジトリへpushしてください．'},
            {description:  '\nプロジェクトに不要なファイルをコミットしないように，.gitignoreを作成してください.\nこのファイルには.classファイルを無視する設定を追加しコミットしてリモートリポジトリへ\npushしてください．'},
            {description:  '\n"Hello World!"を表示させるMain.javaを作成し，コミットを作成してください．\npushはしないでください．'},
            {description:  '\n過去のコミットに誤りがあった場合に備え，手戻りを行う方法を学びましょう．\nrevertコマンドを使って最新のコミットを取り消してください．'},
            {description:  '\ngit logコマンドで今までのコミットが正しいか（意図通りか）確認してください．\nその後，新しい機能を開発するために"feature-xyz"という名前のブランチを作成してください．\nfeature-xyzブランチに移動して，"Hello Monster!"と表示されるような\nMonster.javaを作成しリモートにpushしてください．'},
            {description:  '\nfeature-xyzブランチの作業をmainブランチに反映させるために\nPull Requestを作成してください．\nその後，Pull Requestを利用して-GitHub上でマージを行ってください．\nリモートリポジトリでのマージはローカルに反映させてください．'},
            {description:  '\nmainブランチに切り替え，プロジェクトのリリースに向けてv1.0タグを作成し\nタグをリモートリポジトリへpushしてください．'},
        ];

        const Sabotagetasks = [
          {description: "githubに不適切な更新があり、pushできない"},
          {description: "gitのログに、心当たりのないコミットがある"},
          {description: "gitHubのマージ時に、同一のファイルの更新内容が複数ある"},
        ]

        getTaskReviewData.push(
          {No: gameState.currentTaskIndex+1, taskContent: tasks[gameState.currentTaskIndex].description, who: data.name, task_count: data.task_count, chat_count: chat_count},
        );
        const index = gameState.currentTaskIndex + 1;
        console.log("No:"+ index + ", taskContent:" + tasks[gameState.currentTaskIndex].description + ", who:" + data.name + ", task_count:" +  data.task_count + ", chat_count:" + chat_count);

        if(gameState.currentTaskIndex == 7 || gameState.currentTaskIndex == 10 || gameState.currentTaskIndex == 11){
          end = process.hrtime();
          const elapsedTime = end[0] - start[0]; // 秒単位で
          console.log(`Task ${gameState.currentTaskIndex + 1} completed in ${elapsedTime} seconds.`);
          getSabotageReviewData.push(
            {No: gameState.currentTaskIndex+1, 
             sabotageContent: Sabotagetasks[review_sabotage_count].description,
             first: firstCorrect,       //障害発見者
             inventor: inventor,    //修正案発案者
             correction: correction,  //修正方法
             corrector: corrector,   //修正者
             correctors: correctors, //障害内容正答者
             usinghint: usinghint,   //ヒント使用者
             talking: talking,      //障害についての話し合い
             time: elapsedTime,        //障害発生から修正までの時間
            }
          );
          review_sabotage_count++;
        }
        advanceTask();0
        broadcastGameState();
        correct_flag = 0;
        cause_flag = 0;
        chat_count = 0;
      }

      // Trigger discussion phase
      if (data.type === 'reportIssue') {
        checkReport_count++;
        checkReport.push(data); 
        const messages = checkReport.map(r => r.message);
        let correct = "";
        
        console.log(messages);

        const correctMap = [
          {description: "思い当たらないファイルがGitHubにある", }, // task7
          {description: "思い当たらないコミットが履歴にある", },   // task10
          {description: "Monster.javaの編集内容が衝突してる", }      // task11
        ];
        
        if(gameState.currentTaskIndex < 7){
           correct = correctMap[0].description;
           console.log("index:" + gameState.currentTaskIndex + "task7:" + correct);
        }else if(gameState.currentTaskIndex < 10){
           correct = correctMap[1].description; 
           console.log("index:" + gameState.currentTaskIndex + "task10:" + correct);
        }else{
           correct = correctMap[2].description;
           console.log("index:" + gameState.currentTaskIndex + "task11:" + correct);
        }

        let result = await isCorrectMeaning(messages[checkReport_count-1], correct);
        if(result === 'YES'){
          console.log("一致");
          correct_flag = 1;
          if(first_correct_flag === 0){
            firstCorrect = data.name;
            firstCorrect_flag = 1;
          }
          if(correct_count === 3){
            correct_count = 0;
            first_correct_flag = 0;
            firstCorrect = "";
            correction = "";
            inventor = "";
            correctors = [];
            usinghint = [];
          }
          correctors.push(data.name);
          correct_count++;
          correct_name.push(checkReport.find(r => r.message === messages[checkReport_count - 1]));
          if(cause_flag === 1 && correct_count === 3){
            talking = "した";
            broadcast({ 
              type: 'reportCause',
              correct_count: correct_count,
              correct_flag: correct_flag 
            });
            return;
          }
          talking = "してない";
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

      if(data.type === 'reportCause'){   //障害内容わからない
        console.log("障害内容不明");
        cause_flag = 1;
        if(correct_count === 3){
            correct_count = 0;
            first_correct_flag = 0;
            firstCorrect = "";
            correction = "";
            inventor = "";
            correctors = [];
            usinghint = [];
          }
          correct_count++;
        broadcast({ 
          type: 'reportCause',
          correct_count: correct_count,
          correct_flag: correct_flag 
        });
      }

      if(data.type === 'reportPlace'){   //障害場所わからない
        let place = "";
        console.log("障害場所不明");
        const placeMap = [
          {description: "GitHubをよくみてください", }, // task7
          {description: "コミットの履歴をよく見てください", },   // task10
          {description: "gitHubのMonster.javaをみてください", }      // task11
        ];

        usinghint.push(data.name);
        
        if(gameState.currentTaskIndex < 7){
           place = placeMap[0].description;
           console.log("index:" + gameState.currentTaskIndex + "task7:" + place);
        }else if(gameState.currentTaskIndex < 10){
           place = placeMap[1].description; 
           console.log("index:" + gameState.currentTaskIndex + "task10:" + place);
        }else{
           place = placeMap[2].description;
           console.log("index:" + gameState.currentTaskIndex + "task11:" + place);
        }
        broadcast({ 
          type:"reportPlace",
          name: data.name,
          place: place
        });
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
        chat_count++;
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
                inventor = target.name;
                correction = target.message;
                corrector = playerName[randomIndex];
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