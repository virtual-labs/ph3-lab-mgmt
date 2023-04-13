#!/usr/bin/env node
const fs = require("fs");
const shell = require("shelljs");
const { BuildEnvs, validBuildEnv } = require("./Enums.js");
const { run } = require("./exp.js");
const minimist = require("minimist");
const Config = require("./Config.js");
const path = require("path");
const log = require("./Logger");
// Build/run
// Flags = clean build, with plugin, without plugin, validation on off, also deploy locally

function getAssessmentPath(src,units){
  let assessmentPath = [];
  units.forEach((unit) => {
    if(unit["unit-type"] === "lu"){
      const nextSrc = path.resolve(src, unit.basedir);
      let paths = getAssessmentPath(nextSrc,unit.units);
      assessmentPath.push(...paths);
    }
    if(unit["content-type"] === "assesment" || unit["content-type"] === "assessment"){
      const quiz = path.resolve(src, unit.source);
      assessmentPath.push(quiz);
    }
  });
  return assessmentPath;
}

function build(
  isClean,
  isESLINT,
  isExpDesc,
  isDeploy,
  isPlugin,
  src,
  build_options
) {
  if (isClean) {
    log.debug("Cleaning build folder");
    clean(src);
  }

  build_options.isValidate = isESLINT || isExpDesc;
  build_options.isESLINT = isESLINT;
  build_options.isExpDesc = isExpDesc;

  // Create build folder
  // shell.mkdir(path.resolve(src, Config.Experiment.build_dir));
  // if (!fs.existsSync(bp)) {
  //   fs.mkdirSync(bp);
  // }

  // run

  const default_lab_data = {};

  const paths = path.resolve(src).split(path.sep);
  const base = paths[paths.length - 1];

  // Get the experiment name and developer institute name from the repo name of the
  //  format exp-<expName>-<devInstituteName> e.g. exp-geometry-optimization-molecules-iiith
  const path_name_regex = /exp-(?<expName>[\w-]+)-(?<devInstituteName>\w+)$/i;
  const match = base.match(path_name_regex);

  if (match && match.groups) {
    default_lab_data.exp_short_name = match.groups.expName;
    default_lab_data.collegeName = match.groups.devInstituteName.toUpperCase();
    default_lab_data.phase = "Testing";
    default_lab_data.lab = "Virtual Lab";
    default_lab_data.lab_display_name = "Virtual Lab Display Name";
    default_lab_data.broadArea = { name: "Test" };
  } else {
    console.log("No match found");
  }

  if (isPlugin) {
    build_options.plugins = true;
  } else {
    build_options.plugins = false;
  }
  run(src, default_lab_data, build_options);

  if (isDeploy) {
    console.log("Deploying locally");
    deployLocal();
  }
}

// Validate
// 1.eslint
// 2. exp desc
function validate(isESLINT, isExpDesc, src) {
  const ep = path.resolve(src, Config.Experiment.exp_dir);
  const descriptorPath = path.resolve(src, Config.Experiment.descriptor_name);
  if (isESLINT) {
    try{
      log.debug("Validating with eslint");
      shell.exec(`npx eslint -c ${__dirname}/.eslintrc.js ${ep}`);
    } catch (e) {
      log.error("Error validating with eslint", e);
    }
  }
  if (isExpDesc) {
    console.log("Running Experiment Descriptor Validation");
    try{
      log.debug("Validating experiment descriptor");
      shell.exec(
        `node ${__dirname}/validation/validate.js -f ${descriptorPath}`
      );
    } catch (e) {
      log.error("Error validating experiment descriptor", e);
    }
    // read from descriptorPath
    // loop through the units and validate the content
    try{
      log.debug("Validating Assessment files");
      const descriptor = require(descriptorPath);
      const assessmentPath = getAssessmentPath(ep,descriptor.units);
      assessmentPath.forEach((file) => {
        if (fs.existsSync(file)){
          // trim ep from file
          const fileName = file.replace(ep,"");
          shell.exec(
            `echo =${fileName}`
          );
          shell.exec(
            `node ${__dirname}/validation/validate.js -f ${file} -c assessment`
          );
        }else{
          console.error(`Assessment file ${path} does not exist`);
        }
      });
    } catch (e) {
      log.error("Error validating Assessment files", e);
    }
  }
}

// Clean
function clean(src) {
  // Check if build exists
  try{
  const bp = path.resolve(src, Config.Experiment.build_dir);
  if (fs.existsSync(bp)) {
    fs.rmSync(bp, { recursive: true });
  }
  if (fs.existsSync("./plugins")) {
    fs.rmSync("./plugins", { recursive: true });
  }
  log.debug("Cleaned build folder");
  } catch (e) {
    log.error("Error cleaning build folder", e);
  }
}

// Deploy Locally
function deployLocal(src) {
  // Check if build exists
  const bp = path.resolve(src, Config.Experiment.build_dir);
  if (fs.existsSync(bp)) {
    // Deploy
    try {
      log.debug("Deploying locally");
      shell.exec(`npx http-server -p 0 ${bp} -o /index.html`);
    } catch (e) {
      log.error("Error deploying locally", e);
    }
  } else {
    // Throw error
    log.error("Build does not exist, build first");
  }
}

function main() {
  const args = minimist(process.argv.slice(2));

  // for backwards compatibility if the env is not given assume it to
  // be testing.
  const build_options = {};

  if (args.env) {
    build_options.env = validBuildEnv(args.env);
  } else {
    build_options.env = BuildEnvs.TESTING;
  }

  // if the path is not provided assume "../" for backward
  // compatability.
  let src = ".";
  if(args.src)
  {
    src = args.src;
  }
  
  let option = "";
  if (args._.length === 1) {
    option = args._[0];
  } else {
    log.error("Invalid Arguments");
    return;
  }

  switch (option) {
    case "build":
      let isClean = args.clean || false;
      let isESLINT = args.validateEslint || false;
      let isExpDesc = args.validateExpdesc || false;
      let isDeploy = args.deploy || false;
      let isPlugin = args.disablePlugin ? false : true;
      log.info("Calling build with options: ");
      log.info(`isClean: ${isClean}`);
      log.info(`isESLINT: ${isESLINT}`);
      log.info(`isExpDesc: ${isExpDesc}`);
      log.info(`isDeploy: ${isDeploy}`);
      log.info(`isPlugin: ${isPlugin}`);
      build(
        isClean,
        isESLINT,
        isExpDesc,
        isDeploy,
        isPlugin,
        src,
        build_options
      );
      log.info("Build Complete");
      break;

    case "validate":
      let isESLINTValidate = args.eslint || false;
      let isExpDescValidate = args.expdesc || false;
      log.info("Calling validate with options: ");
      log.info(`isESLINT: ${isESLINTValidate}`);
      log.info(`isExpDesc: ${isExpDescValidate}`);
      validate(isESLINTValidate, isExpDescValidate, src);
      break;

    case "clean":
      log.info("Calling clean");
      clean(src);
      log.info("Clean Complete");
      break;

    case "deploy":
      log.info("Calling deploy");
      deployLocal(src);
      log.info("Deploy Complete");
      break;

    default:
      log.error("Invalid Arguments");
      break;
  }


}

main();

// Build - validate
// node main.js build --validateEslint --validateExpdesc ../
// Clean Build - validate
// node main.js build --clean --validateEslint --validateExpdesc ../
// Build and deploy locally
// node main.js build --validateEslint --validateExpdesc --deploy ../
// Build without plugin
// node main.js build --validateEslint --validateExpdesc --disablePlugin ../
// Build without validation
// node main.js build  ../
// Validate
// node main.js validate --eslint --expdesc ../
// Clean
// node main.js clean ../
// Deploy
// node main.js deploy ../
