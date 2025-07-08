export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
        this.name = "null";
    }

    preload() {
        this.load.image('startButton', '../../assets/images/start-button.png');
    }

    create() {

        /* 
        **************************************************************
            実験参加者の皆様へ
        　　この下のアドレスを指定されたものに書き換えてください
            例： this.socket = new WebSocket('ws:192.168.xx.xx:8080');
        **************************************************************
        */
       
        this.ws = new WebSocket('ws://localhost:8081');

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'ChaosGit', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5);

        this.createName();

    }

    createName(){
        // name用のDOM要素を追加（CSSは必要に応じて調整）
        const nameHTML =` 
        <div id="chatBox" style=" position: absolute; top: 250px; right: 450px;
         z-index: 1000;  /* ← 追加: これでPhaserより前に出る */
         width: 300px; background: rgba(0,0,0,0.5); color: white;
         padding: 10px; font-size: 14px;">
            <div class="title">名前</div>
            <div calss="contents scroll" id="NAME">
            <div calss="contents input">
                <div>
                    <input class="name" type="text" id="nameInput" placeholder="name" />
                </div>
                 <button id="registerNameBtn"()">登録</button>
            </div>
            </div>
        </div>
        `;

        MainHTMLList.innerHTML = nameHTML;
        document.body.appendChild(MainHTMLList);

        const registerNameBtn = document.getElementById("registerNameBtn");
        if (registerNameBtn) {
            registerNameBtn.addEventListener("click", this.registerName.bind(this));
        } else {
            console.warn("registerName が見つかりませんでした");
        }
    }

    registerName() {
        this.name = document.getElementById('nameInput').value;
        console.log("Name = " + this.name);

        const json = {
            type: "name",
            name: this.name 
        }

        this.resetHTMLList();
        this.createStartBtn();
        //名前送信
        this.ws.send(JSON.stringify(json));
        
    }

    resetHTMLList() {
         // 初期HTMLを保存
        const MainHTMLList = document.getElementById('MainHTMLList');
        MainHTMLList.innerHTML = ``;
    }

    createStartBtn(){
        const startButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'startButton')
            .setInteractive()
            .setScale(0.3)
            .on('pointerdown', () => {
                this.scene.start('RegisterScene', { 
                    ws: this.ws,
                    name: this.name 
                });
            });
    }
}