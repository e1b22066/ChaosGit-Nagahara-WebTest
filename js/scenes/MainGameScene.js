export class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.terminalVisible = false; // ターミナルが表示されているかどうか
    }

    preload() {
        this.load.image('GitHub', '../../assets/images/GitHub-button.png');
        this.load.image('Task', '../../assets/images/task-button.png');
        this.load.image('message', '../../assets/images/message.png');
        this.load.image('player', 'https://examples.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('terminalButton', '../../assets/images/terminal-button.png');
        this.load.image('closeButton', '../../assets/images/terminal-button.png');
        this.load.image('reportButton', '../../assets/images/report-button.png');
        this.load.image('close-term-button', '../../assets/images/close-term-button.png');
        this.load.image('close-button', '../../assets/images/close.png');
        this.load.image('task-window', '../../assets/images/task-window.png');
        this.load.image('hint', '../../assets/images/hint.png');
    }

    create() {
        this.createGitHubButton(); // GitHubボタンを作成
        this.createTaskButton(this.cameras.main.centerX + 100, this.cameras.main.centerY, 0.2, 'リモートリポジトリを　クローンしてください');   // Taskボタンを作成１
        this.createTaskButton(this.cameras.main.centerX - 300, this.cameras.main.centerY - 10, 0.2, 'ブランチ名をmasterからmainに　変更してください');  // Taskボタンを作成2
        this.createTaskButton(this.cameras.main.centerX - 100, this.cameras.main.centerY - 160, 0.2, 'ターミナル上で　コミット履歴を確認してください');  // Taskボタンを作成3
        this.createTerminalButton(); // Terminalボタンを作成
        this.createReportButton(); // Reportボタンを作成
        this.createPlayer();       // プレイヤーを作成
        this.createMessageWindow(); // メッセージウィンドウを作成
        this.setupInput();         // 入力設定

        // メッセージを表示するテキスト（初期は空の文字列）
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 300, '', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5, 0.5);
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
            .on('pointerdown', () => this.showTaskWindow(message));
    }
    
    showTaskWindow(message) {
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
        this.hintButton = this.add.image(this.taskWindow.x, this.taskWindow.y + taskWindowHeight / 2 - 50, 'hint')
            .setInteractive()
            .setScale(0.2)
            .on('pointerdown', () => this.showHint());
    
        // クローズボタンを作成
        this.closeButton = this.add.image(
            this.taskWindow.x + 500,
            this.taskWindow.y - taskWindowHeight / 2 + 80, 
            'close-button'
        )
            .setInteractive()
            .setScale(0.2)
            .on('pointerdown', () => this.closeTaskWindow());
    }
    
    showHint() {
        // ヒントの表示を行う処理
        this.messageText.setText('');
    }
    
    closeTaskWindow() {
        // タスクウィンドウ、メッセージ、ヒントボタン、クローズボタンを消す
        this.taskWindow.destroy();
        this.taskMessage.destroy();
        this.hintButton.destroy();
        this.closeButton.destroy();
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
                this.scene.start('DiscussionScene'); // クリック時にDiscussionSceneへ移動
            });
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

    showMessage(message) {
        this.messageText.setText(message);
    }

    handleButtonClick() {
        window.open('https://github.com/Dagechan/chaos-repo');
    }
}
