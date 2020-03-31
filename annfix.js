const fs = require("fs");
const glob = require('glob');
const path = require('path');
const { JSDOM } = require("jsdom");

const labpath = path.join(process.argv[2], 'src/lab');
const exp_pattern = path.join(labpath, '*/*.html');
const lab_pattern = path.join(labpath, '*.html');

function modify(p) {
  const dom = new JSDOM(fs.readFileSync(p));
  var ctnt = dom.window.document.querySelectorAll("#top > div")[1];
  var ctnr = dom.window.document.querySelector("#top > #content");
  var footer = dom.window.document.querySelector("#footer");
  if (ctnt && ctnr && footer){
    ctnr.appendChild(ctnt);
    ctnr.appendChild(footer);
  }
  return dom.serialize();
}


glob(lab_pattern, (err, fns) => {
  const resPages = fns.map((p) => [p, modify(p)]);
  resPages.forEach((p) => fs.writeFileSync(p[0], p[1], 'utf-8'));
});

glob(exp_pattern, (err, fns) => {
  const resPages = fns.map((p) => [p, modify(p)]);
  resPages.forEach((p) => fs.writeFileSync(p[0], p[1], 'utf-8'));
});
