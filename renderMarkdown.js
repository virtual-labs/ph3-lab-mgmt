const marked = require("marked");
const katex = require("katex");
const Config = require("./Config.js");
const path = require("path");
const shell = require("shelljs");
const args = require("minimist")(process.argv.slice(2));
let src = "../";

let LaTeXinMD = false;
let expressions = [];

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

const tokenizeDoubleDollar = (md) => {
  // Find all $$ by for loop
  const matches = [];
  for (let i = 0; i < md.length - 1; i++) {
    if (md[i] === "$" && md[i + 1] === "$") {
      let info = {
        start: i,
        end: i + 1,
        type: "doubleDollar",
      };
      matches.push(info);
      i++;
    }
  }
  return matches;
};

const tokenizeSingleDollar = (md) => {
  // Find all $ by for loop
  const matches = [];
  for (let i = 0; i < md.length; i++) {
    if (md[i] === "$") {
      if (i > 0 && md[i - 1] === "$") {
        continue;
      }
      if (i < md.length - 1 && md[i + 1] === "$") {
        continue;
      }

      let info = {
        start: i,
        end: i,
        type: "singleDollar",
      };

      matches.push(info);
    }
  }
  return matches;
};

const handleDoubleDollar = (matches, md) => {
  let num_matches = matches.length;
  num_matches = num_matches % 2 === 0 ? num_matches : num_matches - 1;

  // replace everything between $$...$$ with {{LATEX-EXPRESSSION}}
  let offset = 0;
  for (let i = 0; i < num_matches-1; i++) {
    let j = i + 1;
    let match1 = matches[i];
    let match2 = matches[j];

    let start1 = match1.start + offset;
    let end1 = match1.end + offset;
    let start2 = match2.start + offset;
    let end2 = match2.end + offset;

    let latex = md.substring(start1, end2+1);
    let expression = `{{LATEX-EXPRESSSION-${expressions.length}}}`;
    expressions.push(katexRender(latex, true));
    md = md.substring(0, start1) + expression + md.substring(end2 + 1);

    offset += expression.length - latex.length;
    i++;
  }
  return md;
};

const checkForNewline = (md, pos1, pos2) => {
  for(let i = pos1; i < pos2; i++) {
    if(md[i] === '\n') {
      return true;
    }
  }
  return false;
};

const handleSingleDollar = (matches, md) => {
  let num_matches = matches.length;
  // num_matches = num_matches % 2 === 0 ? num_matches : num_matches - 1;

  let offset = 0;
  for (let i = 0; i < num_matches-1; i++) {
    let j = i + 1;
    // console.log(i,j);
    if(checkForNewline(md, matches[i].start+offset, matches[j].start+offset)) {
      continue;
    };

    let match1 = matches[i];
    let match2 = matches[j];

    let start1 = match1.start + offset;
    let end1 = match1.end + offset;   
    let start2 = match2.start + offset;
    let end2 = match2.end + offset;

    let latex = md.substring(start1, end2+1);
    let expression = `{{LATEX-EXPRESSSION-${expressions.length}}}`;
    expressions.push(katexRender(latex, false));
    md = md.substring(0, start1) + expression + md.substring(end2 + 1);

    offset += expression.length - latex.length;
    i++;
  }
  return md;
};

function preProcessMd(md) {
  const matchesDD = tokenizeDoubleDollar(md);
  const renderedDD = handleDoubleDollar(matchesDD, md);
  const matchesSD = tokenizeSingleDollar(renderedDD);
  const renderedSD = handleSingleDollar(matchesSD, renderedDD);
  return renderedSD;
}

function katexRender(texString, displayMode) {
  let html = "";

  // remove all $ from texString start and end
  while (texString[0] === "$") {
    texString = texString.substring(1);
  }
  while (texString[texString.length - 1] === "$") {
    texString = texString.substring(0, texString.length - 1);
  }


  try {
    html = katex.renderToString(texString, { displayMode: displayMode });
  } catch (e) {
    if (e instanceof katex.ParseError) {
      // KaTeX can't parse the expression
      html = ("Error in LaTeX '" + texString + "': " + e.message)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
        // wrap in <strong> to make it more visible
        html = "<strong>" + html + "</strong>";
    } else {
      throw e; // other error
    }
  }
  return html;
}

function mathsExpression(expr) {
  // trim expr till both sides start with $
  while (expr[0] !== "$" && expr.length > 0) {
    expr = expr.substring(1);
  }
  while (expr[expr.length - 1] !== "$" && expr.length > 0) {
    expr = expr.substring(0, expr.length - 1);
  }

  if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
    expr = expr.substr(2, expr.length - 4);
    return katexRender(expr, true);
  } else if (expr.match(/^\$[\s\S]*\$$/)) {
    expr = expr.substr(1, expr.length - 2);
    return katexRender(expr, false);
  }
}

function replaceCodeBlocks(html) {
  html = html.replace(/{{LATEX-EXPRESSSION-\d+}}/g, function(match) {
    const index = parseInt(match.match(/\d+/)[0]);
    return expressions[index];
  });
  return html;
}

function renderMarkdown(md) {
  console.log("Rendering Markdown" + (LaTeXinMD ? " with LaTeX" : ""));
  if (LaTeXinMD) {
    expressions = [];
    const preProcessedMd = preProcessMd(md);
    let html = marked(preProcessedMd);
    html = replaceCodeBlocks(html);
    return html;
  } else {
    return marked(md);
  }
}

module.exports = { renderMarkdown };