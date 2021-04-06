const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const { JSDOM } = require("jsdom");
const child_process = require("child_process");
const url = require("url");
const chalk = require("chalk");
const shell = require("shelljs");
const moment = require("moment");
const prettier = require("prettier");
const simpleGit = require("simple-git");
const validator = require("./validateDescriptor.js");
const gs = require("./googlesheet.js");
const labDescriptorFn = "lab-descriptor.json";
const { run } = require("./exp.js");
const config = require("./config.json");
const { BuildEnvs } = require("./Enums.js");

shell.config.silent = true;

function stageLab(src, destPath) {
  console.log(`STAGE LAB to ${destPath}\n`);
  shell.exec(`mkdir -p '${destPath}'`);
  shell.exec(`rsync -a ${src} '${destPath}'`);
}

function buildPage(template_file, component_files, content_file) {
  const main_template = fs.readFileSync(template_file, "utf-8");
  const components = loadComponents(component_files);
  const content = fs.readFileSync(`page-components/${content_file}`, "utf-8");
  const res_html = populateTemplate(main_template, components, content);
  return res_html;
}

function loadComponents(component_files) {
  const components = component_files.map((fn) =>
    fs.readFileSync(`page-components/${fn}`, "utf-8")
  );
  return components;
}

function populateTemplate(template, components, content) {
  let dom = new JSDOM(`${template}`);
  let res = addAnalytics(dom, components[0]);
  res = addLabName(res, components[1]);
  res = addBroadAreaName(res, components[2]);
  res = addSideBar(res, components[3]);
  res = addContent(res, content);
  return res.serialize();
}

function addAnalytics(dom, analyticsSnippet) {
  dom.window.document.head.querySelector("script").innerHTML = analyticsSnippet;
  return dom;
}

function addBroadAreaName(dom, broadareaName) {
  dom.window.document.querySelector(
    ".vlabs-page-main > div"
  ).innerHTML = broadareaName;
  return dom;
}

function addLabName(dom, labname) {
  dom.window.document.querySelector(".lab-name").innerHTML = labname;
  return dom;
}

function addSideBar(dom, sidebar) {
  dom.window.document.querySelector(".sidebar").innerHTML = sidebar;
  return dom;
}

function addContent(dom, ctnt) {
  dom.window.document.querySelector(
    ".vlabs-page-content > div"
  ).innerHTML = ctnt;
  return dom;
}


function genComponentHtml(fn, data) {
  const template = fs.readFileSync(fn, "utf-8");
  const base = path.parse(fn).name;

  html = Handlebars.compile(template)(data);
  fs.writeFileSync(`page-components/${base}.html`, html, "utf-8");
}

function prepareStructure(labpath) {
  shell.mkdir("-p", path.resolve(labpath, "build"));
  shell.cp(
    "-r",
    path.resolve("templates/assets/*"),
    path.resolve(labpath, "build")
  );
}

function generateLab(pages, labpath, template_file, component_files) {
  shell.exec(`cd ${labpath}; git checkout master; git pull origin master`);
  prepareStructure(labpath);
  pages.forEach((p) => {
    const res_html = buildPage(template_file, component_files, p.src);
    fs.writeFileSync(`${labpath}/build/${p.target}`, res_html, "utf-8");
  });
}

function dataPreprocess(datafile) {
  const data = JSON.parse(fs.readFileSync(datafile));

  if (data.experiments) {
    data.experiments = data.experiments.map((e) => {
      const exp_url = generateLink(data.baseUrl, e["short-name"]);
      return { name: e.name, link: exp_url.toString() };
    });
    return data;
  } else {
    if (data["experiment-sections"]) {
      data["experiment-sections"] = data["experiment-sections"].map((es) => {
        return {
          "sect-name": es["sect-name"],
          experiments: es.experiments.map((e) => {
            const exp_url = generateLink(
              data.baseUrl,
              e["short-name"],
              (index_fn = "index.html")
            );
            return { name: e.name, link: exp_url.toString() };
          }),
        };
      });
      return data;
    }
  }
}

function toDirName(n) {
  return n.toLowerCase().trim().replace(/–/g, "").replace(/ +/g, "-");
}

function generateLink(baseUrl, expName, index_fn = "") {
  const expUrl = new URL(`https://${baseUrl}/exp/${expName}/${index_fn}`);
  return expUrl;
}

function labURL(host, name) {
  return new URL(`https://${host}/${toDirName(name)}`);
}

function generate(labpath) {
  const data = dataPreprocess(path.join(labpath, "lab-descriptor.json"));
  const template_file = "skeleton.html";
  const component_files = config.commonComponents;

  const fns = glob.sync("page-templates/*.handlebars");
  if (
    data.experiments === undefined &&
    data["experiment-sections"] !== undefined
  ) {
    config.pages = config.pages.filter(
      (p) => !(p.src === "list-of-experiments-ctnt.html")
    );
    data.menu = config.pages;
    fns.forEach((fn) => genComponentHtml(fn, data));
  } else {
    if (
      data.experiments !== undefined &&
      data["experiment-sections"] === undefined
    ) {
      config.pages = config.pages.filter(
        (p) => !(p.src === "nested-list-of-experiments-ctnt.html")
      );
      data.menu = config.pages;
      fns
        .filter((fn) => !fn.includes("nested"))
        .forEach((fn) => genComponentHtml(fn, data));
    }
  }

  generateLab(config.pages, labpath, template_file, component_files);
}



/*
  Publish: clone -> build -> stage
*/
function publishExperiments(labpath) {
  const ldpath = path.resolve(labpath, "lab-descriptor.json");
  const lab_descriptor = require(ldpath);

  const config = require("./config.json");
  const exp_dir = config["exp_dir"];
  const deployment_dest = config["deployment_dest"];
  const lab_dir_name = toDirName(lab_descriptor.lab);
  const deployment_path = path.join(deployment_dest, lab_dir_name);
  const experiments = expList(lab_descriptor);

  experiments.forEach((e) => {
    console.log("");
    exp_clone(e, exp_dir);
    exp_build(e, lab_descriptor, exp_dir);
    exp_stage(e, exp_dir, deployment_path);
    console.log("");
  });
}

function getLabName(labpath) {
  const ldpath = path.resolve(labpath, "lab-descriptor.json");
  const labdesc = require(ldpath);
  return toDirName(labdesc.lab);
}

function exp_clone(e, exp_dir) {
  console.log(chalk`{cyan CLONE} {yellow from} ${e.repo}`);
  const e_short_name = e["short-name"];
  shell.mkdir("-p", path.resolve(exp_dir));
  shell.rm("-rf", path.resolve(exp_dir, e_short_name));
  shell.exec(
    `git clone -b ${e.tag} --depth 1 ${e.repo} ${path.resolve(
      exp_dir,
      e_short_name
    )}`
  );
}

function exp_build(e, ld, exp_dir) {
  const e_short_name = e["short-name"];
  console.log(
    chalk`{cyan BUILD} {yellow at} ${path.resolve(exp_dir, e_short_name)}`
  );

  /*
     Including name and short-name to the lab descriptor
     because these field are needed in the analytics.  There
     is no other (easy) way to identify the experiment from the
     list of experiments.
  */

  ld.exp_name = e.name;
  ld.exp_short_name = e_short_name;

  run(path.resolve(exp_dir, e_short_name), ld, { env: BuildEnvs.PRODUCTION });
}

function exp_stage(e, exp_dir, deployment_dest) {
  const e_short_name = toDirName(e["short-name"]);

  console.log(
    chalk`{cyan STAGE} {yellow to} ${path.resolve(
      deployment_dest,
      "stage",
      "exp",
      e_short_name
    )}`
  );

  shell.rm("-rf", `${deployment_dest}/stage/exp/${e_short_name}/`);
  shell.mkdir(
    "-p",
    path.resolve(deployment_dest, "stage", "exp", e_short_name)
  );
  shell.cp(
    "-rf",
    `${exp_dir}/${e_short_name}/build/*`,
    `${deployment_dest}/stage/exp/${e_short_name}/`
  );
}

function expList(data) {
  if (data.experiments) {
    const experiments = data.experiments;
    return experiments;
  } else {
    const experiments = data["experiment-sections"]
      .map((es) => es.experiments)
      .flat();
    return experiments;
  }
}

function deploy(labpath) {
  const config = require("./config.json");
  const deployment_dest = config["deployment_dest"];
  const lab_descriptor = require(path.resolve(labpath, "lab-descriptor.json"));
  const lab_dir_name = toDirName(lab_descriptor.lab);
  const deployment_path = path.join(deployment_dest, lab_dir_name);

  const elist = expList(require(path.resolve(labpath, "lab-descriptor.json")));

  elist.forEach((e) => {
    console.log(
      chalk`{bold DEPLOY} {yellow to} ${path.resolve(
        deployment_path,
        "exp",
        e["short-name"]
      )}`
    );
    shell.mkdir("-p", path.resolve(deployment_path, "exp", e["short-name"]));
    shell.exec(`rsync -arv --exclude .git \
'${deployment_path}/stage/exp/${e["short-name"]}/'* '${deployment_path}/exp/${e["short-name"]}'`);
  });

  console.log(chalk`{bold DEPLOY LAB} to ${deployment_dest}/${lab_dir_name}`);
  shell.exec(`rsync -arv --exclude .git \
'${deployment_dest}/stage/${lab_dir_name}/'* '${deployment_dest}/${lab_dir_name}'`);
}

/*
  main.js --release patch <path>
  main.js --release minor <path>
  main.js --release major <path>
*/
function labgen() {
  const args = require("minimist")(process.argv.slice(2));

  const labpath = args._[0];
  const release_type = args.release;
  const newVersion = nextVersion(labpath, release_type);

  if (!fs.existsSync(labpath)) {
    console.error(chalk`{red Invalid Lab Path} '${labpath}'`);
  } else {
    const isValid = validator.validateLabDescriptor(
      path.resolve(labpath, labDescriptorFn)
    );
    if (!isValid) {
      return;
    }

    generate(labpath);
    publishExperiments(labpath);
    stageLab(
      `${labpath}/build/*`,
      path.resolve("/var/www/html/stage", getLabName(labpath))
    );
    deploy(labpath);

    ld = updateDescriptor(labpath, newVersion);
    updateRecord(ld, "SUCCESS");
    pushlab(labpath);
    release(labpath, newVersion);
  }
}

function updateDescriptor(labpath, t) {
  ld = LD(labpath);
  ld.version = t;
  lds = prettier.format(JSON.stringify(ld), { parser: "json" });
  fs.writeFileSync(path.resolve(labpath, "lab-descriptor.json"), lds, "utf-8");
  return ld;
}

function updateRecord(lab_descriptor, exec_status) {
  const rec = {
    date: moment().format("DD MMMM YYYY"),
    time: moment().format("hh:mm:ss"),
    unit: "LAB",
    url: labURL(lab_descriptor.baseUrl, lab_descriptor.lab),
    version: lab_descriptor.version,
    status: exec_status,
  };
  gs.appendExecutionResult(rec);
}

function LD(lp) {
  return require(path.resolve(lp, "lab-descriptor.json"));
}

function pushlab(labpath) {
  const commitMsg = `Lab generated at ${moment()}`;
  child_process.execSync(
    `cd ${labpath};
git add license.org lab-descriptor.json;
git commit -m "${commitMsg}";
git push origin master`
  );
}

function release(labpath, tag_name) {
  child_process.execSync(
    `cd ${labpath};
git tag -a ${tag_name} -m "version ${tag_name}";
git push origin ${tag_name}`
  );
  return tag_name;
}

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
  shell.cd(path.resolve(labpath));
  const res = shell.exec(`git describe --abbrev=0`);
  if (res.code === 0) {
    version = res.stdout;
  }
  shell.cd(__dirname);
  return version;
}

labgen();
