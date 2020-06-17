const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require('glob');
const path = require('path');
const { JSDOM } = require("jsdom");
const child_process = require('child_process');
const readline = require('readline');
const url = require('url');
const fse = require("fs-extra");
const {StringDecoder} = require('string_decoder');
const figures = require('figures');
const chalk = require('chalk');
var shell = require('shelljs');

shell.config.silent = true;
shell.set('-e');

const validator = require('./validateDescriptor.js');

const labDescriptorFn = "lab-descriptor.json";


/* 
   Copy lab descriptor to the lab repository's working directory.  If
   a lab-descriptor is already present then don't copy.
*/
function copyLabDescriptor(repoDir) {
    const ldpath = path.resolve(repoDir, labDescriptorFn);
    if (fse.existsSync(ldpath)) {
	console.error("Lab Descriptor Already exists");
    }
    else {
	fse.copySync(labDescriptorFn, ldpath);
    }  
}



/*

  If this is the first time, then there is no tag, so start with
  v0.0.0

  If there already exists a tag then we increment the tag based on
  release type taken as input from user.

  If this works, then push the new tag.  If the user input is invalid,
  return.
  
*/

function pushLab(repoDir) {
    let mj, mn, pt;
    try {
	const res = child_process.execSync(`cd ${repoDir}; git describe --tags`);
	const dc = new StringDecoder('utf-8');
	tag = dc.write(Buffer.from(res));
	[mj, mn, pt] = tag.slice(1).split('.').map(parseFloat);
    }
    catch(e) {
	console.log("This is the first release");
	mj = 0; mn = 0; pt = 0;
    }
    const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
    });

    /*
      
      patch 1.0.0 => 1.0.1
      minor 1.0.0 => 1.1.0
            1.0.2 => 1.1.0
      
     */
    
    rl.question(chalk`\n{cyan Lab release? {bold [major, minor, patch]}} {bold (default=minor)} `, (answer) => {
	if (!answer) answer = 'minor';
	switch (answer) {
	case 'major':
	    mj += 1; mn = 0; pt = 0;
	    break;
	case 'minor':
	    mn +=1 ; pt = 0;
	    break;
	case 'patch':
	    pt += 1;
	    break;
	default:
	    console.log(chalk`{bold {red Invalid response.  Please run the script again}}`);
	    rl.close();	    
	    return;
	}
	const version = `v${mj}.${mn}.${pt}`;
	const branch = 'master';
	const commitMsg = `Lab generated at ${Date.now()}`;
	child_process.execSync(
	    `cd ${repoDir}; 
git add license.org lab-descriptor.json src/;
git commit -m "${commitMsg}";
git push origin ${branch}`
	);
	child_process.execSync(
	    `cd ${repoDir}; 
git tag -a ${version} -m "version ${version}"; 
git push origin ${version}`
	);	
	rl.close();
    })    
}



function deploy_lab(src, destPath) {
    child_process.execSync(`rsync -a ${src} ${destPath}`);
}


function buildPage(template_file, component_files, content_file) {
    const main_template = fs.readFileSync(template_file, 'utf-8');
    const components = loadComponents(component_files);
    const content = fs.readFileSync(`page-components/${content_file}`, 'utf-8');
    const res_html = populateTemplate(main_template, components, content);
    return res_html;
}


function loadComponents(component_files) {
    const components = component_files.map((fn) => 
					   fs.readFileSync(`page-components/${fn}`, 'utf-8')
					  );
    return components;
}


function populateTemplate(template, components, content) {
    let dom = new JSDOM(`${template}`);
    let res = addAnalytics(dom, components[0]);
    res = addLabName(res, components[1]);
    res = addBroadAreaName(res, components[2]);
    res = addSideBar(res, components[3]);
    res = addContent(res, content);
    return res.serialize();
}


function addAnalytics(dom, analyticsSnippet) {
    dom.window.document.head.querySelector('script').innerHTML = analyticsSnippet;
    return dom;
}


function addNavbar(dom, navbar) {
    dom.window.document.querySelector('header').innerHTML = navbar;
    return dom;
}



function addSlider(dom, slider) {
    dom.window.document.querySelector('#content > div').innerHTML = slider;
    return dom;
}


function addBroadAreaName(dom, broadareaName) {
    dom.window.document
	.querySelector('.vlabs-page-main > div')
	.innerHTML = broadareaName;
    return dom;
}


function addLabName(dom, labname) {
    dom.window.document
	.querySelector('.lab-name').innerHTML = labname;
    return dom;
}

function addSideBar(dom, sidebar) {
    dom.window.document
	.querySelector('.sidebar').innerHTML = sidebar;
    return dom;
}


function addContent(dom, ctnt) {
    dom.window.document
	.querySelector('.vlabs-page-content > div')
	.innerHTML = ctnt;
    return dom;
}

function addFooter(dom, footer) {
    dom.window.document.querySelector('footer').innerHTML = footer;
    return dom;
}


function addRandomJsThings(dom, jsthings) {
    dom.window.document.body.innerHTML = (dom.window.document.body.innerHTML + jsthings);
    return dom;
}


function genComponentHtml(fn, data) {
    const template = fs.readFileSync(fn, 'utf-8');
    const base = path.parse(fn).name;
    html = (Handlebars.compile(template))(data);
    fs.writeFileSync(`page-components/${base}.html`, html, 'utf-8');
}


function prepareStructure(labpath){
    child_process.execSync(`cp -rf lab-structure/* ${labpath}/`);
    child_process.execSync(`mkdir -p ${labpath}/src/lab`);
}


function copyPages(pages, template_file, component_files, labpath){
    pages.forEach( p => {
	const res_html = buildPage(template_file, component_files, p.src);
	fs.writeFileSync(`${labpath}/src/lab/${p.target}`, res_html, 'utf-8');
    });  
}

function generateLab(pages, labpath, template_file, component_files){
    child_process.execSync(`cd ${labpath}; git checkout master; git pull origin master`);
    child_process.execSync(`cd ${labpath}`);
    prepareStructure(labpath);
    copyPages(pages, template_file, component_files, labpath);
    child_process.execSync(`cd ${labpath}; make`);
}


function dataPreprocess(datafile){

    const data = JSON.parse(fs.readFileSync(datafile));

    if (data.experiments) {
	data.experiments = data.experiments.map((e) => {
	    const exp_url = generateLink(data.baseUrl, data.lab, e['short-name']);
	    return {"name": e.name, "link": exp_url.toString()}
	});
	return data;
    }
    else {
	if (data["experiment-sections"]) {
	    data["experiment-sections"] = data["experiment-sections"].map((es) => {
		return { 
		    "sect-name": es["sect-name"],
		    "experiments": es.experiments.map((e) => {
			const exp_url = generateLink(data.baseUrl, data.lab, e['short-name'], index_fn='exp.html');
			return {"name": e.name, "link": exp_url.toString()}
		    })
		}; 
	    });
	    return data;      
	}
    }
}

function toDirName(n) {
    return n.toLowerCase().trim().replace(/–/g, '').replace(/ +/g, '-');
}

function generateLink(baseUrl, labName, expName, index_fn='') {
    
    const expUrl = new URL(`http://${baseUrl}/${toDirName(labName)}/exp/${expName}/${index_fn}`);
    console.log(expUrl.href);
    return expUrl;
}


function generate(labpath) {
    
    const data = dataPreprocess(path.join(labpath, 'lab-descriptor.json'));
    
    const template_file = "skeleton-new.html";
    const config = JSON.parse(fs.readFileSync('config.json'));
    const component_files = config.commonComponents;
    
    const fns = glob.sync('page-templates/*.handlebars');
    if ((data.experiments === undefined) && (data["experiment-sections"] !== undefined)){      
	fns.forEach((fn) => genComponentHtml(fn, data));
	config.pages = config.pages.filter((p) => !(p.src === 'list-of-experiments-ctnt.html'));
    }
    else {
	if ((data.experiments !== undefined) && (data["experiment-sections"] === undefined)){        
	    fns.filter((fn) => !(fn.includes("nested"))).forEach((fn) => genComponentHtml(fn, data));
	}
	config.pages = config.pages.filter((p) => !(p.src === 'nested-list-of-experiments-ctnt.html'));
    }
    generateLab(config.pages, labpath, template_file, component_files);
}


function deployExperiments(labpath) {
    const ldpath = path.resolve(labpath, 'lab-descriptor.json');
    const ld = require(ldpath);
    if (ld.collegeName === 'IIITH') {
	iiith_exp_manage(ld);
	return;
    }
    else {
	
	const expDeploymentRepo = 'https://github.com/virtual-labs/ph3-beta-to-ui3.0-conv.git';
	const expDeploymentWd = 'ph3-beta-to-ui3.0-conv';
	//const branch = 'master';
	const tag = 'v1.0.0';

	child_process.execSync(`rm -rf ${expDeploymentWd}`);
	child_process.execSync(`git clone ${expDeploymentRepo}; cd ${expDeploymentWd}; git fetch --all; git checkout ${tag}`);
	child_process.execSync(`cp ${ldpath} ${expDeploymentWd}/experiment-list.json`);
	child_process.execSync(`cd ${expDeploymentWd}; make host-experiments`);
    }
}

function getLabName(labpath) {
    const ldpath = path.resolve(labpath, 'lab-descriptor.json');
    const labdesc = require(ldpath);
    return toDirName(labdesc.lab);
}


function toDeployLab(labpath) {
    const ldpath = path.resolve(labpath, 'lab-descriptor.json');
    const labdesc = require(ldpath);
    return labdesc.deployLab;
}


// --- iiit exp

function iiithexp_clone(e, exp_dir, common_repo_name) {
    const ename = toDirName(e.name);
    shell.mkdir('-p', path.resolve(exp_dir, ename));
    shell.cd(path.resolve(exp_dir, ename));
    shell.rm('-rf', common_repo_name);
    shell.exec(`git clone ${e.repo}/${common_repo_name}`);
    shell.cd(common_repo_name);
    shell.exec('git fetch --all');
    shell.exec(`git checkout ${e.tag}`);
    shell.cd(__dirname);
    console.log(`Cloned ${e.repo}`);
}

function iiithexp_build(e, exp_dir, common_repo_name) {
    const ename = toDirName(e.name);
    
    console.log(`Building ${ename}`);
    
    shell.cd(`${exp_dir}/${ename}/${common_repo_name}`);
    shell.cp('config.mk.sample', 'config.mk');
    shell.exec('make clean-infra; make clean; make -k all');
    shell.cd('../../../');
}


function iiithexp_deploy(e, exp_dir, common_repo_name, deployment_dest) {

    const ename = toDirName(e.name);
    shell.mkdir('-p',
                path.resolve(deployment_dest, 'exp', ename)
               );    
    shell.exec(
        `cp -rf ${exp_dir}/${ename}/${common_repo_name}/build/* ${deployment_dest}/exp/${ename}`
    );
    console.log(`${ename} deployed to ${deployment_dest}\n`);
}


function iiithexp_getExpList(data){
    if (data.experiments){
	const experiments = data.experiments;
	return experiments;
    }
    else {
	const experiments = data['experiment-sections'].map((es) => es.experiments).flat();
	return experiments;
    }
}


function iiith_exp_manage(lab_descriptor) {
    
    const config = require('./config.json');
    const exp_dir = config['exp_dir'];
    const common_repo_name = config['common_repo_name'];
    const deployment_dest = config['deployment_dest'];
    const lab_dir_name = toDirName(lab_descriptor.lab);
    const deployment_path = path.join(deployment_dest, lab_dir_name);
    const experiments = iiithexp_getExpList(lab_descriptor);
    
    experiments.forEach((e) => {        
        iiithexp_clone(e, exp_dir, common_repo_name);
        iiithexp_build(e, exp_dir, common_repo_name);
        iiithexp_deploy(e, exp_dir, common_repo_name, deployment_path);
    });
}

// --- iiit exp


function run(){
    const task = process.argv[2];
    const labpath = path.resolve(process.argv[3]);
    const user = process.argv[4];
    const hostIP = process.argv[5];
    
    switch (task) {
    case 'init':
	copyLabDescriptor(labpath);
	break;
    case 'generate':
	if (validator.validateLabDescriptor(path.resolve(labpath, 'lab-descriptor.json'))) {
	    generate(labpath);
	    pushLab(labpath);
	}
	break;
    case 'deploy':      
	if (toDeployLab(labpath)) {
            const deploySrc = labpath + '/build/*';
            const labname = getLabName(labpath);
            const deployDestPath = path.resolve("/var/www/html/", labname);
            console.log(deployDestPath);
            deploy_lab(deploySrc, deployDestPath);
	}
	deployExperiments(labpath);
	break;
    default:
	console.error("unknown task"); 
    }
}

run();
