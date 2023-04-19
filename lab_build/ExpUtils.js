const path = require("path");

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
  console.log(chalk`{cyan CLONE} {yellow from} ${e.repo}`);
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
  console.log(
    chalk`{cyan BUILD} {yellow at} ${path.resolve(exp_dir, e_short_name)}`
  );

  /*
       Including name and short-name to the lab descriptor
       because these field are needed in the analytics.  There
       is no other (easy) way to identify the experiment from the
       list of experiments.
    */

  ld.exp_name = e.name;
  ld.exp_short_name = e_short_name;

  run(path.resolve(exp_dir, e_short_name), ld, { env: BuildEnvs.PRODUCTION });
}

function exp_stage(e, exp_dir, deployment_dest) {
  const e_short_name = toDirName(e["short-name"]);

  console.log(
    chalk`{cyan STAGE} {yellow to} ${path.resolve(
      deployment_dest,
      "stage",
      "exp",
      e_short_name
    )}`
  );

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

  const config = require("./config.json");
  const exp_dir = config["exp_dir"];
  const deployment_dest = config["deployment_dest"];
  const lab_dir_name = toDirName(lab_descriptor.lab);
  const deployment_path = path.join(deployment_dest, lab_dir_name);
  const experiments = expList(lab_descriptor);

  experiments.forEach((e) => {
    console.log("");
    exp_clone(e, exp_dir);
    exp_build(e, lab_descriptor, exp_dir);
    exp_stage(e, exp_dir, deployment_path);
    console.log("");
  });
}

module.exports = {
    loadExperiments,
};