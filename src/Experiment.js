const git = require('simple-git/promise');
const {spawn} = require('child_process');
const URL = require('url');
const path = require('path');
const {Repository} = require('./repository.js');

class Experiment {
    
    constructor(name, short_name, remote_repository_url, version) {
	this.name = name;
	this.short_name = short_name;
	this.repository = new Repository(remote_repository_url, version);
    }

    describe() {
	console.log(`NAME:              ${this.name}`);
	console.log(`SHORT NAME:        ${this.short_name}`);
	console.log(`REMOTE REPOSITORY: ${this.repository.remote.href}`);
	console.log(`VERSION:           ${this.repository.version}`);
    }

    clone() {
	this.deleteSources();
	console.info(`cloning ${this.name} sources from ${this.repository.remote.href}`);
	git().silent()
	    .clone(this.repository.remote.href)
	    .then(() => console.log(`cloned :: ${this.name}`))
	    .catch((err) => {});
    }
    
    deleteSources() {
	const rm = spawn('rm', ['-rf', this.repository.name]);
	rm.on('close', (code) => {
	    if (code !== 0) {
		console.log(code);
	    }
	});
    }
}


class ExpBuilder {

    constructor(repository){
	this.repository = repository;
    }
    
    load() {
	return git().clone(this.repository.remote.href)
	    .then((res) => {
		return repo.checkout(this.repository.version);
	    })
	    .catch((err) => {
		return git(this.repository.name).checkout(this.repository.version);
	    });
    }

    build() {
	console.log('TODO');
    }
}


module.exports.MarkdownExperiment = class MarkdownExperiment extends Experiment {

    constructor(name, short_name, remote_repository_url, version, builder_repo) {
	super(name, short_name, remote_repository_url, version);
	this.builder_repo = builder_repo;
    }

    build() {
	const builder = new ExpBuilder(this.builder_repo);
	builder.load().then(build);
    }
}
