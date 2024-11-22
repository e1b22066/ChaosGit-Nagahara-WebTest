#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

if [ -d "$REPO_PATH" ]; then
  # check if .gitignore exists and contains .class
  if git -C "$REPO_PATH" ls-files --error-unmatch .gitignore > /dev/null 2>&1 && \
     git -C "$REPO_PATH" show HEAD:.gitignore | grep -q "\.class"; then
    echo "Task 6 Completed"
    exit 0
  else
    echo "Task 6 Incomplete"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
