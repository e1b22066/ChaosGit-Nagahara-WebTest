const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');


const app = express();
const repoPath = '..';

// CORSの設定
app.use(cors());

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// バックエンドのエンドポイント
app.get('/commits', (req, res) => {
    const gitLogCommand = `git --git-dir=${repoPath}/.git log --all --reverse --pretty=format:'{"commit": "%H", "author": "%an <%ae>", "date": "%ad", "message": "%f", "branch": "%D", "parents": "%P"}'`;

    exec(gitLogCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ error: 'Failed to get Git log' });
        }

        const commits = stdout.split('\n').filter(commit => !!commit).map(commit => {
            const commitData = JSON.parse(commit);
            commitData.parents = commitData.parents.split(' '); // 複数の親コミットを配列に分割
            
            // マージコミット判定とマージ元のブランチ名取得
            if (commitData.parents.length > 1) {
                console.log("マージコミット");
                const mergeParentHash = commitData.parents[0];
                const mergeParentHash2 = commitData.parents[1];
                const mergeParentBranch = getBranchName(mergeParentHash);
                const mergeParentBranch2 = getBranchName(mergeParentHash2);
                commitData.mergeParentBranch = mergeParentBranch;
                console.log("親1:"+mergeParentBranch);
                console.log("親2:"+mergeParentBranch2);
                // console.log("マージコミット判定："+mergeParentBranch);
            } else {
                console.log("ノーマルコミット");
                const ParentHash = commitData.parents[0];
                const ParentBranch = getBranchName(ParentHash);
                commitData.mergeParentBranch = ParentBranch;
                commitData.mergeParentBranch = null;
                console.log("親:"+ParentBranch);
            }

            return commitData;
        });
        res.json({ commits });
    });
});

// コミットハッシュからブランチ名を取得する関数
// function getBranchName(commitHash) {
//     const branchNameCommand = `git --git-dir=${repoPath}/.git name-rev --name-only --refs=refs/heads/* ${commitHash}`;
//     const branchNameOutput = execSync(branchNameCommand, { encoding: 'utf-8' }).trim();
//     return branchNameOutput;
// }

// function getBranchName(commitHash) {
//     const branchNameCommand = `git --git-dir=${repoPath}/.git log --pretty=%D ${commitHash} -1`;
//     const branchNameOutput = execSync(branchNameCommand, { encoding: 'utf-8' }).trim();
    
//     // マージコミットかどうかを確認する
//     const isMergeCommit = branchNameOutput.includes('merge');

//     if (isMergeCommit) {
//         // マージコミットの場合は、親コミットからブランチ名を取得する
//         const parentBranchNameCommand = `git --git-dir=${repoPath}/.git name-rev --name-only --refs=refs/heads/* ${commitHash}^`;
//         const parentBranchNameOutput = execSync(parentBranchNameCommand, { encoding: 'utf-8' }).trim();
//         return parentBranchNameOutput;
//     }

//     // 通常のコミットの場合は、そのままブランチ名を返す
//     return branchNameOutput;
// }

function getBranchName(commitHash) {
    let currentCommitHash = commitHash;

    while (true) {
        const branchNameCommand = `git --git-dir=${repoPath}/.git name-rev --name-only --refs=refs/heads/* ${currentCommitHash}`;
        const branchNameOutput = execSync(branchNameCommand, { encoding: 'utf-8' }).trim();

        // ブランチ名が取得できた場合は返す
        if (branchNameOutput !== 'undefined' && branchNameOutput !== 'detached') {
            return branchNameOutput;
        }

        // 親コミットのハッシュを取得する
        const parentCommitHashCommand = `git --git-dir=${repoPath}/.git log --pretty=%P -n 1 ${currentCommitHash}`;
        const parentCommitHash = execSync(parentCommitHashCommand, { encoding: 'utf-8' }).trim();

        // 親コミットが存在しない場合は終了する
        if (!parentCommitHash) {
            return "Unknown";
        }

        // 親コミットを新しい現在のコミットとして設定する
        currentCommitHash = parentCommitHash.split(' ')[0]; // 複数の親コミットがある場合は最初の親を使用
    }
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
