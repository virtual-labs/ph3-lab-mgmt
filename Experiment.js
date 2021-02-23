const path = require("path");
const fs = require("fs");
const marked = require("marked");
const process = require("process");
const shell = require("shelljs");

const Config = require("./Config.js");
const {LearningUnit} = require("./LearningUnit.js");
const {Task} = require("./Task.js");
const {UnitTypes, ContentTypes, validType, validContentType} = require("./Enums.js");

class Experiment {
  constructor(src) {
    this.src = src;
    this.descriptor = require(Experiment.descriptorPath(src));
    this.lus = this.descriptor.map((lu) => LearningUnit.fromRecord(lu, src));
  }

  static build_path(src) {
    return path.resolve(src, Config.Experiment.build_dir);
  }
  
  static exp_path(src) {
    return path.resolve(src, Config.Experiment.build_dir, Config.Experiment.exp_dir);
  }
  
  static ui_template_path = path.resolve(Config.Experiment.ui_template_name);

  static static_content_path = path.resolve(Config.Experiment.static_content_dir);

  static descriptorPath(src) {
    return path.resolve(src, `${Config.Experiment.descriptor_name}.json`);
  }

  clean() {
    const bp = Experiment.build_path(this.src);
    if (shell.test("-d", bp)){
      shell.rm("-rf", bp);
    }
  }
  
  static registerPartials(hb) {
    Config.Experiment.partials.forEach(([name, file]) => {
      const partial_content = fs.readFileSync(path.resolve(Experiment.ui_template_path, 'partials', `${file}.handlebars`));
      hb.registerPartial(name, partial_content.toString());
    });
  }

  init(hb) {
    try{
      const bp = Experiment.build_path(this.src);
      const ep = Experiment.exp_path(this.src);
      shell.mkdir(bp);
      shell.mkdir(ep);
      shell.mkdir(path.resolve(ep, "feedback"));
      shell.cp("-R", path.resolve(this.src, Config.Experiment.exp_dir), bp);
      shell.cp("-R", path.resolve(Experiment.ui_template_path, "assets"), ep);
      shell.cp("-R", path.resolve(Experiment.static_content_path, "feedback.md"), path.resolve(ep, "feedback"));
      Experiment.registerPartials(hb);
    }
    catch(e) {
      console.error(e);
      process.exit();
    }
  }
  
  name() {
    const name_file = fs.readFileSync(path.resolve(this.src, "build/experiment", "experiment-name.md"));
    return marked(name_file.toString());
  }
  
  summary() {
    /* return the number of learning units and tasks. */
    const desc = this.descriptor;
    const lus = Array.from(desc).map((lu) => [lu["label"], lu["units"].length]);
    const nlus = lus.length;
    const ntasks = lus.reduce((nts, l) => nts + l[1], 0);
    return { nlus: nlus, ntasks: ntasks, lus: lus };
  }

  menudata() {
    return this.lus.map(lu => lu.menuInfo());
  }

  build(){
    const exp_info = {name: this.name(), menu: this.lus};
    this.lus.forEach((lu) => {
      lu.writePage(exp_info);
      if(lu.tasks){
	      lu.tasks.forEach(t => t.writePage(exp_info));
      }
    });
  }

  includeFeedbackAsLU() {
    const feedbackLU = new LearningUnit(UnitTypes.LU,
      "Feedback",
      ContentTypes.TEXT,
      this.src,
      "feedback",
      "feedback.md",
      "feedback.html",
      []
    );
    this.lus.push(feedbackLU);
  }
}

module.exports = {Experiment};
