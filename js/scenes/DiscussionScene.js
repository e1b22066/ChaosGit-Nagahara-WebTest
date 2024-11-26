export class DiscussionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DiscussionScene' });
        this.timeLeft = 300; // タイマーの時間（秒）
    }

    preload() {
        this.load.image('dummy-button', '../../assets/images/dummy-button.png');
        this.load.image('terminalButton', '../../assets/images/terminal-button.png');
        this.load.image('message', '../../assets/images/message.png');
        this.load.image('backButton', '../../assets/images/BackButton.png');
    }

    init(data) {
    }

    create(data) {
        this.socket = data.socket;

        this.createMessageWindow(); // メッセージウィンドウを作成

        this.createBackButotn();

        // メッセージを表示するテキスト
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 300, '以下の作業をこのタイマーの残り時間を目安に行ってください．\
            \n ①レポートをした人が他のメンバーにどのような障害が発生したかを口頭で説明する．\
            \n ②レポートをした人がメンバーに対して，先程の説明が理解できたかどうかを確認する．\
            \n ※②でチームメンバーの理解が得られるまで説明を繰り返す．\
            \n ③説明を受けたメンバー2人のうちどちらが障害の修正をするか決める．\
            \n ④Backボタンを押してメインメニューへ戻り，担当者が障害を修正する\
            \n\
            \n補足：説明やそれを理解する上でターミナルを参照しても構いません．', {
            fontSize: '24px',
            fill: '#000'
        }).setOrigin(0.5, 0.5);

        // show the timer
        this.timerText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, `Time Left: 300`, {
            fontSize: '28px',
            fill: '#000'
        }).setOrigin(0.5);


        // ディスカッション開始のメッセージ表示
        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'リポジトリ障害報告セッション', {
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
            // this.scene.start('MainGameScene', { socket: this.socket });
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

    createBackButotn() {
        const buttonScale = 0.5;
        const buttonWidth = this.textures.get('backButton').getSourceImage().width * buttonScale;
        const buttonHeight = this.textures.get('backButton').getSourceImage().height * buttonScale;

        const x = this.cameras.main.width - buttonWidth / 2 - 20;
        const y = this.cameras.main.height - buttonHeight / 2 - 10

        this.add.image(x, y, 'backButton')
            .setInteractive()
            .setScale(buttonScale)
            .on('pointerdown', () => this.scene.start('MainGameScene'));
    }

    openTerminal() {
        window.open('../../term.html', '_blank');
    }

    createMessageWindow() {
        this.messageWindow = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 300, 'message')
            .setInteractive()
            .setScale(0.3)
    }
}