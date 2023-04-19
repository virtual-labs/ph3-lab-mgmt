const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const { nextVersion } = require("./Tags");
const { loadExperiments } = require("./ExpUtils");
const validator = require("../validateDescriptor.js");
const config = require("./labConfig.json");
const chalk = require("chalk");
const {
  getLabName,
  updateLabVersion,
  stageLab,
  pushLab,
  releaseLab,
  buildLabPages,
  processLabDescriptor,
} = require("./LabUtils");

shell.config.silent = true;

function generateLab(labpath) {
  const data = processLabDescriptor(path.join(labpath, "lab-descriptor.json"));
  const template_file = "skeleton.html";
  const component_files = config.commonComponents;

  const fns = glob.sync("page-templates/*.handlebars");
  if (
    data.experiments === undefined &&
    data["experiment-sections"] !== undefined
  ) {
    config.pages = config.pages.filter(
      (p) => !(p.src === "list-of-experiments-ctnt.html")
    );
    data.menu = config.pages;
    fns.forEach((fn) => renderTemplate(fn, data));
  } else {
    if (
      data.experiments !== undefined &&
      data["experiment-sections"] === undefined
    ) {
      config.pages = config.pages.filter(
        (p) => !(p.src === "nested-list-of-experiments-ctnt.html")
      );
      data.menu = config.pages;
      fns
        .filter((fn) => !fn.includes("nested"))
        .forEach((fn) => renderTemplate(fn, data));
    }
  }
  buildLabPages(config.pages, labpath, template_file, component_files);
}

function deployLab(labpath) {
  const config = require("./config.json");
  const deployment_dest = config["deployment_dest"];
  const lab_descriptor = require(path.resolve(labpath, "lab-descriptor.json"));
  const lab_dir_name = toDirName(lab_descriptor.lab);
  const deployment_path = path.join(deployment_dest, lab_dir_name);

  const elist = expList(require(path.resolve(labpath, "lab-descriptor.json")));

  elist.forEach((e) => {
    console.log(
      chalk`{bold DEPLOY} {yellow to} ${path.resolve(
        deployment_path,
        "exp",
        e["short-name"]
      )}`
    );
    shell.mkdir("-p", path.resolve(deployment_path, "exp", e["short-name"]));
    //     shell.exec(`rsync -arv --exclude .git \
    // '${deployment_path}/stage/exp/${e["short-name"]}/'* '${deployment_path}/exp/${e["short-name"]}'`);
    // alternative
    shell.rm(
      "-rf",
      path.resolve(deployment_path, "exp", e["short-name"], "**", ".git/")
    );
    shell.cp(
      "-av",
      `${deployment_path}/stage/exp/${e["short-name"]}/*`,
      `${deployment_path}/exp/${e["short-name"]}`
    );
  });

  console.log(chalk`{bold DEPLOY LAB} to ${deployment_dest}/${lab_dir_name}`);
  //   shell.exec(`rsync -arv --exclude .git \
  // '${deployment_dest}/stage/${lab_dir_name}/'* '${deployment_dest}/${lab_dir_name}'`);
  // alternative
  shell.rm(
    "-rf",
    path.resolve(deployment_dest, "stage/", lab_dir_name, "*", "**", ".git/")
  );
  shell.cp(
    "-av",
    path.resolve(deployment_dest, "stage/", lab_dir_name, "*"),
    path.resolve(deployment_dest, lab_dir_name)
  );
}

function main() {
  // Parse arguments
  const args = require("minimist")(process.argv.slice(2));
  let labpath = args._[0];
  // convert to absolute path
  labpath = path.resolve(labpath);
  console.log(chalk`{bold Lab Path} ${labpath}`);
  const release_type = args.release;

  // Get next version number
  const newVersion = nextVersion(labpath, release_type);

  // Generate lab
  // Check if labpath is valid
  if (!fs.existsSync(labpath)) {
    console.error(chalk`{red Invalid Lab Path} '${labpath}'`);
  } else {
    
    const lab_descriptor_path = path.resolve(labpath, "lab-descriptor.json");

    const isValid = validator.validateLabDescriptor(lab_descriptor_path);
    if (!isValid) {
      return;
    }
    // 1 : Build all lab pages by rendering templates and loading components
    generateLab(labpath);
    // 2 : Load all experiments in the lab (Clone, build, and stage)
    loadExperiments(labpath);
    // 3 : Stage the lab
    stageLab(
      `${labpath}/build/*`,
      path.resolve("/var/www/html/stage", getLabName(lab_descriptor_path))
    );
    // 4 : Move all staged experiments to the deployment directory (/var/www/html/)
    deployLab(labpath);
    // 5 : Update lab version in lab-descriptor.json
    updateLabVersion(lab_descriptor_path, newVersion);
    // updateRecord(ld, "SUCCESS");
    // 6 : Push lab to github repo
    pushLab(labpath);
    // 7 : Create a new release on github for the lab
    releaseLab(labpath, newVersion);
  }
}

main();
