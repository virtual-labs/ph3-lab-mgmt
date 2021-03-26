const path = require("path");
const {BuildEnvs} = require("./Enums.js");

const Lab = {
  descriptor_name: "lab-descriptor",
  build_dir: "build",
  exp_dir: "exp",
  deployment_dest: "/var/www/html",
  stage_dir: "stage",
  ui_template_name: "templates",
  static_content_dir: "static_content",
  partials: [
    ["analytics_head", "lab-analytics-head"],
    ["analytics_body", "lab-analytics-body"],
    ["commons", "commons"],
    ["header", "header"],
    ["breadcrumbs", "lab-breadcrumbs"],
    ["side_menu", "sidemenu"],
    ["content", "content"],
    ["footer", "footer"]
  ],
  pages: [
    {

    }
  ]
}

const Experiment = {
  descriptor_name: "experiment-descriptor",
  default_descriptor: "default-experiment-descriptor.json",
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


/*
Experiment build path
-------------------------
This is here to avoid circular dependency between
Experiment moudle and Task module.
*/
function build_path(src) {
  return path.resolve(src, Experiment.build_dir, path.basename(path.resolve(src)));
}

module.exports.Experiment = Experiment;
module.exports.Lab = Lab;
module.exports.build_path = build_path;
