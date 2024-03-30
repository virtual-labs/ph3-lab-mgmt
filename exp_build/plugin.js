const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const { JSDOM } = require("jsdom");

const Config = require("../config.js");
const { PluginConfig, PluginScope } = require("../enums.js");
const log = require("../logger.js");

function setCurr(component, targetPath, subTaskFlag = false) {
  let obj = { ...component },
    isCurrentItem = false;

  if (obj.unit_type === "aim") {
    subTaskFlag = true;
    isCurrentItem = true;
  }

  if (!subTaskFlag) {
    obj = component.menuItemInfo(targetPath);
  }

  if (obj.unit_type === "lu") {
    obj.units = [
      ...obj.units.map((subComponent) =>
        setCurr(subComponent, targetPath, true)
      ),
    ];
  }

  return { ...obj, isCurrentItem: isCurrentItem };
}


// function isURL(source) {
//   try {
//     new URL(source);
//     return true;
//   } catch (e) {
//     log.debug(`${source} is not a valid URL`);
//     return false;
//   }
// }

function finalPath(target_path ,pluginId, modules) {
  const pluginPath = path.resolve("plugins", pluginId);
  let final_paths = [];
  for (let module of modules) {
    if(Config.isURL(module)) {
      log.debug(`${module} is a valid URL`);
      final_paths.push(module);
      continue;
    }
    const absolute_path = path.resolve(
      path.join(pluginPath, module)
    );
    // check if the file exists
    if (fs.existsSync(absolute_path)) {
      log.debug(`${absolute_path} is found successfully`);
      final_paths.push(
        path.join("plugins", pluginId, module)
      );
    }
    else {
      log.error(`${absolute_path} does not exist`);
    }
  }
  return final_paths;
}

function prepareRepo(repoInfo) {
  log.debug(`Preparing repo ${repoInfo.id}`);
  if (!fs.existsSync(repoInfo.id)) {
    if (repoInfo.tag) {
      shell.exec(`git clone --depth=1  ${repoInfo.repo} --branch ${repoInfo.tag}`, { silent: true });
    }
    else {
      shell.exec(`git clone --depth=1 ${repoInfo.repo}`, { silent: true });
    }
  } else {
    shell.cd(`${repoInfo.id}`);
    shell.exec(`git pull`, { silent: true });
    shell.cd("..");
  }
}

class Plugin {
  static getConfigFileName(options_env) {
    const env = options_env || BuildEnvs.TESTING;
    const pluginConfigFile = `./plugin-config.${env}.js`;
    return pluginConfigFile;
  }

  static loadAllPlugins(options) {
    const pluginConfigFile = Plugin.getConfigFileName(options.env);
    const pluginConfig = require(pluginConfigFile);
    
    if (!fs.existsSync("plugins")) {
      shell.exec("mkdir plugins");
    }
    pluginConfig.map((plugin) => {
      if(plugin.label == 'Code Assessment') {
        return;
      }
      shell.cd("plugins");
      prepareRepo(plugin);
      shell.cd("..");
    });
  }

  static loadCodeAssessment(options) {
    const pluginConfigFile = Plugin.getConfigFileName(options.env);
    const code_assessment = require(pluginConfigFile).find(plugin => plugin.label == "Code Assessment")
    
    return [code_assessment.id, code_assessment.div_id, code_assessment.js_modules, code_assessment.css_modules]
  }

  static processExpScopePlugins(exp_info, hb, lab_data, options) {
    log.debug("Processing experiment scope plugins");
    let pluginConfig = require(Plugin.getConfigFileName(options.env));

    if (!options.isValidate) {
      pluginConfig = pluginConfig.filter((p) => p.id !== "tool-validation");
    }

    const expScopePlugins = pluginConfig.filter(
      (p) => p.scope === PluginScope.EXPERIMENT
    );

    let plugins = [];
    expScopePlugins.forEach((plugin) => {
      try {
        const pluginPath = path.resolve("plugins", plugin.id);
        const page_template = fs.readFileSync(
          path.resolve(pluginPath, plugin.template)
        );

        let assets_path = path.relative(
          path.dirname(
            path.join(Config.build_path(exp_info.src), plugin.target)
          ),
          Config.build_path(exp_info.src)
        );
        assets_path = assets_path ? assets_path : ".";
        const cssModule = plugin.cssModule || PluginConfig.Default.CSS_MODULE;
        const jsModule = plugin.jsModule || PluginConfig.Default.JS_MODULE;

        const page_data = {
          experiment_name: exp_info.name,
          assets_path: assets_path,
          units: exp_info.menu.map((component) =>
            setCurr(
              component,
              path.join(Config.build_path(exp_info.src), plugin.target)
            )
          ),
          cssModule: path.join("plugins", plugin.id, cssModule),
          jsModule: path.join("plugins", plugin.id, jsModule),
        };

        fs.writeFileSync(
          path.join(Config.build_path(exp_info.src), plugin.target),
          hb.compile(page_template.toString())(page_data)
        );

        plugins.push({ target: plugin.target, label: plugin.label });
        log.debug(`Plugin ${plugin.id} processed`);
      } catch (e) {
        log.error(`Error while processing plugin ${plugin.id}`);
        log.error(e);
      }
    });

    // shell.exec(
    //   `rsync -av "${path.resolve("./plugins")}" "${Config.build_path(
    //     exp_info.src
    //   )}" --exclude=.git`
    // );
    // remove .git folder from all folders in plugins
    shell.rm("-rf", path.resolve("./plugins", "**", ".git/"));
    shell.cp("-r", path.resolve("./plugins"), Config.build_path(exp_info.src));
    return plugins;
  }

  static preProcessPageScopePlugins(options) {
    const pluginConfigFile = Plugin.getConfigFileName(options.env);
    const pluginConfig = require(pluginConfigFile);
    const pageScopePlugins = {};
    pluginConfig
      .filter((p) => p.scope === PluginScope.PAGE)
      .forEach((element) => {
        pageScopePlugins[element.id] = element;
      });
    // console.log(plugins["plugin-bug-report"].attributes.bug_options);
    return pageScopePlugins;
  }


  static processPageScopePlugins(page, options) {
    log.debug(`Processing page scope plugins`);
    const pluginConfigFile = Plugin.getConfigFileName(options.env);
    const pluginConfig = require(pluginConfigFile);

    const pageScopePlugins = pluginConfig.filter(
      (p) => p.scope === PluginScope.PAGE
    );

    const html = fs.readFileSync(path.resolve(page.targetPath()));
    const dom = new JSDOM(html);
    const { document } = dom.window;

    pageScopePlugins.forEach((plugin) => {
      // Render the Plugin UI component inside the parent
      const pluginParent = document.getElementById(plugin.id);
      log.debug(`Processing plugin ${plugin.id}`);
      if (pluginParent) {
        // Write code to process a template file and add to the parent
      }

      // add the css-modules in the head
      if (plugin.css_modules) {
        const css_modules = finalPath(page.targetPath(), plugin.id, plugin.css_modules);
        css_modules.forEach((css) => {
          const cssNode = document.createElement("link");
          cssNode.rel = "stylesheet";
          cssNode.href = css;

          document.head.appendChild(cssNode);
        });
      }
      // add the js-modules at the bottom of the body
      if (plugin.js_modules) {
        const js_modules = finalPath(page.targetPath(), plugin.id, plugin.js_modules);
        js_modules.forEach((mjs) => {
          const scriptNode = document.createElement("script");
          scriptNode.type = "module";
          scriptNode.src = mjs;

          document.body.appendChild(scriptNode);
        });
      }
      log.debug(`Plugin ${plugin.id} processed`);
    });
    fs.writeFileSync(page.targetPath(), dom.serialize());
  }

  static processPostBuildPlugins(exp_info, options) {
    log.debug("Processing post build plugins");
    let pluginConfig = require(Plugin.getConfigFileName(options.env));

    if (!options.isValidate) {
      pluginConfig = pluginConfig.filter((p) => p.id !== "tool-validation");
    }

    const postBuildScopePlugins = pluginConfig.filter(
      (p) => p.scope === PluginScope.POSTBUILD
    );
    if (!fs.existsSync("plugins")) {
      shell.exec("mkdir plugins");
    }

    postBuildScopePlugins.forEach((plugin) => {
      try {
        log.debug(`Processing plugin ${plugin.id}`);
        shell.cd("plugins");
        shell.cd(`${plugin.id}`);
        try {
          shell.exec(`${plugin.command} ${exp_info.bp}`, { silent: true });
        } catch (e) {
          log.error(`Error while executing command ${plugin.command}`);
          log.error(e);
        }
        shell.cd("..");
        shell.cd("..");
        log.debug(`Plugin ${plugin.id} processed`);
      } catch (e) {
        log.error(`Error while processing plugin ${plugin.id}`);
        log.error(e);
      }
    });
  }
}

module.exports = { Plugin };
