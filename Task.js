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
  BuildEnvs,
  validType,
  validContentType,
} = require("./Enums.js");
const { NONAME } = require("dns");

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
      target: path.relative(path.dirname(host_path), this.targetPath()),
    };
  }

  getMenu(menu_data) {
    return menu_data.map((mi) => mi.menuItemInfo(this.targetPath()));
  }

  setCurrent(menu) {
    menu.map((u) => {
      if (u.unit_type === UnitTypes.TASK || u.unit_type === UnitTypes.AIM) {
        u.isCurrentItem = this.target === u.target;
      } else {
        u.isCurrentLU = u.units
          ? u.units.some((t) => {
              return t.target === this.target;
            })
          : false;
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
      path.join(Config.build_path(this.exp_path), this.basedir, this.target)
    );
  }

  sourcePath() {
    return path.resolve(
      path.join(Config.build_path(this.exp_path), this.basedir, this.source)
    );
  }

  buildPage(exp_info, lab_data, options) {
    let assets_path = path.relative(
      path.dirname(this.targetPath()),
      Config.build_path(this.exp_path)
    );
    assets_path = assets_path ? assets_path : ".";

    const page_data = {
      production: options.env === BuildEnvs.PRODUCTION,
      testing: options.testing,
      local: options.local,
      units: this.setCurrent(this.getMenu(exp_info.menu)),
      experiment_name: exp_info.name,
	    meta: {
		    experiment_short_name: lab_data.exp_short_name,
		    college_name: lab_data.collegeName,
		    learning_unit: this.lu || exp_info.name,
		    task_name: this.label,
	    },
      isText: false,
      isVideo: false,
      isSimulation: false,
      isAssesment: false,
      assets_path: assets_path,
      lab: lab_data.lab,
      broadArea: lab_data.broadArea,
      deployLab: lab_data.deployLab,
      phase: lab_data.phase,
      collegeName: lab_data.collegeName,
      baseUrl: lab_data.baseUrl,
      exp_name: lab_data.exp_name,
      exp_short_name: lab_data.exp_short_name,
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

        let rp = path.join(
          path.relative(
            path.dirname(this.sourcePath()),
            Config.build_path(this.exp_path)
          ),
          "assets/js/iframeResize.js"
        );

        content = content.replace(
          "</body>",
          `<script src="${rp}"></script></body>`
        );
        fs.writeFileSync(path.resolve(this.sourcePath()), content);
        break;

      case ContentTypes.ASSESMENT:
        page_data.isAssesment = true;
        if (shell.test("-f", this.sourcePath())) {
          page_data.questions = require(this.sourcePath());
          if (page_data.questions.version) {
            /**
             * The below condition will only work if the version in the json is either 2 or 2.0, for any update in version
             * it needs to be changed here accordingly
             */
            if (page_data.questions.version == 2) {
              page_data.isJsonVersion2 = page_data.questions.version;
            }
            page_data.questions = page_data.questions.questions;
          }
          page_data.questions_str = JSON.stringify(page_data.questions);
          page_data.isJsonVersion = true;
        } else {
          const jsonpath = this.sourcePath();
          const jspath = path.resolve(
            path.dirname(jsonpath),
            `${path.basename(jsonpath, "json")}js`
          );

          if (shell.test("-f", jspath)) {
            page_data.quiz_src = path.basename(jspath);
            page_data.isJsVersion = true;
          } else {
            console.log(`${jspath} is missing`);
            process.exit(-1);
          }
        }

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
      fs.writeFileSync(
        this.targetPath(),
        Handlebars.compile(page_template.toString())(page_data)
      );
    } catch (e) {
      console.error(e.message);
    }
  }


  processPostPlugins(exp_info, lab_data, options) {
    const pluginConfig = require("plugin-config.js");
    const postBuildPlugins = pluginConfig.filter((p) => p.lifecycle==="post-build")
    for(plugin in postBuildPlugins){
      let curPluginDiv = document.getElementById(plugin.id)
      if(!curPluginDiv) continue;
      switch(plugin.render){
        case "inline":
          let src = "<script src=\"" + plugin.src + "\" type=\"module\"></script>"
          // Include in handlebar build or at end of body, below is a crude untested approach
          let content = fs
          .readFileSync(path.resolve(this.sourcePath()))
          .toString();
          content = content.replace(
            "</body>",
            src + "</body>"
          );
          fs.writeFileSync(path.resolve(this.sourcePath()), content);
          // Question we probably need to do this step before Handlebar compile I suppose
      // Get the repos here
      // Dist dir in plugin repo
      // Copy them to assets folder as plugin-<pluginname>-dist
      // Add app.js in the body. 
      }
    }
  }

  build(exp_info, lab_data, options) {
    this.buildPage(exp_info, lab_data, options);
    this.processPostPlugins(exp_info, lab_data, options);
  }
}

module.exports = { Task };
