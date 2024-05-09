document.getElementById('filePickerButton').addEventListener('click', async () => {
    const response = await fetch('/files');
    const files = await response.json();
    // ファイルリストを表示する処理を追加
});
document.getElementById('fileList').addEventListener('click', async (event) => {
    if (event.target.tagName === 'LI') {
        const filename = event.target.textContent;
        const response = await fetch(`/file/${filename}`);
        const content = await response.text();
        editor.setValue(content);
    }
});
document.getElementById('saveButton').addEventListener('click', async () => {
    const filename = document.getElementById('selectedFile').textContent;
    const content = editor.getValue();
    await fetch('/file/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename, content })
    });
    alert('File saved successfully');
});
//