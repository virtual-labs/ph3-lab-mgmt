// This file contains the functions to build the html page from the template and the page components
const Handlebars = require("handlebars");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const log = require("../logger.js");

function loadComponents(component_files) {
  const components = component_files.map((fn) =>
    fs.readFileSync(path.resolve(__dirname,"page-components",fn), "utf-8")
  );
  return components;
}

function addAnalytics(dom, analyticsSnippet) {
  dom.window.document.head.querySelector("script").innerHTML = analyticsSnippet;
  return dom;
}

function addBroadAreaName(dom, broadareaName) {
  dom.window.document.querySelector(".vlabs-page-main > div").innerHTML =
    broadareaName;
  return dom;
}

function addLabName(dom, labname) {
  dom.window.document.querySelector(".lab-name").innerHTML = labname;
  return dom;
}

function addSideBar(dom, sidebar) {
  dom.window.document.querySelector(".popupMenuItems").innerHTML = sidebar;
  dom.window.document.querySelector(".sidebar").innerHTML = sidebar;
  return dom;
}

function addContent(dom, ctnt) {
  dom.window.document.querySelector(".vlabs-page-content > div").innerHTML =
    ctnt;
  return dom;
}

function populateTemplate(template, components, content) {
  log.debug("Loading Components");
  let dom = new JSDOM(template);
  dom = addAnalytics(dom, components[0]);
  dom = addLabName(dom, components[1]);
  dom = addBroadAreaName(dom, components[2]);
  dom = addSideBar(dom, components[3]);
  dom = addContent(dom, content);
  return dom.serialize();
}

function buildPage(template_file, component_files, content_file) {
  const main_template = fs.readFileSync(template_file, "utf-8");
  const components = loadComponents(component_files);
  const contentPath = path.resolve(__dirname, "page-components", content_file);
  const content = fs.readFileSync(contentPath, "utf-8");
  const res_html = populateTemplate(main_template, components, content);
  return res_html;
}

function renderTemplate(fn, data) {
  log.debug(`Rendering template ${fn}`);
  const template = fs.readFileSync(fn, "utf-8");
  const base = path.parse(fn).name;

  html = Handlebars.compile(template)(data);
  const basePath = path.resolve(__dirname, "page-components", `${base}.html`);
  fs.writeFileSync(basePath, html, "utf-8");
}

module.exports = {
  buildPage,
  renderTemplate,
};
