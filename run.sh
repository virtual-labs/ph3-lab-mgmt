#!/bin/bash
npm install
npm run build-exp
cd ../
git reset
git add build/* -f
git mv build/* ./ -f
