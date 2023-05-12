#!/usr/bin/env node
const minimist = require("minimist");
const { build, validate, clean, deployLocal } = require("./main.js");
const {buildLab, deployLab,validation} = require("./lab_build/lab_gen.js");
const { BuildEnvs, validBuildEnv } = require("./enums.js");
const log = require("./logger");
const path = require("path");

function help(){
    console.log("Usage: npx @virtual-labs/buildexp [command]");
    console.log("Options:");
    console.log("Commands:");
    console.log("  build-exp            Build the experiment");
    console.log("  build-exp-deploy     Build the experiment and deploy locally");
    console.log("  build-exp-noplugin   Build the experiment without using any plugins");
    console.log("  clean-build-exp      Clean and build the experiment");
    console.log("  validate             Validate the code and content");
    console.log("  clean                Clean the build and plugins");
    console.log("  deploy               Deploy the experiment locally");
    console.log("  build-lab            Build the lab");
    console.log("  deploy-lab           Deploy the lab locally");
    console.log("  build-and-deploy-lab Build and deploy the lab locally");
    console.log("  help                 Display help for command");
}

function main() {
    // console.log("Vlabs Build Exp");
    const args = minimist(process.argv.slice(2));

    // for backwards compatibility if the env is not given assume it to
    // be testing.
    const build_options = {};
    if (args.env) {
        build_options.env = validBuildEnv(args.env);
    } else {
        build_options.env = BuildEnvs.TESTING;
    }

    // if the path is not provided assume "." for backward
    // compatability.
    let src = ".";
    if (args.src) {
        src = args.src;
    }

    let isDebug = args.debug || false;
    if (isDebug) {
        log.addDebug();
        log.info("Debug mode enabled");
    } else {
        log.addInfo();
    }

    let option = "";
    if (args._.length === 1) {
        option = args._[0];
    } else {
        log.error("Invalid Arguments");
        console.log("Invalid Arguments");
        help();
        return;
    }

    let release = args.release || "minor";
    let labpath = "";

    // options
    let isClean = false;
    let isESLINT = false;
    let isExpDesc = false;
    let isDeploy = false;
    let isPlugin = false;

    switch (option) {
        case "build-exp":
            isESLINT = true;
            isExpDesc = true;
            isPlugin = true;
            log.info("Calling build with options: ");
            log.info(`isClean: ${isClean}`);
            log.info(`isESLINT: ${isESLINT}`);
            log.info(`isExpDesc: ${isExpDesc}`);
            log.info(`isDeploy: ${isDeploy}`);
            log.info(`isPlugin: ${isPlugin}`);
            build(
                isClean,
                isESLINT,
                isExpDesc,
                isDeploy,
                isPlugin,
                src,
                build_options
            );
            log.info("Build Complete");
            break;

        case "clean-build-exp":
            isClean = true;
            isESLINT = true;
            isExpDesc = true;
            isPlugin = true;
            log.info("Calling build with options: ");
            log.info(`isClean: ${isClean}`);
            log.info(`isESLINT: ${isESLINT}`);
            log.info(`isExpDesc: ${isExpDesc}`);
            log.info(`isDeploy: ${isDeploy}`);
            log.info(`isPlugin: ${isPlugin}`);
            build(
                isClean,
                isESLINT,
                isExpDesc,
                isDeploy,
                isPlugin,
                src,
                build_options
            );
            log.info("Build Complete");
            break;

        case "build-exp-deploy":
            isESLINT = true;
            isExpDesc = true;
            isPlugin = true;
            isDeploy = true;
            log.info("Calling build with options: ");
            log.info(`isClean: ${isClean}`);
            log.info(`isESLINT: ${isESLINT}`);
            log.info(`isExpDesc: ${isExpDesc}`);
            log.info(`isDeploy: ${isDeploy}`);
            log.info(`isPlugin: ${isPlugin}`);
            build(
                isClean,
                isESLINT,
                isExpDesc,
                isDeploy,
                isPlugin,
                src,
                build_options
            );
            log.info("Build Complete");
            break;

        case "build-exp-noplugin":
            isClean = true;
            log.info("Calling build with options: ");
            log.info(`isClean: ${isClean}`);
            log.info(`isESLINT: ${isESLINT}`);
            log.info(`isExpDesc: ${isExpDesc}`);
            log.info(`isDeploy: ${isDeploy}`);
            log.info(`isPlugin: ${isPlugin}`);
            build(
                isClean,
                isESLINT,
                isExpDesc,
                isDeploy,
                isPlugin,
                src,
                build_options
            );
            log.info("Build Complete");
            break;
        
        case "build-exp-noplugin":
            isClean = true;
            isPlugin = true;
            log.info("Calling build with options: ");
            log.info(`isClean: ${isClean}`);
            log.info(`isESLINT: ${isESLINT}`);
            log.info(`isExpDesc: ${isExpDesc}`);
            log.info(`isDeploy: ${isDeploy}`);
            log.info(`isPlugin: ${isPlugin}`);
            build(
                isClean,
                isESLINT,
                isExpDesc,
                isDeploy,
                isPlugin,
                src,
                build_options
            );
            log.info("Build Complete");
            break;

        case "validate":
            let isESLINTValidate = true;
            let isExpDescValidate = true;
            log.info("Calling validate with options: ");
            log.info(`isESLINT: ${isESLINTValidate}`);
            log.info(`isExpDesc: ${isExpDescValidate}`);
            validate(isESLINTValidate, isExpDescValidate, src);
            break;

        case "clean":
            log.info("Calling clean");
            clean(src);
            log.info("Clean Complete");
            break;

        case "deploy":
            log.info("Calling deploy");
            deployLocal(src);
            break;

        case "build-lab":
            log.info("Calling buildLab");
            labpath = path.resolve(src);
            if (validation(labpath)) {
                buildLab(labpath);
                log.info("BuildLab Complete");
                if (args.deploy) {
                    log.info("Calling deploy Lab");

                    deployLab(labpath, release);
                    log.info("Deploy Lab Complete");
                }
            }
            break;

        case "deploy-lab":
            release = "patch";
            log.info("Calling deploy Lab");
            labpath = path.resolve(src);
            if (validation(labpath)) {
                deployLab(src, release);
                log.info("Deploy Lab Complete");
                break;
            }
        case "build-and-deploy-lab":
            log.info("Calling buildLab");
            labpath = path.resolve(src);
            args.deploy = true;
            if (validation(labpath)) {
                buildLab(labpath);
                log.info("BuildLab Complete");
                if (args.deploy) {
                    log.info("Calling deploy Lab");

                    deployLab(labpath, release);
                    log.info("Deploy Lab Complete");
                }
            }
            break;
            
        case "help":
            help();
            break;
        default:
            log.error("Invalid Arguments");
            help();
            break;
    }
}

main();