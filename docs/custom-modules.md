---
title: Custom Modules
author: "Shreyash Jain and Aditya Malhotra"
audience: "Experiment Developer"
date: 2023-05-11T13:49:21.348Z
phase: "Ext Phase 3"
summary: "This document describes how to add custom modules to the experiment."
tags: []
---

## Introduction
In an experiment, there are several theoretical pages like procedure, theory etc. The developer is supposed to write the contents of those pages in a markdown file, later these markdown files are rendered. To render the build script uses the virtual labs CSS and JS. There might be cases that a developer wants to add his own CSS and JS modules to add further functionality to their experiments.  
The new build script allows developers to add their own CSS/JS either as a file or a CDN link.


## How to Use
The developer needs to specify the CSS/JS files in the experiment-descriptor.json file. The developer can specify the CSS/JS files in the following way:

```json
{
    "target": "procedure.html",
    "source": "procedure.md",
    "js_modules" : ["procedure.js","https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.js"],
    "css_modules" : ["procedure.css","https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.css"],
    "label": "Procedure",
    "unit-type": "task",
    "content-type": "text"
}
```

As shown in the above snippet the js modules and the css modules will be added to the procedure.html page. The developer can specify the modules for every page in the experiment-descriptor.json file.

## How to verify
To verify, deploy the experiment and check if the CSS/JS modules are added to the page or not.

## Important points to note
1. The developer can specify the CSS/JS files in the experiment-descriptor.json file.
2. The developer can specify the CSS/JS files either as a file or a CDN link.
3. The developer can specify the CSS/JS files for every page in the experiment-descriptor.json file as long as the unit-type is task.