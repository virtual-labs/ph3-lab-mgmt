const fs = require("fs");
const glob = require('glob');
const path = require('path');
const { JSDOM } = require("jsdom");

const labpath = path.join(process.argv[2], 'src/lab');
const exp_pattern = path.join(labpath, '*/*.html');
const lab_pattern = path.join(labpath, '*.html');

const newFooterFile = './page-components/footer.html';

function hasFooter(fn) {
  const htmlContent = fs.readFileSync(fn);
  let dom = new JSDOM(htmlContent);
  if (dom.window.document.querySelector('footer')){
    //console.log(fn);
    return true;
  }
  else {
    return false;
  }
}

function replaceFooter(pageFn, footerFn) {
  const page = fs.readFileSync(pageFn, 'utf-8');
  const footerContent = fs.readFileSync(footerFn, 'utf-8');
  let dom = new JSDOM(page);
  const footer = dom.window.document.querySelector('footer');
  footer.id = 'footer';
  footer.innerHTML = footerContent;
  return dom;
}

function modify(p, footerFn) {
  const dom = replaceFooter(p, footerFn);
  const all_labs_node = dom.window.document.querySelector(".menu-li-active");
  if (all_labs_node){
    all_labs_node.remove();
  }
  return dom.serialize();
}


glob(lab_pattern, (err, fns) => {
  const htmlPages = fns.filter(hasFooter);
  const resPages = htmlPages.map((p) => [p, modify(p, newFooterFile)]);
  resPages.forEach((p) => fs.writeFileSync(p[0], p[1], 'utf-8'));
});

glob(exp_pattern, (err, fns) => {
  const htmlPages = fns.filter(hasFooter);
  const resPages = htmlPages.map((p) => [p, modify(p, newFooterFile)]);
  resPages.forEach((p) => fs.writeFileSync(p[0], p[1], 'utf-8'));
});
