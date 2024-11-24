const term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    fontSize: 14,
    rows: 35,
    cols: 80,
    fontFamily: 'monospace'
});

term.open(document.getElementById('terminal'));

/* 
**************************************************************
    実験参加者の皆様へ
　　この下のアドレスを指定されたものに書き換えてください
    例： const socket = new WebSocket('ws:192.168.xx.xx:6060');
**************************************************************
*/
const socket = new WebSocket('ws://localhost:6060');

socket.addEventListener('open', function (event) {
    term.onKey(function (e) {
        const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey &&
                          !e.domEvent.ctrlKey && !e.domEvent.metaKey &&
                          e.key !== 'Dead' && e.key !== 'Escape';
        
        if (e.domEvent.ctrlKey) {
            // Case: entered Ctrl key
            switch (key) {
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
            socket.send(e.key);  // Send Enter key & backspace key
        } else if (e.key == 'Escape') {
            socket.send('\x1b');
        // } else if (e.key == 'Control') {
        //     socket.send('\x03');
        } else if (printable) {
            socket.send(e.key);
        }
    });


    socket.addEventListener('message', function (event) {
        term.write(event.data);
    });
});



function closeTerminal() {
    if (socket) {
        socket.close();
    }
    if (terminal) {
        terminal.clear();
    }
}