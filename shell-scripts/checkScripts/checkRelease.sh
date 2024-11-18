#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"
# REPO_PATH="../../../workspace"
EXPECTED_TAG="v1.0"
RELEASE_BRANCH="release/v1.0"

if [ -d "$REPO_PATH" ]; then
  # Check if the tag v1.0 exists locally and has been pushed to the remote
  if git -C "$REPO_PATH" show-ref --tags "$EXPECTED_TAG" > /dev/null 2>&1 && \
     git -C "$REPO_PATH" ls-remote --tags origin | grep -q "refs/tags/$EXPECTED_TAG"; then
    
    # Check if the release branch exists locally and has been pushed to the remote
    if git -C "$REPO_PATH" show-ref --heads "$RELEASE_BRANCH" > /dev/null 2>&1 && \
       git -C "$REPO_PATH" ls-remote --heads origin | grep -q "refs/heads/$RELEASE_BRANCH"; then
      
      echo "Task Completed: Tag $EXPECTED_TAG and branch $RELEASE_BRANCH are correctly created and pushed"
      exit 0
    else
      echo "Task Incomplete: Release branch $RELEASE_BRANCH is missing or not pushed"
      exit 1
    fi
  else
    echo "Task Incomplete: Tag $EXPECTED_TAG is missing or not pushed"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
