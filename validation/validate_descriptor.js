const Ajv = require('ajv');
const addFormats = require("ajv-formats")
const figures = require('figures');
const chalk = require('chalk');
const path = require('path');

function reportJSONError(error) {
  const heading =
	chalk`Error detected in {blue {italic lab-descriptor.json}}`;    
  console.log(chalk`${heading}`);
  
  if (error.keyword === 'additionalProperties') {
    const msg = `please remove: ${error.params.additionalProperty}`;
    logError(error.dataPath, msg);
  }
  else {
    logError(error.dataPath, error.message);
  }
}

function logError(dataPath, textMsg) {
  let delim =chalk` {yellow ${figures.pointerSmall}} `;
  let msg = chalk`   {yellow ${textMsg}}`;    
  dp = dataPath.replace(/\./g, delim);
  console.log(`\n${dp}\n${msg}\n`);
}


function validateLabDescriptor(lab_descriptor_path){
  const validator = new Ajv();
  addFormats(validator);
  const validate = validator.compile(require("./schemas/labDescSchema.json"));
  const valid = validate(require(lab_descriptor_path));

  if (!valid) {
    if (validate.errors) {
      reportJSONError(validate.errors[0]);	    
    }
    return false;
  }
  return true;
}


module.exports = {
  validateLabDescriptor,
}


/*
  node validateDescriptor.js <path/to/lab>
*/
if (require.main === module) {
  validateLabDescriptor(path.resolve(process.argv[2], "lab-descriptor.json"));
}
