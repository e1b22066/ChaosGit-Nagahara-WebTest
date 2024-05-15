var editorElement = document.getElementById("editor");

var editorOptions = {
    theme: "ace/theme/monokai",
    mode: "ace/mode/javascript",
    autoScrollEditorIntoView: true,
};

var editor = ace.edit(editorElement);
editor.setOptions(editorOptions);
