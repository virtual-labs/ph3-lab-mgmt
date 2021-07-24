const UnitTypes = {
  LU: "lu",
  TASK: "task",
  AIM: "aim",
  PLUGIN: "plugin",
};

const ContentTypes = {
  TEXT: "text",
  VIDEO: "video",
  SIMULATION: "simulation",
  ASSESMENT: "assesment",
};

const BuildEnvs = {
  PRODUCTION: 'production',
  TESTING: 'testing',
  LOCAL: 'local'
};

const PluginScope = {
  EXPERIMENT: 'experiment',
  PAGE: 'page',
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

function validBuildEnv(e) {
  if (validType(BuildEnvs, e)) {
    return e;
  } else {
    throw new Error("Invalid build environment");
  }
}

module.exports = {UnitTypes, ContentTypes, BuildEnvs, PluginScope, validType, validContentType, validUnitType, validBuildEnv};
