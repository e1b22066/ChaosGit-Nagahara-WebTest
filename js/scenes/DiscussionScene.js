//やること
//①障害が起きていることはわかるがなぜ起きているかわからない人の対処             7/21完成    
// ⇒　誰かひとりでも正解の案に到達していれば、投票フェーズに飛ばす、その代わり、わかっている人に音声媒介で情報共有
//     誰一人わかっていない場合、Web会議で情報共有　　　　　　　　　　　　　 　　　　　　
//②他の人が障害を発見し、それがプッシュ通知されているが、障害がどこで起きているかもわからない
// ⇒  ここで障害が起きているよと知らせるヒント機能的なものを作成する。　　　　　　7/21完成
//③誰一人、障害内容が起きているのに、誰一人その障害を発見できずに、checkボタンを押す。
// ⇒　障害が発生しているので、探してください的なものを作る。　　　　　
//④　③については、checkボタンを一回押したときと、複数回押された時で、内容を変更する。
// ⇒  ここで障害が発生しています。と②の機能と似たようなものを作る。　　　　　　　　　　
//⑤障害状況の判定には、正解のものと照らし合わせの方法に変更　　　　             7/16完成
// ⇒　タスクごとに正解の回答を用意しておいて、それと照らし合わせる方法に変更。
//⑥ひとり、ひとり正解かどうかを通す。　　　　　                                 7/16完成　　　　　　　　　　　　　　　　　　　　　　　　 　　　　　
//⑦Web会議で情報共有し、修正案を作成してからの投票機能フェーズ　　　　　　　　   　　　　　　　　　　　　　
//⑧修正案を決める際に、時間制限付きで音声媒介にした情報共有フェーズの作成(事前に音声を行った場合は、なしで)

export class DiscussionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DiscussionScene' });
        this.timeLeft = 300; // タイマーの時間（秒）
        this.vote_flag = 0;  // 投票を一人一回までにするため
        this.voting_flag = 0; // 入れれる票数を一つにするため
        this.voting_id = "null";
        this.proposal_count = 0;
        this.proposal = [];
        this.activePps = "null";
    }

    preload() {
        this.load.image('dummy-button', '../../assets/images/dummy-button.png');
        this.load.image('terminalButton', '../../assets/images/terminal-button.png');
        this.load.image('message', '../../assets/images/message2.png');
        this.load.image('backButton', '../../assets/images/BackButton.png');
    }

    //wsは、chatようの通信ソケット
    //addChat以下は、チャット機能
    init(data) {
        //this.socket = data.socket;
        this.ws = data.ws;
        this.name = data.name;
        this.addChatUI = data.addChatUI; 
        this.sendMessage = data.sendMessage;
        //this.initChatSocket = data.initChatSocket;
        this.createDiv = data.createDiv;
        this.createMessage = data.createMessage;
        this.resetHTMLList = data.resetHTMLList;
        this.generateId = data.generateId;
    }

    create(data) {
        this.socket = data.socket;

        this.resetHTMLList();
        this.resetCount();

        console.log("this.socket = ", this.socket);
        console.log("this.ws = ", this.ws);

        this.createMessageWindow(); // メッセージウィンドウを作成

        this.createBackButotn();

        //チャット機能
        //this.addChatUI();           //チャットUIをDOMで追加
        //this.initChatSocket();      //WebSocketの初期化
        this.initVoteSocket();
        this.createVoteWindow();

        // メッセージを表示するテキスト
        /* this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 290, '以下の作業をこのタイマーの残り時間を目安に行ってください．\
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
        */

        this.messageText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 300, '実験実施者の指示に従ってください', {
            fontSize: '50px',
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
            .on('pointerdown', () => {
                document.querySelectorAll('.solutionDiv').forEach(el => {
                    el.style.display = 'none';
                });
                if(this.votingDiv){
                    this.votingDiv.innerHTML = '';
                }
                this.scene.start('MainGameScene')
            });
    }

    openTerminal() {
        window.open('../../term.html', '_blank');
    }

    createMessageWindow() {
        this.messageWindow = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY + 300, 'message')
            .setInteractive()
            .setScale(0.4)
    }

    createVoteWindow(){
        // チャットUI用のDOM要素を追加（CSSは必要に応じて調整）
        const voteHTML =` 
        <div id="voteBox" style=" position: absolute; top: 100px; right: 10px;
         z-index: 1000;  /* ← 追加: これでPhaserより前に出る */
         width: 300px; background: rgba(0,0,0,0.5); color: white;
         padding: 10px; font-size: 14px;">
            <div class="title">投票</div>
            <div calss="contents scroll" id="vote">
            <div calss="contents input">
                <div>
                    <input class="msg" type="text" id="msgInput" placeholder="message" />
                </div>
                 <button id="chatSendBtn"()">Send</button>
                 <button id="voteSendBtn"()">Vote</button>
                 <button id="cancelBtn"()">Cancel</button>
            </div>
            </div>
        </div>
        `;

        MainHTMLList.innerHTML = voteHTML;
        document.body.appendChild(MainHTMLList);

        const chatSendBtn = document.getElementById("chatSendBtn");
        if (chatSendBtn) {
            chatSendBtn.addEventListener("click", this.sendMessage.bind(this));
        } else {
            console.warn("chatSendBtn が見つかりませんでした");
        }

        const voteSendBtn = document.getElementById("voteSendBtn");
        if (voteSendBtn) {
            voteSendBtn.addEventListener("click", this.voteMessage.bind(this));
        } else {
            console.warn("chatSendBtn が見つかりませんでした");
        }

        const cancelBtn = document.getElementById("cancelBtn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", this.cancelVote.bind(this));
        } else {
            console.warn("chatSendBtn が見つかりませんでした");
        }
    }

    voteMessage() {
        const now = new Date();
        const json = {
            id: this.generateId(),
            type: "vote",
            name: this.name,
            message: document.getElementById('msgInput').value,
            time: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
            voteCount: 0
        };

        //メッセージ送信
        if(!this.vote_flag){
            console.log("メッセージ送信");
            this.ws.send(JSON.stringify(json));  
            document.getElementById('msgInput').value = '';
            this.vote_flag = 1;
            this.activePps = json.id;
        }else{
            console.log("発表済み");
        }
    }

    cancelVote(){
        if(this.vote_flag === 1){
            this.vote_flag = 0;
            
            const json = {
                type: "voteCancel",
                activePps: this.activePps        
            };

            console.log("キャンセル");
            this.ws.send(JSON.stringify(json));  
        }else{
            console.log("未発表");
        }
    }

    initVoteSocket(){
        let uuid = null;
        //メッセージ受信処理
        this.ws.onmessage = (event) => {
            const json = JSON.parse(event.data);
            console.log("json = " + json);
            const voteDiv = document.getElementById('vote');

            switch (json.type) {
                case "chat":
                    console.log("Discuss");
                    //const chatDiv = document.getElementById('chat');
                    voteDiv.appendChild(this.createMessage(json));
                    voteDiv.scrollTo(0, voteDiv.scrollHeight);
                    break;

                case "vote":
                case "voteCancel":
                    if(json.type === "vote"){
                        this.proposal_count++;
                        this.proposal.push(json);
                    }

                    if(json.type === "voteCancel"){
                        this.proposal_count--;
                        const index = this.proposal.findIndex(m => m.id === json.id);
                        if (index !== -1) {
                          this.proposal.splice(index, 1); // 特定の要素を削除
                        }
                    }
                    
                    if(this.proposal_count % 3 !== 0){
                        const proposalHTML = `
                        <div id="someoneProposal" style="display: none;position: fixed;top: 20%;left: 50%;
                            transform: translate(-50%, -50%);z-index: 9999;background: rgba(0, 0, 0, 0.85);
                            color: white;padding: 30px 50px;font-size: 16px;border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.5);text-align: center;">
                        </div>
                        `;

                        // 要素作成と追加
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = proposalHTML;
                        document.body.appendChild(wrapper);

                        this.proposalDiv = document.getElementById('someoneProposal');

                        this.proposalDiv.innerHTML = `💡「${this.proposal_count % 3}人が修正案を出しました」<br>
                                                        投票開始まで後${3 - this.proposal_count % 3}人`;
                        this.proposalDiv.style.display = 'block';

                    }else{
                        this.proposalDiv.style.display = 'none';
                        const votingHTML = `
                        <div id="voting" style="display: none;position: fixed;top: 50%;left: 50%;
                            transform: translate(-50%, -50%);z-index: 9999;background: rgba(0, 0, 0, 0.85);
                            color: white;padding: 30px 50px;font-size: 16px;border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.5);text-align: center;">
                            <div class="title">投票</div>
                            <div calss="contents scroll" id="voting">
                        </div>
                        `;
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = votingHTML;
                        document.body.appendChild(wrapper);

                        this.votingDiv = document.getElementById('voting');
                        console.log("proposal_count = " + this.proposal_count);
                        for(let i = this.proposal_count - 3; i < this.proposal_count; i++){
                            console.log("i = " + i);
                            console.log(this.proposal[i].message);
                            console.log("投票中");
                            this.votingDiv.appendChild(this.createVote(this.proposal[i]));
                            this.votingDiv.scrollTo(0,this.votingDiv.scrollHeight);
                        }
                        this.votingDiv.style.display = 'block';
                    }
                    break;

                case "uuid":
                    uuid = join.uuid;
                    break;
                
                case "goodclick":
                    // 既存のメッセージ要素を探す
                    const targetElement = document.querySelector(`[data-id="${json.targetMessageId}"]`);
                    if (targetElement) {
                        // voteCountを表示している span を見つける（classなどで特定すると安全）
                        const voteCountSpan = targetElement.querySelector('.vote-count');
                        if (voteCountSpan) {
                            voteCountSpan.textContent = json.voteCount.toString();
                        }
                    } else {
                        // 見つからない場合は、新規描画する（任意）
                        chatDiv.appendChild(this.createVote(json));
                    }
                    //三票入れられると、解決方法がでかでか表示
                    if (json.voteCount === 3) {
                        this.votingDiv.style.display = 'none';
                        const name = targetElement.querySelector('.name')?.textContent || '(no name)';
                        const message = targetElement.querySelector('.message')?.textContent || '(no message)';
                        console.log("🌟 解決方法：");
                        console.log("name =", name);
                        console.log("message =", message);

                        const solutionHTML = `
                        <div id="voteSolution" style="
                            display: none;
                            position: fixed;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            z-index: 9999;
                            background: rgba(0, 0, 0, 0.85);
                            color: white;
                            padding: 30px 50px;
                            font-size: 20px;
                            border-radius: 10px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.5);
                            text-align: center;
                        ">
                        </div>
                        `;

                        // 要素作成と追加
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = solutionHTML;
                        document.body.appendChild(wrapper);

                        const solutionDiv = document.getElementById('voteSolution');

                        solutionDiv.innerHTML = `💡「${name}」のメッセージが選ばれました！<br>${message}<br><br>
                                                この修正をするPlayerは、「${json.taskName}」`;
                        

                        solutionDiv.style.display = 'block';

                        solutionDiv.className = 'solutionDiv';

                        //MainHTMLList.innerHTML = solutionHTML;
                        //document.body.appendChild(MainHTMLList);
                        //solutionDiv.appendChild(this.createSMsg(name, message));
                        //solutionDiv.scrollTo(0, solutionDiv.scrollHeight);

                        //banner.textContent = `💡 「${name}」のメッセージが選ばれました！\n"${message}"`;

                        //5秒後にMainSecenに移動
                        setTimeout(() => {
                            //wrapper.remove(); // or solutionDiv.style.display = 'none';
                            document.querySelectorAll('.solutionDiv').forEach(el => {
                                el.style.display = 'none';
                            });
                            if(this.votingDiv){
                                this.votingDiv.innerHTML = '';
                            }
                            this.solutionHTML2 = `
                                <div id="someoneClickReport" style="
                                    display: none;
                                    position: fixed;
                                    top: 20%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    z-index: 9999;
                                    background: rgba(0, 0, 0, 0.85);
                                    color: white;
                                    padding: 30px 50px;
                                    font-size: 16px;
                                    border-radius: 10px;
                                    box-shadow: 0 0 20px rgba(0,0,0,0.5);
                                    text-align: center;
                                ">
                                </div>
                        `;

                        wrapper.innerHTML = this.solutionHTML2;
                        document.body.appendChild(wrapper);

                        this.solutionDiv2 = document.getElementById('someoneClickReport');

                        this.solutionDiv2.innerHTML = `修正方法は、${message}<br>
                                                    修正者は、${json.taskName}`;
                        this.solutionDiv2.style.display = 'block';

                        this.scene.start('MainGameScene',{
                            socket : this.socket,
                            ws : this.ws,
                            name : this.name,
                            solutionDiv2: this.solutionDiv2
                        })
                        }, 5000);
                    }
                    break;
            }
        };
    }

    createSMsg(name, message){
        const side = 'mine';
        const sideElement = this.createDiv(side);
        const nameElement = this.createDiv('name');
        const textElement = this.createDiv('text');
        const sideTextElement = this.createDiv(`${side}-text`);

        nameElement.textContent = name;
        textElement.textContent = message;

        sideElement.appendChild(sideTextElement);
        sideTextElement.appendChild(nameElement);
        sideTextElement.appendChild(textElement); 

        return sideElement;
    }

    createVote(json) {
        const side = json.mine ? 'mine' : 'other';
        const sideElement = this.createDiv(side);
        const sideTextElement = this.createDiv(`${side}-text`);
        const idElement = this.createDiv('id');
        const timeElement = this.createDiv('time');
        const nameElement = this.createDiv('name');
        const textElement = this.createDiv('text');

        idElement.textContent = json.id;
        timeElement.textContent = json.time;
        nameElement.textContent = json.name;
        nameElement.className = 'name';
        textElement.textContent = json.message;
        textElement.className = 'message';

        // 投票ボタンエリア
        const voteContainer = this.createDiv('vote-container');
        const voteButton = document.createElement('button');
        voteButton.textContent = '👍';
        voteButton.style.marginLeft = '10px';

        const voteCount = document.createElement('span');
        voteCount.textContent = '0';
        voteCount.className = 'vote-count';
        voteCount.style.marginLeft = '5px';
        
        // クリック時に投票数+1
        voteButton.addEventListener('click', () => {
            if(!this.voting_flag){   //まだ投票してない
                    const voteMessage = {
                    type: "goodclickOn",
                    targetMessageId: json.id,  // ← どのチャットに対する投票か
                    };
                this.ws.send(JSON.stringify(voteMessage));
                this.voting_flag = 1;
                this.voting_id = json.id;
            }else if(this.voting_id === json.id){    //投票したのを取り消す場合
                 const voteMessage = {
                    type: "goodclickOff",
                    targetMessageId: json.id,  // ← どのチャットに対する投票を取り消すか
                    };
                this.ws.send(JSON.stringify(voteMessage));
                this.voting_flag = 0;
                this.voting_id = "null";
            }else{   //複数投票する場合
                console.log("投票済み");
            }
        });

        voteContainer.appendChild(voteButton);
        voteContainer.appendChild(voteCount);

        sideElement.setAttribute('data-id', json.id);
        sideElement.appendChild(sideTextElement);
        sideTextElement.appendChild(timeElement);
        sideTextElement.appendChild(nameElement);
        sideTextElement.appendChild(textElement);
        sideTextElement.appendChild(voteContainer); 

        return sideElement;
    }

    resetCount(){
        this.vote_flag = 0;
        this.voting_flag = 0;
        this.voting_id = "null";
        this.activePps = "null";
    }
}