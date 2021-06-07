module.exports = {
  type: "object",
  properties: {
    version: { type: "integer" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
          },
          answers: {
            type: "object",
          },
          correctAnswer: {
            type: "string",
          },
          difficulty: {
            type: "string",
          },
          explanations: {
            type: "object",
          },
        },
        additionalProperties: false,
        required: ["question", "answers", "correctAnswer", "difficulty"],
      },
    },
  },
  required: ["version", "questions"],
  additionalProperties: false,
};
