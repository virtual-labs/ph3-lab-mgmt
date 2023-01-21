const fs = require("fs");
const shell = require("shelljs");
const { run } = require("./exp.js");
const minimist = require("minimist");
const path = require("path");

// Build/run
// Flags = clean build, with plugin, without plugin, validation on off, also deploy locally
function build(isClean, isValidate, isESLINT, isExpDesc, isDeploy, isPlugin , src, build_options) {
  const bp = Config.build_path(src);
  if (isClean) {
    clean();
  }

  if (isValidate) {
    validate(isESLINT, isExpDesc, bp);
  }

  // Create build folder
  if (!fs.existsSync(bp)) {
    fs.mkdirSync(bp);
  }

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

  if(isPlugin){
    build_options.plugins = true;
  }else{
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
function validate(isESLINT, isExpDesc, buildPath) {
  if (isESLINT) {
    shell.exec(
      `npx eslint -c ./.eslintrc.js ../experiment > ${buildPath}/eslint.log`
    );
    console.log(`ESLINT log file: ${buildPath}/eslint.log`);
  }
  if (isExpDesc) {
    shell.exec(
      `node ./validation/validate.js -f ../experiment-descriptor.json > ${buildPath}/validate.log`
    );
    console.log(`Experiment Descriptor log file: ${buildPath}/validate.log`);
  }
}

// Clean
function clean() {
  fs.rmdirSync("../build", { recursive: true });
  fs.rmdirSync("./plugins", { recursive: true });
  fs.rmdirSync("./node_modules", { recursive: true });
  fs.rmdirSync("./package-lock.json", { recursive: true });
}

// Deploy Locally
function deployLocal() {
  // Check if build exists
  if (fs.existsSync("../build")) {
    // Deploy
    shell.exec(`npx http-server ../build -o -p 0`);
  } else {
    // Throw error
    console.error("Build does not exist, build first");
  }
}

function main()
{
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
  
    let src = "../";
  
    if (args._.length === 1) {
      src = path.resolve(args._[0]);
    }
}
