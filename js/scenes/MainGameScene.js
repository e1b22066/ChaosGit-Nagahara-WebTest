export class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.tasks = [];
        this.currentTaskIndex = 0;
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
        this.load.image('task-window', '../../assets/images/task-window.png');
        this.load.image('hint', '../../assets/images/hint.png');
        this.load.image('check', '../../assets/images/check.png');
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
        this.createTaskButton(this.cameras.main.centerX + 100, this.cameras.main.centerY, 0.2, 'リモートリポジトリを　クローンしてください');   // Taskボタンを作成１
        this.createTaskButton(this.cameras.main.centerX - 300, this.cameras.main.centerY - 10, 0.2, 'ブランチ名をmasterからmainに　変更してください');  // Taskボタンを作成2
        this.createTaskButton(this.cameras.main.centerX - 100, this.cameras.main.centerY - 160, 0.2, 'ターミナル上で　コミット履歴を確認してください');  // Taskボタンを作成3
        this.createTaskButton2();
        this.createTerminalButton(); // Terminalボタンを作成
        this.createReportButton(); // Reportボタンを作成
        this.createPlayer();       // プレイヤーを作成
        this.setupInput();         // 入力設定
        this.setupSocketListeners(); // ソケットリスナの設定
        this.scenario();
        
        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.type == 'enterDiscussion') {
                this.scene.start('DiscussionScene', { socket: this.socket });
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

        const x = this.cameras.main.width - buttonWidth / 2 - 10;
        const y = this.cameras.main.height - buttonHeight / 2 - 10;

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

        const x = this.cameras.main.width - buttonWidth / 2 - 10;
        const y = buttonHeight / 2 + 200;

        this.add.image(x - 35, y, 'check')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => this.finishTask());

        // const taskWindowWidth = this.taskWindow.displayWidth;
        // const taskWindowHeight = this.taskWindow.displayHeight;

        // this.checkButton = this.add.image(this.messageWindow.x + 100, this.messageWindow.y + taskWindowHeight / 2 - 50, 'check')
        //     .setInteractive()
        //     .setScale(0.2)
        //     .on('pointerdown', () => this.checkTask());
    }


    scenario() {
        this.tasks = [
            'あなたの作業環境に新しいプロジェクトのリポジトリを作成してください．\nこのリポジトリでは，Gitの操作を通じて開発を進めていきます．',
            'Gitで作業を記録するために，あなたの名前とメールアドレスを設定してください．\nこの情報はコミット履歴に記録されます．',
            'Gitのデフォルトブランチ名はmasterになっています．\nこのブランチをmainに変更してください．',
            'リモートリポジトリを操作できるように，リモートのURLを設定してください．',
            '作成したローカルリポジトリの内容をリモートリポジトリに反映させるために\nmainブランチをリモートへpushしてください．',
            'プロジェクトに不要なファイルをコミットしないように，.gitignoreを作成してください.\nこのファイルには.classファイルを無視する設定を追加しコミットしてリモートへpushしてください．',
            '"Hello,World!"を表示させるMain.javaを作成し，コミットを作成してください．',
            '過去のコミットに誤りがあった場合に備え，手戻りを行う方法を学びましょう．\n最新のコミットを取り消して，リポジトリを正しい状態に戻してください．',
            '新しい機能を開発するために，feature-xyzという名前のブランチを作成してください．\nそのブランチで作業を進め，変更をリモートにpushしてください．',
            'feature-xyzブランチの作業をmainブランチに反映させるためにPull Requestを作成してください．\nその後，レビュー後にマージを行ってください．',
            'リモートリポジトリに新しい変更を加えてください．その後，変更をリモートにpushしてください．',
            'リモートリポジトリとローカルリポジトリの間でコンフリクトが発生しました．\nこれを解消してリポジトリを正しい状態に戻してください．',
            'プロジェクトのリリースに向けて，v1.0タグを作成し，リリース用ブランチを作成してください．\nその後リモートにpushしてください．',
            'プロジェクト内に不要なファイルが見つかりました．\nこのファイルを削除し，リモートに反映してください．',
        ];
        this.showCurrentTask();
    }

    showCurrentTask() {
        const currentTask = this.tasks[this.currentTaskIndex];
        if (currentTask) {
            this.showMessage(currentTask);
        } else {
            this.messageText.setText('すべてのタスクが完了しました．');
        }
    }

    showMessage(message) {
        this.messageText.setText(message);
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
        this.hintButton = this.add.image(this.taskWindow.x - 100, this.taskWindow.y + taskWindowHeight / 2 - 50, 'hint')
            .setInteractive()
            .setScale(0.2)
            .on('pointerdown', () => this.showHint());
    
        // クローズボタンを作成
        this.closeButton = this.add.image(this.taskWindow.x + 500, this.taskWindow.y - taskWindowHeight / 2 + 80, 'close-button')
            .setInteractive()
            .setScale(0.2)
            // .on('pointerdown', () => this.closeTaskWindow());
            .on('pointerdown', () => this.finishTask());

        // チェックボタンを作成
        this.checkButton = this.add.image(this.taskWindow.x + 100, this.taskWindow.y + taskWindowHeight / 2 - 50, 'check')
            .setInteractive()
            .setScale(0.2)
            .on('pointerdown', () => this.checkTask());
    }
    
    showHint() {
        // ヒントの表示を行う処理
        this.messageText.setText('');
    }

    

    checkTask() {
        fetch('http://localhost:3000/check-branch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.messageText.setText('タスクを完了しました: ' + data.message);
            } else {
                this.messageText.setText('タスクの実行に失敗しました: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.messageText.setText('エラーが発生しました');
        });
    }
    
    
    closeTaskWindow() {
        // タスクウィンドウに表示されているボタンを一緒に削除
        this.taskWindow.destroy();
        this.taskMessage.destroy();
        this.hintButton.destroy();
        this.closeButton.destroy();
        this.checkButton.destroy();
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
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        }
    }

    handleButtonClick() {
        window.open('https://github.com/Dagechan/chaos-repo');
    }
}
