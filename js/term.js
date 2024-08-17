function initializeTerminal() {
    const terminalContainer = document.getElementById('terminal');
    terminalContainer.style.display = 'block';

    const term = new Terminal({
        convertEol: true,
        cursorBlink: true,
        fontSize: 14,
        rows: 35,
        cols: 80,
        fontFamily: 'monospace'
    });

    term.open(terminalContainer);

    const socket = new WebSocket('ws://localhost:6060');

    term.onKey(function (e) {
        const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey &&
                          !e.domEvent.ctrlKey && !e.domEvent.metaKey &&
                          e.key !== 'Dead' && e.key !== 'Escape';

        if (e.domEvent.ctrlKey) {
            switch (e.key) {
                case 'c':
                case 'C':
                    socket.send('\x03');
                    break;
                case 'x':
                case 'X':
                    socket.send('\x18');
                    break;
                default:
                    break;
            }
        } else if (e.domEvent.keyCode === 13 || e.domEvent.keyCode === 8) {
            socket.send(e.key);  // EnterキーとBackspaceキーを送信
        } else if (e.key === 'Escape') {
            socket.send('\x1b');
        } else if (printable) {
            socket.send(e.key);
        }
    });

    socket.addEventListener('message', function (event) {
        term.write(event.data);
    });

    // ターミナルを閉じるボタンもしくはイベントリスナーを追加
    document.getElementById('close-terminal').addEventListener('click', function() {
        terminalContainer.style.display = 'none';
        term.dispose();
        socket.close();
    });
}
