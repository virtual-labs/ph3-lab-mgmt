const path = require("path");
const fs = require("fs");
const { renderMarkdown } = require("./renderer.js");
const process = require("process");
const shell = require("shelljs");

const Config = require("../config.js");
const { LearningUnit } = require("./learning_unit.js");
const { Task } = require("./task.js");
const {
  UnitTypes,
  ContentTypes,
  BuildEnvs,
  PluginScope,
} = require("../enums.js");
const { Plugin } = require("./plugin.js");
const log = require("../logger.js");

function getAssessmentPath(src, units) {
  let assessmentPath = [];
  units.forEach((unit) => {
    if (unit["unit-type"] === "lu") {
      const nextSrc = path.resolve(src, unit.basedir);
      let paths = getAssessmentPath(nextSrc, unit.units);
      assessmentPath.push(...paths);
    }
    if(unit["content-type"] === ContentTypes.ASSESMENT || unit["content-type"] === ContentTypes.ASSESSMENT){
      const quiz = path.resolve(src, unit.source);
      assessmentPath.push(quiz);
    }
  });
  return assessmentPath;
}

class Experiment {
  constructor(src) {
    this.src = src;
    this.descriptor = require(Experiment.descriptorPath(src));
  }

  static ui_template_path = path.resolve(
    __dirname,
    Config.Experiment.ui_template_name
  );

  static static_content_path = path.resolve(
    __dirname,
    Config.Experiment.static_content_dir
  );

  static descriptorPath(src) {
    return path.resolve(src, Config.Experiment.descriptor_name);
  }

  static contributorsPath(src) {
    return path.resolve(`${src}/experiment`, "contributors.md");
  }

  static registerPartials(hb) {
    Config.Experiment.partials.forEach(([name, file]) => {
      const partial_content = fs.readFileSync(
        path.resolve(
          Experiment.ui_template_path,
          "partials",
          `${file}.handlebars`
        )
      );
      hb.registerPartial(name, partial_content.toString());
    });
  }

  init(hb) {
    try {
      log.debug("Initializing experiment");
      const bp = Config.build_path(this.src);
      shell.mkdir(path.resolve(this.src, Config.Experiment.build_dir));
      shell.cp("-R", path.resolve(this.src, Config.Experiment.exp_dir), bp);
      shell.cp("-R", Config.assets_path(), bp);

      // Copy the Katex CSS and fonts to the build directory in assets/katex_assets
      log.debug("Moving Katex assets");
      shell.mkdir(path.resolve(bp, "assets", "katex_assets"));
      const pathtoKatex = require.resolve("katex")
      const katex_assets_path = path.dirname(pathtoKatex);
      shell.cp(
        "-R",
        path.resolve(katex_assets_path, "katex.min.css"),
        path.resolve(bp, "assets", "katex_assets")
      );
      shell.cp(
        "-R",
        path.resolve(katex_assets_path, "fonts"),
        path.resolve(bp, "assets", "katex_assets")
      );

      log.debug("Moving feedback file");
      shell.cp(
        "-R",
        path.resolve(Experiment.static_content_path, "feedback.md"),
        bp
      );

      log.debug("Linking with Handlebars");
      Experiment.registerPartials(hb);
    } catch (e) {
      log.error("Error initializing experiment", e);
      log.error("Exiting Build Process");
      process.exit();
    }
  }

  validate(build_options) {
    log.debug("Validating experiment");
    const buildPath = Config.build_path(this.src);
    const expPath = path.resolve(this.src, Config.Experiment.exp_dir);
    if (build_options.isESLINT) {
      try {
        log.debug("Validating with eslint");
        shell.exec(`npx eslint -c ${__dirname}/.eslintrc.js ${expPath} > ${buildPath}/eslint.log`);
      } catch (e) {
        log.error("Error validating with eslint", e);
      }
    }
    if (build_options.isExpDesc) {
      const descriptorPath = Experiment.descriptorPath(this.src);
      const descriptor = require(descriptorPath);
      const pathToValidator = path.resolve(__dirname, "../validation/validate.js");
      try {
      log.debug("Validating experiment descriptor");
      shell.exec(`node ${pathToValidator} -f ${descriptorPath} >> ${buildPath}/validate.log`);
      } catch (e) {
        log.error("Error validating experiment descriptor", e);
      }
      // loop through the units and validate the content
      try {
      log.debug("Validating Assessment files");
      const assessmentPath = getAssessmentPath(expPath, descriptor.units);
      assessmentPath.forEach((file) => {
        if (fs.existsSync(file)) {
          // trim ep from file
          const fileName = file.replace(expPath, "");
          shell.exec(`echo =${fileName} >> ${buildPath}/assesment.log`);
          shell.exec(
            `node ${pathToValidator} -f ${file} -c assessment >> ${buildPath}/assesment.log`
          );
        } else {
          log.error(`Assessment file ${path} does not exist`);
        }
      });
      } catch (e) {
        log.error("Error validating Assessment files", e);
      }
    }
  }
  name() {
    const name_file = fs.readFileSync(
      path.resolve(Config.build_path(this.src), "experiment-name.md")
    );
    return renderMarkdown(name_file.toString());
  }

  build(hb, lab_data, options) {
    /*
    here we are assuming that the descriptor contains a simgle object
    that represents the learning unit corresponding to the experiment.
    */
   log.debug(`Building experiment`);
   const explu = LearningUnit.fromRecord(this.descriptor, this.src);
   const exp_info = {
     name: this.name(),
     menu: explu.units,
     src: this.src,
     bp: Config.build_path(this.src) + "/",
    };

    if (options.plugins) {
      exp_info.plugins = Plugin.processExpScopePlugins(
        exp_info,
        hb,
        lab_data,
        options
      );
    }
    explu.build(exp_info, lab_data, options);
    // post build
    if (options.plugins) {
      Plugin.processPostBuildPlugins(exp_info, options);
    }
    /*
      This "tmp" directory is needed because when you have a sub-directory
      with the same name, it can cause issue.  So, we assume that there should
      not be any sub-directory with "tmp" name, and first move the contents to tmp
      before moving the contents to the top level directory.
     */
    const tmp_dir = path.resolve(this.src, Config.Experiment.build_dir, "tmp");
    shell.mv(path.resolve(Config.build_path(this.src)), tmp_dir);
    shell.mv(
      path.resolve(tmp_dir, "*"),
      path.resolve(this.src, Config.Experiment.build_dir)
    );
    shell.rm("-rf", tmp_dir);
  }

  includeFeedback() {
    const feedbackLU = {
      "unit-type": "task",
      label: "Feedback",
      "content-type": "text",
      source: "feedback.md",
      target: "feedback.html",
    };

    this.descriptor.units.push(feedbackLU);
  }

  includeContributors() {
    const contributors = {
      "unit-type": "task",
      label: "Contributors",
      "content-type": "text",
      source: "contributors.md",
      target: "contributors.html",
    };
    this.descriptor.units.push(contributors);
  }
}

module.exports = { Experiment };

// need to handle optional menu items

/*

TODO

Removing this becaiuse it is optional and we have not yet handled
the case.

    {
      "target": "posttest.html",
      "source": "posttest.js",
      "label": "Posttest",
      "unit-type": "task",
      "content-type": "assesment"
    },

*/
