const Ajv = require('ajv');
const path = require('path');
const schemaMap = require('./schemaMap.json')

let validateSchema = (input="1", schema="1") => {
    console.log("validating " + input + " against " + schema);
    console.log("You got validated");
}

module.exports.validateSchema = validateSchema;

/**
 * node validation/validate.js <jsonpath> <schema path>
 */
if (require.main === module) {
    let json=""
    let schema=""
    console.log(process.argv.length)
    switch(process.argv.length){
        case 2:
            console.log('validating all')
            validateSchema();
            break;
        case 3:
            json = process.argv[2];
            json = json.replace('/', '\\')
            let n = json.lastIndexOf('\\');
            let jsonKey = json.substring(n + 1);
            console.log(json, n)
            schema=schemaMap[jsonKey];
            console.log(schema)
            validateSchema(json, schema);
            break
        case 4:
            json = path.resolve(process.argv[2]);
            schema=path.resolve(process.argv[3]);
            validateSchema(json, schema);
            break
        default:
            console.log("Error")
        }
}
  