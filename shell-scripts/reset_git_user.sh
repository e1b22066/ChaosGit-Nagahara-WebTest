#!/bin/bash

# Gitのユーザ設定を初期化するスクリプト

echo "Gitのユーザ設定（ユーザ名とメールアドレス）を初期化します..."

# グローバル設定のユーザ名を削除
git config --global --unset user.name
if [ $? -eq 0 ]; then
    echo "グローバル設定のユーザ名を削除しました。"
else
    echo "ユーザ名の削除に失敗しました。既に設定が存在しない可能性があります。"
fi

# グローバル設定のメールアドレスを削除
git config --global --unset user.email
if [ $? -eq 0 ]; then
    echo "グローバル設定のメールアドレスを削除しました。"
else
    echo "メールアドレスの削除に失敗しました。既に設定が存在しない可能性があります。"
fi

# 結果を確認
echo "現在の設定:"
git config --global --list

echo "初期化が完了しました！"
