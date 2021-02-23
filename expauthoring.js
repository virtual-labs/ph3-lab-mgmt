const path = require("path");
const fs = require("fs");
const marked = require("marked");
const { JSDOM } = require("jsdom");
const process = require("process");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const {Experiment} = require("./Experiment.js");

const exp = new Experiment(path.resolve("/home/ojas/tmp/exp-ds-phase3/"));
exp.clean();
exp.init(Handlebars);
exp.includeFeedbackAsLU();
exp.build();


/**
 * Fix Feedback link in the menu.
 * 
 */

/*

positioning issue in phase 2 lab (get link)

include simulation styling in the framework

iframe

font size in quiz
*/
