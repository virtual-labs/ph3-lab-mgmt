const shell = require("shelljs");
shell.config.silent = true;

function semanticVersion(t) {
  const nums = t.slice(1).split(".");
  return {
    major: parseInt(nums[0]),
    minor: parseInt(nums[1]),
    patch: parseInt(nums[2]),
    id: parseInt(t.slice(1).replace(/\./g, "")),
  };
}

function compareTags(t1, t2) {
  const st1 = semanticVersion(t1);
  const st2 = semanticVersion(t2);
  return st2.id - st1.id;
}

function latestTag(tags) {
  if (tags.length === 0) {
    return "v0.0.0";
  }
  tags.sort(compareTags);
  return tags[0];
}

function nextMajor(t) {
  t.major += 1;
  t.minor = 0;
  t.patch = 0;
  return t;
}

function nextMinor(t) {
  t.minor += 1;
  t.patch = 0;
  return t;
}

function nextPatch(t) {
  t.patch += 1;
  return t;
}

function incrementTagNumber(tag, release_type) {
  const st = semanticVersion(tag);
  switch (release_type) {
    case "major":
      nextMajor(st);
      break;

    case "minor":
      nextMinor(st);
      break;

    case "patch":
      nextPatch(st);
      break;

    default:
      nextMinor(st);
      break;
  }

  return `v${st.major}.${st.minor}.${st.patch}`;
}

function nextVersion(labpath, release_type) {
  let version = "v0.0.1";
  shell.cd(labpath);
  const res = shell.exec(`git describe --abbrev=0`);
  if (res.code === 0) {
    version = res.stdout;
  }
  shell.cd(__dirname);
  return incrementTagNumber(version, release_type);
}

module.exports = {
  nextVersion,
};
