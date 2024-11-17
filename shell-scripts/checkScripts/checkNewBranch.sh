#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

BRANCH_NAME="feature-xyz"

if [ -d "$REPO_PATH" ]; then
  # check if the branch exists on the remote
  if git -C "$REPO_PATH" branch -r | grep -q "origin/$BRANCH_NAME"; then
    echo "Task 9 Completed"
    exit 0
  else
    echo "Task 9 Incomplete"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
