### ***Lab Descriptor***
<!-- # Table of Contents

1.  [Introduction](#orgd4ec3cd)
2.  [Lab Descriptor Structure](#orge1e90a9)
3.  [Experiment](#org20d37da)
    1.  [Example](#org1509e00)
4.  [Empty Lab descriptor](#org5b2ccda)
5.  [Sample Lab Descriptor](#org9faf911) -->



<a id="orgd4ec3cd"></a>

# Introduction

Lab Descriptor is a json file that contains information about
generation, and deployment of lab pages and related experiments.


<a id="orge1e90a9"></a>

# Lab Descriptor Structure

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">
<colgroup>
<col  class="org-left" />

<col  class="org-left" />

<col  class="org-left" />

<col  class="org-left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="org-left">Field</th>
<th scope="col" class="org-left">Sub Field</th>
<th scope="col" class="org-left">Type</th>
<th scope="col" class="org-left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="org-left"><b>broadArea</b></td>
<td class="org-left"><i>name</i></td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Broad Area (Domain) name</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left">&#xa0;</td>
<td class="org-left"><i>link</i></td>
<td class="org-left"><code>URL</code></td>
<td class="org-left">Link to the page on vlab.co.in that lists all labs in the domain.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>baseUrl</b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>URL</code></td>
<td class="org-left">A URL has <code>host</code> and <code>url-path</code>.  baseUrl contains the <code>host</code> part of the lab.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>lab</b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Lab name used in google analytics.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>lab<sub>display</sub><sub>name</sub></b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Lab name as displayed on lab pages.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>deployLab</b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>Boolean</code></td>
<td class="org-left">Should the lab be deployed?</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>phase</b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>number</code></td>
<td class="org-left">Virtual Labs Phase</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>collegeName</b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Name of authoring college.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>introduction</b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Contents of the <code>Introduction.html</code> page.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>experiments</b></td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>List Experiment</code></td>
<td class="org-left">List of Experiments.  Each item in this list is an <code>Experiment</code> object.  <code>Experiment</code> object is described <a href="#orgc7f1d57">here</a>. This list is used for populating the <code>List Of Experiments.html</code> page</td> and for deployment of experiments.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>experiment-sections</b></td>
<td class="org-left"><i>sect-name</i></td>
<td class="org-left"><code>String</code></td>
<td class="org-left">This is required when list of experiments is a nested list. (ex: Data Structures Lab). Otherwise just use <b>experiments</b> and ommit <b>experiment-sections</b>.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left">&#xa0;</td>
<td class="org-left"><i>experiments</i></td>
<td class="org-left"><code>List Experiment</code></td>
<td class="org-left">List of experiments in a section.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>targetAudience</b></td>
<td class="org-left"><i>UG</i></td>
<td class="org-left"><code>List String</code></td>
<td class="org-left">List of UG degrees, that the lab is targeted towards.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left">&#xa0;</td>
<td class="org-left"><i>PG</i></td>
<td class="org-left"><code>List String</code></td>
<td class="org-left">List of PG degrees that the lab is targeted towards.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>objective</b> [optional]</td>
<td class="org-left">&#xa0;</td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Content for <code>Objective.html</code> page. This field is optional.  If this is omitted then <code>Objective.html</code> page is not generated.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>courseAlignment</b></td>
<td class="org-left"><i>description</i></td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Content for <code>Course Alignment.html</code> page.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left">&#xa0;</td>
<td class="org-left"><i>universities</i></td>
<td class="org-left"><code>List String</code></td>
<td class="org-left">Content for <code>Course Alignment.html</code> page.</td>
</tr>
</tbody>
</table>


<a id="org20d37da"></a>

# Experiment

Each experiment record should contain the following information:

<table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">


<colgroup>
<col  class="org-left" />

<col  class="org-left" />

<col  class="org-left" />

<col  class="org-left" />
</colgroup>
<thead>
<tr>
<th scope="col" class="org-left">Field</th>
<th scope="col" class="org-left">Type</th>
<th scope="col" class="org-left">Source</th>
<th scope="col" class="org-left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td class="org-left"><b>name</b></td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Hosting Request</td>
<td class="org-left">Name of the Experiment as displayed on the Experiment pages.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>short-name</b></td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Hosting Engineer</td>
<td class="org-left">Unique short name for the experiment. <br/> Used in the url path for the experiment.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>repo</b></td>
<td class="org-left"><code>URL</code></td>
<td class="org-left">Hosting Request</td>
<td class="org-left">URL of the remote repository for the experiment sources.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>tag</b></td>
<td class="org-left"><code>String</code></td>
<td class="org-left">Hosting Request</td>
<td class="org-left">Tag of the repository to be used.</td>
</tr>
</tbody>
<tbody>
<tr>
<td class="org-left"><b>deploy</b></td>
<td class="org-left"><code>Boolean</code></td>
<td class="org-left">Hosting Engineer</td>
<td class="org-left">Should the experiment be deployed.</td>
</tr>
</tbody>
</table>

The information comes from two sources: Hosting Request and Hosting
Engineer.  The hosting engineer has to provide a unique `short-name`
for the experiment which is used for the experiment deployment path.
All other values should be taken from the Hosting Request.


<a id="org1509e00"></a>

## Example

    
    {
        "name": "Performance Characteristics of Centrifugal Pump",
        "short-name": "centrifugal-pump",
        "repo": "http://vlabs.ac.in/gitlab/central-hosting/fluid/centrifugal-pump-nitk.git",
        "tag": "v1.0.1",
        "deploy": true
    }


<a id="org5b2ccda"></a>

# Empty Lab descriptor

Following is a lab descriptor file which has not been filled.  Use
this as a starting point to create the lab descriptor for your lab.

    {
        "broadArea": {
    	"name": "",
    	"link": ""
        },
        "lab": "",
        "lab_display_name": "",
        "deployLab": ,
        "phase": ,
        "collegeName": "",
        "baseUrl": "",
        "introduction": "",
        "experiments": [],
        "targetAudience": {
    	"UG": [],
    	"PG": []
        },
        "objective": "",
        "courseAlignment": {
    	"description": "",
    	"universities": []
        }
    }


<a id="org9faf911"></a>

# Sample Lab Descriptor

Following lab descriptor is used for testing.

    
    {
        "broadArea": {
    	"name": "Civil Engineering",
    	"link": "http://vlab.co.in/broad-area-civil-engineering"
        },
        "lab": "Fluid Machinery",
        "lab_display_name": "Fluid Machinery",
        "deployLab":true,
        "phase": 3,
        "collegeName": "NITS",
        "baseUrl": "http://localhost",
        "introduction": "Welcome to fluid macninery lab!",
        "experiments": [
    	{
    	    "name": "Performance Characteristics of Centrifugal Pump",
    	    "short-name": "centrifugal-pump",
    	    "repo": "http://vlabs.iitb.ac.in/gitlab/vlabs-dev-central-hosting/fluid-machinery-nitk/performance-characteristics-centrifugal-pump-nitk.git",
    	    "tag": "v1.0.0",
    	    "deploy": true
    	},
    	{
    	    "name": "Performance Characteristics of Hydraulic Ram",
    	    "short-name": "hydraulic-ram",
    	    "repo": "http://vlabs.iitb.ac.in/gitlab/vlabs-dev-central-hosting/fluid-machinery-nitk/performance-characteristics-hydraulic-ram-nitk.git",
    	    "tag": "v1.0.0",
    	    "deploy": true
    	}
        ],
        "targetAudience": {
    	"UG": [
    	    "B. Tech./ B.E in Civil Engineering"
    	],
    	"PG": [
    	    "MS/Ph. D. Beginners in Civil Engineering and related topics"
    	]
        },
        "objective": "Hello World.",
        "courseAlignment": {
    	"description": "course are listed here:",
    	"universities": [
    	    "Visvesvaraya Technological University Karnataka",
    	    "National Institute of Technology Karnataka Karnataka",
    	    "Anna University Tamil Nadu",
    	    "SRM University Delhi - NCR Sonepat Haryana",
    	    "University of Kerala Kerala",
    	    "APJ Abdul Kalam Technological University Kerala",
    	    "CUSAT Kerala"
    	]
        }
    }  

