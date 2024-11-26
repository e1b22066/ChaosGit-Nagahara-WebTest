#!/bin/bash

# リポジトリのパスを指定
REPO_PATH="../workspace/"
EXPECTED_TAG="v1.0"
TARGET_BRANCH="main"

if [ -d "$REPO_PATH" ]; then
  # リポジトリのパスに移動
  cd "$REPO_PATH" || exit 1

  # 現在のブランチが main であることを確認
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
    echo "Task Incomplete: Current branch is '$CURRENT_BRANCH'. Please switch to '$TARGET_BRANCH'."
    exit 1
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
