export class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
    }

    preload() {
        this.load.image('GitHub', '../../assets/images/GitHub-button.png');
        this.load.image('player', 'https://examples.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        this.createGitHubButton(); // GitHubボタンを作成
        this.createPlayer();       // プレイヤーを作成
        this.setupInput();         // 入力設定
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

    createSabotageButton() {
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
