const marked = require("marked");
const katex = require("katex");
const Config = require("../config.js");
const path = require("path");
const shell = require("shelljs");
const args = require("minimist")(process.argv.slice(2));
const log = require("../logger.js");


let src = ".";
if(args.src)
{
  src = args.src;
  src = path.resolve(Config.PROJECT_ROOT, src);
}

let LaTeXinMD = true;
let expressions = [];
let descriptorPath = path.resolve(
  src,
  `${Config.Experiment.descriptor_name}`
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
  for (let i = 0; i < num_matches - 1; i++) {
    let j = i + 1;
    let match1 = matches[i];
    let match2 = matches[j];

    let start1 = match1.start + offset;
    let end1 = match1.end + offset;
    let start2 = match2.start + offset;
    let end2 = match2.end + offset;

    let latex = md.substring(start1, end2 + 1);
    let expression = `{{LATEX-EXPRESSSION-${expressions.length}}}`;
    expressions.push(katexRender(latex, true));
    md = md.substring(0, start1) + expression + md.substring(end2 + 1);

    offset += expression.length - latex.length;
    i++;
  }
  return md;
};

const checkForNewline = (md, pos1, pos2) => {
  for (let i = pos1; i < pos2; i++) {
    if (md[i] === "\n") {
      return true;
    }
  }
  return false;
};

const handleSingleDollar = (matches, md) => {
  let num_matches = matches.length;
  // num_matches = num_matches % 2 === 0 ? num_matches : num_matches - 1;

  let offset = 0;
  for (let i = 0; i < num_matches - 1; i++) {
    let j = i + 1;
    // console.log(i,j);
    if (
      checkForNewline(md, matches[i].start + offset, matches[j].start + offset)
    ) {
      continue;
    }

    let match1 = matches[i];
    let match2 = matches[j];

    let start1 = match1.start + offset;
    let end1 = match1.end + offset;
    let start2 = match2.start + offset;
    let end2 = match2.end + offset;

    let latex = md.substring(start1, end2 + 1);
    let expression = `{{LATEX-EXPRESSSION-${expressions.length}}}`;
    expressions.push(katexRender(latex, false));
    md = md.substring(0, start1) + expression + md.substring(end2 + 1);

    offset += expression.length - latex.length;
    i++;
  }
  return md;
};


// function to detect maths expression and replace it with {{LATEX-EXPRESSSION}} keyword
function preProcessData(md) {
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
  html = html.replace(/{{LATEX-EXPRESSSION-\d+}}/g, function (match) {
    const index = parseInt(match.match(/\d+/)[0]);
    return expressions[index];
  });
  return html;
}

function renderMarkdown(md) {
  log.debug("Rendering Markdown" + (LaTeXinMD ? " with LaTeX" : ""));
  if (LaTeXinMD) {
    expressions = [];
    const preProcessedMd = preProcessData(md);
    let html = marked(preProcessedMd);
    html = replaceCodeBlocks(html);
    return html;
  } else {
    return marked(md);
  }
}

function renderJSON(json) {
  log.debug("Rendering JSON");
  json = JSON.parse(json);

  // check for versioning
  if (json.version) {
    let questions = json.questions;
    questions.forEach((question) => {
      // render question
      let processedQuestion = preProcessData(question.question);
      let questionHTML = replaceCodeBlocks(processedQuestion);
      question.question = questionHTML;

      // render answers
      let answers = question.answers;
      for (option in answers) {
        let answer = answers[option];
        let processedAnswer = preProcessData(answer);
        let answerHTML = replaceCodeBlocks(processedAnswer);
        question.answers[option] = answerHTML;
      }

      // render explanations
      let explanations = question.explanations;
      for (option in explanations) {
        let explanation = explanations[option];
        let processedExplanation = preProcessData(explanation);
        let explanationHTML = replaceCodeBlocks(processedExplanation);
        question.explanations[option] = explanationHTML;
      }
    });
  }
  else {
    // older version, list of objects
    json.forEach((element) => {

      let question = element.question;
      let answers = element.answers;
      let corectAnswer = element.correctAnswer;

      // render question
      let processedQuestion = preProcessData(question);
      let questionHTML = replaceCodeBlocks(processedQuestion);
      element.question = questionHTML;

      // render answers
      for (option in answers) {
        let answer = answers[option];
        let processedAnswer = preProcessData(answer);
        let answerHTML = replaceCodeBlocks(processedAnswer);
        element.answers[option] = answerHTML;
      }

      // render correct answer
      let processedCorrectAnswer = preProcessData(corectAnswer);
      let correctAnswerHTML = replaceCodeBlocks(processedCorrectAnswer);
      element.correctAnswer = correctAnswerHTML;
    });
  }

  return JSON.stringify(json);
}

module.exports = { renderMarkdown, renderJSON };
