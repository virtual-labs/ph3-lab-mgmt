const path = require("path");

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

const PROJECT_ROOT = path.resolve(__dirname);


/*
Experiment build path
-------------------------
This is here to avoid circular dependency between
Experiment moudle and Task module.
*/
function build_path(src) {
  return path.resolve(src, Experiment.build_dir, path.basename(path.resolve(src)));
}

function assets_path() {
  return path.resolve(__dirname, "assets");
}

module.exports.Experiment = Experiment;
module.exports.Lab = Lab;
module.exports.build_path = build_path;
module.exports.assets_path = assets_path;
module.exports.PROJECT_ROOT = PROJECT_ROOT;
