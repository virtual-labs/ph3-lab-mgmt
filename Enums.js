const UnitTypes = {
  LU: "lu",
  TASK: "task",
};

const ContentTypes = {
  TEXT: "text",
  VIDEO: "video",
  SIMULATION: "simulation",
  ASSESMENT: "assesment"
};

function validType(t, v) {
  return Object.values(t).includes(v);
}

function validUnitType(ut) {
  if (validType(UnitTypes, ut)) {
    return ut;
  } else {
    throw new Error("Invalid unit type");
  }
}

function validContentType(ct) {
  if (validType(ContentTypes, ct)) {
    return ct;
  } else {
    throw new Error("Invalid content type");
  }
}

module.exports = {UnitTypes, ContentTypes, validType, validContentType, validUnitType};
