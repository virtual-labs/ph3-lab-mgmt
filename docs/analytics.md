### ***Analytics***
<!-- # Table of Contents

1.  [Introduction](#org9ce992a)
2.  [Mechanism for Collecting Analytics](#orgd3e4de1)
3.  [Analytics Setup in pages](#org71468e1)
    1.  [Header Script](#orgfedde5e)
    2.  [Body Snippet](#org8e5e518)
4.  [Lab Analytics](#orga80c890)
5.  [Experiment Analytics](#org8a3dbf9) -->



<a id="org9ce992a"></a>

# Introduction

This document describes the analytics information included in a lab
and experiment page.

The Lab and Experiment pages are tracked for analytics information
using the google analytics service.  This service keeps track usage
information for each page in a given domain.  Currently we collect
analytics for labs hosted in the [vlabs.ac.in](https://vlabs.ac.in/) domain.

The reporting of analytics is done using googld data studio reports
and is publically available [here](https://datastudio.google.com/u/0/reporting/1bVjKkAw-e617LmNE1v_WPdIByVRz2waa/page/5fLPB).

The setup for tracking analytics is done using google tag manager.

**Tag Manager Container: GTM-W59SWTR**


<a id="orgd3e4de1"></a>

# Mechanism for Collecting Analytics

There are two types of information collected for any page by google
analytics:

-   **predefined variable:** Predefined/inbuilt variables are things like
    page url, timestamp etc which is common to all webpages.  No
    configuration is required for these variables.

-   **user defined variables:** These variables are used to store
    additional information related to the page.  For example, in an
    experiment level page, the experiment name is stored in a user
    defined variable.  The [Datalayer](https://support.google.com/tagmanager/answer/6164391?hl=en) facility of google tag manager
    is used to create these variables.

In the next two sections we discuss the datalayer variables for Lab
and Experiment level pages.


<a id="org71468e1"></a>

# Analytics Setup in pages

In order to track any page using google analytics, we need to add two
scripts in the page.


<a id="orgfedde5e"></a>

## Header Script

The header script contains some javascript code provided by google tag
manager along with the `dataLayer` object.

Refer to the Html templates for header scripts in [lab](../lab_build/page-templates/head.handlebars) and [experiment](../exp_build/templates/partials/analytics-head.handlebars)
pages for details.

**NOTE**: The code in the header scripts include the GTM container ID.
It has been hardcoded in the templates and will need to be changed in
the unlikely event that the container ID changes.


<a id="org8e5e518"></a>

## Body Snippet

The body snippet needs to be added at the top of the body (first child
of the body element).

This snippet also contains the GTM container ID and will have to
change when the container ID changes.

The body snippet for the lab pages is included in the
[skeleton.html](../lab_build/skeleton.html) document which is the common template for all lab
pages.

The body snippet for the experiment pages is included in the
[analytics-body.handlebars](../exp_build/templates/partials/analytics-body.handlebars) template.


<a id="orga80c890"></a>

# Lab Analytics

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="org-left" />

<col  class="org-left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="org-left">VARIABLE</th>
<th scope="col" class="org-left">DESCRIPTION</th>
</tr>
</thead>

<tbody>
<tr>
<td class="org-left">labName</td>
<td class="org-left">Name of the Lab</td>
</tr>


<tr>
<td class="org-left">discipline</td>
<td class="org-left">Subject Domain of the Lab</td>
</tr>


<tr>
<td class="org-left">college</td>
<td class="org-left">College Code</td>
</tr>


<tr>
<td class="org-left">phase</td>
<td class="org-left">Phase Number of the Lab</td>
</tr>
</tbody>
</table>

All of these fields are given in the lab-descriptor document.


<a id="org8a3dbf9"></a>

# Experiment Analytics

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="org-left" />

<col  class="org-left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="org-left">VARIABLE</th>
<th scope="col" class="org-left">DESCRIPTION</th>
</tr>
</thead>

<tbody>
<tr>
<td class="org-left">labName</td>
<td class="org-left">Name of the Lab</td>
</tr>


<tr>
<td class="org-left">discipline</td>
<td class="org-left">Subject Domain of the Lab</td>
</tr>


<tr>
<td class="org-left">college</td>
<td class="org-left">College Code</td>
</tr>


<tr>
<td class="org-left">phase</td>
<td class="org-left">Phase Number of the Lab</td>
</tr>


<tr>
<td class="org-left">expName</td>
<td class="org-left">Experiment Name</td>
</tr>


<tr>
<td class="org-left">expShortName</td>
<td class="org-left">Experiment Short Name</td>
</tr>
</tbody>
</table>

All of these fields are given in the lab-descriptor.

**NOTE**: **Please get all the fields verified before building a lab.**

