const path = require("path");
const Handlebars = require("handlebars");
const {Experiment} = require("./Experiment.js");
const {BuildEnvs, validBuildEnv} = require("./Enums.js");

function run (src, lab_data, build_options) {
  const exp = new Experiment(src);
  exp.clean();
  exp.init(Handlebars);
  exp.includeFeedback();
  exp.build(lab_data, build_options);
}

module.exports.run = run;

if (require.main === module) {
  const args = require("minimist")(process.argv.slice(2));
  const build_options = {
    env: validBuildEnv(args.env)
  };
  const src = path.resolve(args._[0]);
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
  run(src, {}, build_options);
}
// node exp.v1.js --env=production ../
// node exp.v1.js --env=testing ../
// node exp.v1.js --env=local ../

// when there is no descriptor.
// we will create one.

// sepearate repo for common experiment stylings like instructions, buttons etc. for ds experiments.

// open close menu.

// finalize the urls.

/*

The side menu:

- list of items
- each item is either a task or a learning unit
- if the item is a task :: it becomes a link
- if the item is a learning unit :: it becomes of list of links

*/
