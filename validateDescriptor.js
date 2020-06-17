const Ajv = require('ajv');
const figures = require('figures');
const chalk = require('chalk');


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


module.exports.validateLabDescriptor = (lab_descriptor_path) => {
    const validator = new Ajv();
    const validate = validator.compile(require('./labDescSchema.json'));
    const valid = validate(require(lab_descriptor_path));

    if (!valid) {
	if (validate.errors) {
	    reportJSONError(validate.errors[0]);	    
	}
	return false;
    }
    return true;
}
