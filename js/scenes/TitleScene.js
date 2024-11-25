export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        this.load.image('startButton', '../../assets/images/start-button.png');
    }

    create() {
        const startButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'startButton')
            .setInteractive()
            .setScale(0.3)
            .on('pointerdown', () => this.scene.start('RegisterScene'));

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'ChaosGit', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5);
    }
}
