module.exports = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://virtual.labs/schemas/codeAssessment.json",
    type: "object",
    properties: {
        "version": {
          type: "integer",
          enum: [1.0],
          errorMessage: "Version should be 1.0",
        },
    },
    required: ['version'],
    if: { properties: { version: { const: 1.0 } }, required: ["version"] },
    then: {
        properties: {
            "name": {
                type: "string",
                errorMessage: {
                    type: "The name should be a string",
                },
            },
            "inputs": {
                type: "array",
                errorMessage: {
                    type: "The inputs must be an array",
                },
            },
            "expected": {
                type: "string",
                errorMessage: {
                    type: "The expected output must be a string",
                },
            }
        },
        required: ["name", "inputs", "expected"],
        errorMessage: {
            required: {
                name: "The name of the experiment field is required",
                inputs: "The inputs field is required",
                expected: "The expected output field is required",
            }
        },
    }
}