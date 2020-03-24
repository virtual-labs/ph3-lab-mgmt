const fs = require('fs');
const child_process = require('child_process');
const url = require('url');

const experiments = require('./experiments.json');

child_process.execSync('mkdir -p experiments');

experiments.forEach((e) => {
  const u = new URL(e.repo);
  const ename = u.pathname.split('/')[4];
  child_process.execSync(`mkdir -p experiments/${ename}`);
  if (!(fs.existsSync(`experiments/${ename}/content-html`))){
    child_process.execSync(`cd experiments/${ename}; git clone ${e.repo}/content-html`);
    console.log('cloned');
  }
  else {
    console.log('cloned already');
  }
});


experiments.forEach((e) => {
  const u = new URL(e.repo);
  const ename = u.pathname.split('/')[4];
  if (!(fs.existsSync(`experiments/${ename}/content-html/build`))){
    child_process.execSync(`cd experiments/${ename}/content-html/; cp config.mk.sample config.mk; make -k all`);
  }
});


experiments.forEach((e) => {
  const u = new URL(e.repo);
  const ename = u.pathname.split('/')[4];
  child_process.execSync(`mkdir -p /var/www/html/${ename}; cp -rf experiments/${ename}/content-html/build/* /var/www/html/${ename}`);
});
