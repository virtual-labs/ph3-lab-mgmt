const { PluginScope } = require("../enums.js");
const issues = require("../assets_plugins/json/bug-report-questions.js");

const config = [
  {
    id: "plugin-bug-report",
    scope: PluginScope.PAGE,
    js_modules: [
      "https://virtual-labs.github.io/svc-bug-report/client/src/bug-report.js",
    ],
    attributes: {
      issues: JSON.stringify(issues),
    },
  },
  {
    id: "svc-rating",
    scope: PluginScope.PAGE,
    js_modules:[
      "https://virtual-labs.github.io/svc-rating/rating-display.js",
      "https://virtual-labs.github.io/svc-rating/rating.js",
      "https://virtual-labs.github.io/svc-rating/rating-submit.js",
    ],
    attributes: {
      spreadsheetID: "1x12nhpp0QvnsA6x-O1sV4IA9SAbfVsq_wiexWkutOmU",
      sheetName: "Experiment-Database",
      columnName: "Experiment Short Name",
      columnValue: "expName",
      title: "Rate this experiment",
      imagesDirectory: "https://virtual-labs.github.io/svc-rating/"
    },

  },
];

module.exports = config;
