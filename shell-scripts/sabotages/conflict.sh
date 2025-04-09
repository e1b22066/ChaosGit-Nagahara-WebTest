#!/bin/bash

# This is sagotage no.3

# リモートリポジトリのURLと一時クローンディレクトリ
# REMOTE_REPO_PATH="git@github.com:Dagechan/WorkSpace.git"
REMOTE_REPO_PATH="git@github.com:e1b22066/Workspace-test.git"
TEMP_DIR="../workspace/temp_repo"

# 1. リモートリポジトリを一時ディレクトリにクローン
git clone "$REMOTE_REPO_PATH" "$TEMP_DIR"
cd "$TEMP_DIR"

# 2. mainブランチをチェックアウト
git checkout main

# 3. Monster.java にサボタージュとして競合する変更を加える
echo 'public class Monster {' > Monster.java
echo '    public static void main(String[] args) {' >> Monster.java
echo '        System.out.println("Hello Sabotage!");' >> Monster.java
echo '    }' >> Monster.java
echo '}' >> Monster.java

git add Monster.java
git commit -m "Sabotage: conflicting change to Monster.java"

# 4. 変更をリモートリポジトリにプッシュ
git push origin main

# 5. クリーンアップ
cd ..
rm -rf "$TEMP_DIR"

echo "Sabotage 3 complete: Conflict introduced in Monster.java on main branch."
