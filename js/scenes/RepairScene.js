export class RepairScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RepairScene' });
    }

    preload() {
        this.load.image('dummy-button', '../../assets/images/dummy-button.png');
    }

    create() {
        // ディスカッション開始のメッセージ表示
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Repair Time!', {
            fontSize: '32px',
            fill: '#000'
        }).setOrigin(0.5);

        // 選択肢を表示する
        this.createFinishButtons();

    }

    createFinishButtons() {
        const buttonScale = 0.5;
        const buttonWidth = this.textures.get('dummy-button').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('dummy-button').getSourceImage().height * buttonScale;
        
        const x = this.cameras.main.width - buttonWidth / 2 - 200;
        const y = this.cameras.main.height - buttonHeight / 2 - 200;

        this.add.image(x, y, 'dummy-button')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => {
                this.scene.start('MainGameScene');
            });
    }


}