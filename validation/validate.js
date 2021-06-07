const Ajv = require("ajv");
const path = require("path");
const fs = require("fs");
const schemaMap = require("./schema-map.json");

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

const argv = require("yargs")(process.argv.slice(2))
  .scriptName("validate")
  .usage("$0 [args]")
  .option("files", {
    type: "array",
    desc: "One or more files for validation",
    demandOption: true,
  })
  .check((argv) => {
    if (argv.files.length === 0) {
      throw new Error("Empty Argument: Filenames cannot be empty");
    }
    return true;
  })
  .option("schema-map", {
    type: "string",
    desc: "The schema map file",
  })
  .alias({
    help: "h",
    version: "v",
    files: "f",
    "schema-map": "s",
  }).argv;

let validateSchema = (input = "1", schema = "1") => {
  let validationSchema = require(schema);
  let validate = ajv.compile(validationSchema);
  let valid = validate(input);
  valid
    ? console.log("Validated", valid)
    : console.log("Invalid", validate.errors);
};

module.exports.validateSchema = validateSchema;

const validateArguments = () => {
  try {
    let filename = path.basename(argv.files[0]);
    let filepath = path.resolve(argv.files[0]);
    if (!fs.existsSync(filepath)) {
      console.log(filepath);
      throw new Error("File does not exist");
    }
    let schema = schemaMap[filename];
    if (argv.s) {
      schema = path.resolve(argv.s);
    }
    if (!schema) {
      throw new Error("The schema for the file does not exist");
    }
    let json = require(filepath);
    validateSchema(json, schema);
  } catch (e) {
    console.log(e.name + ": " + e.message);
    return -1;
  }
};

validateArguments();
