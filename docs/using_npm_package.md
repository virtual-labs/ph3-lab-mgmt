# Run Build Script using npm package

1. To run the build script using the npm package you need to make sure that the experiment has package.json file in the root directory. If you don't have one, you can create it by running the following command in the root directory of your experiment:
```bash
npm init -y
```
2. After initialising the experiment as a node project, you can run the build script by running the following command:
```bash
Usage: npx @virtual-labs/buildexp [command]
Options:
Commands:
  build-exp            Build the experiment
  build-exp-deploy     Build the experiment and deploy locally
  build-exp-noplugin   Build the experiment without using any plugins
  clean-build-exp      Clean and build the experiment
  validate             Validate the code and content
  clean                Clean the build and plugins
  deploy               Deploy the experiment locally
  build-lab            Build the lab
  deploy-lab           Deploy the lab locally
  build-and-deploy-lab Build and deploy the lab locally
  help                 Display help for command
```
