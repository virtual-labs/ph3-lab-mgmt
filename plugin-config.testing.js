const { PluginScope } = require("./Enums.js");

const config = [
  {
    id: "plugin-bug-report",
    scope: PluginScope.PAGE,
    js_modules: ["https://vjspranav.github.io/vleads-bug-report/client/app.js"],
  },
  {
    id: "plugin-rating",
    scope: PluginScope.PAGE,
  },
  {
    id: "plugin-performance",
    scope: PluginScope.PAGE,
    // js_modules: ["https://vjspranav.github.io/vleads-bug-report/client/app.js"],
  },
  {
    id: "tool-performance",
    scope: PluginScope.EXPERIMENT,
    repo: "https://github.com/virtual-labs/tool-performance",
    template: "handlebars/performance-report.handlebars",
    target: "performance-report.html",
    label: "Performance Tool"
  },
];

module.exports = config;
