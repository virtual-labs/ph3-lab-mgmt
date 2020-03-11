const { JSDOM } = require("jsdom");
const fs = require("fs");


// The template for the final page.
const template_file = "skeleton.html";

/* Every page has two kinds of components.  First, static components that are 
common to all pages in a lab, such as header and footer.  Second type is the 
main content of a page, which is specific to that page.  This file needs to be 
specified by the user while building the page.
*/

// All common components required for a page.
const component_files = [ "page-components/head.html"
                        , "page-components/navbar.html"
                        , "page-components/slider.html"
                        , "page-components/domain.html"
                        , "page-components/sidebar.html"
                        , "page-components/footer.html"
                        , "page-components/random-js-things.html"
                        ];

const config = JSON.parse(fs.readFileSync('config.json'));
const component_files = config.commonComponents;


const mode = process.argv[2]; // MODE:: -a: all pages, -p: single page

if (mode === '-a'){
  // build all pages
  const cfg = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
  const page_names = cfg.pages;
  const component_names = page_names.map(
    (pn) => `page-components/${pn.replace(/\s/g,'')}`
    );
  component_names.forEach((cn, i) => {
    const res_html = buildPage(template_file, component_files, cn);
    fs.writeFile(`lab/${page_names[i]}`, res_html, 'utf-8', (err, data) => {
      if (err) throw err;
      console.log(`${page_names[i]} built successfuly`);
    });
  });
}
else if (mode === '-p') {
  const content_file = process.argv[3];

  // name of the file to be generated.
  const target_html_file = process.argv[4];

  const res_html = buildPage(template_file, component_files, content_file);
  fs.writeFile(target_html_file, res_html, 'utf-8', (err, data) => {
    if (err) throw err;
    console.log("html built successfuly");
  });
}


function buildPage(template_file, component_files, content_file) {
  const main_template = fs.readFileSync(template_file, 'utf-8');
  const components = loadComponents(component_files);
  const content = fs.readFileSync(content_file, 'utf-8');
  const res_html = populateTemplate(main_template, components, content);
  return res_html;
}

function loadComponents(component_files) {
  const components = component_files.map((fn) => fs.readFileSync(fn, 'utf-8'));
  return components;
}


function populateTemplate(template, components, content) {
  let dom = new JSDOM(`${template}`);
  let res = addHead(dom, components[0]);
  res = addNavbar(res, components[1]);
  res = addSlider(res, components[2]);
  res = addLabName(res, components[3]);
  res = addSideBar(res, components[4]);
  res = addContent(res, content);
  res = addFooter(res, components[5]);
  res = addRandomJsThings(res, components[6]);
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


function addLabName(dom, labname) {
  dom.window.document
    .querySelectorAll('#content > div')[1]
    .querySelector('h2').innerHTML = labname;
  return dom;
}


function addSideBar(dom, sidebar) {
  dom.window.document
    .querySelectorAll('#content > div')[1]
    .querySelector('.t-sidebar').innerHTML = sidebar;
  return dom;
}


function addContent(dom, ctnt) {
  dom.window.document
    .querySelectorAll('#content > div')[1]
    .querySelector('.t-content').innerHTML = ctnt;
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