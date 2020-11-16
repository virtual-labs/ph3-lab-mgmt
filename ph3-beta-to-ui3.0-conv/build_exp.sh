#!/bin/bash

template=ui3template


## Copy template files to the build directory of the experiment.
mkdir -p ../../build
mkdir -p ../../build/round-template
cp -r $template/* ../../build


## Copy content (simulations, and other files like markdown, images etc) from the source repo directory
## to the build directory and rename it to "round-template".
cp -r ../../experiment ../../build/round-template
cp -r ../../experiment/images ../../build

#cp fixpointer.py ../../build/round-template/experiment/simulation/
#cd ../../build/round-template/experiment/simulation/
#python2 fixpointer.py

exit 0
