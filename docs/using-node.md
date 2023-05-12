1. To run the build script using nodejs, you have to clone this repository in your experiment project folder. 
2. Then, you have to install the dependencies using the following command:
```bash
npm install
```
3. After that, you can run the build script using the following commands and options:
```bash
Usage: node main.js [mode] [options]
Modes:
  build                Build the experiment
  validate             Validate the code and content
  clean                Clean the build and plugins
  deploy               Deploy the experiment locally
  buildLab             Build the lab
  deployLab            Deploy the lab locally


Common Options:
  --src       path to the experiment, default is parent directory
  --debug     enable debug mode
  --help      display help for command


Mode: build
Usage: build [options]
Options:
  --clean              clean build folder
  --validateEslint     validate the code using eslint
  --validateExpDesc    validate the experiment description and assessment files
  --disablePlugin      disable the plugins
  --deploy             deploy the experiment locally
  --env                environment to build the experiment


Mode: Validate
Usage: validate [options]
Options:
  --validateEslint     validate the code using eslint
  --validateExpDesc    validate the experiment description and assessment files


Mode: clean
Usage: clean


Mode: deploy
Usage: deploy


Mode: buildLab
Usage: buildLab [options]
Options:
  --src       path to the lab, default is parent directory
  --deploy    deploy the lab locally
  --release   release type of the lab, default is minor


Mode: deployLab
Usage: deployLab [options]
Options:
  --src       path to the lab, default is parent directory
  --release   release type of the lab, default is minor
```