const path = require("path");
const {BuildEnvs} = require("./Enums.js");

const Experiment = {
  descriptor_name: "experiment-descriptor",
  build_dir: "build",
  exp_dir: "experiment",
  ui_template_name: "templates",
  static_content_dir: "static_content",
  partials: [
    ["analytics_head", "analytics-head"],
    ["analytics_body", "analytics-body"],
    ["meta", "meta"],
    ["commons", "commons"],
    ["header", "header"],
    ["breadcrumbs", "breadcrumbs"],
    ["side_menu", "sidemenu"],
    ["content", "content"],
    ["footer", "footer"]
  ],
  optional_pages: [
    "Observations",
    "Assignment",
    "Quiz"
  ]
};

function build_path(src) {
  return path.resolve(src, Experiment.build_dir, path.basename(path.resolve(src)));
}

module.exports.Experiment = Experiment;
module.exports.build_path = build_path;
