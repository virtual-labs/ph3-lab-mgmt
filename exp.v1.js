const path = require("path");
const Handlebars = require("handlebars");

const {Experiment} = require("./Experiment.js");

const exp = new Experiment(path.resolve(process.argv[2]));
//const exp = new Experiment(path.resolve("/home/ojas/tmp/exp-liquid-viscosity-iitk"));

exp.clean();
exp.init(Handlebars);
exp.includeFeedback();
exp.build();

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