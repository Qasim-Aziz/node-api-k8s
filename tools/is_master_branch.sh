#!/bin/bash
set -e

branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
if [ "$branch" == "master" ]
then
    echo "Not allowed to commit/push directly on master. Please use pull request"
    exit 1
fi
