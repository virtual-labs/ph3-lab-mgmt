module.exports = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://virtual.labs/schemas/descriptorSchema.json",
  type: "object",
  properties: {
    "unit-type": {
      type: "string",
      enum: ["aim", "task", "lu"],
      errorMessage: {
        enum: "The unit-type should be one of the following: aim, task, lu",
      },
    },
  },
  required: ["unit-type"],
  errorMessage: {
    required: {
      "unit-type": "The unit-type is required",
    },
  },
  if: {
    properties: { "unit-type": { const: "lu" } },
    required: ["unit-type"],
  },
  then: {
    required: ["basedir", "units", "label"],
    properties: {
      "unit-type": {
        type: "string",
        enum: ["aim", "task", "lu"],
        errorMessage: {
          enum: "The unit-type should be one of the following: aim, task, lu",
        },
      },
      basedir: {
        type: "string",
      },
      units: {
        $ref: "learningUnit.json#/",
      },
      label: {
        type: "string",
      },
      "service-worker": {
        type: "string",
      },
      services: {
        type: "array",
        items: {
          type: "string",
          enum: ["VLAB_SVC_COMPILER", "VLAB_SVC_OCTAVE_ANN"],
        }
      },
    },
    additionalProperties: false,
    errorMessage: {
      required: {
        basedir: "The basedir is required",
        units: "The units are required",
      },
      additionalProperties: "There are additional experiment properties",
    },
  },
  else: {
    if: {
      properties: { "unit-type": { const: "task" } },
      required: ["unit-type"],
    },
    then: {
      required: ["content-type", "label", "source", "target"],
      properties: {
        "content-type": {
          type: "string",
          enum: ["text", "assesment", "simulation", "video", "assessment"],
        },
        label: {
          type: "string",
        },
        source: {
          type: "string",
        },
        target: {
          type: "string",
        },
        "additional-sources": {
          type: "array",
          items: {
            type: "string",
          }
        },
        "css_modules": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "js_modules": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      additionalProperties: false,
      errorMessage: {
        required: {
          "content-type": "The content-type is required",
          label: "The label is required",
          source: "The source is required",
          target: "The target is required",
        },
        additionalProperties: "There are additional task properties",
      },
    },
  },
};
