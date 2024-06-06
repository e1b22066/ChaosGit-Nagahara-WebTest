document.getElementById('filePickerButton').addEventListener('click', async (event) => {
    const currentDir = document.getElementById('currentDir').textContent || '/home/takeaki/';
    await loadFileList(currentDir, event.clientX, event.clientY);
});

async function loadFileList(dir, x, y) {
    const response = await fetch(`http://localhost:3000/file-tree?dir=${encodeURIComponent(dir)}`);
    const files = await response.json();
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    // 戻るボタンを追加
    if (dir !== '/home/takeaki/') {
        const backItem = document.createElement('li');
        backItem.innerHTML = '<i class="fas fa-arrow-up"></i> ..';
        backItem.addEventListener('click', async () => {
            const parentDir = dir.substring(0, dir.lastIndexOf('/'));
            document.getElementById('currentDir').textContent = parentDir;
            await loadFileList(parentDir, x, y);
        });
        fileList.appendChild(backItem);
    }

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.innerHTML = file.isDirectory ? `<i class="fas fa-folder"></i> ${file.name}` : `<i class="fas fa-file"></i> ${file.name}`;
        listItem.addEventListener('click', async () => {
            if (file.isDirectory) {
                document.getElementById('currentDir').textContent = file.path;
                await loadFileList(file.path, x, y);
            } else {
                const fileResponse = await fetch(`http://localhost:3000/file/${encodeURIComponent(file.path)}`);
                const content = await fileResponse.text();
                editor.setValue(content);
                document.getElementById('selectedFile').textContent = file.path;
                fileList.style.display = 'none';
            }
        });
        fileList.appendChild(listItem);
    });

    fileList.style.display = 'block';
    fileList.style.left = `${x}px`;
    fileList.style.top = `${y}px`;
}

document.addEventListener('click', (event) => {
    const fileList = document.getElementById('fileList');
    if (!fileList.contains(event.target) && event.target.id !== 'filePickerButton') {
        fileList.style.display = 'none';
    }
});

document.getElementById('saveButton').addEventListener('click', async () => {
    const saveModal = document.getElementById('saveModal');
    const saveFileList = document.getElementById('saveFileList');
    const currentDir = document.getElementById('currentDir').textContent || '/home/takeaki/';

    saveFileList.innerHTML = '';
    await loadSaveFileList(currentDir);

    saveModal.style.display = 'block';
});

async function loadSaveFileList(dir) {
    const response = await fetch(`http://localhost:3000/file-tree?dir=${encodeURIComponent(dir)}`);
    const files = await response.json();
    const saveFileList = document.getElementById('saveFileList');
    saveFileList.innerHTML = '';

    // 戻るボタンを追加
    if (dir !== '/home/takeaki/') {
        const backItem = document.createElement('li');
        backItem.innerHTML = '<i class="fas fa-arrow-up"></i> ..';
        backItem.addEventListener('click', async () => {
            const parentDir = dir.substring(0, dir.lastIndexOf('/'));
            document.getElementById('currentDir').textContent = parentDir;
            await loadSaveFileList(parentDir);
        });
        saveFileList.appendChild(backItem);
    }

    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.innerHTML = file.isDirectory ? `<i class="fas fa-folder"></i> ${file.name}` : `<i class="fas fa-file"></i> ${file.name}`;
        listItem.addEventListener('click', async () => {
            if (file.isDirectory) {
                document.getElementById('currentDir').textContent = file.path;
                await loadSaveFileList(file.path);
            }
        });
        saveFileList.appendChild(listItem);
    });
}

document.getElementById('confirmSaveButton').addEventListener('click', async () => {
    const filename = document.getElementById('saveFileName').value;
    const currentDir = document.getElementById('currentDir').textContent || '/home/takeaki/';

    if (filename) {
        const content = editor.getValue();
        const response = await fetch('http://localhost:3000/file/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: path.join(currentDir, filename), content })
        });
        if (response.ok) {
            alert('File saved successfully');
            document.getElementById('saveModal').style.display = 'none';
        } else {
            alert('Failed to save the file');
        }
    } else {
        alert('No file name specified');
    }
});

// モーダルを閉じる
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('saveModal').style.display = 'none';
});

window.onclick = function(event) {
    if (event.target == document.getElementById('saveModal')) {
        document.getElementById('saveModal').style.display = 'none';
    }
}
