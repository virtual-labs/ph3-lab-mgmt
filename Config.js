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
    ["validation_body", "lab-validation-body"],
    ["commons", "commons"],
    ["header", "header"],
    ["breadcrumbs", "lab-breadcrumbs"],
    ["side_menu", "sidemenu"],
    ["content", "content"],
    ["footer", "footer"],
    ["popup_menu", "popupmenu"],
    ["simulation_header", "simulation-header"],
    ["bug_report_mobile", "bug-report-mobile"],
    ["nav_menu_items", "nav-menu-items"],
  ],
  pages: [
    {

    }
  ]
}

const Experiment = {
  descriptor_name: "experiment-descriptor.json",
  default_descriptor: "default-experiment-descriptor.json",
  build_dir: "build",
  exp_dir: "experiment",
  ui_template_name: "templates",
  static_content_dir: "static_content",
  partials: [
    ["analytics_head", "analytics-head"],
    ["analytics_body", "analytics-body"],
    ["validation_body", "validation-body"],
    ["meta", "meta"],
    ["commons", "commons"],
    ["header", "header"],
    ["breadcrumbs", "breadcrumbs"],
    ["tools", "tools"],
    ["side_menu", "sidemenu"],
    ["content", "content"],
    ["footer", "footer"],
    ["popup_menu", "popupmenu"],
    ["simulation_header", "simulation-header"],
    ["bug_report_mobile", "bug-report-mobile"],
    ["nav_menu_items", "nav-menu-items"],
  ],
  optional_pages: [
    "Observations",
    "Assignment",
    "Quiz"
  ]
};

let debug_mode = false;

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
module.exports.debug_mode = debug_mode;
