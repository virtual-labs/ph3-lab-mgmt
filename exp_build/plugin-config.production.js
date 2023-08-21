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
];

module.exports = config;
