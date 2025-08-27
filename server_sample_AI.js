import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';

// __dirname の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../APIキー/.env') });
const API_KEY = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY =", API_KEY);

async function isContributed(playerName, getSabotageReviewData, getTaskReviewData){
  const prompt = `
  あなたは、ソフトウェア開発のプロジェクトマネージャーです。以下の情報をもとに、${JSON.stringify(playerName, null, 2)}さんたちがどれくらいプロジェクトに貢献したかどうかを判断してください。
  彼らは、通常のタスクを完了し、障害が発生した際に問題を発見し、解決するために協力しました。各メンバーの貢献度を評価し、その理由を具体的に説明してください。

【出力ルール】
・出力は、必ずJSON形式で、以下の構造に従ってください。

{
  "users": [
    {
      "name": "A",
      "contribution": "貢献度",
      "content":"理由"
    },
    {
      "name": "B",
      "contribution": "貢献度",
      "content":"理由"
    },
    ...
  ]
}

・"name"に関しては、${JSON.stringify(playerName, null, 2)}の名前を使用してください。
・"contribution"は下記のように入力してください。
  貢献度に関しては、5階の評価と、全体の貢献度を100%としたときの割合で記入してください。
  5段階の評価に関しては、貢献した順に「大変貢献した」「貢献した」「普通」「あまり貢献しなかった」「全く貢献しなかった」 で表現してください。
  貢献度の5段階評価に関しては、以下の基準を参考にしてください。
    ・貢献度80%以上: 大変貢献した
    ・貢献度60%以上80%未満: 貢献した
    ・貢献度40%以上60%未満: 普通
    ・貢献度20%以上40%未満: あまり貢献しなかった
    ・貢献度20%未満: 全く貢献しなかった
  貢献度の%に関しては、判定対象の内容を参照して自由に決めてください。
・"content"に関しては、貢献度の理由を具体的に記入してください。
【例】
{
  "users": [
    {
      "name": "Aさん",
      "contribution": "貢献した : 50%",
      "content":"タスクの完了数、トラブルの最初の発見者、トラブル解決の主導者で高いスコアを出しています。
      タスクを確実にこなし、問題発生時にも積極的に解決を主導する、リーダーシップと問題解決能力に優れた貢献者と言えます。"
    },
    {
      "name": "B",
      "contribution": "あまり貢献しなかった : 20%",
      "content":"タスクの完了数は高いですが、
      トラブルシューティングへの貢献は修正者としての関与が主です。チーム内でタスクを効率的に進めることに貢献していますが、
      問題解決を主導する場面は少ないようです。"
    },
    {
      "name": "C",
      "contribution": "普通 : 30%",
      "content":"タスクの完了数は最も少ないですが、チャットでのコミュニケーションとトラブル解決の主導者（1回）という点で貢献しています。
      これは、技術的なタスクだけでなく、チームの連携やサポートの面で貢献していることを示しています。"
    }
  ]
}

【判定対象】
ユーザ ${JSON.stringify(playerName, null, 2)}
障害時のタスクの振り返り ${JSON.stringify(getSabotageReviewData, null, 2)}
障害時の内容の説明
・"No" ⇒ 障害の番号
・"sabotageContent" ⇒ 障害の内容
・"first" ⇒ 最初に障害に気づいた人
・"inventor" ⇒ 障害を仕掛けた人
・"correction" ⇒ 修正方法
・"corrector" ⇒ 修正者
・"correctors" ⇒ 障害原因を特定した人（複数人いる場合もある）
・"usinghint" ⇒ ヒントを使用した人（複数人いる場合もある）
・"talking" ⇒ チーム内で話し合いをしたかどうか
・"time" ⇒ 障害の修正にかかった時間（秒）

通常のタスクの振り返り ${JSON.stringify(getTaskReviewData, null, 2)}
基本タスクの内容の説明
・"No" ⇒ タスクの番号
・"taskContent" ⇒ タスクの内容
・"who": ⇒ タスクを担当した人
・"task_count" ⇒ そのタスクのクリアチェックにかかった数（少ないほうがいい最低1回）
・"chat_count" ⇒ その人がチャットで質問した回数

では、上記のルールに従って、${JSON.stringify(playerName, null, 2)}さんたちの貢献度を評価し、その理由を具体的に説明してください。
  なお、出力は必ずJSON形式で、上記の構造に従ってください。
`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const jsonString = response.data.candidates[0].content.parts[0].text.trim();
    console.log('判定結果:', jsonString);
    const cleanedString = jsonString.replace(/```json|```/g, '').trim();

    try {
      const result = JSON.parse(cleanedString);
      // これでresultはJavaScriptのオブジェクトになります
      console.log(result.users[0].name); // "A"が出力されます
      console.log(result.users[1].name); // "B"が出力されます
      return result; 
    } catch (error) {
      // JSONのパースに失敗した場合の処理
      console.error("JSONのパースに失敗しました:", error);
      return 'ERROR';
    } 
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return 'ERROR';
  }
}

// テスト呼び出し例
(async () => {
const playerName = ["Aさん", "Bさん", "Cさん"];

const getTaskReviewData = [
                          {
                          "No": 1,
                          "taskContent": "\nターミナルにコマンドを入力して現在のディレクトリに新規のGitリポジトリを作成してください．\nここで作成したGitリポジトリをローカルリポジトリとして開発を進めます．",
                          "who": "Aさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 2,
                          "taskContent": "\nGitで作業を記録するために，指定の名前とメールアドレスを設定してください．\nこの情報はコミット履歴に記録されます．\n名前：user\nメールアドレス：user@example.com",
                          "who": "Bさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 3,
                          "taskContent": "\nMain.javaというファイルを作成し，コミットメッセージとともにコミットを作成してください．\nコミットにはコミットメッセージが必ず必要です．\nMain.javaには何も書き込まなくても構いません．\npushはまだしないでください．",
                          "who": "Cさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 4,
                          "taskContent": "\nGitのデフォルトブランチ名はmasterになっています。\nこのブランチをmainに変更してください.\n",
                          "who": "Aさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 5,
                          "taskContent": "\nリモートリポジトリとローカルリポジトリが連携できるように，ローカルリポジトリに\nリモートリポジトリを登録してください．\nGitHub上でリモートリポジトリのURLを選択する際に\nHTTPSではなくSSH用のアドレスを選んで登録してください．",
                          "who": "Bさん",
                          "task_count": 2,
                          "chat_count": 0
                          },
                          {
                          "No": 6,
                          "taskContent": "\n作成したローカルリポジトリの内容をリモートリポジトリに反映させるために\nmainブランチをリモートリポジトリへpushしてください．",
                          "who": "Cさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 7,
                          "taskContent": "\nプロジェクトに不要なファイルをコミットしないように，.gitignoreを作成してください.\nこのファイルには.classファイルを無視する設定を追加しコミットしてリモートリポジトリへ\npushしてください．",
                          "who": "Cさん",
                          "task_count": 1,
                          "chat_count": 2
                          },
                          {
                          "No": 8,
                          "taskContent": "\n\"Hello World!\"を表示させるMain.javaを作成し，コミットを作成してください．\npushはしないでください．",
                          "who": "Aさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 9,
                          "taskContent": "\n過去のコミットに誤りがあった場合に備え，手戻りを行う方法を学びましょう．\nrevertコマンドを使って最新のコミットを取り消してください．",
                          "who": "Bさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 10,
                          "taskContent": "\ngit logコマンドで今までのコミットが正しいか（意図通りか）確認してください．\nその後，新しい機能を開発するために\"feature-xyz\"という名前のブランチを作成してください．\nfeature-xyzブランチに移動して，\"Hello Monster!\"と表示されるような\nMonster.javaを作成しリモートにpushしてください．",
                          "who": "Bさん",
                          "task_count": 1,
                          "chat_count": 2
                          },
                          {
                          "No": 11,
                          "taskContent": "\nfeature-xyzブランチの作業をmainブランチに反映させるために\nPull Requestを作成してください．\nその後，Pull Requestを利用して-GitHub上でマージを行ってください．\nリモートリポジトリでのマージはローカルに反映させてください．",
                          "who": "Aさん",
                          "task_count": 1,
                          "chat_count": 0
                          },
                          {
                          "No": 12,
                          "taskContent": "\nmainブランチに切り替え，プロジェクトのリリースに向けてv1.0タグを作成し\nタグをリモートリポジトリへpushしてください．",
                          "who": "Bさん",
                          "task_count": 1,
                          "chat_count": 0
                          }
                        ]

const getSabotageReviewData = [
                            {
                            "No": 8,
                            "sabotageContent": "githubに不適切な更新があり、pushできない",
                            "first": "Aさん",
                            "inventor": "Bさん",
                            "correction": "OK",
                            "corrector": "Cさん",
                            "correctors": ["Aさん","Bさん","Cさん"],
                            "usinghint": ["Aさん","Cさん"],
                            "talking": "してない",
                            "time": 342
                            },

                            {
                            "No": 11,
                            "sabotageContent": "gitのログに、心当たりのないコミットがある",
                            "first": "Aさん",
                            "inventor": "Bさん",
                            "correction": "OK",
                            "corrector": "Aさん",
                            "correctors": ["Cさん","Bさん","Aさん"],
                            "usinghint": [],
                            "talking": "してない",
                            "time": 175
                            },

                            {
                            "No": 12,
                            "sabotageContent": "gitHubのマージ時に、同一のファイルの更新内容が複数ある",
                            "first": "Aさん",
                            "inventor": "Bさん",
                            "correction": "OK",
                            "corrector": "Aさん",
                            "correctors": ["Cさん","Bさん","Aさん"],
                            "usinghint": [],
                            "talking": "してない",
                            "time": 207
                            }
                            ]

  const result = await isContributed(playerName, getSabotageReviewData, getTaskReviewData);
  console.log('内容の一致判定:', result); 
})();


// 3つのテキストが同じ意味かどうかを判定する関数
/*
async function isSameMeaning(text1, text2, text3) {
  const prompt = `
次の3つの文が、文体や表現が異なっていても「伝えようとしている意味が同じ」かどうかを判断してください。
同じ意味かどうかを柔軟に考え、以下のルールに従って日本語で1語のみ出力してください。

【出力ルール】
・3つすべてが伝えようとしている意味が同じの場合 → YES
・すべて伝えようとしている意味が異なる場合 → NO
・文1だけ伝えようとしている意味が異なる場合 → 文1
・文2だけ伝えようとしている意味が異なる場合 → 文2
・文3だけ伝えようとしている意味が異なる場合 → 文3

【例】
文1: 今日は雨が降っているので傘を持っていこう。
文2: 外は雨が降っています。傘を持って行ったほうがいいです。
文3: 昨日は晴れていたので散歩した。
→ 出力：文3

【判定対象】
文1: ${text1}
文2: ${text2}
文3: ${text3}

必ず上記のルールに従って、日本語で「YES」「NO」「文1」「文2」「文3」のいずれか1つだけ出力してください。

また、出力ルールに書いてある「YES」「NO」「文1」「文2」「文3」になった理由も一緒に出力
してください。

`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const result = response.data.candidates[0].content.parts[0].text.trim();
    console.log('判定結果:', result);  

    return result;  
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return 'ERROR';
  }
}

// テスト呼び出し例
(async () => {
  const text1 = 'gitHubに不正な更新はある';
  const text2 = 'GitHubがおかしい';
  const text3 = 'GitHubの変更内容に誤りがある';

  const result = await isSameMeaning(text1, text2, text3);

  if (['YES', 'NO', '文1', '文2', '文3'].includes(result)) {
    console.log('内容の一致判定:', result);
  } 
})();
*/
