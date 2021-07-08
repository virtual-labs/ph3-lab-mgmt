const path = require("path");
const fs = require("fs");
const Config = require("./Config.js");
const Handlebars = require("handlebars");

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

class MetaPage {
	constructor(src, basedir, page)
	{
		this.src = src;
		this.basedir = basedir;
		this.page = page;
	};

	getFiles(dirPath) {
		let files = getAllFiles(dirPath);
		return files.map((file) => path.join(path.relative(Config.build_path(this.src), path.dirname(file)), path.basename(file)));
	};

	build(exp_info) {
		try {
			const page_template = fs.readFileSync(
				path.resolve(
					Config.Experiment.ui_template_name, "pages", this.page + ".handlebars"
				)
			);

			const targetPath = path.resolve(
				path.join(Config.build_path(this.src), this.basedir, this.page + '.html')
			);
			const page_data = {
				experiment_name: exp_info.name,
				units: exp_info.menu.map((component) => {
					const obj = component.menuItemInfo(targetPath);
					let isCurrentItem = false;

					if(obj.label === "Aim")
					{
						isCurrentItem = true;
					}

					return { ...obj, isCurrentItem: isCurrentItem };
				}),
				css_files: this.getFiles(path.join(Config.build_path(this.src), "assets/css/", this.page)),
				js_files: this.getFiles(path.join(Config.build_path(this.src), "assets/js/", this.page))
			};

			fs.writeFileSync(
				targetPath,
				Handlebars.compile(page_template.toString())(page_data)
			);

		} catch (e) {
			console.error(e.message);
		};
	};
};

module.exports = { MetaPage };
