## ***Experiment Build Process***

<!-- 
# Table of Contents

1.  [Introduction](#orgbc1a952)
2.  [Conceptual Model of an Experiment](#org825ff54)
    1.  [Learning Unit](#org5ae5469)
        1.  [Concept of a Learning Unit](#orga68baa2)
        2.  [Structure and Properties of a Learning Unit](#org19188b8)
    2.  [Task](#org1c152e4)
        1.  [Concept of a Task](#org1d97c4e)
        2.  [Structure and Properties of a Task](#orgceac549)
3.  [Experiment Webpages](#orgb943c47)
    1.  [Relation between Learning Units, Tasks and Pages](#orgb470594)
    2.  [Contents supported for Task Pages](#org2939830)
        1.  [Text](#orgc5dfcfc)
        2.  [Video](#org28aa73b)
        3.  [Simulation](#org9754ca0)
        4.  [Assesment](#org27114f9)
    3.  [URL Scheme for a page](#org5f9aa4f)
    4.  [The Feedback Page](#orgb4b883b)
4.  [Experiment Descriptor](#org4901519)
    1.  [Elements of a descriptor](#org67ebb7e)
        1.  [Task Object](#org10ed044)
        2.  [Learning Unit Object](#org288aaaa)
        3.  [Aim Object](#org4d12b73)
    2.  [Default Descriptor](#org0b6e956)
    3.  [Structure of an experiment descriptor](#orgfa98c6d)
        1.  [Problems and Limitations of the experiment descriptor](#org42292e9)
    4.  [Unit Types](#orgc376080) -->



<a id="orgbc1a952"></a>

# Introduction

This document describes the Experiment UI build process.


<a id="org825ff54"></a>

# Conceptual Model of an Experiment

An experiment is divided into several *learning units* and *tasks*.
Learning Units and Tasks are logical units of an experiment that we
discuss in the next few sections.


<a id="org5ae5469"></a>

## Learning Unit


<a id="orga68baa2"></a>

### Concept of a Learning Unit

A Learning Unit is a pedagogical term used to denote a set of learning
material including lessons, exercises and evaluations aimed at
teaching a particular subset of topics to be covered in a course.

The students have to perform a set of activities of various kind in
order to achieve the learning objectives of the learning unit.  We
refer to these activities as *Tasks*.


<a id="org19188b8"></a>

### Structure and Properties of a Learning Unit

Learning Units have the following properties:

-   **AIM:** A learning unit always has an aim/learning objective.  This
    aim outlines the topics and concepts that the students are
    expected to learn from a given learning unit.

-   **Sub Learning Units:** A learning unit can be further divided into
    more than one learning units.  This is useful when a topic is
    huge and consists of several sub-topics that require detailed
    study.

-   **Tasks:** There can be several tasks in a learning unit.  Each task
    corresponds to a learning activity that the students need
    to perform.


<a id="org1c152e4"></a>

## Task


<a id="org1d97c4e"></a>

### Concept of a Task

A Learning Unit can be divided into several smaller Learning Units and
Tasks.  Currently, Tasks are the lowest logical units in any
experiment and cannot be further divided.  A task corresponds to a
single activity that the students need to perform.


<a id="orgceac549"></a>

### Structure and Properties of a Task

-   **Content Type:** Each Task has one of the following content types:
    -   Text
    -   Video
    -   Assesment
    -   Simulation

-   **Source:** File used to build the page related to that task.  The
    nature of this source document depends on the content type
    and is discussed in the sections on the relevant content
    types.

-   **Target:** The Html page to be generated for this task.  Each task
    has a corresponding Html page related to it that contains
    the content related to this task.


<a id="orgb943c47"></a>

# Experiment Webpages

A Virtual Labs Experiment is a collection of webpages containing the
learning material for the topics covered in the Experiment.  These
webpages are built using content provided by the subject matter
experts and it can be in several formats.  The resulting page and it's
build process depends on the nature of the content.


<a id="orgb470594"></a>

## Relation between Learning Units, Tasks and Pages

-   **Learning Unit:** A learning unit itself does not have a page
    associated with it.  A learning unit has a set of
    sub-units and tasks.

-   **Task:** Each task has exactly one page associated with it.  The kind
    of page that is generated for a task depends on the content
    type of the task.


<a id="org2939830"></a>

## Contents supported for Task Pages

Each task has a corresponding webpage associated with it.  This page
is generated as a result of the build process.  The build process of a
page depends on the content type of the task.

In the following sections we discuss the different content types and
build process details.


<a id="orgc5dfcfc"></a>

### Text

A Task with the "text" content type contains reading meterial for the
learner.  It contains mostly textual information and may include
images and hyperlinks.

**NOTE** : **text content may not contain videos.**

-   **Source:** A page of text type requires a markdown document
    containing the source of text.  This markdown document is
    used to build the final page for the task.

-   **Target:** The target page is build using the markdown source.  The
    markdown content is processed throught a markdown parser
    and the resulting html is added to the common page
    template.


<a id="org28aa73b"></a>

### Video

A Task with "video" content type contains at least one video in the
task page.  It can also have additional information in the form of
text, images and hyperlinks.

All the processing for video content type is similar to "text" type.

1.  What is the difference between text and video content types?

    -   **For Authors:** -   Text content cannot have embedded video.
        -   Video content must have at least one embedded video.
    
    -   **For Developers:** -   Embedded videos in "video" type pages need to be processing with
            analytics information.
        -   If there are embedded videos in a "text" source document, the
            processing should fail with appropriate error message.
        -   If there is no embedded video in a "video" source document, the
            processing should fail with appropriate error message.

2.  **Implementation Status**

    Video and text content types are processed the same way.  The
    analytics injection in embedded video pages is to be implemented.


<a id="org9754ca0"></a>

### Simulation

A Simulation type page contains interactive simulations that
demonstrate the concepts learned in the reading material/ videos.  A
simulation is an html document along with all it's assets (css, js,
images, etc.) required to run the simulation.  These pages are
embedded in the corresponding task page using iframes.

-   **Source:** The html document that contains the simulation.
-   **Target:** The task page is built by inserting an iframe in the
    common template.  This iframe points to the source html
    document.

One task page can only contain a single simulation.


<a id="org27114f9"></a>

### Assesment

Assesment type page contains multiple-choice questions related to the
material in the learning unit.

-   **Source:** The questions in an assesment are written in a js module
    with a predefined format that contains questions along
    with assesment code.  The source should provide link to
    this document.
-   **Target:** Page corresponding to the assesment task.  The source is
    included as a script in the task page.


<a id="org5f9aa4f"></a>

## URL Scheme for a page

-   **github pages:** `https://virtual-labs.github.io/><file-path>`
-   **vlab website:** `https://<lab-code>.vlabs.ac.in/<lab-name>/exp/<file-path>`

*lab-code* refers to the 2-3 letter code used for the sub-domain of
the lab.  For example: *de-iitr* for IITR Digital Electronics Labs,
*ds1* and *ds2* for IIITH data structures labs.

Each learning unit has a different directory for all its content.  So, the filepath for any page is \<base-dir-name>/\<filename>.


<a id="orgb4b883b"></a>

## The Feedback Page


<a id="org4901519"></a>

# Experiment Descriptor

The experiment descriptor is a json document that provides information
about all the learning units and tasks in an experiment, that is
required to build an experiment.

The `experiment-descriptor.json` needs to be provided by the
experiment authors in the root of the experiment repository.  If it is
not present then a [deafult descriptor](../default-experiment-descriptor.json) is used.


<a id="org67ebb7e"></a>

## Elements of a descriptor


<a id="org10ed044"></a>

### Task Object

A Task Object describes a task.  For example:

    {
      "unit-type": "task",
      "label": "Overview",
      "LaTeXinMD": "boolean",
      "content-type": "video",
      "source": "overview.md",
      "target": "overview.html"
    }

The above json object represents a task.  It is identified as a task
by the field `unit-type`.

The `label` field is used as a label for the unit's link in the
sidemenu.

The `content-type` field describes the type of content in the target
html page generated for this unit.

The `source` field gives a relative link to the source document
required to build the page to be generated for the task.  The path of
the page to be generated is given in the `target` field.


<a id="org288aaaa"></a>

### Learning Unit Object

A Learning Unit object describes a learning unit.  For example: 

    {
      "unit-type": "lu",
      "label": "Bubble Sort",
      "basedir": "bubble-sort",
      "units": [...]
    
    }

The above object describes a learning unit.  Observe that a learning
unit does not have source and target fields.  This is because no page
is generated for a learning unit.  Pages are only generated for tasks
in a learning unit.

Some additional fields:

-   **basedir:** This field gives relative path to the directory that
    contains all the contents (tasks and units) in this unit.
    All the tasks and units use this directory as root and
    relative paths are computed accordingly.

-   **LaTeXinMD:** This feild gives LaTeX support into the markdown using KaTeX integration. The feature is controlled by a flag which needs to put on the experiment descriptor.

-   **units:** This is a list of units (Tasks and LUs) that are contained
    within this learning unit.


<a id="org4d12b73"></a>

### Aim Object

Each Learning Unit needs to have an Aim.  This aim describes the
learning objectives of a unit.  This Aim Object denotes the fact that
an Aim is required in this learning unit.

**Each learning unit should have the aim object as the first object in
its list of units.** (This is not enforced as of now, but it is a good
practice.)

The aim object looks as follows:

    {
      "unit-type": "aim"
    }

An aim object is a special case of task, and is similar to the
following task:

    {
      "unit-type": "task",
      "label": "Aim",
      "content-type": "text",
      "source": "aim.md",
      "target": "index.html"
    }


<a id="org0b6e956"></a>

## Default Descriptor

-   assumptions

-   the experiment authors follow the experiment structure prescribed by
    the template.
    -   The directory structure is preserved.
    -   The file names remain the same and are used for the intended
        purpose.
    -   Refer to the [default descriptor](../default-experiment-descriptor.json) for details.

-   failure scenarios 
    -   The main reason for why the experiment build process fails is
        missing files.
    
    -   **How does the build script know which files to look for?**
        -   The experiment build process depends on the experiment
            descriptor for all the experiment structure related information.
            The experiment descriptor is a json document that lists all the
            learning units and tasks in an experiment.  It contains
            information regarding the html pages to build for each unit and
            their dependencies in the form of relative file paths.  The
            build script looks for each of these dependencies in the given
            path in the experiment repository and it exits with failure if
            any of the dependent files are missing.  The experiment
            descriptor is written by the authors but it is optional and
            usually not needed.  If the authors do not write the experiment
            descriptor then a default descriptor is used.
    
    -   **There are two possible scenarios:** 
        1.  Custom Experiment Descriptor - If the authors have provided an
            experiment descriptor in the root directory of the experiment
            repository.  This is done when a different experiment structure
            is required from the one given in the template.
        
        2.  Default Experiment Descriptor - This is the most common
            scenario.  The authors do not provide any experiment descriptor
            and follow the prescribed experiment template.  In this case
            the default experiment descriptor is used.


<a id="orgfa98c6d"></a>

## Structure of an experiment descriptor

The experiment descriptor contains a single Learning Unit object that
acts as the root unit for the experiment.

See [this](https://github.com/virtual-labs/exp-bubble-sort-iiith/blob/main/experiment-descriptor.json) descriptor for an example


<a id="org42292e9"></a>

### Problems and Limitations of the experiment descriptor

The experiment descriptor is intended to provided a mechanism to make
the experiment structure more flexible.  The authors get the freedom
to define their own directory structure and file names and divide
their experiment into several learning units.  However, the current
implementation supports this under certain limits.  In this section we
didcuss the limitations of the functionalities supported by the
experiment descriptor.

1.  No support for Nested Learning Units

    The experiment descriptor is designed with flexibility in mind.  It
    allows for a recursive structure where each learning unit can contain
    several nested units.  But, the current implementation does not
    support this.  It assumes the following:
    
    -   The top level learning unit that represents the experiment contains
        all the learning units listed as its direct children in the "units"
        field.
    
    -   The inner learning units contain only tasks, no learning units.
    
    The main challenge in supporting nested learning units is the
    structure and functioning of the side menu.  The side menu is a list
    of links to all the units in the experiment that is presented at the
    left side of each page in the experiment.  The details of the side
    menu are discussed [here](exp-side-menu.md).  The side menu contains a drawer for each
    learning unit that contains links to all the units contained in that
    unit.
    
    The challenge is to design the user interface that facilitates easy
    navigation with nested drawers for nested learning units.  The drawers
    a separated from each other visually by a horizontal left margin that
    represents its level in the heirarchy and when you go deeper in the
    nested structure it might be difficult to accomodate the spacing.

2.  The Label field in the top level unit object

    The top level object is a learning unit that represents the entire
    experiment.  A learning unit object has a **label** field which is used
    as a label for the side menu drawer for that unit.  Because the side
    menu does not have a drawer for the experiment unit this is field is
    not used anywhere.
    
    This can cause confusion to the authors who might assume that this
    field is used for the name of the experiment whereas the experiment
    name comes from the "experiment-name.md" document.


<a id="orgc376080"></a>

## Unit Types

-   **lu:** Learning Unit
-   **task:** Task
-   **aim:** Aim

