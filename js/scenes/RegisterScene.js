export class RegisterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RegisterScene' });
        this.maxPlayers = 3;
    }

    init(data){
        this.name = data.name;
        this.ws = data.ws;
    }

    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Waiting for players...', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        // this.playerCountText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Players: ${data.count} / ${this.maxPlayers}`, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        this.playerCountText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Players connected: 0', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        /* 
        **************************************************************
            実験参加者の皆様へ
        　　この下のアドレスを指定されたものに書き換えてください
            例： this.socket = new WebSocket('ws:192.168.xx.xx:8080');
        **************************************************************
        */
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'playerCount') {
                console.log("hi man!");
                this.playerCountText.setText(`Players connected: ${data.count}`);
                if (data.count >= this.maxPlayers) {
                    this.socket.send(JSON.stringify({ type: 'startGame' }));    
                }
            }

            if (data.type === 'startGame') {
                this.scene.start('MainGameScene', { 
                    socket: this.socket, 
                    ws: this.ws,
                    name: this.name
                });
            }
        };
    }
}