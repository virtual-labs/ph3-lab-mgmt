module.exports = {
  type: ["object", "array"],
  if: {
    type: "object",
  },
  then: {
    properties: {
      version: {
        type: "integer",
        enum: [2],
        errorMessage: "Version should be 2.0",
      },
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
              minProperties: 1,
              errorMessage: {
                minProperties: "There have to be atleast one correct answer",
              },
            },
            correctAnswer: {
              type: "string",
            },
            difficulty: {
              type: "string",
              enum: ["beginner", "intermediate", "advanced"],
              errorMessage: {
                enum:
                  "Difficulty can only be: beginner, intermediate or advanced",
              },
            },
            explanations: {
              type: "object",
            },
          },
          additionalProperties: false,
          required: ["question", "answers", "correctAnswer", "difficulty"],
        },
        minItems: 1,
        errorMessage: {
          minItems: "Questions cannot be empty",
          type: "Please provide an array of questions",
        },
      },
    },
    required: ["version", "questions"],
    additionalProperties: false,
  },
  if: {
    type: "array",
  },
  then: {
    items: {
      type: "object",
      properties: {
        question: {
          type: "string",
        },
        answers: {
          type: "object",
          minProperties: 1,
          errorMessage: {
            minProperties: "There have to be atleast one correct answer",
          },
        },
        correctAnswer: {
          type: "string",
        },
      },
      required: ["question", "answers", "correctAnswer"],
    },
  },
};
