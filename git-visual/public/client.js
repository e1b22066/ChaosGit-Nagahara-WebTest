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
    var first = true; // 最初のコミットかどうかを判定する変数

    commits.forEach(commit => {
        console.log("mergeParentBranchは"+commit.mergeParentBranch); // デバッグ用ログ
        console.log(branches); // デバッグ用ログ
        

        const branchName = commit.branch.split(',')[0].trim(); // ブランチ名を取得
        /* マージコミットのときは，branchNameは空文字になる */
        console.log("branchNameは"+branchName);

        

        if (!branches[branchName] && branchName !== "") {
            if (first) {
                branches[branchName] = gitgraph.branch(branchName); // ブランチを作成
                first = false;
            }else{
                console.log("pre_branchNameは"+pre_branchName+" ,"+"branches[pre_branchName]は"+branches[pre_branchName]); // デバッグ用ログ
                // branches[branchName] = branches[commit.ParentBranch].branch(branchName); // ブランチを作成
                console.log('commit.ParentBranchは'+commit.ParentBranch);

                /* 
                問題点：
                ブランチを作成するとき，その親を指定する際に親がマージコミットであった場合，ブランチ名が特定できないのでbranch[ブランチ名].branch と指定することができない．
                pre_branchNameを使って，直前のブランチ名を取得してbranch[pre_branchName].branch と指定することで一時しのぎをしているが，これでは対応できない． 
                ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓　*/
                branches[branchName] = branches[pre_branchName].branch(branchName); // ブランチを作成
            }
        }

        if (commit.parents.length > 1) {
            // マージコミットの場合の処理
            console.log("merge commit");
            const mergeMessage = `Merge branch: ${commit.mergeParentBranch}`;
            console.log("commit.mergeParentBranchは"+commit.mergeParentBranch); // デバッグ用ログ
            // branches[commit.mergeParentBranch].merge({ branch: branches[pre_branchName], message: mergeMessage }); // マージ元のブランチ名を指定してマージ

            /* 
            問題点：
            このマージコミットの親もマージコミットである場合，ブランチ名が特定できないのでbranch[ブランチ名].merge と指定することができない 
            ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓　*/
            branches["main"].merge({ branch: branches[pre_branchName], message: mergeMessage }); // マージ元のブランチ名を指定してマージ
        } else {
            // マージコミットでない場合の処理
            console.log("normal commit");
            if(!branchName == ""){
                branches[branchName].commit({
                    subject: commit.message,
                    author: commit.author,
                    hash: commit.commit,
                    date: new Date(commit.date)
                });
            }else{
                branches[pre_branchName].commit({
                    subject: commit.message,
                    author: commit.author,
                    hash: commit.commit,
                    date: new Date(commit.date)
                });
            }
        }
        if(branchName !== ""){
            pre_branchName = branchName; // マージ元のブランチ名を更新
        }
        console.log("pre_branchNameは"+pre_branchName); // デバッグ用ログ
        console.log("-----------------------------------");
    });

}

drawGitGraph(); // drawGitGraph 関数を呼び出し
