const path = require("path");
const {toDirName} = require("./lab_utils.js");
const {run} = require("../exp_build/exp_gen.js");
const chalk = require("chalk");
const shell = require("shelljs");
const log = require("../logger.js");
const { BuildEnvs } = require("../enums.js");
shell.config.silent = true;

function expList(lab_descriptor) {
  if (lab_descriptor.experiments) {
    const experiments = lab_descriptor.experiments;
    return experiments;
  } else {
    const experiments = lab_descriptor["experiment-sections"]
      .map((es) => es.experiments)
      .flat();
    return experiments;
  }
}

function exp_clone(e, exp_dir) {
  log.debug(`Cloning ${e.repo} to ${exp_dir}`);
  const e_short_name = e["short-name"];
  shell.mkdir("-p", path.resolve(exp_dir));
  shell.rm("-rf", path.resolve(exp_dir, e_short_name));
  shell.exec(
    `git clone -b ${e.tag} --depth 1 ${e.repo} ${path.resolve(
      exp_dir,
      e_short_name
    )}`
  );
}

function exp_build(e, ld, exp_dir) {
  const e_short_name = e["short-name"];
  log.debug(`Building experiment ${e_short_name} at ${path.resolve(exp_dir, e_short_name)}`);
  /*
       Including name and short-name to the lab descriptor
       because these field are needed in the analytics.  There
       is no other (easy) way to identify the experiment from the
       list of experiments.
    */

  ld.exp_name = e.name;
  ld.exp_short_name = e_short_name;

  const build_options = {
    env: BuildEnvs.PRODUCTION,
    isValidate: false,
    plugins: false
  }

  run(path.resolve(exp_dir, e_short_name), ld, build_options);
}

function exp_stage(e, exp_dir, deployment_dest) {
  const e_short_name = toDirName(e["short-name"]);
  log.debug(`Staging experiment ${e_short_name} to ${path.resolve(deployment_dest, "stage", "exp", e_short_name)}`);

  shell.rm("-rf", `${deployment_dest}/stage/exp/${e_short_name}/`);
  shell.mkdir(
    "-p",
    path.resolve(deployment_dest, "stage", "exp", e_short_name)
  );
  shell.cp(
    "-rf",
    `${exp_dir}/${e_short_name}/build/*`,
    `${deployment_dest}/stage/exp/${e_short_name}/`
  );
}

function loadExperiments(labpath) {
  const ldpath = path.resolve(labpath, "lab-descriptor.json");
  const lab_descriptor = require(ldpath);

  const config = require("./lab_config.json");
  const exp_dir = config["exp_dir"];
  const deployment_dest = config["deployment_dest"];
  const lab_dir_name = toDirName(lab_descriptor.lab);
  const deployment_path = path.join(deployment_dest, lab_dir_name);
  const experiments = expList(lab_descriptor);

  const num_experiments = experiments.length;
  let exp_count = 1;
  experiments.forEach((e) => {
    log.info(`Loading experiment ${e["short-name"]} (${exp_count}/${num_experiments})`);
    exp_clone(e, exp_dir);
    exp_build(e, lab_descriptor, exp_dir);
    exp_stage(e, exp_dir, deployment_path);
  });
}

module.exports = {
    loadExperiments,
    expList
};