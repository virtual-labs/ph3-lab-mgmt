const Ajv = require('ajv');
const addFormats = require("ajv-formats");
const figures = require('figures');
const chalk = require('chalk');
const path = require('path');

function reportJSONError(error) {
  const heading =
    chalk`Error detected in {blue {italic lab-descriptor.json}}`;
  console.log(chalk`${heading}`);

  if (error.keyword === 'additionalProperties') {
    const msg = `please remove: ${error.params.additionalProperty}`;
    logError(error.instancePath, msg);
  }
  else {
    logError(error.instancePath, error.message);
  }
}

function logError(dataPath, textMsg) {
  let delim = chalk` {yellow ${figures.pointerSmall}} `;
  let msg = chalk`   {yellow ${textMsg}}`;
  dp = dataPath && dataPath.replace(/\./g, delim);
  dp && console.log(`\n${dp}`);
  console.log(`${msg}\n`);
}


function validateLabDescriptor(lab_descriptor_path) {
  const validator = new Ajv();
  addFormats(validator);
  const validate = validator.compile(require("./schemas/labDescSchema.json"));
  const valid = validate(require(lab_descriptor_path));

  if (!valid) {
    for (error of validate.errors) {
      reportJSONError(error);
    }
    return false;
  }
  return true;
}


module.exports = {
  validateLabDescriptor,
};


/*
  node validate_descriptor.js <path/to/lab>
*/
if (require.main === module) {
  if (process.argv[2]) {
    validateLabDescriptor(path.resolve(process.argv[2], "lab-descriptor.json"));
  } else {
    logError("", "Please provide the path of the Lab base directory");
  }
}
