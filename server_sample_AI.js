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

