const path = require("path");
const fs = require("fs");
const marked = require("marked");
const { JSDOM } = require("jsdom");
const process = require("process");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const {Unit} = require("./Unit.js");
const {Task} = require("./Task.js");

const {UnitTypes, ContentTypes, validType, validContentType} = require("./Enums.js");

class LearningUnit extends Unit {
  constructor(
    unit_type,
    label,
    content_type,
    exp_path,
    basedir,
    source,
    target,
    tasks
  ) {
    super(unit_type, label, content_type, exp_path, basedir, source, target);
    if (tasks) {
    this.tasks = Array.from(tasks).map(
      (t) =>
        new Task(
          t["unit-type"],
          t["label"],
          t["content-type"],
          exp_path,
          basedir,
          t["source"],
          t["target"],
          this.label
        )
    );
    }
    else {
      tasks = [];
    }
  }

  static unit_type = UnitTypes.LU;

  static fromRecord(lu, exp_path) {
    return new LearningUnit(
      lu["unit-type"],
      lu["label"],
      lu["content-type"],
      exp_path,
      lu["basedir"],
      lu["source"],
      lu["target"],
      lu["units"]
    );
  }

  menuItemInfo(host_page_level) {
    const mi = super.menuItemInfo(host_page_level);
    mi.id = this.label.toLowerCase().replace(/ /g, '-');
    mi.tasks = this.tasks?this.tasks.map(t => {
      return t.menuItemInfo(host_page_level);
    }):[];
    return mi;
  }
}

module.exports = {LearningUnit};
