# Experiment UI - Side Menu

## INTRODUCTION
This document describes the side menu of the experiment user interface.

## PURPOSE OF THE SIDE MENU
The side menu is intended as a navigation tool for the user. It allows the user to navigate different parts/units of the experiment that are divided into different pages. The side menu highlights the current page to make it easy for the user to track their location in the experiment.

## FEATURES
The side menu provides the following features:

### Links to all the pages in the experiment
The side menu provides links to all the pages in the experiment. The default pages currently supported are:
1. Aim - aim.md
2. Theory - theory.md
3. Pretest - pretest.json - [Instructions](https://github.com/virtual-labs/ph3-exp-template/blob/main/experiment/README.md) to populate this file
4. Procedure - procedure.md
5. Simulation - populate simulation directory
6. Posttest - posttest.json - [Instructions](https://github.com/virtual-labs/ph3-exp-template/blob/main/experiment/README.md) to populate this file
7. Contributors - contributors.md - Captures the names and contact information of SME's and the developers of the experiment. If required the developer may change the presentation template and also add a Credit section to this file.
8. References/Further Reading - references.md
9. Feedback - It is populated by the script and does not need any inputs from the developer

This menu can be customized by making changes to the experiment-descriptor.json as detailed [here](https://github.com/virtual-labs/ph3-lab-mgmt/blob/master/docs/exp-build-process.md#experiment-descriptor).

### Highlights the link to the current page
To facilitate tracking the current page, the side menu highlights the link to the current page in a different text color.

### Drawers for links to nested units
There are three kinds of units: Learning Unit, Task, and Aim. Out of these units, only Task and Aim units have a page. Learning units do not have a page. This difference is reflected in the side menu as follows:

1. TASK AND AIM : For Task and Aim units, the side menu provides links to the corresponding pages.
2. LEARNING UNIT : Learning units do not have pages associated with them. The side menu has a drawer in place of a link for each learning unit. The drawer groups all links to the units within the learning unit and the user can open/close the drawer to access the links contained within.