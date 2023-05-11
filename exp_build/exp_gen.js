const path = require("path");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const { Experiment } = require("./experiment.js");
const Config = require("../config.js");
const { BuildEnvs, validBuildEnv } = require("../enums.js");
const log = require("../logger.js");

function run(src, lab_data, build_options) {
  log.debug(`Running build process at ${src}`);
  // if the experiment repo does not contain experiment descriptor we will add the default descriptor.
  if (!shell.test("-f", Experiment.descriptorPath(src))) {
    shell.cp(
      path.resolve(Config.Experiment.default_descriptor),
      path.resolve(this.src, Experiment.descriptorPath(src))
    );
  }

  const exp = new Experiment(src);
  exp.init(Handlebars);
  // Validation
  if (build_options.isValidate)
  {
    exp.validate(build_options);
  } 

  // if the experiment repo contains contributors.md file we will add its lu to the descriptor.
  if (shell.test("-f", Experiment.contributorsPath(src))) {
    if (
      shell
        .head({ "-n": 1 }, Experiment.contributorsPath(src))
        .includes("EMPTY")
    ) {
      log.warn("Contributors.md file is empty, please add contributors to the file.");
    } else {
      exp.includeContributors();
    }
  }
  else {
    log.warn("Contributors.md file is not present, please add contributors to the experiment.");
  }
  exp.includeFeedback();
  exp.build(Handlebars, lab_data, build_options);
}

module.exports.run = run;
module.exports.build_experiment = run;