const path = require("path");
const fs = require("fs");
const marked = require("marked");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const Config = require("./Config.js");
const {ContentTypes, validContentType, validUnitType} = require("./Enums.js");

class Unit {
  constructor(
    unit_type,
    label,
    content_type,
    exp_path,
    basedir,
    source,
    target
  ) {
    this.unit_type = validUnitType(unit_type);
    this.content_type = validContentType(content_type);
    this.label = label;
    this.exp_path = exp_path;
    this.basedir = basedir;
    this.source = source;
    this.target = target;
  }

  targetPath() {
    return path.resolve(".", this.exp_path, Config.Experiment.build_dir, this.basedir, this.target);
  }

  sourcePath() {
    return path.resolve(".", this.exp_path, Config.Experiment.build_dir, this.basedir, this.source);
  }

  menuItemInfo() {
    return {
      label: this.label,
      isCurrentItem: false,
      target: path.join("/", this.basedir, this.target)
    };
  }
  
  relativeRootPath() {
      return this.target.split("/").filter(pi => pi === ".").map(i => "..").join("/");
  }

  getMenu(menu_data) {
    return menu_data
      .filter((mi) => shell.test("-e", mi.sourcePath()))
      .map(mi => {
        return mi.menuItemInfo();
      });
  }
  
  setCurrent(menu) {
    menu.map(lu => {
      lu.isCurrentItem = (this.label === lu.label);

      lu.isCurrentLU = lu.isCurrentItem || (lu.tasks? lu.tasks.some(t => {
        return (t.label === this.label);
      }):false);

      lu.tasks = lu.tasks? lu.tasks.map(t => {
        t.isCurrentItem = (this.label === t.label);
        return t;
      }):[];

      return lu;
    });
    return menu;
  }

  compilePage(exp_info) {
    const page_data = {
      production: false,
      lus: this.setCurrent(this.getMenu(exp_info.menu)),
      experiment_name: exp_info.name,
      isText: false,
      isVideo: false,
      isSimulation: false,
      isAssesment: false,
      assets_path: "" //this.relativeRootPath()
    };

    switch(this.content_type) {
    case ContentTypes.TEXT:
      let mdContent = fs.readFileSync(this.sourcePath()).toString();
      let htmlContent = marked(mdContent);
      page_data.content = htmlContent;
      page_data.isText = true;
      break;
      
    case ContentTypes.VIDEO:
      let vidContent = fs.readFileSync(this.sourcePath()).toString();
      let htmlvidContent = marked(vidContent);
      page_data.content = htmlvidContent;
      page_data.isVideo = true;
      break;
      
    case ContentTypes.SIMULATION:
      page_data.isSimulation = true;
      page_data.sim_src = this.source;
      
      // Inject IframeResizer
      let content = fs.readFileSync(path.resolve(this.sourcePath())).toString();
      content = content.replace("</body>", `<script src="${this.relativeRootPath()}/assets/js/iframeResize.js"></script></body>`);
      fs.writeFileSync(path.resolve(this.sourcePath()), content);
      break;
      
    case ContentTypes.ASSESMENT:
      page_data.isAssesment = true;
      page_data.quiz_src = this.source;
      break;
    }

    const page_template = fs.readFileSync(path.resolve(Config.Experiment.ui_template_name, 'pages', 'content.handlebars'));
    return Handlebars.compile(page_template.toString())(page_data);
  }

  writePage(exp_info) {
    try{
      fs.writeFileSync(this.targetPath(), this.compilePage(exp_info));
    }
    catch(e){
      console.error(e.message);
    }
  }
}

module.exports = {Unit};
