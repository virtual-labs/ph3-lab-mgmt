const path = require("path");
const Handlebars = require("handlebars");
const {Experiment} = require("./Experiment.js");
const {BuildEnvs, validBuildEnv} = require("./Enums.js");

args = require("minimist")(process.argv.slice(2));

const exp = new Experiment(path.resolve(args._[0]));
const build_options = {
  env: validBuildEnv(args.env)
};
exp.clean();
exp.init(Handlebars);
exp.includeFeedback();
exp.build(build_options);

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
