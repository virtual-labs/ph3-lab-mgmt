const path = require("path");
const fs = require("fs");
const { renderJSON, renderMarkdown } = require("./renderer.js");
const process = require("process");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const Config = require("../config.js");
const { Unit } = require("./unit.js");

const { convert } = require("html-to-text");

const {
  UnitTypes,
  ContentTypes,
  BuildEnvs,
  validType,
  validContentType,
  PluginScope,
} = require("../enums.js");
const { NONAME } = require("dns");
const { Plugin } = require("./plugin.js");

const log = require("../logger.js");

class Task extends Unit {
  constructor(
    unit_type,
    label,
    content_type,
    exp_path,
    basedir,
    source,
    target,
    js_modules,
    css_modules,
    lu
  ) {
    super(unit_type, label, exp_path, basedir);
    this.lu = lu;
    this.content_type = validContentType(content_type);
    this.source = source;
    this.target = target;
    this.js_modules = js_modules || [];
    this.css_modules = css_modules || [];
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
      t["js_modules"],
      t["css_modules"],
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

  isURL(source) {
    try {
      new URL(source);
      return true;
    } catch (e) {
      log.debug(`${source} is not a valid URL`);
      return false;
    }
  }

  finalPath(modules) {
    let final_paths = [];
    for (let module of modules) {
      if (this.isURL(module)) {
        log.debug(`${module} is a valid URL`);
        final_paths.push(module);
        continue;
      }

      const absolute_path = path.resolve(
        path.join(Config.build_path(this.exp_path), this.basedir, module)
      );
      // check if the file exists
      if (fs.existsSync(absolute_path)) {
        log.debug(`${absolute_path} is found successfully`);
        final_paths.push(
          path.relative(path.dirname(this.targetPath()), absolute_path)
        );
      }
      else {
        log.error(`${absolute_path} does not exist`);
      }
    }
    return final_paths;
  }

  buildPage(exp_info, lab_data, options) {
    let assets_path = path.relative(
      path.dirname(this.targetPath()),
      Config.build_path(this.exp_path)
    );
    assets_path = assets_path ? assets_path : ".";

    // exp_info.name is an html tag. To get the experiment name from it,
    //  we need to extract the text
    const exp_info_name_text = convert(exp_info.name, {
      selectors: [{ selector: "h1", options: { uppercase: false } }],
    });
    const page_plugins = Plugin.preProcessPageScopePlugins(options);
    const page_data = {
      production: options.env === BuildEnvs.PRODUCTION,
      testing: options.env === BuildEnvs.TESTING,
      plugins: exp_info.plugins,
      page_plugins: page_plugins,
      local: options.local,
      units: this.setCurrent(this.getMenu(exp_info.menu)),
      experiment_name: exp_info.name,
      meta: {
        "experiment-short-name": lab_data.exp_short_name,
        "developer-institute": lab_data.collegeName,
        "learning-unit": this.lu || exp_info_name_text,
        "task-name": this.label,
      },
      isText: false,
      isVideo: false,
      isSimulation: false,
      isAssessment: false,
      assets_path: assets_path,
      js_modules: this.finalPath(this.js_modules),
      css_modules: this.finalPath(this.css_modules),
      lab_data: lab_data,
      exp_info: exp_info,
      lab: lab_data.lab,
      lab_display_name: lab_data.lab_display_name,
      broadArea: lab_data.broadArea,
      deployLab: lab_data.deployLab,
      phase: lab_data.phase,
      collegeName: lab_data.collegeName,
      baseUrl: lab_data.baseUrl,
      exp_name: lab_data.exp_name || exp_info_name_text,
      exp_short_name: lab_data.exp_short_name,
    };
    // Context Info for Bug report
    page_data.bugreport_context_info = JSON.stringify({
      organisation: "Virtual Labs",
      developer_institute: lab_data.collegeName,
      expname: page_data.exp_name,
      labname: lab_data.lab,
      phase: lab_data.phase,
    });

    // console.log(page_data.bugreport_context_info);
    page_data.content_type = this.content_type;
    switch (this.content_type) {
      case ContentTypes.TEXT:
        const mdContent = fs.readFileSync(this.sourcePath()).toString();
        const htmlContent = renderMarkdown(mdContent);
        page_data.content = htmlContent;
        page_data.isText = true;
        break;

      case ContentTypes.VIDEO:
        const vidContent = fs.readFileSync(this.sourcePath()).toString();
        const htmlvidContent = renderMarkdown(vidContent);
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

        const rp = path.join(
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

      case ContentTypes.ASSESSMENT:
      case ContentTypes.ASSESMENT:
        page_data.isAssessment = true;

        if (shell.test("-f", this.sourcePath())) {
          let JSONdata = require(this.sourcePath());
          let version = JSONdata.version;
          JSONdata = renderJSON(JSON.stringify(JSONdata));
          if (version) {
            /**
             * The below condition will only work if the version in the json is either 2 or 2.0, for any update in version
             * it needs to be changed here accordingly
             */
            if (version == 2) {
              page_data.isJsonVersion2 = true;
            }
            page_data.questions = JSON.parse(JSONdata).questions;
          }
          else { // Assuming it is version 1 of json format
            page_data.questions = JSON.parse(JSONdata);
          }
          // page_data.questions_str = JSON.stringify(JSON.parse(JSONdata).questions);
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
            log.error(`${jsonpath} is missing`);
            process.exit(-1);
          }
        }
        break;
    }

    const page_template = fs.readFileSync(
      path.resolve(
        __dirname,
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
      log.error(e);
    }
  }

  build(exp_info, lab_data, options) {
    log.debug(`Building TASK ${this.label}...`);
    this.buildPage(exp_info, lab_data, options);
    Plugin.processPageScopePlugins(this, options);
    log.debug(`Finished building TASK ${this.label}`);
  }
}

module.exports = { Task };
