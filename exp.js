const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

const {buildPages} = require("./renderpage.js");

const repo_root = "../";
const build_root = "../build";


function copySources() {
    
    const repo_dir = path.join( repo_root, "experiment" );
    const build_dir = path.join( build_root );
    const round_template_dir = path.join( build_root, "round-template" );
    const exp_content_dir = path.join( round_template_dir, "experiment" );
    
    shell.rm( "-rf", exp_content_dir );
    try {
	fs.accessSync( build_dir , fs.constants.W_OK);
    }
    catch (err) {
	shell.mkdir( "-p", round_template_dir );
    }
    shell.cp( "-R", repo_dir,  round_template_dir );
}


function copyPages() {
    
    const repo_dir = path.join( repo_root, "experiment" );
    const build_dir = path.join( build_root );
    
    shell.cp( "-R", "ui3template/assets", build_dir );
    shell.cp( "-R", path.join(repo_dir, "images"), build_dir );
}


function buildExp() {
    copySources();
    buildPages( {}, {}, false );
    copyPages();
}


buildExp();
