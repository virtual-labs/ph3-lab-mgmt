const path = require("path");
const fs = require("fs");
const marked = require("marked");
const process = require("process");
const Handlebars = require("handlebars");
const shell = require("shelljs");

const {Unit} = require("./unit.js");
const {Task} = require("./task.js");
const {Aim} = require("./aim.js");

const {UnitTypes, ContentTypes, validType, validContentType} = require("../enums.js");
const log = require("../logger.js");

class LearningUnit extends Unit {
  constructor(
    unit_type,
    label,
    exp_path,
    basedir,
    units
  ) {
    super(unit_type, label, exp_path, basedir);
    if (units) {
    this.units = Array.from(units).map(
      (u) => {
        switch(u["unit-type"]){
          case UnitTypes.LU:
            return LearningUnit.fromRecord(u, exp_path);
            break;
          case UnitTypes.TASK:
            u.basedir = basedir;
            return Task.fromRecord(u, label, exp_path);
            break;
          case UnitTypes.AIM:
            return (new Aim(this.basedir, label, exp_path));
            break;
        }
      });
    }
    else {
      units = [];
    }
  }

  static unit_type = UnitTypes.LU;

  static fromRecord(lu, exp_path) {
    const u = new LearningUnit(
      lu["unit-type"],
      lu["label"],
      exp_path,
      lu["basedir"],
      lu["units"]
    );
    return u;
  }


  menuItemInfo(host_path) {
    return {
      label: this.label,
      unit_type: this.unit_type,
      id: this.label.toLowerCase().replace(/ /g, '-'),
      units: this.units?this.units.map(t => {
        let info = t.menuItemInfo(host_path);
        //console.log(info);
        return info;
      }):[]
    };
  }


  build(exp_info, lab_data, options) {
    log.debug(`Building LU ${this.label}`);
    if (this.units.length > 0) {
      this.units.forEach(u => {
	u.build(exp_info, lab_data, options);
      });
    }
    log.debug(`Finished building LU ${this.label}`);
  }
}

module.exports = {LearningUnit};
