// commit情報を取得する
async function fetchCommits() {
    const response = await fetch('http://localhost:3000/commits');
    const data = await response.json();
    return data.commits;
}

// commitグラフの描画
async function drawGitGraph() {
    const commits = await fetchCommits(); // fetchCommits 関数を呼び出し

    const graphContainer = document.getElementById('gitgraph');
    const gitgraph = GitgraphJS.createGitgraph(graphContainer);

    const branches = {};
    var pre_branchName = ""; // マージ元のブランチ名を保持する変数

    commits.forEach(commit => {
        console.log("mergeParentBranchは"+commit.mergeParentBranch); // デバッグ用ログ
        console.log(branches); // デバッグ用ログ
        

        const branchName = commit.branch.split(',')[0].trim(); // ブランチ名を取得
        /* マージコミットのときは，branchNameは空文字になる */
        console.log("branchNameは"+branchName);

        if (!branches[branchName] && branchName !== "") {
            branches[branchName] = gitgraph.branch(branchName); // ブランチを作成
        }

        if (commit.parents.length > 1) {
            // マージコミットの場合の処理
            console.log("merge commit");
            const mergeMessage = `Merge branch: ${commit.mergeParentBranch}`;
            console.log(pre_branchName);
            console.log(branches[pre_branchName]);
            branches[commit.mergeParentBranch].merge({ branch: branches[pre_branchName], message: mergeMessage }); // マージ元のブランチ名を指定してマージ
        } else {
            // マージコミットでない場合の処理
            console.log("normal commit");
            branches[branchName].commit({
                subject: commit.message,
                author: commit.author,
                hash: commit.commit,
                date: new Date(commit.date)
            });
        }
        pre_branchName = branchName; // マージ元のブランチ名を更新
        console.log("pre_branchNameは"+pre_branchName); // デバッグ用ログ
        console.log("-----------------------------------");
    });

}

drawGitGraph(); // drawGitGraph 関数を呼び出し
