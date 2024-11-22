#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"
BRANCH_NAME="feature-xyz"

if [ -d "$REPO_PATH" ]; then
  # check if branch is merged into main
  if git -C "$REPO_PATH" branch --merged main | grep -q "$BRANCH_NAME"; then
    echo "Task 10 Completed"
    exit 0
  else
    echo "Task 10 Incomplete"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
