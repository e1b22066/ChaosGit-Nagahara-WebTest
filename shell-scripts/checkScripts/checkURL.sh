#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

# expected_url="https://github.com/Dagechan/WorkSpace.git"
expected_url="git@github.com:Dagechan/WorkSpace.git"
actual_url=$(git -C "$REPO_PATH" remote get-url origin)

# check if the directory exists
if [ -d "$REPO_PATH" ]; then
  # execute git command in the specified directory
  if [ "$actual_url" = "$expected_url" ]; then
    echo "Task 4 Completed"
    exit 0
  else
    echo "Task 4 Incomplete"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi