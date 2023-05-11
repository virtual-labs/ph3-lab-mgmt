---
title: latex
author: "Shreyash Jain and Aditya Malhotra"
audience: "Experiment Developer"
date: 2023-05-11T13:49:21.348Z
phase: "Ext Phase 3"
summary: "This document describes the how to enable the latex support in your experiment."
tags: []
---

## Introduction
We have incorporated the support for rendering math following the commonly used KaTeX syntax into our build pipeline.
You can write KaTeX syntax in both Markdown as well as Assessment(JSON) files. Which will be rendered into maths automatically by our tool.

## How to use
To enable LaTeX rendering in your experiment, you need to add the following line in your experiment descriptor file:
```json
"LaTeXinMD": true
```

## How to verify
To verify that the LaTeX is working properly, you can add the following line in your Markdown file:
```markdown
$$
\frac{1}{2}
$$
```
This will render the following equation:
$$
\frac{1}{2}
$$

You can view the rendered equation in the deployed experiment.

## Important Points
1. You can use LaTeX in both Markdown and Assessment(JSON) files.
2. You need to add the following line in your experiment descriptor file to enable LaTeX in Markdown files:
```json
"LaTeXinMD": true
```
3. LaTeX is enabled by default in Assessment(JSON) files.


