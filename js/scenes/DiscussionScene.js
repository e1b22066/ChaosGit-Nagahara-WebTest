export class DiscussionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DiscussionScene' });
        this.timerDuration = 10; // タイマーの時間（秒）
    }

    preload() {
        this.load.image('dummy-button', '../../assets/images/dummy-button.png');
    }

    create() {
        // ディスカッション開始のメッセージ表示
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Discussion Time!', {
            fontSize: '32px',
            fill: '#000'
        }).setOrigin(0.5);

        // タイマーを表示するテキスト
        this.timerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, `Time Left: ${this.timerDuration}`, {
            fontSize: '28px',
            fill: '#000'
        }).setOrigin(0.5);

        // タイマーを開始する
        this.startTimer();

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
            this.scene.start('QuizScene'); // 'MainGameScene'に移動
        }
    }


}