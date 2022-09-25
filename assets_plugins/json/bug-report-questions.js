const { ContentTypes } = require("../../Enums");

const issues = {
  [ContentTypes.TEXT]: ["Incorrect Content", "Insufficient Content"],
  [ContentTypes.VIDEO]: ["Incorrect Content", "Insufficient Content"],
  [ContentTypes.ASSESMENT]: [
    "Incorrect Options",
    "Incorrect Answer",
    "Incorrect Question",
  ],
  [ContentTypes.SIMULATION]: [
    "Simulation Not Working",
    "Incorrect Results/Observations",
    "Insufficient/Incorrect Instructions",
  ],
  DEFAULT: ["Page Not Loading", "Content Not Visible", "Incorrect content"],
};

module.exports = issues;
