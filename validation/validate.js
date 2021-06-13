const Ajv = require("ajv");
const AjvErrors = require("ajv-errors");

const path = require("path");
const fs = require("fs");
const schemaMap = require("./schema-map.json");

const ajv = new Ajv({ allErrors: true }); // options can be passed, e.g. {allErrors: true}
AjvErrors(ajv);

const argv = require("yargs")(process.argv.slice(2))
  .scriptName("validate")
  .usage("$0 [args]")
  .option("files", {
    type: "array",
    desc: "One or more files for validation",
  })
  .option("schema-map", {
    type: "string",
    desc: "The schema map file",
  })
  .option("all", {
    type: "boolean",
    desc: "Verify all jsons",
  })
  .check((argv) => {
    console.log(argv);
    if (!argv.files && !argv.all) {
      throw new Error("Required either -f or -a. Run --help for more info");
    }
    if (!argv.all && argv.files.length === 0) {
      throw new Error("Empty Argument: Filenames cannot be empty");
    }
    return true;
  })

  .alias({
    help: "h",
    version: "v",
    files: "f",
    "schema-map": "s",
    all: "a",
  }).argv;

let validateSchema = (input = "1", schema = "1") => {
  let validationSchema = require(schema);
  let validate = ajv.compile(validationSchema);
  let valid = validate(input);
  if (!valid) {
    validate.errors.forEach((e) =>
      console.log(e.instancePath + ": " + e.message)
    );
    throw new Error("Schema is Invalid");
  }
  console.log("Validated", valid);
};

module.exports.validateSchema = validateSchema;

const validateArguments = () => {
  for (let i in argv.files) {
    try {
      let filename = path.basename(argv.files[i]);
      let filepath = path.resolve(argv.files[i]);
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
      console.log("Failed while validating " + argv.files[i]);
      console.log(e.name + ": " + e.message);
      return -1;
    }
  }
};

if (argv.all) {
  console.log("Validating all jsons\nChecking for available jsons");
} else {
  validateArguments();
}
