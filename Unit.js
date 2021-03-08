const path = require("path");
const fs = require("fs");
const marked = require("marked");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const Config = require("./Config.js");
const { ContentTypes, validContentType, validUnitType } = require("./Enums.js");

class Unit {
  constructor(unit_type, label, exp_path, basedir) {
    this.unit_type = validUnitType(unit_type);
    this.label = label;
    this.exp_path = exp_path;
    this.basedir = basedir;
  }


  build() {
    console.log(this.lu, this.label);
  }
}

module.exports = { Unit };
