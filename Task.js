const path = require("path");
const fs = require("fs");
const marked = require("marked");
const { JSDOM } = require("jsdom");
const process = require("process");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const {Unit} = require("./Unit.js");
const {UnitTypes, ContentTypes, validType, validContentType} = require("./Enums.js");

class Task extends Unit {
  constructor(
    unit_type,
    label,
    content_type,
    exp_path,
    basedir,
    source,
    target,
    lu
  ) {
    super(unit_type, label, content_type, exp_path, basedir, source, target);
    this.lu = lu;
  }

  static unit_type = UnitTypes.TASK;

  menuItemInfo() {
    const info = super.menuItemInfo();
    info.lu = this.lu;
    return info;
  }
}

module.exports = {Task};
