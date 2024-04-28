// fetchCommits 関数を定義
async function fetchCommits() {
    const response = await fetch('http://localhost:3000/commits');
    const data = await response.json();
    return data.commits;
}

// drawGitGraph 関数を定義
async function drawGitGraph() {
    const commits = await fetchCommits(); // fetchCommits 関数を呼び出し

    const graphContainer = document.getElementById('gitgraph');
    const gitgraph = GitgraphJS.createGitgraph(graphContainer);

    const branches = {};

    commits.forEach(commit => {
        const branchName = commit.branch.split(',')[0].trim(); // ブランチ名を取得

        if (!branches[branchName]) {
            branches[branchName] = gitgraph.branch(branchName); // ブランチを作成
        }

        branches[branchName].commit({
            subject: commit.message,
            author: commit.author,
            hash: commit.commit,
            date: new Date(commit.date)
        });
    });
}

drawGitGraph(); // drawGitGraph 関数を呼び出し
