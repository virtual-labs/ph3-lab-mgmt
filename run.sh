#!/bin/bash
npm install
npm run build-exp
cd ../
git config --local user.email "admin@vlabs.ac.in"
git config --local user.name "vleadadmin"
git checkout --orphan gh-pages
git reset
git add build/* -f
git mv build/* ./ -f
