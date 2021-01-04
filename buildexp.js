const shell = require("shelljs");
const path = require("path");
const fs = require("fs");

const {buildPages} = require("./renderpage.js");
//const {cloneExperiment} = require("./cloneexp.js");


const repo_root = "exprepos";
const build_root = "expbuilds";


function copySources( experiment ) {

    console.log("copy sources");
    
    const repo_dir = path.join( repo_root, experiment["short-name"], "experiment" );
    const build_dir = path.join( build_root, experiment["short-name"] );
    const round_template_dir = path.join( build_root, experiment["short-name"], "round-template" );
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


function copyPages( experiment ) {

    console.log("copy pages");
    
    const build_dir = path.join( build_root, experiment["short-name"] );
    const repo_dir = path.join( repo_root, experiment["short-name"], "experiment" );
    
    shell.cp( "-R", "ui3template/assets", build_dir );
    shell.cp( "-R", path.join(repo_dir, "images"), build_dir );
}


function buildExp(data, experiment) {
    console.log("building experiment");
    copySources( experiment );
    buildPages( data, experiment, false );
    copyPages( experiment );
}

exports.buildExp = buildExp;
