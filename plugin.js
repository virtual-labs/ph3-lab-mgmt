const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const { JSDOM } = require("jsdom");

const Config = require("./Config.js");
const { PluginScope } = require("./Enums.js");

function getAllFiles(dirPath, arrayOfFiles) {
	const files = fs.readdirSync(dirPath);
	arrayOfFiles = arrayOfFiles || [];

	files.forEach(function(file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory())
		{
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
		}
		else
		{
			arrayOfFiles.push(path.join(dirPath, "/", file));
		}
	});

	return arrayOfFiles;
};

function getFiles(dirPath, targetPath) {
	let files = getAllFiles(dirPath);
	return files.map((file) => path.join(path.relative(targetPath, path.dirname(file)), path.basename(file)));
};

function setCurr(component, targetPath, flag=false) {
	let obj = {...component}, isCurrentItem = false;

	if(obj.unit_type === "aim")
	{
		flag = true;
		isCurrentItem = true;
	}

	if(!flag)
	{
		obj = component.menuItemInfo(targetPath);
		console.log(obj);
	}

	if(obj.unit_type === "lu")
	{
		obj.units = [...obj.units.map((subComponent) => setCurr(subComponent, targetPath, true))];
	}

	return { ...obj, isCurrentItem: isCurrentItem };
};

class Plugin {

  static getConfigFileName(options_env) {
    const env = options_env || BuildEnvs.TESTING;
    const pluginConfigFile = `./plugin-config.${env}.js`;
    return pluginConfigFile;
  }

  static processExpScopePlugins(exp_info, hb, lab_data, options) {
    const env = options.env || BuildEnvs.TESTING;
    const pluginConfigFile = `./plugin-config.${env}.js`;
    const pluginConfig = require(pluginConfigFile);

    const expScopePlugins = pluginConfig.filter(
      (p) => p.scope === PluginScope.EXPERIMENT
    );

    shell.exec('cp -r \'' + path.resolve('./plugins') + '\' \'' + Config.build_path(exp_info.src) + '\'');
    let plugins = [];
    expScopePlugins.forEach((plugin) => {
	    try {
		    const pluginPath = path.resolve('plugins', plugin.dirName);
		    const page_template = fs.readFileSync(path.resolve(pluginPath, plugin.template));

		    let assets_path = path.relative(
			    path.dirname(path.join(Config.build_path(exp_info.src), plugin.target)),
			    Config.build_path(exp_info.src)
		    );
		    assets_path = assets_path ? assets_path : ".";

		    const page_data = {
			    experiment_name: exp_info.name,
			    assets_path: assets_path,
			    units: exp_info.menu.map((component) => setCurr(component, path.join(Config.build_path(exp_info.src), plugin.target))),
			    css_files: getFiles(
				    path.join(Config.build_path(exp_info.src), 'plugins', plugin.dirName, plugin.cssDir), 
				    Config.build_path(exp_info.src)
			    ),
			    js_files: getFiles(
				    path.join(Config.build_path(exp_info.src), 'plugins', plugin.dirName, plugin.jsDir), 
				    Config.build_path(exp_info.src)
			    ),
		    };

		    fs.writeFileSync(
			    path.join(Config.build_path(exp_info.src), plugin.target),
			    hb.compile(page_template.toString())(page_data)
		    );

		    plugins.push({ target: plugin.target, label: plugin.label });
	    } catch (e) {
		    console.error(e.message);
	    };
    });

	return plugins;
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
