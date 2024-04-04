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
    id: "tool-performance",
    scope: PluginScope.EXPERIMENT,
    repo: "https://github.com/virtual-labs/tool-performance",
    template: "handlebars/performance-report.handlebars",
    target: "performance-report.html",
    label: "Performance Tool",
  },
  {
    id: "tool-validation",
    scope: PluginScope.EXPERIMENT,
    repo: "https://github.com/virtual-labs/tool-validation",
    tag: "v1.0.1",
    template: "handlebars/validator-report.handlebars",
    target: "validator-report.html",
    label: "Validation Tool",
  },
  {
    id: "tool-validation",
    scope: PluginScope.POSTBUILD,
    repo: "https://github.com/virtual-labs/tool-validation",
    tag: "v1.0.1",
    command: "npm i && node js/link_validation.js",
  },
  {
    id: "svc-rating",
    scope: PluginScope.PAGE,
    repo: "https://github.com/virtual-labs/svc-rating",
    tag: "v1.1.0.beta",
    label: "Validation Tool",
    js_modules: [
      "./index.js",
      "./config.js",
      "https://apis.google.com/js/api.js",
    ],
    css_modules: [
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css",
    ],
    attributes: {
      spreadsheetID: "1x12nhpp0QvnsA6x-O1sV4IA9SAbfVsq_wiexWkutOmU",
      sheetName: "Experiment-Database",
      columnName: "Experiment Short Name",
      columnValue: "expName",
      title: "Rate this experiment",
      imagesDirectory: "./plugins/svc-rating/images/",
    },
  },
  {
    id: "VLABS-code-editor",
    div_id: "code-editor", 
    js_modules: [
      "https://virtual-labs.github.io/comp-code-editor/js/codeditor.js"
    ],
    css_modules: [
      "https://virtual-labs.github.io/comp-code-editor/css/codeditor.css"
    ],
    label: "Code Assessment",
  },
];

module.exports = config;
