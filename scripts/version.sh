#!/usr/bin/env bash

npm version $1
git add package.json
git commit -m \"version\"
git push origin master
npm publish
