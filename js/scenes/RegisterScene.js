export class RegisterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RegisterScene' });
        this.maxPlayers = 3;
    }

    create() {
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Waiting for players...', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        // this.playerCountText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, `Players: ${data.count} / ${this.maxPlayers}`, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        this.playerCountText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Players connected: 0', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

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
                this.scene.start('MainGameScene', { socket: this.socket });
            }
        };
    }
}
