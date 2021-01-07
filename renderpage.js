const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const shell = require("shelljs");

const template_dir = "templates";
let menu = require("./menu.json");

const repo_dir = "../";
const build_dir = "../build";

function hasSource( menu ) {
    if (menu.source) {
	try {
	    fs.accessSync(path.join(repo_dir, "experiment", menu.source));
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



function buildPage( data, current_item, template_content ) {

    
    data["current_item"] = current_item;
    data["menu"] = menu.filter((mi) => hasSource(mi));

    Handlebars.registerHelper('isActive', function (current_page, page) {
	console.log(page);
	return (current_page === page);
    });
    
    const template = Handlebars.compile(template_content);
    const compiled_template = template(data);
    
    fs.writeFileSync(`${build_dir}/${data["current_item"].target}`, compiled_template );
}


function buildPages(data, experiment, production) {
    menu.forEach((mi) => {

	data["production"] = production;
	
	const template_content = fs.readFileSync(path.join(template_dir, templateFile(mi.item)), "utf-8");
	buildPage(data, mi, template_content);
    });
}


exports.buildPages = buildPages;
