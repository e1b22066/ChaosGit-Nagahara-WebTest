export class DiscussionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DiscussionScene' });
        this.timerDuration = 10; // タイマーの時間（秒）
    }

    preload() {
        this.load.image('dummy-button', '../../assets/images/dummy-button.png');
    }

    init(data) {
        // this.timerDuration = 10; // 毎回初期化
    }

    create(data) {
        this.socket = data.socket;

        // show the timer
        this.timerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, `Time Left: 60`, {
            fontSize: '28px',
            fill: '#000'
        }).setOrigin(0.5);

        this.timeLeft = 10; 

        // ディスカッション開始のメッセージ表示
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Discussion Time!', {
            fontSize: '32px',
            fill: '#000'
        }).setOrigin(0.5);

        
        // Decrement the timer every second
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // タイマーを開始する
        // this.startTimer();
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
        if (this.timeLeft > 0) {
            this.timeLeft -= 1;
            this.timerText.setText(`Time: ${this.timeLeft}`);
        } else {
            this.timeEvent.remove();
            this.scene.start('QuizScene', { socket: this.socket });
        }
    }

    // updateTimer() {
    //     this.timerDuration--; // タイマーを1秒減らす
    //     this.timerText.setText(`Time Left: ${this.timerDuration}`); // 残り時間を更新

    //     if (this.timerDuration <= 0) {
    //         // タイマーがゼロになったら次のシーンへ移動
    //         this.timeEvent.remove(); // タイマーイベントを停止
    //         this.scene.start('QuizScene'); // 'MainGameScene'に移動
    //     }
    // }


}