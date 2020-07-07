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
const shell = require('shelljs');
const moment = require('moment');
const Git = require('nodegit');
const prettier = require("prettier");


const validator = require('./validateDescriptor.js');
const gs = require('./googlesheet.js');
const labDescriptorFn = "lab-descriptor.json";


shell.config.silent = true;
shell.set('-e');

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



function stageLab(src, destPath) {
    console.log(`STAGE LAB to ${destPath}\n`);
    shell.exec(`mkdir -p ${destPath}`);
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
    //console.log(expUrl.href);
    return expUrl;
}


function labURL(host, name) {
    return (new URL(`http://${host}/${toDirName(name)}`));
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
    console.log(chalk`{cyan CLONE} {yellow from} ${e.repo}`);
    const e_short_name = e['short-name'];
    shell.mkdir('-p', path.resolve(exp_dir, e_short_name));
    shell.cd(path.resolve(exp_dir, e_short_name));
    shell.rm('-rf', common_repo_name);
    shell.exec(`git clone ${e.repo}/${common_repo_name}`);
    shell.cd(common_repo_name);
    shell.exec('git fetch --all');
    shell.exec(`git checkout ${e.tag}`);
    shell.cd(__dirname);
}

function iiithexp_build(e, exp_dir, common_repo_name) {
    const e_short_name = e['short-name'];
    
    console.log(chalk`{cyan BUILD} {yellow at} ${path.resolve(exp_dir, e_short_name, common_repo_name)}`);
    
    shell.cd(`${exp_dir}/${e_short_name}/${common_repo_name}`);
    shell.cp('config.mk.sample', 'config.mk');
    shell.exec('make clean-infra; make clean; make -k all');
    shell.cd('../../../');
}


function iiithexp_stage(e, exp_dir, common_repo_name, deployment_dest) {    

    const e_short_name = toDirName(e['short-name']);
    
    console.log(chalk`{cyan STAGE} {yellow to} ${path.resolve(deployment_dest, 'stage', 'exp', e_short_name)}`);
    
    shell.rm('-rf', `${deployment_dest}/stage/exp/${e_short_name}/`);
    shell.mkdir('-p',
                path.resolve(deployment_dest, 'stage', 'exp', e_short_name)
               );
    shell.cp('-rf',
             `${exp_dir}/${e_short_name}/${common_repo_name}/build/*`,
             `${deployment_dest}/stage/exp/${e_short_name}/`
            );
}


function expList(data){
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
    const experiments = expList(lab_descriptor);
    
    experiments.forEach((e) => {
        console.log('');
        iiithexp_clone(e, exp_dir, common_repo_name);
        iiithexp_build(e, exp_dir, common_repo_name);
        iiithexp_stage(e, exp_dir, common_repo_name, deployment_path);
        console.log('');
    });
}

// --- iiit exp


function golive(labpath) {
    const config = require('./config.json');
    const exp_dir = config['exp_dir'];
    const common_repo_name = config['common_repo_name'];
    const deployment_dest = config['deployment_dest'];
    const lab_descriptor = require(path.resolve(labpath, 'lab-descriptor.json'));
    const lab_dir_name = toDirName(lab_descriptor.lab);
    const deployment_path = path.join(deployment_dest, lab_dir_name);

    const elist = expList(require(path.resolve(labpath, 'lab-descriptor.json')));

    elist.forEach(e => {
        console.log(chalk`{bold DEPLOY} {yellow to} ${path.resolve(deployment_path, 'exp', e['short-name'])}`);
        shell.mkdir('-p', path.resolve(deployment_path, 'exp', e['short-name']));
        shell.exec(`rsync -arv --exclude .git \
${deployment_path}/stage/exp/${e['short-name']}/* ${deployment_path}/exp/${e['short-name']}`);        
    });

    
    console.log(chalk`{bold DEPLOY LAB} to ${deployment_dest}/${lab_dir_name}`);
    shell.exec(`rsync -arv --exclude .git \
${deployment_dest}/stage/${lab_dir_name}/* ${deployment_dest}/${lab_dir_name}`);    
}


function run(){
    const task = process.argv[2];
    const labpath = path.resolve(process.argv[3]);
    const user = process.argv[4];
    const hostIP = process.argv[5];
    
    switch (task) {
    case 'init':
	copyLabDescriptor(labpath);
	break;
    case 'all':
        const isjsonvalid = validator.validateLabDescriptor(
            path.resolve(labpath, 'lab-descriptor.json')
        );
        if (!isjsonvalid) return;
	try {
	    const v = getNextVersion(labpath);
	    generate(labpath);
//	    throw Error("$$$$");
            deployExperiments(labpath);        
            stageLab(`${labpath}/build/*`,
                   path.resolve("/var/www/html/stage", getLabName(labpath))
                  );        
            golive(labpath);
	    pushLab(labpath);
	}
	catch(e) {
	    const lab_info = require(path.resolve(labpath, 'lab-descriptor.json'));
	    const rec = { date: moment().format("DD MMMM YYYY"),
			  time: moment().format("hh:mm:ss"),
			  unit: 'LAB',
			  url: labURL(lab_info.baseUrl, lab_info.lab),
			  version: getNextVersion(),
			  status: "FAILURE"
			};
	    gs.appendExecutionResult(rec);
	}

        break;
    case 'generate':
	if (validator.validateLabDescriptor(path.resolve(labpath, 'lab-descriptor.json'))) {
	    generate(labpath);
	    pushLab(labpath);
	}
	break;
    case 'deploy':
        deployExperiments(labpath);
        
        stageLab(`${labpath}/build/*`,
                   path.resolve("/var/www/html/", getLabName(labpath))
                  );
	break;
    default:
	console.error("unknown task"); 
    }
}

//run();

function init(){
    console.log("initializing");
}


async function maybeProcessAll(labpath) {
    generate(labpath);
    deployExperiments(labpath);
    stageLab(`${labpath}/build/*`,
	     path.resolve("/var/www/html/stage", getLabName(labpath))
	    );
    golive(labpath);
}


function labgen() {
    const args = require('minimist')( process.argv.slice(2), {
	boolean : ["init"]
    } );

    const labpath = args._[0];
    if (!fs.existsSync(labpath)) {
	console.error(chalk`{red Invalid Lab Path} '${labpath}'`);
    }
    else {
	if (args.init) {
	    init(args._);
	}
	else {
	    const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	    });    
	    rl.question("release type?  :: ", (release_type) => {
		rl.close();
		const lab_descriptor = LD(labpath);
		nextVersion(labpath, release_type)
		    .then(t => {			
			maybeProcessAll(labpath)
			    .then(() => {
				reportRes(labpath, t, 'SUCCESS');
			    })
			    .catch((e) => {
				console.log(e);
				reportRes(labpath, t, 'FAILURE');
			    })
		    })
		    .catch(e => {
			console.log(e);
			reportRes(labpath, t, 'FAILURE');
		    });		
	    });
	}
    }
}



function reportRes(labpath, tag, res) {
    ld = updateDescriptor(labpath, tag);
    updateRecord(ld, res);
    pushlab(labpath);
    if (res === 'SUCCESS') {
	release(labpath, tag)
    }
}



function updateDescriptor(labpath, t){
    ld = LD(labpath);
    ld.version = t;
    lds = prettier.format(JSON.stringify(ld), {parser: "json"});
    fs.writeFileSync(path.resolve(labpath, 'lab-descriptor.json'), lds, 'utf-8');
    return ld;
}


/*

,
        {
	    "sect-name": "Graphs",
	    "experiments": [
		{
		    "name": "Breadth First Search",
		    "short-name": "bfs",
		    "repo": "https://gitlab.com/vlead-projects/experiments/ds/breadth-first-search",
                    "tag": "v4.0.4",
                    "deploy": true
                }
	    ]
	}

*/



function updateRecord(lab_descriptor, exec_status) {
    const rec = { date: moment().format("DD MMMM YYYY"),
		  time: moment().format("hh:mm:ss"),
		  unit: 'LAB',
		  url: labURL(lab_descriptor.baseUrl, lab_descriptor.lab),
		  version: lab_descriptor.version,
		  status: exec_status
		};
    gs.appendExecutionResult(rec);
}


function LD(lp){
    return (require(path.resolve(lp, 'lab-descriptor.json')));
}


function pushlab(labpath) {
    const commitMsg = `Lab generated at ${moment()}`;
    child_process.execSync(
	`cd ${labpath};
git add license.org lab-descriptor.json src/;
git commit -m "${commitMsg}";
git push origin master`
    );    
}


function release(labpath, tag_name){    
    child_process.execSync(
	`cd ${labpath}; 
git tag -a ${tag_name} -m "version ${tag_name}"; 
git push origin ${tag_name}`
    );
    return tag_name;
}


function semanticVersion(t) {
    const nums = t.slice(1).split('.');
    return {
	major: parseInt(nums[0]),
	minor: parseInt(nums[1]),
	patch: parseInt(nums[2]),
	id: parseInt(t.slice(1).replace(/\./g, ''))
    }
}


function compareTags(t1, t2){
    const st1 = semanticVersion(t1);
    const st2 = semanticVersion(t2);
    return st2.id - st1.id;
}


function latestTag(tags){
    if (tags.length === 0) {
	return 'v0.0.0';
    }
    tags.sort(compareTags);
    return tags[0];
}


function nextMajor(t) {
    t.major += 1;
    t.minor = 0;
    t.patch = 0;
    return t;
}



function nextMinor(t) {
    t.minor += 1;
    t.patch = 0;
    return t;
}



function nextPatch(t) {
    t.patch += 1;
    return t;
}



function incrementTagNumber(tag, release_type) {
    const st = semanticVersion(tag);
    switch(release_type){

    case 'major':
	nextMajor(st);
	break;
	
    case 'minor':
	nextMinor(st);
	break;
	
    case 'patch':
	nextPatch(st);
	break;
	
    default:
	nextMinor(st);
	break;	
    }

    return `v${st.major}.${st.minor}.${st.patch}`;
}


function nextVersion(labpath, release_type) {
    const p = Git.Repository.open(labpath)
	  .then(function(repository) {	
	      return Git.Tag.listMatch('v*.*.*', repository);
	  })
	  .then(latestTag)
	  .then((t) => incrementTagNumber(t, release_type))
    return p;
}

labgen();
