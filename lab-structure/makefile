SHELL := /bin/bash
PWD=$(shell pwd)
SRC_DIR=${PWD}/src
BUILD_DIR=${PWD}/build
THEME=green-icon
STATUS=0

all: clean-build build 

init:
	./init.sh

build: clean-build create-build-dir copy-lab-sources copy-lab-theme
	
create-build-dir:
	mkdir -p ${BUILD_DIR}

copy-lab-sources:
	cp -rf ${SRC_DIR}/lab/* ${BUILD_DIR}

copy-libs:
	cp -rf ${SRC_DIR}/libs ${BUILD_DIR}

copy-lab-theme:
	cp -rf ${SRC_DIR}/themes/${THEME}/* ${BUILD_DIR}

clean-build:
	rm -rf ${BUILD_DIR}

run:
	cd ${BUILD_DIR};python -m SimpleHTTPServer 8000

