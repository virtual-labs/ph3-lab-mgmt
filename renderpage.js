const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const shell = require("shelljs");

const template_dir = "templates";
let menu = require("./menu.json");

const repo_dir = "exprepos";
const build_dir = "expbuilds";

function hasSource( menu, exp_dir_name ) {
    if (menu.source) {
	try {
	    fs.accessSync(path.join(repo_dir, exp_dir_name, "experiment", menu.source));
	}
	catch (err) {
	    if (err.code === "ENOENT") return false;
	    throw err;
	}
    }
    return true;
}



function templateFile(item) {
    let fn = "content.handlebars";
    
    if ( ["pretest", "posttest"].includes(item) ) {
	fn = "prepost.handlebars";
    }
    if ( item === "simulation" ) {
	fn = "simulation.handlebars";
    }
    if ( item === "feedback" ) {
	fn = "feedback.handlebars";
    }        
    return fn;
}



function buildPage( data, current_item, template_content, exp_dir_name ) {

    
    data["current_item"] = current_item;
    data["menu"] = menu.filter((mi) => hasSource(mi, exp_dir_name));
    
    const template = Handlebars.compile(template_content);
    const compiled_template = template(data);
    
    fs.writeFileSync(`${build_dir}/${exp_dir_name}/${data["current_item"].target}`, compiled_template );
}


function buildPages(data, experiment, production) {
    menu.forEach((mi) => {

	data["exp_name"] = experiment.name;
	data["exp_short_name"] = experiment["short-name"];
	data["production"] = production;
	
	const template_content = fs.readFileSync(path.join(template_dir, templateFile(mi.item)), "utf-8");
	buildPage(data, mi, template_content, experiment["short-name"]);
    });
}


exports.buildPages = buildPages;
