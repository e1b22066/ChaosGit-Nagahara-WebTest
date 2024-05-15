document.getElementById('filePickerButton').addEventListener('click', async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async () => {
                const content = reader.result;
                const filename = file.name;
                editor.setValue(content);
                document.getElementById('selectedFile').textContent = filename;
            };
            reader.readAsText(file);
        }
    });
    input.click();
});

document.getElementById('saveButton').addEventListener('click', async () => {
    const filename = document.getElementById('selectedFile').textContent;
    if (filename) {
        const content = editor.getValue();
        const response = await fetch('http://localhost:3000/file/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename, content })
        });
        if (response.ok) {
            alert('File saved successfully');
        } else {
            alert('Failed to save the file');
        }
    } else {
        alert('No file selected');
    }
});
