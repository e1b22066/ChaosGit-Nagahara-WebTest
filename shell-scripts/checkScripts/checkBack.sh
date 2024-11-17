#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

if [ -d "$REPO_PATH" ]; then
  # check if the last commit is a revert
  if git -C "$REPO_PATH" log -1 --pretty=%s | grep -qi "revert"; then
    echo "Task 8 Completed"
    exit 0
  else
    echo "Task 8 Incomplete"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
