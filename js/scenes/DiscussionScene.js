export class DiscussionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DiscussionScene' });
        this.timerDuration = 10; // タイマーの時間（秒）
    }

    preload() {
        this.load.image('dummy-button', '../../assets/images/dummy-button.png');
        this.load.image('terminalButton', '../../assets/images/terminal-button.png');
        this.load.image('message', '../../assets/images/message.png');
    }

    init(data) {
        // this.timerDuration = 10; // 毎回初期化
    }

    create(data) {
        this.socket = data.socket;

        this.createMessageWindow(); // メッセージウィンドウを作成

        // メッセージを表示するテキスト（初期は空の文字列）
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 300, 'レポートをした人はどのような障害が発生したか説明してチームで共有してください．\nその後，どのようにして修復するのかチームで検討してください．\n障害を共有後，メイン画面に戻ってレポートした人以外が障害の復旧にあたってください．', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5, 0.5);

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

        this.createTerminalButton();
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
            this.scene.start('MainGameScene', { socket: this.socket });
        }
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