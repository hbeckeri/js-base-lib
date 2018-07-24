#!/usr/bin/env bash

npm version patch
git add package.json
git commit -m \"version\"
git push origin master
npm publish
