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
  var ctnr = dom.window.document.querySelector("#content");
  var top = dom.window.document.querySelector("#top");
  var footer = dom.window.document.querySelector("#footer");
  console.log(ctnt, ctnr, top, footer);
  
  if (ctnt && ctnr && footer && top){
    console.log(p);
    ctnr.appendChild(ctnt);
    top.appendChild(footer);
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
