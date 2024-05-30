# Web-Terminal

サーバサイドプログラムである**server.js**をLinuxで実行し，Windowsで本Webアプリケーションを利用することにより，WindowsからLinuxマシンをコマンドラインで操作することができる．

## **テスト動作環境** ##
クライアントサイド：Windows 10

サーバサイド：Ubuntu Cinnamon 22.04.4 LTS x86_64

## **動作確認手順** ##

1. Linuxマシンで以下を実行し，サーバを準備する．
```
$ node server.js
```

2. Linuxマシンで以下を実行し，ローカルIPアドレスを確認する．複数アドレスが表示された場合，最初のIPアドレスを参照する．
```
$ hostname -I
```

3. Windowsマシン上で以下を実行し，接続を確認する．
```
$ ping <LinuxマシンのローカルIPアドレス>
```

4. Windowsマシン上で，file.jsのサーバURLを以下のように書き換える．
```
('http://<LinuxマシンのローカルIPアドレス>/file/save')
```

5. Windowsマシン上で，term.jsのサーバURLを以下のように書き換える．
```
('ws://<LinuxマシンのローカルIPアドレス>:8080')
```

6. Windowsマシン上で，Visual Studio Codeの拡張機能である**Live Server**を使って，HTTPサーバを起動し，index.htmlを開く．
