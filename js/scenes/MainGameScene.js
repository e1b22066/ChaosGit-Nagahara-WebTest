export class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
    }

    preload() {
        this.load.image('GitHub', '../../assets/images/GitHub-button.png');
        this.load.image('Task', '../../assets/images/task-button.png');
        this.load.image('message', '../../assets/images/message.png');
        this.load.image('player', 'https://examples.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        this.createGitHubButton(); // GitHubボタンを作成
        this.createTaskButton();   // Taskボタンを作成
        // this.createSabotageButton(); // Sabotageボタンを作成
        this.createPlayer();       // プレイヤーを作成
        this.createMessageWindow(); // メッセージウィンドウを作成
        this.setupInput();         // 入力設定

        // メッセージを表示するテキスト（初期は空の文字列）
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 300, '', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5, 0.5);
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

    createTaskButton() {
        const buttonScale = 0.2;
        const buttonWidth = this.textures.get('Task').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('Task').getSourceImage().height * buttonScale;

        this.add.image(this.cameras.main.centerX + 100, this.cameras.main.centerY, 'Task')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => this.showMessage('main.cというファイルを作成して　コミットを作成してください'));
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
