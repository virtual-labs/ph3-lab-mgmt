import * as chalk from 'chalk';
import * as boxen from 'boxen';
import * as figures from 'figures';
import {URL} from 'url';
import * as Handlebars from 'handlebars';
import * as fs from 'fs-extra';
import * as shell from 'shelljs';
import * as path from 'path';

import {firstToUpper, Label} from './utility';

export abstract class Experiment {
    name : string;
    shortName : string;
    repoURL : URL;
    tag: string;
    link : URL;
    labName: Label;

    constructor(name: string, shortName: string, repoURL: URL,
                tag: string, labName: Label, indexfn='index.html') {
        this.name = name;
        this.shortName = shortName;
        this.repoURL = repoURL;
        this.tag = tag;
        this.labName = labName;
    }

    describe() : void {
        console.log(` ${this.name}, ${this.shortName}, ${this.link}`);
    }

    abstract build() : Experiment;
    abstract deploy() : Experiment;
}
export class IIITHExperiment extends Experiment {
    constructor(name: string, shortName: string, repoURL: URL, tag: string, labName: Label) {
        super(name, shortName, repoURL, tag, labName, 'exp.html');
    }

    build() : Experiment {
        console.log(chalk`   {magenta ${figures.bullet}}  Building {blue ${this.shortName}}`);
    
        const localExpRoot = path.resolve('build/experiments').toString();
        const localExp = path.resolve(localExpRoot, this.shortName).toString();
        const content_repo = new URL(`${this.repoURL.pathname}/content-html`, this.repoURL);
        shell.rm('-rf', localExp);
        shell.mkdir('-p', localExp);
        shell.cd(localExp);
        shell.exec(`git clone ${content_repo.toString()}`);
        shell.cd('content-html');
        shell.exec(`git fetch --all`);
        shell.exec(`git checkout ${this.tag}`);
        shell.cp('config.mk.sample', 'config.mk');
        //shell.exec('make -k clean');
        //shell.exec('make -k clean-infra');
        shell.exec('make -k all');
        shell.cd(`../../../../`);
        console.log(chalk`      {green ${figures.tick}}  Done`);
        return this;
    }
    deploy() : Experiment {
       console.log(`Deploying ${this.shortName}`);
       const localExpRoot = path.resolve('build/experiments').toString();
       const localExp = path.resolve(localExpRoot, this.shortName).toString();
       const copyTo = `/var/www/html/${this.labName.toPathName()}/exp/${this.shortName}/`;
       shell.rm('-rf', copyTo);
       shell.mkdir('-p', copyTo);
       shell.cp('-rf', `${localExp}/content-html/build/*`, copyTo);
       return this;
    }
}
