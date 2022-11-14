const marked = require("marked");
const katex = require("katex");
const Config = require("./Config.js");
const path = require("path");
const shell = require("shelljs");
const args = require("minimist")(process.argv.slice(2));
let src = "../";

let LaTeXinMD = false;

if (args._.length === 1) {
  src = path.resolve(args._[0]);
}

let descriptorPath = path.resolve(
  src,
  `${Config.Experiment.descriptor_name}.json`
);

if (!shell.test("-f", descriptorPath)) {
  LaTeXinMD = false;
} else {
  descriptor = require(descriptorPath);
  LaTeXinMD = descriptor.LaTeXinMD || false;
}

const renderer = new marked.Renderer();

function handleDoubleDollarMaths(md) {
  for (let i = 0; i < md.length; i++) {
    if (md[i] === "$" && md[i + 1] === "$") {
      let j = i + 2;
      // console.log('found $$');
      while (j < md.length && !(md[j] === "$" && md[j + 1] === "$")) {
        j++;
      }
      if (j < md.length) {
        // console.log('found $$');
        const expr = md.substring(i, j + 2);
        const math = "`" + expr + "`";
        if (math) {
          md = md.substring(0, i) + math + md.substring(j + 2);

          i += math.length - 1;
        }
      }
    }
  }

  return md;
}

// check if two regex matches overlap
function overlap(match1, match2) {
  const start1 = match1.index;
  const end1 = start1 + match1[0].length;
  const start2 = match2.index;
  const end2 = start2 + match2[0].length;

  // console.log(start1, end1, start2, end2);

  // ensure both sets are independent
  if (start1 < start2 && end1 < start2) {
    return false;
  }
  if (start2 < start1 && end2 < start1) {
    return false;
  }

  return true;
}

function handleSingleDollarMaths(md) {
  const regex = / \$[^\$]+\$ |^\$[^\$]+\$ |^\$[^\$]+\$$| \$[^\$]+\$$/gm;
  const regex2 = /([`])(?:(?=(\\?))\2.)*?\1/g;

  const matches = [...md.matchAll(regex)];
  const matches2 = [...md.matchAll(regex2)];

  const actualMatches = [];

  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      let isOverlapping = false;
      for (let j = 0; j < matches2.length; j++) {
        const match2 = matches2[j];
        if (overlap(match, match2)) {
          isOverlapping = true;
          break;
        }
      }
      if (!isOverlapping) {
        actualMatches.push(match);
      }
    }
  }

  let replacements = 0;

  for (let i = 0; i < actualMatches.length; i++) {
    const match = actualMatches[i];
    const start = match.index + replacements * 4;
    const end = start + match[0].length;
    md =
      md.substring(0, start) +
      " `" +
      md.substring(start, end) +
      "` " +
      md.substring(end);
    replacements++;
  }

  return md;
}

function preProcessMd(md) {
  md = handleDoubleDollarMaths(md);
  md = handleSingleDollarMaths(md);
  // md = md.replace(/\$(.*?)\$/g, '`$$$1$$`');
  return md;
}

function mathsExpression(expr) {
  // remove start and end whitespace
  expr = expr.trim();
  if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
    expr = expr.substr(2, expr.length - 4);
    return katex.renderToString(expr, { displayMode: true });
  } else if (expr.match(/^\$[\s\S]*\$$/)) {
    expr = expr.substr(1, expr.length - 2);
    return katex.renderToString(expr, { displayMode: false });
  }
}

const rendererCode = renderer.code;
renderer.code = function (code, lang, escaped) {
  if (!lang) {
    const math = mathsExpression(code);
    if (math) {
      return math;
    }
  }

  return rendererCode(code, lang, escaped);
};

const rendererCodespan = renderer.codespan;
renderer.codespan = function (text) {
  const math = mathsExpression(text);

  if (math) {
    return math;
  }

  return rendererCodespan(text);
};

function renderMarkdown(md) {
  console.log("Rendering Markdown" + (LaTeXinMD ? " with LaTeX" : ""));
  if (LaTeXinMD) {
    const preProcessedMd = preProcessMd(md);
    return marked(preProcessedMd, { renderer: renderer });
  } else {
    return marked(md);
  }
}

module.exports = { renderMarkdown };
