const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const url = require('url');

function getExpProjectName(repo_url){
  const u = new URL(repo_url);
  const ename = u.pathname.split('/')[4];
  return ename;
}

function clone(experiments, exp_dir, common_repo_name) {
  console.log("\nClone\n");
  experiments.forEach((e) => {
    const ename = getExpProjectName(e.repo);
    child_process.execSync(`mkdir -p ${exp_dir}/${ename}`);
    if (!(fs.existsSync(`${exp_dir}/${ename}/${common_repo_name}`))){
      child_process.execSync(`cd ${exp_dir}/${ename}; git clone ${e.repo}/${common_repo_name}`);
      console.log('cloned');
    }
    else {
      console.log(`${ename} cloned already`);
    }
  });
}


function pull(experiments, exp_dir, common_repo_name) {
  
}


function build(experiments, exp_dir, common_repo_name) {
  console.log("\nBuild\n");
  experiments.forEach((e) => {
    const ename = getExpProjectName(e.repo);
    /* if (!(fs.existsSync(`${exp_dir}/${ename}/${common_repo_name}/build`))){
     *   child_process.execSync(`cd ${exp_dir}/${ename}/${common_repo_name}; cp config.mk.sample config.mk; make -k all`);
     * } */
    console.log(`building ${ename}`);
    child_process.execSync(`cd ${exp_dir}/${ename}/${common_repo_name}; cp config.mk.sample config.mk; make -sk all`);
    
  });
}


function deploy(experiments, exp_dir, common_repo_name, deployment_dest) {
  console.log("\nDeploy\n");
  experiments.forEach((e) => {
    const ename = getExpProjectName(e.repo);
    child_process.execSync(`mkdir -p ${deployment_dest}/${ename}; cp -rf ${exp_dir}/${ename}/${common_repo_name}/build/* ${deployment_dest}/${ename}`);
    console.log(`${ename} deployed to ${deployment_dest}`);
  });
}




function run(){
  const options = process.argv[2];
  const elistfn = process.argv[3];
  const commands = options.slice(6).split('');

  const experiments = JSON.parse(fs.readFileSync(elistfn, 'utf-8'));
  const exp_dir = 'experiments';
  const common_repo_name = 'content-html';
  const deployment_dest = '/var/www/html';

  child_process.execSync(`mkdir -p ${exp_dir}`);
  
  commands.forEach((cmd) =>{
    switch(cmd) {
      case 'C':
	clone(experiments, exp_dir, common_repo_name);	
	break;
      case 'B':
	build(experiments, exp_dir, common_repo_name);
	break;
      case 'D':
	deploy(experiments, exp_dir, common_repo_name, deployment_dest);
	break;
      default:
	console.log('nothing to do!');
    }
  });
  
}

run();
