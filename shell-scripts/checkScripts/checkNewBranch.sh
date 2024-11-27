#!/bin/bash

# Specify the repository path and parameters
REPO_PATH="../workspace/"
MAIN_BRANCH="main"
FEATURE_BRANCH="feature-xyz"
SABOTAGE_FILE="unnecessary_file.txt"
TARGET_FILE="Monster.java"

if [ -d "$REPO_PATH" ]; then
  cd "$REPO_PATH" || exit 1

  # 1. Check if the sabotage file is absent in the latest state of the main branch
  SABOTAGE_REMOVED=false
  if git checkout "$MAIN_BRANCH" > /dev/null 2>&1; then
    if [ ! -f "$SABOTAGE_FILE" ]; then
      SABOTAGE_REMOVED=true
    fi
  else
    echo "Error: Unable to switch to branch '$MAIN_BRANCH'."
    exit 1
  fi

  # 2. Check if the feature branch exists on the remote
  FEATURE_BRANCH_EXISTS=false
  if git branch -r | grep -q "origin/$FEATURE_BRANCH"; then
    FEATURE_BRANCH_EXISTS=true
  fi

  # 3. Check if Monster.java exists in the feature branch
  MONSTER_FILE_EXISTS=false
  if $FEATURE_BRANCH_EXISTS; then
    if git checkout "$FEATURE_BRANCH" > /dev/null 2>&1; then
      if git ls-tree --name-only HEAD | grep -q "$TARGET_FILE"; then
        MONSTER_FILE_EXISTS=true
      fi
    else
      echo "Error: Unable to switch to branch '$FEATURE_BRANCH'."
      exit 1
    fi
  fi

  # Final task completion checks
  if $SABOTAGE_REMOVED && $FEATURE_BRANCH_EXISTS && $MONSTER_FILE_EXISTS; then
    echo "Task Completed: Sabotage file removed, feature branch created, and $TARGET_FILE added."
    exit 0
  else
    if ! $SABOTAGE_REMOVED; then
      echo "Task Incomplete: Sabotage commit still exists."
    fi
    if ! $FEATURE_BRANCH_EXISTS; then
      echo "Task Incomplete: Feature branch '$FEATURE_BRANCH' does not exist on the remote."
    fi
    if ! $MONSTER_FILE_EXISTS; then
      echo "Task Incomplete: $TARGET_FILE not found in branch '$FEATURE_BRANCH'."
    fi
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
