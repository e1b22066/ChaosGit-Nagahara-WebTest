//モジュール
const http	= require('http');
const express	= require('express');
const socketIO	= require('socket.io');
const moment	= require('moment');

//オブジェクト
const app	= express();
const server	= http.Server(app);
const io	= socketIO(server);

//定数
const PORT = process.env.PORT || 3000;//ここ変更
const SYSTEM_NICKNAME = "**system**";

//グローバル変数
let iCountUser = 0; //ユーザ数

//接続時の処理
io.on('connection', (socket) => {
	console.log('connection');

	let strNickname = ""; //コネクションごとの固有のニックネーム。イベントをまたいで使用

	//切断時の処理
	socket.on('disconnect', () => {
		console.log('disconnect');
	
		if(strNickname) {
			//ユーザ数の更新
			iCountUser--;
		
			//システムメッセージの作成
			const objMsg = {
				strNickname: SYSTEM_NICKNAME,
				strMsg:
			 	 strNickname + "left." + " there are " + iCountUser + " participants"
			};
		//送信元含む全員に送信
		io.emit("spread message",objMsg);
	}
	});
	//切断時の処理終了
	//
	
	//入室時の処理
	socket.on("join", strNickname_ => {
		console.log("joined :", strNickname_);

		//コネクションごとで固有のニックネームに設定
		strNickname = strNickname_;

		//ユーザの数の更新
		iCountUser++;

		//メッセージオブジェクトに現在時刻追加
		
		//システムメッセージの作成
		const objMsg = {
			strNickname: SYSTEM_NICKNAME,
			strMsg:
			 strNickname + "joined." + " there are " + iCountUser + " participants"
		};

		//送信元含む全員に送信
		io.emit("spread message", objMsg);
	});

	//新しいメッセージの受信時の処理
	socket.on('new message', strMsg => { 
		console.log('new message', strMsg);

		const objMsg = {
			strNickname: strNickname,
			strMsg: strMsg
		};

		//送信元含む全員に送信
		io.emit('spread message', objMsg);
	});
});

//公開フォルダの指定
app.use(express.static(__dirname + '/public'));

//サーバの起動
server.listen(PORT, () => {
	console.log('server starts on port: %d', PORT);
});
