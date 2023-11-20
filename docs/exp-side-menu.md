### ***Experiment UI - Side Menu***
<!-- # Table of Contents

1.  [INTRODUCTION](#org8898f3a)
2.  [PURPOSE OF THE SIDE MENU](#org5685f19)
3.  [FEATURES](#orgc72f612)
    1.  [Links to all the pages in the experiment](#orgd9cf273)
    2.  [Highlights the link to the current page](#orgb36561b)
    3.  [Drawers for links to nested units](#orgecd5216)

-->

<a id="org8898f3a"></a>

# INTRODUCTION

This document describes the side menu of the experiment user
interface.


<a id="org5685f19"></a>

# PURPOSE OF THE SIDE MENU

The side menu is intended as navigation tool for the user.  It allows
the user to navigate different parts/units of the experiment that are
divided into different pages.  The side menu highlights the current
page to make it easy for the user to track their location in the
experiment.


<a id="orgc72f612"></a>

# FEATURES

The side menu provides the following features:


<a id="orgd9cf273"></a>

## Links to all the pages in the experiment

The side menu provies links to all the pages in the experiment. The default pages currently supported are - 

1.  Aim - aim.md
2.  Theory - theory.md
3.  Pretest - pretest.json - [Instructions](https://github.com/virtual-labs/ph3-exp-template/blob/main/experiment/README.md) to populate this file
4.  Procedure - procedure.md
5.  Simulation - populate simulation directory
6.  Posttest - posttest.json - [Instructions](https://github.com/virtual-labs/ph3-exp-template/blob/main/experiment/README.md) to populate this file
7.  Contributors - contributors.md - Captures the the names and contact information of SME's and the developers of the experiment. If required the developer    may change the presentation template and also add a Credit section to this file.
8.  References/Further Reading - references.md
9.  Feedback - It is populated by the script and does not need any inputs from the developer

This menu can be customized by making changes to the experiment-descriptor.json as detailed [here](./exp-build-process.md#org4901519). 


<a id="orgb36561b"></a>

## Highlights the link to the current page

To facilitate tracking the current page, the side menu highlights the
link to the current page in a different text color.


<a id="orgecd5216"></a>

## Drawers for links to nested units

Ther are three kinds of units: Learning Unit, Task, and Aim.  Out
these units, only Task and Aim units have a page.  Learning units do
not have a page.  This difference is reflected in the side menu as
follows:

-   **TASK AND AIM:** For Task and Aim units, the side menu provides links
    to the corresponding pages.

-   **LEARNING UNIT:** Learning units do have pages associated with them.
    The side menu has a drawer in place of a link for
    each learning unit.  The drawer groups all links to
    the units within the learning unit and the user can
    open/close the drawer to access the links contained
    within.
    
    If drawer that contains the link to the current
    page is open by default.

