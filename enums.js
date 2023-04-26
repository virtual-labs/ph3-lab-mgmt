const UnitTypes = {
  LU: "lu",
  TASK: "task",
  AIM: "aim",
};

const ContentTypes = {
  TEXT: "text",
  VIDEO: "video",
  SIMULATION: "simulation",
  ASSESMENT: "assesment",
  ASSESSMENT: "assessment",
};

const BuildEnvs = {
  PRODUCTION: 'production',
  TESTING: 'testing',
  LOCAL: 'local'
};

const PluginScope = {
  EXPERIMENT: 'experiment',
  PAGE: 'page',
  POSTBUILD: 'postbuild'
};

const PluginConfig = {
	Default: {
		JS_MODULE: 'js/main.js',
		CSS_MODULE: 'css/main.css',
	},
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

module.exports = {UnitTypes, ContentTypes, BuildEnvs, PluginScope, PluginConfig, validType, validContentType, validUnitType, validBuildEnv};
