const marked = require("marked");
const katex = require("katex");

const renderer = new marked.Renderer();

function preProcessMd(md) {
  // Replace all $$...$$ with `$$...$$` to prevent them from being processed as code
  md = md.replace(/\$\$[\s\S]*?\$\$/g, function (match) {
    return "`" + match + "`";
  });

  // Replace all $...$ with `$...$` and ignore everything in between `` to prevent them from being processed as code
  for (let i = 0; i < md.length; i++) {
    if (md[i] === "`") {
      i++;
      while (md[i] !== "`") {
        i++;
      }
    } else if (md[i] === "$") {
      md = md.slice(0, i) + "`" + md.slice(i);
      i = i + 2;
      while (md[i] !== "$") {
        i++;
      }
      i++;
      md = md.slice(0, i) + "`" + md.slice(i);
      i++;
    }
  }
  return md;
}

function mathsExpression(expr) {
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
  const preProcessedMd = preProcessMd(md);
  return marked(preProcessedMd, { renderer: renderer });
}


module.exports = {renderMarkdown};

