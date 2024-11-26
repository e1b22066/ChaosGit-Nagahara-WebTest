#!/bin/bash

# リポジトリのパスを指定
REPO_PATH="../workspace/"
EXPECTED_TAG="v1.0"
TARGET_BRANCH="main"

if [ -d "$REPO_PATH" ]; then
  # リポジトリのパスに移動
  cd "$REPO_PATH" || exit 1

  # 現在のブランチを取得
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

  # 現在のブランチが main でない場合、main ブランチに切り替え
  if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    echo "Switching to branch '$TARGET_BRANCH'..."
    if git checkout "$TARGET_BRANCH" > /dev/null 2>&1; then
      echo "Successfully switched to '$TARGET_BRANCH'."
    else
      echo "Failed to switch to branch '$TARGET_BRANCH'. Ensure it exists and try again."
      exit 1
    fi
  fi

  # タグがローカルに存在し、リモートにプッシュされていることを確認
  if git show-ref --tags "$EXPECTED_TAG" > /dev/null 2>&1 && \
     git ls-remote --tags origin | grep -q "refs/tags/$EXPECTED_TAG"; then
    echo "Task Completed: Tag $EXPECTED_TAG has been correctly created and pushed."
    exit 0
  else
    echo "Task Incomplete: Tag $EXPECTED_TAG is missing or not pushed."
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
