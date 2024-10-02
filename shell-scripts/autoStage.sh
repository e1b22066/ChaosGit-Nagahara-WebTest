#!/bin/bash

# 1. 作成するリポジトリのパスを指定
REPO_PATH="../workspace"

# 2. 作成するファイル名
FILE_NAME="sussy.txt"

# 3. Gitステージングする前に、ディレクトリの存在を確認
if [ -d "$REPO_PATH" ]; then
    # ディレクトリが存在する場合
    cd "$REPO_PATH" || exit 1  # ディレクトリが存在しない場合は終了
    echo "Navigated to $REPO_PATH"

    # ファイルの作成
    if [ -f "$FILE_NAME" ]; then
        echo "$FILE_NAME already exists."
    else
        touch "$FILE_NAME"
        echo "$FILE_NAME file created successfully."
    fi

    # 4. Gitステージングに追加
    git add "$FILE_NAME"

    # 5. ステージングが成功したかを確認
    if [ $? -eq 0 ]; then
        echo "File '$FILE_NAME' successfully added to git staging."
    else
        echo "Failed to stage the file '$FILE_NAME'."
    fi

else
    # ディレクトリが存在しない場合
    echo "$REPO_PATH does not exist"
fi
