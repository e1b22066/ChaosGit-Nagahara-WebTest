const term = new Terminal({
    shell: '/bin/bash',
    convertEol: true
});
term.open(document.getElementById('terminal'));

const socket = new WebSocket('ws://localhost:8080');
let buffer = '';
let promptShown = false;

function writePrompt() {
    term.write('\x1b[38;2;0;255;0m')
    term.write('WebTerm> ');
    term.write('\x1b[0m');
    promptShown = true;
}

writePrompt();
socket.addEventListener('open', function (event) {
    term.onKey(function (e) {
        if (e.domEvent.keyCode === 13) {
            socket.send(buffer);
            buffer = '';
        }
    });

    socket.addEventListener('message', function (event) {
        term.write('\n' + event.data);
        writePrompt();
    });

    term.onData(function (data) {
        if (data === '\r') {
            return;
        }

        if (data == '\x7f') {
            if (buffer.length > 0) {
                buffer = buffer.slice(0, -1);
                term.write('\b \b');
            }
            return;
        }
        buffer += data;
        term.write(data);
    });
});
