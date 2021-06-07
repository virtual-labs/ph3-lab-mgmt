const Ajv = require("ajv");
const path = require("path");
const schemaMap = require("./schema-map.json");

const argv = require("yargs")(process.argv.slice(2))
  .scriptName("validate")
  .usage("$0 [args]")
  .option("files", {
    type: "array",
    desc: "One or more files for validation",
    demandOption: true,
  }).check((argv) => {
    if(argv.files.length === 0){
        throw new Error('Empty Argument: Filenames cannot be empty');
    }
  })
  .option("schema-map", {
    type: "string",
    desc: "The schema map file",
  }).alias({
    help: 'h',
    version: 'v',
    files: 'f',
    schemaMap: 's',
  }).argv;
console.log(argv);

let validateSchema = (input = "1", schema = "1") => {
  console.log("validating " + input + " against " + schema);
  console.log("You got validated");
};

module.exports.validateSchema = validateSchema;

/**
 * node validation/validate.js <jsonpath> <schema path>
 */
if (require.main === module) {
  let json = "";
  let schema = "";
  console.log(process.argv.length);
  switch (process.argv.length) {
    case 2:
      console.log("validating all");
      validateSchema();
      break;
    case 3:
      json = process.argv[2];
      json = json.replace("/", "\\");
      let n = json.lastIndexOf("\\");
      let jsonKey = json.substring(n + 1);
      console.log(json, n);
      schema = schemaMap[jsonKey];
      console.log(schema);
      validateSchema(json, schema);
      break;
    case 4:
      json = path.resolve(process.argv[2]);
      schema = path.resolve(process.argv[3]);
      validateSchema(json, schema);
      break;
    default:
      console.log("Error");
  }
}
