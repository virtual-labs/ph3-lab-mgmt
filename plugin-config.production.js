const { PluginScope } = require("./Enums.js");
const issues = require("./assets_plugins/json/bug-report-questions.js");


const config = [
  
  
  

  {
    id: "plugin-rating",
    scope: PluginScope.PAGE,
    js_modules:[
      "https://virtual-labs.github.io/svc-rating/rating-display.js",
      "https://virtual-labs.github.io/svc-rating/rating.js",
      "https://virtual-labs.github.io/svc-rating/rating-submit.js",
    ],
    attributes: {},
    
  },
  {
    id: "tool-performance",
    scope: PluginScope.EXPERIMENT,
    repo: "https://github.com/virtual-labs/tool-performance",
    template: "handlebars/performance-report.handlebars",
    target: "performance-report.html",
    label: "Performance Tool",
  },
];

module.exports = config;