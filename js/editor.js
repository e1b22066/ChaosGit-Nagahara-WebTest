// HTMLファイルからエディタの要素を取得
var editorElement = document.getElementById("editor");

// Ace Editorの設定オブジェクトを作成
var editorOptions = {
    // エディタのテーマを設定
    theme: "ace/theme/monokai",
    // エディタの言語モードを設定（ここではJavaScript）
    mode: "ace/mode/javascript",
    // エディタの初期内容を設定
    value: `// ここにコードを入力してください`,
    // エディタの行数を自動調整する設定
    autoScrollEditorIntoView: true,
};

// Ace Editorを生成し、設定を適用
var editor = ace.edit(editorElement);
editor.setOptions(editorOptions);
