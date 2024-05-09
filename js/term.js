const term = new Terminal({
    shell: '/bin/bash',
    convertEol: true
});
term.open(document.getElementById('terminal'));

const socket = new WebSocket('ws://localhost:8080');
let buffer = ''; // 入力文字列をバッファリングするための変数
let promptShown = false; // プロンプトが表示されているかどうかを示すフラグ

function writePrompt() {
    term.write('\x1b[38;2;0;255;0m')
    term.write('WebTerm> ');
    term.write('\x1b[0m');
    promptShown = true;
}

writePrompt();
socket.addEventListener('open', function (event) {

  // エンターキーが押されたときの処理
    term.onKey(function (e) {
        if (e.domEvent.keyCode === 13) {
            socket.send(buffer); // バッファの内容を送信
            buffer = ''; // バッファをクリア
        }
    });

    socket.addEventListener('message', function (event) {
        term.write('\n' + event.data); // サーバーからのメッセージをターミナルに表示
        writePrompt();  // プロンプトを表示
    });

    /* 入力文字列をターミナルに書き込む */
    term.onData(function (data) {
        if (data === '\r') {
            // Enterキーが押されたときはバッファに追加しない
            return;
        }

        /*バックスペースキーが押されたときはバッファから1文字削除 */
        if (data == '\x7f') {
            if (buffer.length > 0) {
                buffer = buffer.slice(0, -1);
                term.write('\b \b'); // ターミナル上の文字を削除
            }
            return;
        }
        buffer += data;
        term.write(data);
    });

});
//