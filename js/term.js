// const { FitAddon } = require('xterm-addon-fit');
const term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    rows: 30,
    cols: 80,
    fontSize: 14,
    fontFamily: 'monospace'
});
// const fitAddon = new FitAddon();
// term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));

// fitAddon.fit();

const socket = new WebSocket('ws://localhost:8080');
let buffer = '';

// function writePrompt() {
//     term.write('\x1b[38;2;0;255;0m');
//     term.write('WebTerm> ');
//     term.write('\x1b[0m');
// }

socket.addEventListener('open', function (event) {
    term.onKey(function (e) {
    const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey &&
                       !e.domEvent.ctrlKey && !e.domEvent.metaKey &&
                       e.key !== 'Dead' && e.key !== 'Escape';

    if (e.domEvent.keyCode === 13) {
        socket.send(buffer + '\r');
        buffer = '';
    } else if (e.domEvent.keyCode === 8) { // Handle backspace
        if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            term.write('\b \b'); // Erase the character on the terminal
        }
    } else if (printable) {
        buffer += e.key;
        term.write(e.key);
    }
});

    socket.addEventListener('message', function (event) {
        term.write(event.data);
    });
});
