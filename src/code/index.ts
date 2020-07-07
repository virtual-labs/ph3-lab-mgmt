#!/usr/bin/env node

import * as chalk from 'chalk';
import * as boxen from 'boxen';
import * as figures from 'figures';
import * as fs from 'fs-extra';
import * as path from 'path';

import * as lab from './lab';
import {Lab, ContentKind} from './lab';
import {LabDescriptor, loadLabDescriptor} from './labdescriptor';

import * as shell from 'shelljs';

shell.config.silent = true;
shell.set('-e');

let labpath;
let level;

if (process.argv[2] === 'init') {
    labpath = process.argv[3];
    shell.cp('empty-lab-descriptor.json', path.resolve(labpath, 'lab-descriptor.json'));
}
else {
    if (process.argv[2] === '-v') {
        shell.config.silent = false;
        level = process.argv[3];
        labpath = process.argv[4];
    }
    else {
        level = process.argv[2];
        labpath = process.argv[3];
    }

    const ld = path.resolve(labpath, 'lab-descriptor.json');

    lab.fromDescriptor(ld)
        .summarize()
        .generatePages()
        .buildLab()
        .deploy()
        //.updateSources(level)
        .buildExperiments()
    
}
