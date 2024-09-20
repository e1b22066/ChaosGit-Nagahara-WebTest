export class RegisterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RegisterScene' });
    }

    preload() {
    }

    create() {
        // フォームの表示
        this.formContainer = document.getElementById('form-container');
        this.formContainer.style.display = 'block'; // フォームを表示

        // フォームのボタンにクリックイベントを追加
        const submitButton = document.getElementById('submit-button');
        submitButton.addEventListener('click', () => this.handleSubmit());

        // ゲームのタイトルや説明文などを追加する場合はここで行います
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 150, 'Welcome to Chaos Crewmate', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5);
    }

    handleSubmit() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;

        if (username && email) {
            console.log(`Username: ${username}, Email: ${email}`);
            this.formContainer.style.display = 'none'; // フォームを非表示にする
            this.scene.start('MainGameScene'); // メインゲームシーンを開始
        } else {
            alert('Please fill out both fields.');
        }
    }
}
