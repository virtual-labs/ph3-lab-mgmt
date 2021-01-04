const git = require("simple-git");
const path = require("path");
const url = require("url");
const fs = require("fs");

const gitOptions = {
    baseDir: "exprepos"
};


function cloneExperiment(exp) {

    const repo_name = exp["short-name"];
    const target_dir = path.join(gitOptions.baseDir, repo_name);
    
    try {
	fs.rmdirSync(target_dir, {recursive: true});
	console.log("clone experiment...!");

	return git( gitOptions )
	    .clone(exp.repo, repo_name, {"--depth": 1, "--branch": exp.tag});
    }
    catch (err) {
	console.log(err.code);
    }
    
    /*
    fs.rmdir(target_dir, {recursive: true}, (err) => {
	if (err) {
	    console.log(err.code);
	    throw err;
	}
	
	git(gitOptions)
	    .clone(exp.repo, repo_name, {"--depth": 1, "--branch": exp.tag})
	    .then(() => {
		console.log(`cloned ${exp.name}`);
		cb();
	    })
	    .catch((err) => console.error("failed : ", err));
    });
    */
}

exports.cloneExperiment = cloneExperiment;

const experiments = require( path.join(process.argv[2], "lab-descriptor.json") )["experiments"];

experiments.forEach(cloneExperiment);

// cloneExperiment({
//     "name": "Four Bar Mechanics",
//     "short-name": "four-bar",
//     "repo": "https://github.com/virtual-labs/exp-four-bar-mechanism-nitk",
//     "tag": "v1.0.0",
//     "deploy": true
// });
