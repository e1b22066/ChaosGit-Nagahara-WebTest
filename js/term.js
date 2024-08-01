const term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    fontSize: 14,
    rows: 35,
    cols: 80,
    fontFamily: 'monospace'
});

term.open(document.getElementById('terminal'));

const socket = new WebSocket('ws://localhost:6060');

// basic commands
const cd = 'cd ~/Documents/Development/Last-project/shell-scripts\n';
const reCd = 'cd -\n';
const clear = 'clear\n';

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

document.getElementById('addStrangeFileButton').addEventListener('click', function () {
    const execute = './touchFile.sh\n';
    socket.send(cd);
    socket.send(execute);
    socket.send(reCd);
});

document.getElementById('destroyRepositoryButton').addEventListener('click', function () {
    const execute = './rmGitdir.sh\n';
    socket.send(cd);
    socket.send(execute);
    socket.send(reCd);
});

document.getElementById('rewriteRemoteURL').addEventListener('click', function () {
    const execute = './rewriteURL.sh\n';
    socket.send(cd);
    socket.send(execute);
    socket.send(reCd);
});

document.getElementById('createBranchButton').addEventListener('click', function () {
    const execute = './createBranch.sh\n';
    socket.send(cd);
    socket.send(execute);
    socket.send(reCd);
});

document.getElementById('rmRemoteBranchButton').addEventListener('click', function () {
    const execute = './rmRemoteBr.sh\n';
    socket.send(cd);
    socket.send(execute);
    socket.send(reCd);
});

document.getElementById('resetButton').addEventListener('click', function () {
    const execute = './reset.sh\n';
    socket.send(cd);
    socket.send(execute);
    socket.send(reCd);
});

function closeTerminal() {
    if (socket) {
        socket.close();
    }
    if (terminal) {
        terminal.clear();
    }
}
