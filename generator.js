/*
This script should be executed whenever you change some data in the data.json
file, or modify a template.
*/

const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require('glob');
const path = require('path');

console.log(process.argv[3]);
const data = JSON.parse(fs.readFileSync("data.json"));

function genComponentHtml(fn) {
	const template = fs.readFileSync(fn, 'utf-8');
	const html = (Handlebars.compile(template))(data);
	const base = path.parse(fn).name;
	fs.writeFile(`page-components/${base}.html`, html, 'utf-8', (err, res) => {
		if (err) throw err;
		console.log(`${base}.html generated`);
	});
}

glob('page-templates/*.handlebars', (err, fns) => {
	fns.forEach(genComponentHtml);
});
