const fs = require("fs");
const glob = require('glob');
const path = require('path');
const { JSDOM } = require("jsdom");

const labpath = path.join(process.argv[2], 'src/lab');
const pattern = path.join(labpath, '*.html');
console.log(pattern);

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
  return dom.serialize();
}

glob(pattern, (err, fns) => {
  const htmlPages = fns.filter(hasFooter);
  const resPages = htmlPages.map((p) => [p, replaceFooter(p, newFooterFile)]);
  resPages.forEach((p) => fs.writeFileSync(p[0], p[1], 'utf-8'));
});
