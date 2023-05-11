const path = require("path");
const fs = require("fs");
const marked = require("marked");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const Config = require("../config.js");
const { ContentTypes, validContentType, validUnitType } = require("../enums.js");

class Unit {
  constructor(unit_type, label, exp_path, basedir) {
    this.unit_type = validUnitType(unit_type);
    this.label = label;
    this.exp_path = exp_path;
    this.basedir = basedir;
  }

  /*
    To be implemented by the inheriting sub-class.
   */
  build() {
    console.log(this.lu, this.label);
  }
}

module.exports = { Unit };
