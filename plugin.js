const path = require("path");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { UnitTypes, PluginScope } = require("./Enums.js");
const { Unit } = require("./Unit.js");

class Plugin extends Unit {
  constructor() {
    super(UnitTypes.PLUGIN, "Plugin", "", "");
  }

  static getConfigFileName(options_env) {
    const env = options_env || BuildEnvs.TESTING;
    const pluginConfigFile = `./plugin-config.${env}.js`;
    return pluginConfigFile;
  }

  static processExpScopePlugins(hb, lab_data, options) {
    const env = options.env || BuildEnvs.TESTING;
    const pluginConfigFile = `./plugin-config.${env}.js`;
    const pluginConfig = require(pluginConfigFile);

    const expScopePlugins = pluginConfig.filter(
      (p) => p.scope === PluginScope.EXPERIMENT
    );

    expScopePlugins.forEach((plugin) => {
      // Render the Plugin UI component inside the parent

      this.descriptor.units.push({
        "unit-type": "plugin",
        label: plugin.label,
        template: plugin.template.path,
        target: plugin.output,
      });
      // add the js-modules at the bottom of the body
      plugin.js_modules &&
        plugin.js_modules.forEach((module) => {
          const scriptNode = document.createElement("script");
          scriptNode.type = "module";
          scriptNode.src = module;

          document.body.appendChild(scriptNode);
        });
    });
    fs.writeFileSync(this.targetPath(), dom.serialize());
  }

  static processPageScopePlugins(page, options) {
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
      if (pluginParent) {
        // Write code to process a template file and add to the parent
      }

      // add the css-modules in the head
      plugin.css_modules &&
        plugin.css_modules.forEach((css) => {
          const cssNode = document.createElement("link");
          cssNode.rel = "stylesheet";
          cssNode.href = css;

          document.head.appendChild(cssNode);
        });

      // add the js-modules at the bottom of the body
      plugin.js_modules &&
        plugin.js_modules.forEach((mjs) => {
          const scriptNode = document.createElement("script");
          scriptNode.type = "module";
          scriptNode.src = mjs;

          document.body.appendChild(scriptNode);
        });
    });
    fs.writeFileSync(page.targetPath(), dom.serialize());
  }
}

module.exports = { Plugin };
