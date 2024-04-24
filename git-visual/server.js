const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const repoPath = '..';

// CORSの設定
app.use(cors());

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// バックエンドのエンドポイント
app.get('/commits', (req, res) => {
    const gitLogCommand = `git --git-dir=${repoPath}/.git log --all --pretty=format:'{"commit": "%H", "author": "%an <%ae>", "date": "%ad", "message": "%f", "branch": "%D", "parents": "%P"}'`;

    exec(gitLogCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: 'Failed to get Git log' });
        }

        const commits = stdout.split('\n').filter(commit => !!commit).map(commit => {
            const commitData = JSON.parse(commit);
            commitData.parents = commitData.parents.split(' '); // 複数の親コミットを配列に分割
            return commitData;
        });
        res.json({ commits });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
