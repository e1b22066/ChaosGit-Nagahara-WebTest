const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  const { spawn } = require('child_process');
  const shell = spawn('bash');

  ws.on('message', function incoming(message) {
    shell.stdin.write(message + '\n');
  });

  shell.stdout.on('data', function (data) {
    ws.send(data.toString());
  });

  shell.stderr.on('data', function (data) {
    ws.send(data.toString());
  });

  shell.on('close', function (code) {
    ws.close();
  });
});
