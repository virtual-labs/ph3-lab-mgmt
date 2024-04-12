const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const { Experiment } = require("./experiment.js");
const Config = require("../config.js");
const { Plugin } = require("./plugin.js");
const { PluginScope } = require("../enums.js");
const log = require("../logger.js");


function copyFileSync(src, dest, options = {}) {

  try {
    fs.copyFileSync(src, dest);
  } catch (e) {
    log.error(`Error while copying ${src} to ${dest}::${e}`);
    return 1;
  }
  return 0;
}

function run(src, lab_data, build_options) {
  log.debug(`Running build process at ${src}`);
  // if the experiment repo does not contain experiment descriptor we will add the default descriptor.
  if (!shell.test("-f", Experiment.descriptorPath(src))) {
    // shell.cp(
    copyFileSync(
      path.resolve(Config.PROJECT_ROOT, Config.Experiment.default_descriptor),
      path.resolve(this.src, Experiment.descriptorPath(src))
    );
  }

  const exp = new Experiment(src);
  const pluginConfigFile = Plugin.getConfigFileName(build_options.env);
  const pluginConfig = require(pluginConfigFile);

  const pageScopePlugins = pluginConfig.filter(
    (p) => p.scope === PluginScope.PAGE
  );

  pageScopePlugins.forEach((plugin) => {
    if (plugin.id === "svc-rating") {
      plugin.attributes.columnValue = lab_data.exp_short_name;
    }
  });

  const code_assessment = exp.descriptor["code-assessment"];

  // Include code-assessment.json if the code editor is included
  if (code_assessment && code_assessment.include) {
    log.info("Code Editor included");
    build_options.codeditor = true;
    build_options.code_assessment = code_assessment;
    exp.includeCodeEditor(code_assessment.position);
  }
  else {
    build_options.codeditor = false;
    log.info("Code Editor Not included");
  }

  exp.init(Handlebars);
  // Validation
  if (build_options.isValidate) {
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