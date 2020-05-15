const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require('glob');
const path = require('path');
const { JSDOM } = require("jsdom");
const child_process = require('child_process');
const readline = require('readline');
const url = require('url');


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
  child_process.execSync(`mkdir -p ${labpath}`);
  child_process.execSync(`cp -rf lab-structure/* ${labpath}/`);
  child_process.execSync(`mkdir -p ${labpath}/src/lab`);
}


function copyPages(pages, template_file, component_files, labpath){
  pages.forEach( p => {
    const res_html = buildPage(template_file, component_files, p.src);
    fs.writeFile(`${labpath}/src/lab/${p.target}`, res_html, 'utf-8', (err, data) => {
      if (err) throw err;
      console.log(`${p.target} built successfuly`);
    });
  });  
}

function generateLab(pages, labpath, template_file, component_files){
  fs.stat(labpath, function(err, stats) {
    if (err) { 
      prepareStructure(labpath);
      copyPages(pages, template_file, component_files, labpath);
    }
    else {
      console.log("Lab already exists.");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Do you want to delete the existing lab(N/Y)[default N]?', (answer) => {
        if (answer === 'Y'){
          child_process.execSync(`rm -rf ${labpath}`);
          rl.close();
          console.log("creating new");	  
          prepareStructure(labpath);
          copyPages(pages, template_file, component_files, labpath);
        }
        else {
          rl.close();
        }
      });
    }
  });
}


function dataPreprocess(datafile){

  const data = JSON.parse(fs.readFileSync(datafile));

  if (data.experiments) {
    data.experiments = data.experiments.map((e) => {
      //const exp_url = new URL(e.link, data.baseUrl);
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

function run(){
  const datafile = process.argv[2];
  const data = dataPreprocess(datafile);
  const labpath = process.argv[3];
  
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
  });

  if (labpath === undefined){
    const default_lp = path.parse(datafile).name;
    generateLab(config.pages, default_lp, template_file, component_files);
  } else {
    generateLab(config.pages, labpath, template_file, component_files);
  }
}

run();