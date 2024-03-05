#!/usr/bin/env node
const fs = require("fs");
const shell = require("shelljs");
const { BuildEnvs, validBuildEnv, ContentTypes } = require("./enums.js");
const { run } = require("./exp_build/exp_gen.js");
const minimist = require("minimist");
const Config = require("./config.js");
const path = require("path");
const log = require("./logger");
const { buildLab, deployLab, validation } = require("./lab_build/lab_gen.js");
// Build/run
// Flags = clean build, with plugin, without plugin, validation on off, also deploy locally

function helper() {
  console.log("Usage: node main.js [mode] [options]");
  console.log("Modes:");
  console.log("  build                Build the experiment");
  console.log("  validate             Validate the code and content");
  console.log("  clean                Clean the build and plugins");
  console.log("  deploy               Deploy the experiment locally");
  console.log("  buildLab             Build the lab");
  console.log("  deployLab            Deploy the lab locally");
  console.log("\n");
  console.log("Common Options:");
  console.log("  --src       path to the experiment, default is parent directory");
  console.log("  --debug     enable debug mode");
  console.log("  --help      display help for command");
  console.log("\n");
  console.log("Mode: build");
  console.log("Usage: build [options]");
  console.log("Options:");
  console.log("  --clean              clean build folder");
  console.log("  --validateEslint     validate the code using eslint");
  console.log("  --validateExpDesc    validate the experiment description and assessment files");
  console.log("  --disablePlugin      disable the plugins");
  console.log("  --disableAnalytics   disable the analytics configuration");
  console.log("  --deploy             deploy the experiment locally");
  console.log("  --env                environment to build the experiment");
  console.log("\n");
  console.log("Mode: Validate");
  console.log("Usage: validate [options]");
  console.log("Options:");
  console.log("  --validateEslint     validate the code using eslint");
  console.log("  --validateExpDesc    validate the experiment description and assessment files");
  console.log("\n");
  console.log("Mode: clean");
  console.log("Usage: clean");
  console.log("\n");
  console.log("Mode: deploy");
  console.log("Usage: deploy");
  console.log("\n");
  console.log("Mode: buildLab");
  console.log("Usage: buildLab [options]");
  console.log("Options:");
  console.log("  --src       path to the lab, default is parent directory");
  console.log("  --deploy    deploy the lab locally");
  console.log("  --release   release type of the lab, default is minor");
  console.log("\n");
  console.log("Mode: deployLab");
  console.log("Usage: deployLab [options]");
  console.log("Options:");
  console.log("  --src       path to the lab, default is parent directory");
  console.log("  --release   release type of the lab, default is minor");
  console.log("\n");
}


function getAssessmentPath(src, units) {
  let assessmentPath = [];
  units.forEach((unit) => {
    if (unit["unit-type"] === "lu") {
      const nextSrc = path.resolve(src, unit.basedir);
      let paths = getAssessmentPath(nextSrc, unit.units);
      assessmentPath.push(...paths);
    }
    if (unit["content-type"] === ContentTypes.ASSESMENT || unit["content-type"] === ContentTypes.ASSESSMENT) {
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
    log.error("No match found");
  }

  if (isPlugin) {
    build_options.plugins = true;
  } else {
    build_options.plugins = false;
  }
  run(src, default_lab_data, build_options);

  if (isDeploy) {
    log.debug("Deploying after building locally");
    deployLocal(src);
  }
}

// Validate
// 1.eslint
// 2. exp desc
function validate(isESLINT, isExpDesc, src) {
  const ep = path.resolve(src, Config.Experiment.exp_dir);
  const descriptorPath = path.resolve(src, Config.Experiment.descriptor_name);
  if (isESLINT) {
    try {
      log.debug("Validating with eslint");
      shell.exec(`npx eslint -c ${__dirname}/exp_build/.eslintrc.js ${ep}`, { silent: false });
    } catch (e) {
      log.error("Error validating with eslint", e);
    }
  }
  if (isExpDesc) {
    try {
      log.debug("Validating experiment descriptor");
      shell.exec(
        `node ${__dirname}/validation/validate.js -f ${descriptorPath}`, { silent: false }
      );
    } catch (e) {
      log.error("Error validating experiment descriptor", e);
    }
    // read from descriptorPath
    // loop through the units and validate the content
    try {
      log.debug("Validating Assessment files");
      const descriptor = require(descriptorPath);
      const assessmentPath = getAssessmentPath(ep, descriptor.units);
      assessmentPath.forEach((file) => {
        if (fs.existsSync(file)) {
          // trim ep from file
          const fileName = file.replace(ep, "");
          shell.exec(
            `echo =${fileName}`, { silent: false }
          );
          shell.exec(
            `node ${__dirname}/validation/validate.js -f ${file} -c assessment`, { silent: false }
          );
        } else {
          log.error(`Assessment file ${path} does not exist`);
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
  try {
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
      const child = shell.exec(`npx http-server -p 0 -c-1 --no-dotfiles ${bp} -o /index.html`, { async: true });
      child.stdout.on('data', function(data) {
        console.log(data);
      });
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

  // check for help flag
  if (args.help) {
    helper();
    return;
  }


  let isClean = args.clean || false;
  let isESLINT = args.validateEslint || false;
  let isExpDesc = args.validateExpdesc || false;
  let isDeploy = args.deploy || false;
  let isPlugin = args.disablePlugin ? false : true;
  let isESLINTValidate = args.eslint || false;
  let isExpDescValidate = args.expdesc || false;
  let isDebug = args.debug || false;
  let addAnalytics = args.disableAnalytics ? false : true;
  // for backwards compatibility if the env is not given assume it to
  // be testing.
  const build_options = {};

  if (args.env) {
    build_options.env = validBuildEnv(args.env);
  } else {
    build_options.env = BuildEnvs.TESTING;
  }

  build_options.isValidate = isESLINT || isExpDesc;
  build_options.isESLINT = isESLINT;
  build_options.isExpDesc = isExpDesc;
  build_options.addAnalytics = addAnalytics;

  if (isPlugin) {
    build_options.plugins = true;
  } else {
    build_options.plugins = false;
  }

  // if the path is not provided assume "../" for backward
  // compatability.
  let src = ".";
  if (args.src) {
    src = args.src;
  }

  if (isDebug) {
    log.addDebug();
    log.info("Debug mode enabled");
  } else {
    log.addInfo();
  }

  let option = "";
  if (args._.length === 1) {
    option = args._[0];
  } else {
    log.error("Invalid Arguments");
    console.log("Invalid Arguments");
    helper();
    return;
  }

  let release = args.release || "minor";
  let labpath = "";

  switch (option) {
    case "build":
      // let isClean = args.clean || false;
      // let isESLINT = args.validateEslint || false;
      // let isExpDesc = args.validateExpdesc || false;
      // let isDeploy = args.deploy || false;
      // let isPlugin = args.disablePlugin ? false : true;
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
      // let isESLINTValidate = args.eslint || false;
      // let isExpDescValidate = args.expdesc || false;
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
      break;

    case "buildLab":
      log.info("Calling buildLab");
      labpath = path.resolve(src);
      if (validation(labpath)) {
        buildLab(labpath, build_options);
        log.info("BuildLab Complete");
        if (args.deploy) {
          log.info("Calling deploy Lab");

          deployLab(labpath, release);
          log.info("Deploy Lab Complete");
        }
      }
      break;

    case "deployLab":
      log.info("Calling deploy Lab");
      labpath = path.resolve(src);
      if (validation(labpath)) {
        deployLab(src, release);
        log.info("Deploy Lab Complete");
        break;
      }

    default:
      log.error("Invalid Arguments");
      console.log("Invalid Arguments");
      helper();
      break;
  }
}


// call main function if this file is run directly
if (require.main === module) {
  main();
}

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

module.exports = {
  build,
  validate,
  clean,
  deployLocal
};