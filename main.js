#!/usr/bin/env node
const fs = require("fs");
const shell = require("shelljs");
const { run } = require("./exp.js");
const minimist = require("minimist");
const { BuildEnvs, validBuildEnv } = require("./Enums.js");
const Config = require("./Config.js");
const path = require("path");

// Build/run
// Flags = clean build, with plugin, without plugin, validation on off, also deploy locally
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
    console.log("Running ESLINT");
    shell.exec(`npx eslint -c ${__dirname}/.eslintrc.js ${ep}`);
  }
  if (isExpDesc) {
    console.log("Running Experiment Descriptor Validation");
    shell.exec(
      `node ${__dirname}/validation/validate.js -f ${descriptorPath}`
    );
    // read from descriptorPath
    // loop through the units and validate the content
    const descriptor = require(descriptorPath);
    descriptor.units.forEach((unit) => {
      // if content type is assessment, then validate the assessment
      if (unit["content-type"] === "assesment") {
        const assesmentPath = path.resolve(ep, unit.source);
        shell.exec(
          `node ${__dirname}/validation/validate.js -f ${assesmentPath}`
        );
      }
    });
  }
}

// Clean
function clean(src) {
  // Check if build exists
  const bp = path.resolve(src, Config.Experiment.build_dir);
  if (fs.existsSync(bp)) {
    fs.rmdirSync(bp, { recursive: true });
  }
  if (fs.existsSync("./plugins")) {
    fs.rmdirSync("./plugins", { recursive: true });
  }
}

// Deploy Locally
function deployLocal(src) {
  // Check if build exists
  const bp = path.resolve(src, Config.Experiment.build_dir);
  if (fs.existsSync(bp)) {
    // Deploy
    shell.exec(`npx http-server -p 8080 ${bp} -o /index.html`);
  } else {
    // Throw error
    console.error("Build does not exist, build first");
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
  let option = "";
  if (args._.length === 2) {
    src = args._[1];
  }
  else if (args._.length === 1) {
    option = args._[0];
  } else {
    console.log("Invalid arguments");
    return;
  }

  switch (option) {
    case "build":
      let isClean = args.clean || false;
      let isESLINT = args.validateEslint || false;
      let isExpDesc = args.validateExpdesc || false;
      let isDeploy = args.deploy || false;
      let isPlugin = args.disablePlugin ? false : true;
      build(
        isClean,
        isESLINT,
        isExpDesc,
        isDeploy,
        isPlugin,
        src,
        build_options
      );
      break;

    case "validate":
      let isESLINTValidate = args.eslint || false;
      let isExpDescValidate = args.expdesc || false;
      validate(isESLINTValidate, isExpDescValidate, src);
      break;

    case "clean":
      clean(src);
      break;

    case "deploy":
      deployLocal(src);
      break;

    default:
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
