const exp = require('./Experiment.js');
const {Repository} = require('./repository.js');
const {Lab} = require('./lab.js');

const expBuilderRepo = new Repository('https://github.com/virtual-labs/ph3-beta-to-ui3.0-conv', 'v1.0.0');

e = new exp.MarkdownExperiment('testlab', 'tl', 'http://github.com/virtual-labs/testlab', 'v1.0.0', expBuilderRepo);
e.describe();
e.clone();
e.build();

lab = new Lab('lab-descriptor.json');
lab.experiments.build().deploy();
// at this stage we will have all the hosted links, and we can verify
// those links before adding to the lab.
lab.build().deploy();
