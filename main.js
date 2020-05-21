const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require('glob');
const path = require('path');
const { JSDOM } = require("jsdom");
const child_process = require('child_process');
const readline = require('readline');
const url = require('url');
const fse = require("fs-extra");



const labDescriptorFn = "lab-descriptor.json";


/* 
   Copy lab descriptor to the lab repository's working directory.  If a lab-descriptor is already present then don't copy.
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



function pushLab(repoDir) {
  const branch = 'master';
  const commitMsg = `Lab generated at ${Date.now()}`;
  child_process.execSync(`cd ${repoDir}; git add src/; git commit -m "${commitMsg}"; git push origin ${branch}`);
}



function deploy_lab(user, src, destHost, destPath) {
  child_process.execSync(`rsync -a ${src} ${user}@${destHost}:${destPath}`);
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
  let res = addHead(dom, components[0]);
  res = addLabName(res, components[1]);
  //res = addNavbar(res, components[2]);
  //res = addSlider(res, components[3]);
  res = addBroadAreaName(res, components[2]);
  res = addSideBar(res, components[3]);
  res = addContent(res, content);
  //res = addFooter(res, components[6]);
  //res = addRandomJsThings(res, components[7]);
  return res.serialize();
}


function addHead(dom, head) {
  dom.window.document.head.innerHTML = head;
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
  console.log(base);
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
            const exp_url = generateLink(data.baseUrl, data.lab, e['short-name']);
            return {"name": e.name, "link": exp_url.toString()}
          })
        }; 
      });
      return data;      
    }
  }
}

function toDirName(n) {
  return n.toLowerCase().split(' ').join('-');
}

function generateLink(baseUrl, labName, expName, index_fn='') {
  const expUrl = new URL(path.join(toDirName(labName), 'exp', toDirName(expName), index_fn), baseUrl);
  return expUrl;
}


function generate(labpath) {
  
  const data = dataPreprocess(path.join(labpath, 'lab-descriptor.json'));
  
  const template_file = "skeleton-new.html";
  const config = JSON.parse(fs.readFileSync('config.json'));
  const component_files = config.commonComponents;
  
  glob('page-templates/*.handlebars', (err, fns) => {
    if ((data.experiments === undefined) && (data["experiment-sections"] !== undefined)){      
      fns.forEach((fn) => genComponentHtml(fn, data));
    }
    else {
      if ((data.experiments !== undefined) && (data["experiment-sections"] === undefined)){        
        fns.filter((fn) => !(fn.includes("nested"))).forEach((fn) => genComponentHtml(fn, data));
      }
    }
    generateLab(config.pages, labpath, template_file, component_files);
  });
}



function deployExperiments(labpath) {
    const expDeploymentRepo = 'https://gitlab.com/vlead-systems/host-ph3-exp-ui-3.0/deployment-scripts.git';
    const ldpath = path.resolve(labpath, 'lab-descriptor.json');
    if(!fse.existsSync('deployment-scripts')){
        child_process.execSync(`git clone ${expDeploymentRepo}; cd deployment-scripts; git checkout feature-remote-param`);
    }
    child_process.execSync(`cp ${ldpath} deployment-scripts/experiment-list.json`);
    child_process.execSync(`cd deployment-scripts; make all`);
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
      generate(labpath);
      pushLab(labpath);
      break;
    case 'deploy':
      if (toDeployLab(labpath)) {
          const deploySrc = labpath + '/build/*';
          const labname = getLabName(labpath);
          const deployDestPath = path.resolve("/var/www/html/", labname);
          console.log(deployDestPath);
          deploy_lab(user, deploySrc, hostIP, deployDestPath);
      }
      deployExperiments(labpath);
      break;
    default:
      console.error("unknown task"); 
  }
}

run();
