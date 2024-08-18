export class QuizScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuizScene' });
        this.timerDuration = 60; // タイマーの時間（秒）
    }

    preload() {
    }

    create() {
        // ディスカッション開始のメッセージ表示
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '発生した障害の種類を以下から選んでください', {
            fontSize: '32px',
            fill: '#000'
        }).setOrigin(0.5);

        // 選択肢を表示する
        this.createQuizButtons();

        // タイマーを表示するテキスト
        this.timerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, `Time Left: ${this.timerDuration}`, {
            fontSize: '28px',
            fill: '#000'
        }).setOrigin(0.5);

        // タイマーを開始する
        this.startTimer();

    }

    createQuizButtons() {
        const buttonScale = 0.5;
        const buttonWidth = this.textures.get('dummy-button').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('dummy-button').getSourceImage().height * buttonScale;
        
        const x = this.cameras.main.width - buttonWidth / 2 - 200;
        const y = this.cameras.main.height - buttonHeight / 2 - 200;

        this.add.image(x, y, 'dummy-button')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => {
                this.scene.start('RepairScene');
            });
    }
    
    startTimer() {
        // 1秒ごとにタイマーを更新するイベントを作成
        this.timeEvent = this.time.addEvent({
            delay: 1000, // 1000ミリ秒ごとに更新
            callback: this.updateTimer,
            callbackScope: this,
            loop: true // ループさせる
        });
    }

    updateTimer() {
        this.timerDuration--; // タイマーを1秒減らす
        this.timerText.setText(`Time Left: ${this.timerDuration}`); // 残り時間を更新

        if (this.timerDuration <= 0) {
            // タイマーがゼロになったら次のシーンへ移動
            this.timeEvent.remove(); // タイマーイベントを停止
            this.scene.start('MainGameScene'); // 'MainGameScene'に移動
        }
    }


}