"use strict";
exports.__esModule = true;
var Ajv = require("ajv");
var ajv = new Ajv();
var validate = ajv.compile(require('./labDescSchema.json'));
var valid = validate('../sample-lab-descriptor.json');
if (!valid) {
    console.log(ajv.errors);
}
