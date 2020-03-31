const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require('glob');
const path = require('path');
const { JSDOM } = require("jsdom");
const child_process = require('child_process');
const readline = require('readline');
const url = require('url');

function toDirName(n) {
  return n.toLowerCase().replace(' ', '-');
}

function clone(experiments, exp_dir, common_repo_name) {
  console.log("\nClone\n");
  experiments.forEach((e) => {
    const ename = toDirName(e.name);
    child_process.execSync(`mkdir -p ${exp_dir}/${ename}`);
    if (!(fs.existsSync(`${exp_dir}/${ename}/${common_repo_name}`))){
      child_process.execSync(
        `cd ${exp_dir}/${ename}; 
         git clone ${e.repo}/${common_repo_name}`
      );
      console.log('cloned');
    }
    else {
      console.log(`${ename} cloned already, trying to pull`);
      child_process.execSync(
        `cd ${exp_dir}/${ename}/${common_repo_name}; 
         git pull origin ${e.branch}`
      );
    }
  });
}

function build(experiments, exp_dir, common_repo_name) {
  console.log("\nBuild\n");
  experiments.forEach((e) => {
    const ename = toDirName(e.name);
    console.log(`building ${ename}`);
    child_process.execSync(
      `cd ${exp_dir}/${ename}/${common_repo_name}; 
       cp config.mk.sample config.mk; make -sk all`
    );
    
  });
}


function deploy(experiments, exp_dir, common_repo_name, deployment_dest) {
  console.log("\nDeploy\n");
  experiments.forEach((e) => {
    const ename = toDirName(e.name);
    child_process.execSync(
      `mkdir -p ${deployment_dest}/${ename}; 
       cp -rf ${exp_dir}/${ename}/${common_repo_name}/build/* ${deployment_dest}/${ename}`
      );
    console.log(`${ename} deployed to ${deployment_dest}`);
  });
}


function getExpList(data){
  if (data.experiments){
    const experiments = data.experiments;
    return experiments;
  }
  else {
    const experiments = data['experiment-sections'].map((es) => es.experiments).flat();
    return experiments;
  }
}

function run(){
  const options = process.argv[2];
  const elistfn = process.argv[3];
  const commands = options.slice(6).split('');

  const data = JSON.parse(fs.readFileSync(elistfn, 'utf-8'));
  const experiments = getExpList(data);
  const config = require('./config.json');
  const exp_dir = config['exp_dir'];
  const common_repo_name = config['common_repo_name'];
  const deployment_dest = config['deployment_dest'];

  const lab_dir_name = toDirName(data.lab);
  const deployment_path = path.join(deployment_dest, lab_dir_name);
  child_process.execSync(`mkdir -p ${exp_dir}`);
  
  commands.forEach((cmd) => {
    switch(cmd) {
      case 'C':
	      clone(experiments, exp_dir, common_repo_name);	
	      break;
      case 'B':
        build(experiments, exp_dir, common_repo_name);
        break;
      case 'D':
	      deploy(experiments, exp_dir, common_repo_name, deployment_path);
	      break;
      default:
	      console.log('nothing to do!');
    }
  });
  
}

run();
