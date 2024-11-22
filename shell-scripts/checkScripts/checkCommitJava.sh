#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

if [ -d "$REPO_PATH" ]; then
  # check if Main.java exists in the latest commit
  if git -C "$REPO_PATH" log -1 --name-only | grep -q "Main.java"; then
    echo "Task 7 Completed"
    exit 0
  else
    echo "Task 7 Incomplete"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
