const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const { nextVersion } = require("./tags.js");
const { loadExperiments, expList } = require("./exp_utils");
const { validateLabDescriptor } = require("../validation/validate_descriptor.js");
const config = require("./lab_config.json");
const log = require("../logger.js");
const {
  toDirName,
  getLabName,
  updateLabVersion,
  stageLab,
  pushLab,
  releaseLab,
  buildLabPages,
  processLabDescriptor,
} = require("./lab_utils");
const { renderTemplate } = require("./template.js");
const { BuildEnvs } = require("../enums.js");

shell.config.silent = true;

function generateLab(labpath, build_options) {
  const data = processLabDescriptor(path.join(labpath, "lab-descriptor.json"), build_options);
  data.options = { ...build_options };
  data.options.production = (build_options.env === BuildEnvs.PRODUCTION);
  data.options.testing = (build_options.env === BuildEnvs.TESTING);
  data.options.local = (build_options.env === BuildEnvs.LOCAL);
  const template_file = "skeleton.html";
  const component_files = config.commonComponents;

  const handlebars_path = path.resolve(__dirname, "page-templates");
  const fns = glob.sync(`${handlebars_path}/*.handlebars`);
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

function moveToDeployDir(labpath) {
  const config = require("./lab_config.json");
  const deployment_dest = config["deployment_dest"];
  const lab_descriptor = require(path.resolve(labpath, "lab-descriptor.json"));
  const lab_dir_name = toDirName(lab_descriptor.lab);
  const deployment_path = path.join(deployment_dest, lab_dir_name);

  const elist = expList(require(path.resolve(labpath, "lab-descriptor.json")));

  elist.forEach((e) => {
    if (e.deploy) {
      log.debug(`Deploying experiment ${e["short-name"]} to ${path.resolve(deployment_path, "exp", e["short-name"])}`);
      shell.mkdir("-p", path.resolve(deployment_path, "exp", e["short-name"]));
      //     shell.exec(`rsync -arv --exclude .git \
      // '${deployment_path}/stage/exp/${e["short-name"]}/'* '${deployment_path}/exp/${e["short-name"]}'`);
      // alternative
      shell.rm(
        "-rf",
        path.resolve(deployment_path, "exp", e["short-name"], "**", ".git/")
      );
      shell.cp(
        "-r",
        `${deployment_path}/stage/exp/${e["short-name"]}/*`,
        `${deployment_path}/exp/${e["short-name"]}`
      );
    }
  });

  // console.log(chalk`{bold DEPLOY LAB} to ${deployment_dest}/${lab_dir_name}`);
  log.debug(`Deploying lab ${lab_dir_name} to ${deployment_dest}/${lab_dir_name}`);
  //   shell.exec(`rsync -arv --exclude .git \
  // '${deployment_dest}/stage/${lab_dir_name}/'* '${deployment_dest}/${lab_dir_name}'`);
  // alternative
  shell.rm(
    "-rf",
    path.resolve(deployment_dest, "stage/", lab_dir_name, "*", "**", ".git/")
  );
  shell.cp(
    "-r",
    path.resolve(deployment_dest, "stage/", lab_dir_name, "*"),
    path.resolve(deployment_dest, lab_dir_name)
  );
}

function validation(labpath) {
  const lab_descriptor_path = path.resolve(labpath, "lab-descriptor.json");

  log.info("Validating lab descriptor");
  const isValid = validateLabDescriptor(lab_descriptor_path);
  if (!isValid) {
    log.error("Lab descriptor is invalid");
    return false;
  }
  log.info("Lab descriptor is valid");
  return true;
}

function deployLab(labpath, release_type) {
  log.info(`Release: ${release_type}`);
  if (!fs.existsSync(labpath)) {
    // console.error(chalk`{red Invalid Lab Path} '${labpath}'`);
    log.error(`Invalid Lab Path '${labpath}'`);
  } else {
    // 3 : Stage the lab
    const lab_descriptor_path = path.resolve(labpath, "lab-descriptor.json");
    log.info("Staging lab");
    stageLab(
      `${labpath}/build/*`,
      path.resolve("/var/www/html/stage", getLabName(lab_descriptor_path))
    );
    // 4 : Move all staged experiments to the deployment directory (/var/www/html/)
    log.info("Moving lab to deployment directory");
    moveToDeployDir(labpath);
    // 5 : Update lab version in lab-descriptor.json
    // Get next version number
    const newVersion = nextVersion(labpath, release_type);
    updateLabVersion(lab_descriptor_path, newVersion);
    // updateRecord(ld, "SUCCESS");
    // 6 : Push lab to github repo
    log.info("Pushing lab to github");
    pushLab(labpath);
    // 7 : Create a new release on github for the lab
    log.info(`Releasing Version ${newVersion}`);
    releaseLab(labpath, newVersion);

    log.info("Lab Deploy complete");
  }
}

function buildLab(labpath, build_options) {
  log.info(`Building lab at ${labpath}`);

  // Generate lab
  // Check if labpath is valid
  if (!fs.existsSync(labpath)) {
    // console.error(chalk`{red Invalid Lab Path} '${labpath}'`);
    log.error(`Invalid Lab Path '${labpath}'`);
  } else {
    // 1 : Build all lab pages by rendering templates and loading components
    log.info("Generating lab pages");
    generateLab(labpath, build_options);
    // 2 : Load all experiments in the lab (Clone, build, and stage)
    log.info("Loading all experiments");
    loadExperiments(labpath, build_options);
    log.info("Lab build complete");
  }
}

module.exports = {
  buildLab,
  deployLab,
  validation
};
