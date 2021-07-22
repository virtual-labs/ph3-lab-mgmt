const path = require("path");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const {Experiment} = require("./Experiment.js");
const Config = require("./Config.js");
const {BuildEnvs, validBuildEnv} = require("./Enums.js");

function run (src, lab_data, build_options) {

  // if the experiment repo does not contain experiment descriptor we will add the default descriptor.
  if (!shell.test("-f", Experiment.descriptorPath(src))){
    shell.cp(path.resolve(Config.Experiment.default_descriptor), path.resolve(this.src, Experiment.descriptorPath(src)));
  }

  const exp = new Experiment(src);
  exp.clean();
  exp.init(Handlebars);
  exp.includeFeedback();
  exp.build(lab_data, build_options);
}

module.exports.run = run;
module.exports.build_experiment = run;

if (require.main === module) {
  const args = require("minimist")(process.argv.slice(2));

  // for backwards compatibility if the env is not given assume it to
  // be testing.
  const build_options = {};

  if(args.env) {
    build_options.env = validBuildEnv(args.env);
  }
  else {
    build_options.env = BuildEnvs.TESTING;
  }
  
  // if the path is not provided assume "../" for backward
  // compatability.

  let src = "../";
  
  if(args._.length === 1) {
    src = path.resolve(args._[0]);
  }
  
  /*
    We are making an assumption here that if you are running this
    script from the command line then this is being used for testing
    the individual experiment, and by convention when we are testing
    individual experiment, we do not use any lab level information and
    we do not include analytics.

    So, while it is possible to give build_options.env as
    'production', it does not make any sense and we should probably
    remove it or change the build process to make it useful.

    Anyways, for now, we will send an empty object as lab_data and
    hope things work out.
   */
  const default_lab_data = {};

  // const repo_path = shell.exec('git config --get remote.origin.url', {silent:true}).stdout;
  // const repo_name = path.basename(repo_path, '.git');
  // console.log('Repo path = ' + repo_path);
  // console.log('Repo name = ' + repo_name);
  // console.log('Src = ' + path.resolve(src));

  const paths = path.resolve(src).split(path.sep);
  const base = paths[paths.length - 1];

  // Get the experiment name and developer institute name from the repo name of the
  //  format exp-<expName>-<devInstituteName> e.g. exp-geometry-optimization-molecules-iiith
  const path_name_regex = /exp-(?<expName>[\w-]+)-(?<devInstituteName>\w+)$/i;
  const match = base.match(path_name_regex);

  if (match && match.groups) {
    default_lab_data.exp_short_name = match.groups.expName;
    default_lab_data.collegeName = match.groups.devInstituteName;
    default_lab_data.phase = 'Testing';
    default_lab_data.lab = 'Virtual Lab';
    default_lab_data.broadArea.name = 'Test';
  } else {
    console.log('No match found');
  }

  run(src, default_lab_data, build_options);
}
// node exp.v1.js --env=production ../
// node exp.v1.js --env=testing ../
// node exp.v1.js --env=local ../
