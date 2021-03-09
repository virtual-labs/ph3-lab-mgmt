const path = require("path");
const fs = require("fs");
const marked = require("marked");
const { JSDOM } = require("jsdom");
const process = require("process");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const Config = require("./Config.js");
const { Unit } = require("./Unit.js");
const {
  UnitTypes,
  ContentTypes,
  validType,
  validContentType,
} = require("./Enums.js");

class Task extends Unit {
  constructor(
    unit_type,
    label,
    content_type,
    exp_path,
    basedir,
    source,
    target,
    lu
  ) {
    super(unit_type, label, exp_path, basedir);
    this.lu = lu;
    this.content_type = validContentType(content_type);
    this.source = source;
    this.target = target;
  }

  static unit_type = UnitTypes.TASK;

  static fromRecord(t, lu, exp_path) {
    return new Task(
      t["unit-type"],
      t["label"],
      t["content-type"],
      exp_path,
      t["basedir"],
      t["source"],
      t["target"],
      lu
    );
  }


  menuItemInfo(host_path) {

    return {
      label: this.label,
      unit_type: this.unit_type,
      isCurrentItem: false,
      lu: this.lu,
      target: path.relative(path.dirname(host_path), this.targetPath())
    };
  }


  getMenu(menu_data) {

    return menu_data
      .filter((mi) => {
        if ( mi.unit_type === UnitTypes.TASK || mi.unit_type === UnitTypes.AIM ){
          return shell.test("-e", mi.sourcePath());
        }
        else {
          return true;
        }
      })
      .map((mi) => {
        return mi.menuItemInfo(this.targetPath());
      });
  }


  setCurrent(menu) {

    menu.map((u) => {
      if (u.unit_type === UnitTypes.TASK || u.unit_type === UnitTypes.AIM) {
        u.isCurrentItem = this.target === u.target; 
      }
      else {
        u.isCurrentLU = (u.units? u.units.some((t) => {
              return t.target === this.target;
            })
          : false);

        u.units = u.units
          ? u.units.map((t) => {
              t.isCurrentItem = this.target === t.target;
              return t;
            })
          : [];

      }
      return u;
    });
    return menu;
  }


  targetPath() {
    return path.resolve(
      ".",
      this.exp_path,
      Config.Experiment.build_dir,
      this.basedir,
      this.target
    );
  }

  sourcePath() {
    return path.resolve(
      ".",
      this.exp_path,
      Config.Experiment.build_dir,
      this.basedir,
      this.source
    );
  }


  buildPage(exp_info) {

    const page_data = {
      production: false,
      units: this.setCurrent(this.getMenu(exp_info.menu)),
      experiment_name: exp_info.name,
      isText: false,
      isVideo: false,
      isSimulation: false,
      isAssesment: false,
      assets_path: path.relative(path.dirname(this.targetPath()), path.join(this.exp_path, "build"))
    };

    switch (this.content_type) {
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
        let content = fs
          .readFileSync(path.resolve(this.sourcePath()))
          .toString();

        let rp = path.join(path.relative(path.dirname(this.sourcePath()), path.resolve(path.join(this.exp_path, "build/assets"))), "js/iframeResize.js");

        content = content.replace(
          "</body>",
          `<script src="${rp}"></script></body>`
        );
        fs.writeFileSync(path.resolve(this.sourcePath()), content);
        break;

      case ContentTypes.ASSESMENT:
        page_data.isAssesment = true;
        page_data.quiz_src = this.source;
        break;
    }

    const page_template = fs.readFileSync(
      path.resolve(
        Config.Experiment.ui_template_name,
        "pages",
        "content.handlebars"
      )
    );

    try {
      fs.writeFileSync(this.targetPath(), Handlebars.compile(page_template.toString())(page_data));
    } catch (e) {
      console.error(e.message);
    }
  }


  build(exp_info) {
    this.buildPage(exp_info);
  }
}

module.exports = { Task };
