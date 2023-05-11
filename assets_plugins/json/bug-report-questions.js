const { ContentTypes } = require("../../enums");

const issues = {
  [ContentTypes.TEXT]: ["Insufficient Content"],
  [ContentTypes.VIDEO]: ["Insufficient Content"],
  [ContentTypes.ASSESMENT]: [
    "Incorrect Options",
    "Incorrect Answer",
    "Incorrect Question",
  ],
  [ContentTypes.ASSESSMENT]: [
    "Incorrect Options",
    "Incorrect Answer",
    "Incorrect Question",
  ],
  [ContentTypes.SIMULATION]: [
    "Simulation Not Working",
    "Incorrect Results/Observations",
    "Insufficient/Incorrect Instructions",
  ],
  DEFAULT: ["Page Not Loading", "Content Not Visible", "Incorrect Content"],
};

module.exports = issues;
