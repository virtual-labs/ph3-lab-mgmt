const path = require("path");
const gs = require("../googlesheet.js");
const fs = require("fs");
const shell = require("shelljs");
const prettier = require("prettier");
const { buildPage } = require("./template.js");
const moment = require("moment");
const log = require("../logger.js");
const Config = require("../config.js");

shell.config.silent = true;

function toDirName(n) {
  return n.toLowerCase().trim().replace(/–/g, "").replace(/ +/g, "-");
}

function generateLink(baseUrl, expName, index_fn = "") {
  const expUrl = new URL(`https://${baseUrl}/exp/${expName}/${index_fn}`);
  return expUrl;
}

function labURL(host, name) {
  return new URL(`https://${host}/${toDirName(name)}`);
}

function getLabDescriptor(lab_descriptor_path) {
  return require(lab_descriptor_path);
}

function getLabName(lab_descriptor_path) {
  const lab_descriptor = getLabDescriptor(lab_descriptor_path);
  return toDirName(lab_descriptor.lab);
}

function updateLabVersion(lab_descriptor_path, newVersion) {
  log.debug(`Updating lab version to ${newVersion}`);
  const lab_descriptor = getLabDescriptor(lab_descriptor_path);
  lab_descriptor.version = newVersion;
  const updated_lab_descriptor = prettier.format(
    JSON.stringify(lab_descriptor),
    {
      parser: "json",
    }
  );
  fs.writeFileSync(lab_descriptor_path, updated_lab_descriptor, "utf-8");
}

function stageLab(src, destPath) {
  shell.mkdir("-p", destPath);
  // shell.exec(`rsync -a ${src} '${destPath}'`);
  shell.cp("-r", src, destPath);
}

function pushLab(labpath) {
  const commitMsg = `Lab generated at ${moment()}`;
  shell.cd(labpath);
  shell.exec(`git add license.org lab-descriptor.json`);
  shell.exec(`git commit -m "${commitMsg}"`);
  shell.exec(`git push origin master`);
  shell.cd(__dirname);
}

function releaseLab(labpath, tag_name) {
  shell.cd(labpath);
  shell.exec(`git tag -a ${tag_name} -m "version ${tag_name}"`);
  shell.exec(`git push origin ${tag_name}`);
  shell.cd(__dirname);
  return tag_name;
}

function prepareStructure(labpath) {
  log.debug(`Preparing lab structure`);
  shell.cp("-r", path.resolve("license.org"), path.resolve(labpath));
  shell.mkdir("-p", path.resolve(labpath, "build"));
  shell.cp(
    "-r",
    path.resolve(Config.assets_path(),"*"),
    path.resolve(labpath, "build")
  );
}

function buildLabPages(pages, labpath, template_file, component_files) {
  log.debug(`Building lab pages`);
  shell.cd(labpath);
  shell.exec("git checkout master");
  shell.exec("git pull origin master");
  shell.cd(__dirname);
  prepareStructure(labpath);
  pages.forEach((p) => {
    const res_html = buildPage(template_file, component_files, p.src);
    fs.writeFileSync(`${labpath}/build/${p.target}`, res_html, "utf-8");
  });
}

function processLabDescriptor(descriptor_path) {
  log.debug(`Processing lab descriptor`);
  const lab_descriptor = JSON.parse(fs.readFileSync(descriptor_path));

  if (lab_descriptor.experiments) {
    lab_descriptor.experiments = lab_descriptor.experiments.map((e) => {
      const exp_url = generateLink(lab_descriptor.baseUrl, e["short-name"]);
      return { name: e.name, link: exp_url.toString() };
    });
    return lab_descriptor;
  } else {
    if (lab_descriptor["experiment-sections"]) {
      lab_descriptor["experiment-sections"] = lab_descriptor[
        "experiment-sections"
      ].map((es) => {
        return {
          "sect-name": es["sect-name"],
          experiments: es.experiments.map((e) => {
            const exp_url = generateLink(
              lab_descriptor.baseUrl,
              e["short-name"],
              (index_fn = "index.html")
            );
            return { name: e.name, link: exp_url.toString() };
          }),
        };
      });
      return lab_descriptor;
    }
  }
}

function updateRecord(lab_descriptor, exec_status) {
  log.debug(`Updating record in Google Sheet`);
  const rec = {
    date: moment().format("DD MMMM YYYY"),
    time: moment().format("hh:mm:ss"),
    unit: "LAB",
    url: labURL(lab_descriptor.baseUrl, lab_descriptor.lab),
    version: lab_descriptor.version,
    status: exec_status,
  };
  gs.appendExecutionResult(rec);
}

module.exports = {
  toDirName,
  getLabName,
  updateLabVersion,
  stageLab,
  pushLab,
  releaseLab,
  buildLabPages,
  processLabDescriptor,
};
