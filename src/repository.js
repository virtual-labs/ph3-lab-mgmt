const git = require('simple-git/promise');
const {spawn} = require('child_process');
const URL = require('url');
const path = require('path');


function repositoryNamefromUrl(url) {
    const rname = path.basename(url)
	  .replace(/.git$/, '');
    return rname;
}

class Repository {
    constructor(remote, version) {
	this.remote = URL.parse(remote);
	this.name = repositoryNamefromUrl(remote);
	this.version = version;	
    }

    repositoryName(){
	return repositoryNamefromUrl(this.remote);
    }

    pull() {
	return git(this.name).pull().then((res) => console.log('exp builder loaded'));
    }
    
}


module.exports.Repository = Repository;
