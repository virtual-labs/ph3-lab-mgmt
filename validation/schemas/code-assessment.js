module.exports = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://virtual.labs/schemas/code-assessment.json",
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
            "experiment name": {
                type: "string",
                errorMessage: {
                    type: "The experiment name should be a string",
                },
            },
            "problems": {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        "problem name": {
                            type: "string",
                            errorMessage: {
                                type: "The problem name should be a string",
                            },
                        },
                        "description": {
                            type: "string",
                            errorMessage: {
                                type: "The description should be a string",
                            },
                        },
                        "inputs": {
                            type: "array",
                            errorMessage: {
                                type: "The inputs should be an array",
                            },
                        },
                        "expected": {
                            type: "array",
                            errorMessage: {
                                type: "The expected should be an array",
                            },
                        }
                    },
                    required: ["problem name", "description", "inputs", "expected"],
                    errorMessage: {
                        required: {
                            "problem name": "The name of the problem field is required",
                            "description": "The description is required",
                            "inputs": "The inputs field is required",
                            "expected": "The expected field is required"
                        }
                    },
                },
                errorMessage: {
                    type: "The problems must be an array",
                },
            }
        },
        required: ["experiment name", "problems"],
        errorMessage: {
            required: {
                name: "The name of the experiment field is required",
                problems: "The problems field is required",
            }
        },
    }
}