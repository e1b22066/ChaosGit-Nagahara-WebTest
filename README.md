# ChaosGit

サーバサイドプログラムである**server_app.js**と**server_term.js**をLinuxで実行し，Windowsで本Webアプリケーションを利用する．

## **テスト動作環境** ##
クライアントサイド：Windows 11

サーバサイド：Windows11/VirtualBox/Manjaro Linux x86_64



## **被験者の準備手順** ##
1. mainブランチのソースコードをZIP形式でダウンロードし，任意の場所に解凍する．
2. VSCodeで下記の3つのファイル内に記載されているアドレスを実験者がその場で指定したアドレスに変更する．
  - Kitamoto-LastProject/js/term.jsの19行目あたり
  - Kitamoto-LastProject/js/scenes/MainGameScene.jsの260行目あたり
  - Kitamoto-LastProject/js/scenes/RegisterScene.jsの19行目あたり
3. VSCodeに拡張機能**Live Server**(publisherがRitwick Deyと書いてあるもの)をインストールする．
4. Kitamoto-LastProject/index.htmlをVSCodeのエクスプローラ上で右クリックし，"Open with Live Server"をクリックする．
5. 「開始」と書かれた画面がブラウザで表示されたら，**実験者の指示があるまで待機する**．


※被験者の準備作業はここまで

## **実験者の準備手順** ##
1. Linuxマシンで以下を実行し，ローカルIPアドレスを確認する．192.168で始まるローカルIPアドレスを確認する．
```
$ ip addr
```

2. 可能であれば被験者のマシン上で以下を実行し，接続を確認する．（やらなくてもいい）
```
$ ping <LinuxマシンのローカルIPアドレス>
```

3. server_app.jsの以下の部分にローカルIPアドレスを追加する
```
app.use(cors({ origin: ['http://127.0.0.1:5501', 'http://192.168.xx.xx:8080']}));
```

4. server_term.jsに記載されている以下のファイルパスをサーバ環境に応じたものに変更する
```
const initialDirectory = '/home/Dagechan/Projects/Bachelor/workspace';
```

5. Linuxマシンで以下を実行し，サーバを準備する．
```
$ node server_app.js
```
```
$ node server_term.js
```