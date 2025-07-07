export class MainGameScene extends Phaser.Scene { //JavaScriptのライブラリ
    constructor() {
        super({ key: 'MainGameScene' });          //このSceneの名前
        this.tasks = [];
        this.currentTaskIndex = 0;
        this.gameState  = {
            playerPosition: { x: null, y: null }
        };
        this.clickReport_count = 0;
        this.clickReport_flag = 0;
        this.finishReport_flag = 0;
        this.activeRpt = "null";
    }

    init(data) {
        this.socket = data.socket;
        this.ws = data.ws;
        this.name = data.name;
    }

    preload() {                                   //画像・音声の読み込み
        this.load.image('GitHub', '../../assets/images/GitHub-button.png');
        this.load.image('Task', '../../assets/images/task-button.png');
        this.load.image('Task2', '../../assets/images/co_taskButton.png');
        this.load.image('message', '../../assets/images/message.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('terminalButton', '../../assets/images/terminal-button.png');
        this.load.image('closeButton', '../../assets/images/terminal-button.png');
        this.load.image('reportButton', '../../assets/images/report2.png');
        this.load.image('close-term-button', '../../assets/images/close-term-button.png');
        this.load.image('close-button', '../../assets/images/close.png');
        this.load.image('task-window', '../../assets/images/alert.png');
        this.load.image('hint', '../../assets/images/hint.png');
        this.load.image('check', '../../assets/images/check.png');
        this.load.image('task-clear', '../../assets/images/clear.png');
        this.load.image('map', '../../assets/images/map.png');
    }

    create() {
        this.resetHTMLList();//htmlをリセット

        this.createMessageWindow(); // メッセージウィンドウを作成

        console.log("this.socket = ", this.socket);
        console.log("this.ws = ", this.ws);
        console.log("this.name = ", this.name);


        // メッセージを表示するテキスト（初期は空の文字列）
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 300, '', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5, 0.5);

        this.createGitHubButton(); // GitHubボタンを作成
        this.createCheckButton(); // Checkボタンを作成
        this.createTerminalButton(); // Terminalボタンを作成
        this.createReportButton(); // Reportボタンを作成
        this.createMap();           // Mapの表示
        this.createPlayer();       // プレイヤーを作成
        this.setupInput();         // 入力設定
        this.setupSocketListeners(); // ソケットリスナの設定
        this.scenario();
        this.initChatSocket();      //WebSocketの初期化
        this.addChatUI();           //チャットUIをDOMで追加
        
        if(!this.isSocket){
        this.createopenjitsi();     //jitsi-meetボタン（例）
        //ゲーム操作側のサーバの受信処理
        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'syncState') {
                this.updateGameState(data.state);
                this.moveToNextTask();
            }
            /*
            if (data.type == 'enterDiscussion') {
                this.scene.start('DiscussionScene', { 
                    socket: this.socket ,
                    ws: this.ws,
                    addChatUI: this.addChatUI.bind(this),
                    sendMessage:this.sendMessage.bind(this),
                    initChatSocket: this.initChatSocket.bind(this),
                    createDiv: this.createDiv.bind(this),
                    createMessage: this.createMessage.bind(this),
                    resetHTMLList: this.resetHTMLList.bind(this),
                    generateId: this.generateId.bind(this)
                });
            }
            */

            if (data.type == 'moveToNextTask') {
                this.moveToNextTask();
            }

            if(data.type == 'clickReport'){
                this.someoneClickReport(data);
            }

            if(data.type == 'cancelReport'){
                this.someoneClickReport(data);
            }
            this.isSocket = true;
        });
    }
    }

    updateGameState(state) {
        this.currentTaskIndex = state.currentTaskIndex;
        this.showCurrentTask();
        
    }

    setupSocketListeners() {
        // Receive messages from the server
        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'playerInfo') {
                this.showMessage(data.message);
            }
        });
    }

    createTerminalButton() {
        const buttonScale = 0.5;
        const buttonWidth = this.textures.get('terminalButton').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('terminalButton').getSourceImage().height * buttonScale;
    
        const x = buttonWidth / 2 + 10; // 左端に配置
        const y = this.cameras.main.height - buttonHeight / 2 - 10; // 画面下端に近い位置
    
        this.add.image(x, y, 'terminalButton')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => this.openTerminal());
    }

    openTerminal() {
        window.open('../../term.html', '_blank');
    }

    createMessageWindow() {
        this.messageWindow = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 300, 'message')
            .setInteractive()
            .setScale(0.3)
    }

    createGitHubButton() {
        const buttonScale = 0.5;
        const buttonWidth = this.textures.get('GitHub').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('GitHub').getSourceImage().height * buttonScale;

        const x = this.cameras.main.width - buttonWidth / 2 - 10;
        const y = buttonHeight / 2 + 10;

        this.add.image(x - 35, y, 'GitHub')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => this.handleButtonClick());
    }

    // 位置とスケール，タスク内容を引数に渡すことによってタスクボタンを作成

    createTaskButton(x, y, scale, message) {
        const buttonScale = scale || 0.2;
        const buttonWidth = this.textures.get('Task').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('Task').getSourceImage().height * buttonScale;
    
        this.add.image(x, y, 'Task')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => this.showPopUpWindow(message));
    }

    createTaskButton2() {
        const buttonScale = 0.2;
        const buttonWidth = this.textures.get('Task2').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('Task2').getSourceImage().height * buttonScale;

        // ボタンの配置位置を設定
        const x = this.cameras.main.width - buttonWidth / 2 - 300;
        const y = buttonHeight / 2 + 300;

        // ボタンの生成とクリックイベントの設定
        this.add.image(x, y, 'Task2')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => {
                this.scene.start('CooperationTaskScene'); 
            });
    }

    createCheckButton(){

        const buttonScale = 0.5;
        const buttonWidth = this.textures.get('check').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('check').getSourceImage().height * buttonScale;

        const x = this.cameras.main.width - buttonWidth / 2 - 20;
        const y = this.cameras.main.height - buttonHeight / 2 - 10

        this.add.image(x, y, 'check')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => this.checkTask());

    }

    createMap() {
        this.map = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'map')
            .setInteractive()
            .setScale(0.3)
    }



    scenario() {
        this.tasks = [
            { description: 'タスク1：\nターミナルにコマンドを入力して現在のディレクトリに新規のGitリポジトリを作成してください．\nここで作成したGitリポジトリをローカルリポジトリとして開発を進めます．', type: 'check-init'},
            { description: 'タスク2：\nGitで作業を記録するために，指定の名前とメールアドレスを設定してください．\nこの情報はコミット履歴に記録されます．\n名前：user\nメールアドレス：user@example.com', type: 'check-usr'},
            { description: 'タスク3：\nMain.javaというファイルを作成し，コミットメッセージとともにコミットを作成してください．\nコミットにはコミットメッセージが必ず必要です．\nMain.javaには何も書き込まなくても構いません．\npushはまだしないでください．', type: 'check-initcommit'},
            { description: 'タスク4：\nGitのデフォルトブランチ名はmasterになっています。\nこのブランチをmainに変更してください.\n', type: 'check-branch'},
            { description: 'タスク5：\nリモートリポジトリとローカルリポジトリが連携できるように，ローカルリポジトリに\nリモートリポジトリを登録してください．\nGitHub上でリモートリポジトリのURLを選択する際に\nHTTPSではなくSSH用のアドレスを選んで登録してください．', type: 'check-url'}, // 被験者混乱（リポジトリアクセス権の問題？）
            { description: 'タスク6：\n作成したローカルリポジトリの内容をリモートリポジトリに反映させるために\nmainブランチをリモートリポジトリへpushしてください．', type: 'check-push'},
            { description: 'タスク7：\nプロジェクトに不要なファイルをコミットしないように，.gitignoreを作成してください.\nこのファイルには.classファイルを無視する設定を追加しコミットしてリモートリポジトリへ\npushしてください．', type: 'check-ignore'},
            { description: 'タスク8：\n"Hello World!"を表示させるMain.javaを作成し，コミットを作成してください．\npushはしないでください．', type: 'check-jcommit'},
            { description: 'タスク9：\n過去のコミットに誤りがあった場合に備え，手戻りを行う方法を学びましょう．\nrevertコマンドを使って最新のコミットを取り消してください．', type: 'check-back'},
            { description: 'タスク10：\ngit logコマンドで今までのコミットが正しいか（意図通りか）確認してください．\nその後，新しい機能を開発するために"feature-xyz"という名前のブランチを作成してください．\nfeature-xyzブランチに移動して，"Hello Monster!"と表示されるような\nMonster.javaを作成しリモートにpushしてください．', type: 'check-newbranch'},
            { description: 'タスク11：\nfeature-xyzブランチの作業をmainブランチに反映させるために\nPull Requestを作成してください．\nその後，Pull Requestを利用して-GitHub上でマージを行ってください．\nリモートリポジトリでのマージはローカルに反映させてください．', type: 'check-merge'},
            { description: 'タスク12：\nmainブランチに切り替え，プロジェクトのリリースに向けてv1.0タグを作成し\nタグをリモートリポジトリへpushしてください．', type: 'check-release'},
        ];
        this.showCurrentTask();
    }

    showCurrentTask() {
        const currentTask = this.tasks[this.currentTaskIndex];

        if (this.currentTaskIndex < 12) {
            this.messageText.setText(currentTask.description);
        } else {
            this.showCmpleteMessage();
        }
    }

    showMessage(message) {
        this.messageText.setText(message);
    }

    addChatUI(){
        // チャットUI用のDOM要素を追加（CSSは必要に応じて調整）
        const chatHTML =` 
        <div id="chatBox" style=" position: absolute; top: 100px; right: 10px;
         z-index: 1000;  /* ← 追加: これでPhaserより前に出る */
         width: 300px; background: rgba(0,0,0,0.5); color: white;
         padding: 10px; font-size: 14px;">
            <div class="title">チャット</div>
            <div calss="contents scroll" id="chat">
            <div calss="contents input">
                <div>
                    <input class="msg" type="text" id="msgInput" placeholder="message" />
                </div>
                 <button id="chatSendBtn"()">Send</button>
            </div>
            </div>
        </div>
        `;

        MainHTMLList.innerHTML = chatHTML;
        document.body.appendChild(MainHTMLList);

        const chatSendBtn = document.getElementById("chatSendBtn");
        if (chatSendBtn) {
            chatSendBtn.addEventListener("click", this.sendMessage.bind(this));
        } else {
            console.warn("chatSendBtn が見つかりませんでした");
        }
    }

    initChatSocket(){
        let uuid = null;

        //メッセージ受信処理
        this.ws.onmessage = (event) => {
            const json = JSON.parse(event.data);
            console.log("json = " + json);
            if(json.uuid){
                uuid = json.uuid;
            }else{
                console.log("Main");
                const chatDiv = document.getElementById('chat');
                if (chatDiv) {
                    console.log("chatDivあり");
                    console.log(json.message);
                    chatDiv.appendChild(this.createMessage(json));
                    chatDiv.scrollTo(0, chatDiv.scrollHeight);
                } else {
                    console.warn("chatDiv が存在しません。現在のシーンに #chat がありません。");
                }
            }
        };
    }

    //メッセージ送信処理
    sendMessage() {
        const now = new Date();
        const json = {
            id: this.generateId(),
            type: "chat",
            name: this.name,
            message: document.getElementById('msgInput').value,
            time: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
        };
        //メッセージ送信
        console.log("メッセージ送信");
        this.ws.send(JSON.stringify(json));  
        document.getElementById('msgInput').value = '';
    }

    // ここから下はDOM生成処理（メッセージ受信後のDOM生成）
    createMessage(json) {
        const side = json.mine ? 'mine' : 'other';
        const sideElement = this.createDiv(side);
        const sideTextElement = this.createDiv(`${side}-text`);
        const timeElement = this.createDiv('time');
        const nameElement = this.createDiv('name');
        const textElement = this.createDiv('text');
        timeElement.textContent = json.time;
        nameElement.textContent = json.name;
        textElement.textContent = json.message;
        sideElement.appendChild(sideTextElement);
        sideTextElement.appendChild(timeElement);
        sideTextElement.appendChild(nameElement);
        sideTextElement.appendChild(textElement);
        return sideElement;
    }

    createDiv(className){
        const element = document.createElement('div');
        element.classList.add(className);
        return element;
    }

    createopenjitsi(){
        const meetHTML=`<button id="openJitsi" 
                        style="position: fixed; 
                        top: 10px; left: 10px; z-index: 1000;">
                        Jitsiを開く     
                        </button>`;     

        const meetContainer = document.createElement('div');
        meetContainer.innerHTML = meetHTML;
        document.body.appendChild(meetContainer);

        const openJitsi = document.getElementById("openJitsi");
        if (openJitsi) {
            openJitsi.addEventListener("click", this.openMeet.bind(this));
        } else {
            console.warn("openJitsi が見つかりませんでした");
        }
    }

    openMeet(){
        const jitsiWindow = window.open("https://meet.jit.si//chaosGit-Test", "_blank");
        if (!jitsiWindow) {
            alert("ポップアップブロックを解除してください！");
        }
    }

    updateTask(task) {
        this.currentTask = task;
        this.messageText.setText(task.description);
    }

    showPopUpWindow(message) {
        // タスクウィンドウを表示
        const taskWindowScale = 0.3;
        this.taskWindow = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'task-window')
            .setInteractive()
            .setScale(taskWindowScale);

        // タスクウィンドウの幅と高さを取得
        const taskWindowWidth = this.taskWindow.displayWidth;
        const taskWindowHeight = this. taskWindow.displayHeight;
    
        // メッセージテキストを表示
        this.taskMessage = this.add.text(this.taskWindow.x, this.taskWindow.y - taskWindowHeight / 2 + 130, message, {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5, 0.5);
    
        // クローズボタンを作成
        this.closeButton = this.add.image(this.taskWindow.x + 500, this.taskWindow.y - taskWindowHeight / 2 + 80, 'close-button')
            .setInteractive()
            .setScale(0.2)
            .on('pointerdown', () => this.closeTaskWindow());;
    }
    
    showHint() {
        this.messageText.setText('');
    }

    checkTask() {
        const currentTask = this.tasks[this.currentTaskIndex];
        
        if (!currentTask) {
            this.showCmpleteMessage();
            return;
        }
        /* 
        **************************************************************
            実験参加者の皆様へ
        　　この下のアドレスを指定されたものに書き換えてください
            例： fetch('http://192.168.xx.xx:8080/check-task', {
        **************************************************************
        */
        fetch('http://localhost:8080/check-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: currentTask.type }) // Use the type from the current task
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.clearTask();
            } else {
                this.showPopUpWindow('タスクの実行に失敗しました: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.showPopUpWindow('エラーが発生しました');
        });
    }
    

    moveToNextTask() {
        this.walkPlayer();

        if (this.currentTaskIndex >= this.tasks.length) {
            this.showCmpleteMessage();
        }
    }

    someoneClickReport(data){
        const clickReportHTML = `
                        <div id="someoneClickReport" style="
                            display: none;
                            position: fixed;
                            top: 20%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            z-index: 9999;
                            background: rgba(0, 0, 0, 0.85);
                            color: white;
                            padding: 30px 50px;
                            font-size: 16px;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.5);
                            text-align: center;
                        ">
                        </div>
                        `;

                        // 要素作成と追加
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = clickReportHTML;
                        document.body.appendChild(wrapper);

                        const clickReportDiv = document.getElementById('someoneClickReport');

                        if(data.type === 'clickReport'){
                            this.clickReport_count++;
                        }else if(data.type === 'cancelReport'){
                            this.clickReport_count--;
                        }

                        clickReportDiv.innerHTML = `💡「${this.clickReport_count}人がSabotageの邪魔を見つけました」<br>
                                                        投票開始まで後${3-this.clickReport_count}人`;
                        clickReportDiv.style.display = 'block';

                        if(this.clickReport_count === 0){
                            clickReportDiv.style.display = 'none';
                        }

                        if(this.clickReport_count === 3){
                            clickReportDiv.style.display = 'none';
                            if(data.flag){   //全員一致で画面遷移
                                this.scene.start('DiscussionScene', { 
                                socket: this.socket,
                                ws: this.ws,
                                name: this.name,
                                addChatUI: this.addChatUI.bind(this),
                                sendMessage:this.sendMessage.bind(this),
                                initChatSocket: this.initChatSocket.bind(this),
                                createDiv: this.createDiv.bind(this),
                                createMessage: this.createMessage.bind(this),
                                resetHTMLList: this.resetHTMLList.bind(this),
                                generateId: this.generateId.bind(this)
                                });
                                return;
                            }

                            if(!data.flag){   //全員一致していなく画面遷移しない場合
                               clickReportDiv.innerHTML = ``;
                               clickReportDiv.innerHTML = `障害の内容にメンバー間で相違があります。」<br>
                                                        ${data.message}`;
                               clickReportDiv.style.display = 'block';
                               this.clickReport_count = 0;
                               this.clickReport_flag = 0;
                               this.finishReport_flag = 0;

                               // 5秒後に非表示にする
                               setTimeout(() => {
                                  clickReportDiv.style.display = 'none';
                               }, 5000);
                            }
                        }
    }

    showCmpleteMessage() {
        this.messageText.setText('すべてのタスクを完了しました！お疲れ様でした！');
    }

    clearTask() {
        const message = JSON.stringify({ type: 'clearTask' });
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.showTaskClearMessage();
            this.socket.send(message);
        } else {
            console.warn('Socket is not open. Cannot send message.');
        }
    }
    
    
    
    closeTaskWindow() {
        // タスクウィンドウに表示されているボタンを一緒に削除
        this.taskWindow.destroy();
        this.taskMessage.destroy();
        this.closeButton.destroy();
        // this.hintButton.destroy();
        // this.checkButton.destroy();
    }

    createReportButton() {
        const buttonScale = 0.4;
        const buttonWidth = this.textures.get('reportButton').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('reportButton').getSourceImage().height * buttonScale;

        // ボタンの配置位置を設定
        const x = this.cameras.main.width - buttonWidth / 2 - 300;
        const y = buttonHeight / 2 + 10;

        // ボタンの生成とクリックイベントの設定
        this.add.image(x, y, 'reportButton')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => {
                this.reportIssue();
            });
    }

    reportIssue() {
        //this.cancelReportButton();
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            if(this.clickReport_flag === 0 && this.finishReport_flag === 0){
                this.clickReport_flag = 1;
                this.checkReport();
                return;
            }

            if(this.clickReport_flag === 1 && this.finishReport_flag === 0){
                this.clickReport_flag = 0;
                if(this.checkReportDiv){
                    this.checkReportDiv.style.display = 'none';
                }
                return;
            }

            if(this.clickReport_flag === 1 && this.finishReport_flag === 1){
                const message = JSON.stringify({ 
                    type: 'cancelReport', 
                    id: this.activeRpt
                });
                this.clickReport_flag = 0;
                this.finishReport_flag = 0;
                this.socket.send(message);
            }
        } else {
            console.warn('Socket is not open. Cannot send message.');
        }
    }

    checkReport(){
        const checkReportHTML = `
                        <div id="checkReport" style="
                            display: none;
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            z-index: 9999;
                            background: rgba(0, 0, 0, 0.85);
                            color: white;
                            padding: 30px 50px;
                            font-size: 16px;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.5);
                            text-align: center;
                        ">
                        </div>
                        `;

                        // 要素作成と追加
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = checkReportHTML;
                        document.body.appendChild(wrapper);

                        this.checkReportDiv = document.getElementById('checkReport');

                        this.checkReportDiv.innerHTML = `障害の原因は何ですか？<br>
                                                  <div><input class="msg" type="text" id="checkMsgInput" placeholder="message" /></div>
                                                  <button id="checkSendBtn"()">Send</button>`;
                        this.checkReportDiv.style.display = 'block';

                        const checkSendBtn = document.getElementById("checkSendBtn");
                        if (checkSendBtn) {
                            checkSendBtn.addEventListener("click", this.checkSend.bind(this));
                        } else {
                            console.warn("checkSendBtn が見つかりませんでした");
                        }
    }

    checkSend(){
        this.checkReportDiv.style.display = 'none';
        this.finishReport_flag = 1;
        const json = {
            id: this.generateId(),
            type: "reportIssue",
            name: this.name,
            message: document.getElementById('checkMsgInput').value
        };

        this.activeRpt = json.id;

        //メッセージ送信
        console.log("メッセージ送信");
        this.socket.send(JSON.stringify(json));  
        document.getElementById('msgInput').value = '';
    }

    createPlayer() {

        if (this.currentTaskIndex > 0) {
            this.player = this.physics.add.sprite(this.gameState.playerPosition.x, this.gameState.playerPosition.y, 'player');
        } else {
            this.player = this.physics.add.sprite(this.cameras.main.centerX - 618, this.cameras.main.centerY - 22, 'player');
        }
        
        this.player.setCollideWorldBounds(true);

        this.gameState.playerPosition.x = this.player.x;
        this.gameState.playerPosition.y = this.player.y;
    }

    walkPlayer() {
        const moveDistance = 101;
        this.tweens.add({
            targets: this.player,
            x: this.player.x + moveDistance,
            duration: 500, // 0.5秒で移動
            ease: 'Power2',
            onComplete: () => {
                // 移動完了後の位置をgameStateに保存
                this.gameState.playerPosition.x = this.player.x;
                this.gameState.playerPosition.y = this.player.y;

                //console.log('Player Position:', this.gameState.playerPosition);
            }
        });
    }

    showTaskClearMessage() {
        const x = this.cameras.main.centerX;
        const y = this.cameras.main.centerY - 200;
    
        const taskClearImage = this.add.image(x, y, 'task-clear').setScale(0.5).setAlpha(0);
    
        // アニメーションでフェードイン
        this.tweens.add({
            targets: taskClearImage,
            alpha: 1,         // フェードイン: 完全に表示される
            duration: 500,    // 0.5秒かけてフェードイン
            ease: 'Power2',
            onComplete: () => {
                // 表示後、一定時間保持
                this.time.delayedCall(500, () => {
                    // フェードアウトのアニメーション
                    this.tweens.add({
                        targets: taskClearImage,
                        alpha: 0,     // フェードアウト: 完全に消える
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            taskClearImage.destroy(); // 画像を削除
                        }
                    });
                });
            }
        });
    }

    setupInput() {
        // this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        this.gameState.playerPosition.x = this.player.x;
        this.gameState.playerPosition.y = this.player.y;
    }

    handleButtonClick() {
        window.open('https://github.com/e1b22066/Workspace-test');
    }

    // リセットする関数
    resetHTMLList() {
         // 初期HTMLを保存
        const MainHTMLList = document.getElementById('MainHTMLList');
        MainHTMLList.innerHTML = ``;
        this.clickReport_count = 0;
        this.clickReport_flag = 0;
        this.finishReport_flag = 0;
    }

    generateId() {
        return Math.random().toString(36).slice(2, 11);
    }

    
}




