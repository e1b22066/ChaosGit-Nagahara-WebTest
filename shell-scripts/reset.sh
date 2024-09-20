#!/bin/bash

# リポジトリのパスを指定
REPO_PATH="../workspace"

# リモートリポジトリのURLを指定
REMOTE_URL="git@github.com:Dagechan/chaos-repo.git"

# 必要に応じてディレクトリを作成
mkdir -p "$REPO_PATH"

# ディレクトリ内に移動
cd "$REPO_PATH"

# ローカルリポジトリが存在するか確認
if [ ! -d ".git" ]; then
    # ローカルリポジトリを初期化
    git init
    echo "Initialized empty Git repository in $REPO_PATH"
else
    echo "Git repository already exists in $REPO_PATH"
fi

# デフォルトブランチの設定を変更（新規に作成されるリポジトリ用）
git config --global init.defaultBranch main

# デフォルトブランチがmasterの場合にmainにリネーム
if git show-ref --verify --quiet refs/heads/master; then
    git branch -m master main
    echo "Renamed master branch to main"
fi

# リモートリポジトリの設定または更新
if git remote get-url origin &>/dev/null; then
    CURRENT_URL=$(git remote get-url origin)
    if [ "$CURRENT_URL" != "$REMOTE_URL" ]; then
        git remote set-url origin "$REMOTE_URL"
        echo "Updated remote URL from $CURRENT_URL to $REMOTE_URL"
    else
        echo "Remote URL is already set to $REMOTE_URL"
    fi
else
    git remote add origin "$REMOTE_URL"
    echo "Remote URL set to $REMOTE_URL"
fi

# デフォルトブランチがmainかどうか確認
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
if [ "$DEFAULT_BRANCH" != "main" ]; then
    # リモートにブランチをプッシュ
    git push -u origin main
    echo "Pushed main branch to remote"
else
    echo "Default branch is already main"
fi

echo "Repository setup completed successfully"
