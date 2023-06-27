# Workflow for Node.js Package

This workflow automates publishing a Node.js package to npm whenever a new tag, specifically ending with `-release`, is pushed to the repository. This is achieved through GitHub Actions.

## Workflow breakdown

1. **Triggering the workflow**: The workflow is configured to run whenever a new tag is pushed to the repository. This is specified in the `on` section of the workflow file. 

2. **Environment setup**: The workflow runs on the latest version of Ubuntu. It sets up a Node.js environment with a specified version (14 in this case) and sets the npm registry URL.

3. **Dependencies installation**: The workflow installs the project dependencies using two npm commands, `npm ci` and `npm install`. `npm ci` provides a clean, reproducible environment for the workflow, while `npm install` ensures that all packages are installed and updated according to your `package.json` file.

4. **Tag checking**: The workflow checks if the pushed tag ends with `-release`. If it does, the workflow sets an output variable `release` to `true`. 

5. **Publishing the package**: If the `release` variable is `true`, the workflow publishes your package to the npm registry using the `npm publish` command. This step uses an NPM authentication token (stored as a GitHub secret) to authenticate with the npm registry.

Please note that to make this workflow functional, we must store our npm authentication token as `NPM_TOKEN` in the secrets of the Virtual Labs GitHub Organisation settings.

This document assumes that you've correctly set up your Node.js project and your `package.json` file is ready for publication. Be sure to customize the workflow according to the needs.

## Troubleshooting

1. **Workflow not running**: If the workflow isn't running when you push a tag, check the workflow file's `on` section. Ensure it is set to trigger on tag pushes and that the tag matches the specified pattern.

2. **Failed at the setup-node step**: If you see an error in the `setup-node` step, make sure you have the correct Node.js version specified and the npm registry URL is correct.

3. **Failed at the Install dependencies step**: If the `Install dependencies` step fails, it could be due to an issue with the dependencies in your `package.json` file. Try running `npm ci` and `npm install` locally to see if you encounter the same issue. 

4. **Failed at the Check Tag step**: If the `Check Tag` step fails, ensure that your script correctly parses the tag from `GITHUB_REF`.

5. **Failed at the Publish step**: If your publish step fails, make sure your `NPM_TOKEN` is correctly set in your GitHub repository secrets and the token has the necessary permissions. Also, make sure your `package.json` file is set up correctly for publication.

If you encounter other issues, the logs provided in GitHub Actions can be a great
