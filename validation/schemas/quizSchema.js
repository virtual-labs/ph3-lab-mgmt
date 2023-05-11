module.exports = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://virtual.labs/schemas/quizSchema.json",
  type: ["object", "array"],
  if: { type: "array" },
  then: {
    items: { $ref: "qv1.json#/items" },
  },
  if: { type: "object" },
  then: {
    properties: {
      version: {
        type: "integer",
        enum: [2.0],
        errorMessage: "Version should be 2.0",
      },
    },
    if: { properties: { version: { const: 2.0 } }, required: ["version"] },
    then: {
      required: ["questions"],
      properties: { questions: { $ref: "qv2.json#/properties/questions" } },
    },
  },
};
