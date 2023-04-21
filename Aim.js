const { Task } = require("./Task.js");
const {
  UnitTypes,
  ContentTypes,
  validType,
  validContentType,
} = require("./Enums.js");

class Aim extends Task {
  constructor(basedir, lu_label, exp_path) {
    super(
      UnitTypes.AIM,
      "Aim",
      ContentTypes.TEXT,
      exp_path,
      basedir,
      "aim.md",
      "index.html",
      [],
      [],
      lu_label
    );
  }
}

module.exports = { Aim };
