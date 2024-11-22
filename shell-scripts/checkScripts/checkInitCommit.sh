#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

if [ -d "$REPO_PATH" ]; then
  # Check if Main.java is tracked by Git and was committed in the latest commit
  if git -C "$REPO_PATH" ls-files --error-unmatch Main.java > /dev/null 2>&1 && \
     git -C "$REPO_PATH" show HEAD:Main.java > /dev/null 2>&1; then
    echo "Task Completed: Main.java exists and is committed"
    exit 0
  else
    echo "Task Incomplete: Main.java is missing or not committed"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
