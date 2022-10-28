const { PluginScope } = require("./Enums.js");
const issues = require("./assets_plugins/json/bug-report-questions.js");

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
    id: "plugin-rating",
    scope: PluginScope.PAGE,
  },
  {
    id: "tool-performance",
    scope: PluginScope.EXPERIMENT,
    repo: "https://github.com/virtual-labs/tool-performance",
    template: "handlebars/performance-report.handlebars",
    target: "performance-report.html",
    label: "Performance Tool",
  }
];

module.exports = config;
