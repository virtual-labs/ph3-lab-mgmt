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
    id: "plugin-performance",
    scope: PluginScope.EXPERIMENT,
    // js_modules: ["https://vjspranav.github.io/vleads-bug-report/client/app.js"],
  },
];

module.exports = config;
