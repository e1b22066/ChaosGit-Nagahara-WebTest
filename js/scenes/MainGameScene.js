export class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.tasks = [];
        this.currentTaskIndex = 0;
        this.gameState  = {
            playerPosition: { x: null, y: null }
        };
    }

    init(data) {
        this.socket = data.socket;
    }

    preload() {
        this.load.image('GitHub', '../../assets/images/GitHub-button.png');
        this.load.image('Task', '../../assets/images/task-button.png');
        this.load.image('Task2', '../../assets/images/co_taskButton.png');
        this.load.image('message', '../../assets/images/message.png');
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('terminalButton', '../../assets/images/terminal-button.png');
        this.load.image('closeButton', '../../assets/images/terminal-button.png');
        this.load.image('reportButton', '../../assets/images/report-button.png');
        this.load.image('close-term-button', '../../assets/images/close-term-button.png');
        this.load.image('close-button', '../../assets/images/close.png');
        this.load.image('task-window', '../../assets/images/alert.png');
        this.load.image('hint', '../../assets/images/hint.png');
        this.load.image('check', '../../assets/images/check.png');
        this.load.image('task-clear', '../../assets/images/clear.png');
        this.load.image('map', '../../assets/images/map.png');
    }

    create() {
        this.createMessageWindow(); // メッセージウィンドウを作成

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
        
        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'currenTask') {
                this.updateTask(data.currentTask);
            }

            if (data.type == 'enterDiscussion') {
                this.scene.start('DiscussionScene', { socket: this.socket });
            }
            
            if (data.type == 'moveToNextTask') {
                this.moveToNextTask();
            }

        });

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
            { description: 'あなたの作業環境に新しいプロジェクトのリポジトリを作成してください．\nこのリポジトリでは，Gitの操作を通じて開発を進めていきます．', type: 'check-init'},
            { description: 'Gitで作業を記録するために，名前とメールアドレスを設定してください．\nこの情報はコミット履歴に記録されます．', type: 'check-usr'},
            { description: 'Main.javaというファイルを作成し，コミットを作成してください．\nMain.javaには何も書き込まなくても構いません．', type: 'check-initcommit'},
            { description: 'Gitのデフォルトブランチ名はmasterになっています。\nこのブランチをmainに変更してください.\n', type: 'check-branch'},
            { description: 'リモートリポジトリを操作できるように，リモートのURLを設定してください．', type: 'check-url'},
            { description: '作成したローカルリポジトリの内容をリモートリポジトリに反映させるために\nmainブランチをリモートへpushしてください．', type: 'check-push'},
            { description: 'プロジェクトに不要なファイルをコミットしないように，.gitignoreを作成してください.\nこのファイルには.classファイルを無視する設定を追加しコミットしてリモートへpushしてください．', type: 'check-ignore'},
            { description: '"Hello,World!"を表示させるMain.javaを作成し，コミットを作成してください．\npushはしないでください．', type: 'check-jcommit'},
            { description: '過去のコミットに誤りがあった場合に備え，手戻りを行う方法を学びましょう．\nrevertコマンドを使って最新のコミットを取り消してください．', type: 'check-back'},
            { description: '新しい機能を開発するために，"feature-xyz"という名前のブランチを作成してください．\nそのブランチで"Hello Monster!"と表示されるような\nMonster.javaを作成しリモートにpushしてください．', type: 'check-newbranch'},
            { description: 'feature-xyzブランチの作業をmainブランチに反映させるために\nPull Requestを作成してください．\nその後，レビュー後にマージを行ってください．\nリモートでのマージはローカルに反映させてください．', type: 'check-merge'},
            { description: 'プロジェクトのリリースに向けて，v1.0タグを作成し\nリリース用ブランチ"release/v1.0"を作成してください．\nその後リモートにpushしてください．', type: 'check-release'},
        ];
        // this.currentTaskIndex = 0;
        this.showCurrentTask();
    }

    showCurrentTask() {
        const currentTask = this.tasks[this.currentTaskIndex];
        this.messageText.setText(currentTask.description);
        // if (currentTask) {
        //     this.showMessage(currentTask.description);
        // } else {
        //     this.messageText.setText('すべてのタスクが完了しました．');
        // }
    }

    showMessage(message) {
        this.messageText.setText(message);
    }

    updateTask(task) {
        this.currentTask = task;
        this.messageText.setText(task.description);
    }

    finishTask() {
        this.currentTaskIndex++;
        this.showCurrentTask();
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
    
        // ヒントボタンを作成
        // this.hintButton = this.add.image(this.taskWindow.x - 100, this.taskWindow.y + taskWindowHeight / 2 - 50, 'hint')
        //     .setInteractive()
        //     .setScale(0.2)
        //     .on('pointerdown', () => this.showHint());
    
        // クローズボタンを作成
        this.closeButton = this.add.image(this.taskWindow.x + 500, this.taskWindow.y - taskWindowHeight / 2 + 80, 'close-button')
            .setInteractive()
            .setScale(0.2)
            .on('pointerdown', () => this.closeTaskWindow());

        // チェックボタンを作成
        // this.checkButton = this.add.image(this.taskWindow.x + 100, this.taskWindow.y + taskWindowHeight / 2 - 50, 'check')
        //     .setInteractive()
        //     .setScale(0.2)
        //     .on('pointerdown', () => this.checkTask());
    }
    
    showHint() {
        // ヒントの表示を行う処理
        this.messageText.setText('');
    }

    checkTask() {
        const currentTask = this.tasks[this.currentTaskIndex];
        
        if (!currentTask) {
            this.messageText.setText('No task available to check.');
            return;
        }
    
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
                // this.messageText.setText('タスクを完了しました: ' + data.message);
                // this.showPopUpWindow('タスクを完了しました: ' + data.message);
                this.clearTask();
            } else {
                // this.messageText.setText('タスクの実行に失敗しました: ' + data.message);
                this.showPopUpWindow('タスクの実行に失敗しました: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // this.messageText.setText('エラーが発生しました');
            this.showPopUpWindow('エラーが発生しました');
        });
    }
    

    moveToNextTask() {
        this.walkPlayer();
        this.currentTaskIndex++;

        if (this.currentTaskIndex < this.tasks.length) {
            this.showCurrentTask();
        } else {
            this.messageText.setText('すべてのタスクを完了しました！');
        }
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
        const buttonScale = 0.3;
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
                // this.scene.start('DiscussionScene'); // クリック時にDiscussionSceneへ移動
                this.reportIssue();
            });
    }

    reportIssue() {
        const message = JSON.stringify({ type: 'reportIssue' });
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.warn('Socket is not open. Cannot send message.');
        }
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

                console.log('Player Position:', this.gameState.playerPosition);
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
        window.open('https://github.com/Dagechan/WorkSpace');
    }
}
