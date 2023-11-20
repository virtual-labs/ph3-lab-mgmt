### ***Plugins***
<!-- # Table of Contents

1.  [Introduction](#org906655f)
2.  [Plugin Arcitecture](#org190ceb5)
    1.  [Core](#org6f17190)
    2.  [Extensions/Plugins](#orgeae5869)
        1.  [Analytics](#org035abd6)
3.  [References](#org0258cd2) -->



<a id="org906655f"></a>

# Introduction

This document describes the components of the lab and experiment
architecture that can be redesigned as independent systems and
included in the the lab architecture


<a id="org190ceb5"></a>

# Plugin Arcitecture

The plugin architecture is based on the idea of separating the core
application from additional features in order to achieve the
following:

-   **Ease of Extension:** When the application is modelled as a
    composition of several features put together as independent
    plugins, it becomes easy to add/remove/modify the features as and
    when needed.

-   **Plugins can be indenpendently developed and maintained:** Plugins
    can be devloped by as separate projects that can be simply
    imported and used by the core system.

There are two main components in a plugin based system: The Core and
Extensions.


<a id="org6f17190"></a>

## Core

The core is the basic application.  This core is kept as simple as
possible and only conatains business logic.  All the features are
separated into plugins.

In case of the lab build process, the core of the application consists
of the lab and experiment related data (lab name, broad area, list of
experiments etc.) and logic (processing pipeline, url schemes,
configurations etc.).


<a id="orgeae5869"></a>

## Extensions/Plugins

Any feature that is not related to the application domain, can be
separated as a plugin.  In the Lab and Experiment build processes the
following features can be separated as plugins.

-   Page
-   Content Rendering
-   Content Dependency Validation
-   Analytics
-   Feedback
-   Discussion Forum
-   Ratings


<a id="org035abd6"></a>

### Analytics

Analytics feature tracks the usage of lab and experiment webpages.
This feature is not unique to the Virtual Labs.  It is widely used by
websites to measure the activities of visiting users.  As a result
there are several tools available for performing website analytics.
Currently we at Virtual Labs use Google Analytics, but it is not the
only option avaiable.

Additionally, there are scenarios where analytics is not needed.  For
example, while developing and testing an experiment/lab, analytics is
not required.  So, we need the ability to enable/disable analytics.

The details of analytics are provided in [this](./analytics.md) document.

As of now, the process to add analytics to any page is included in the
page building process which in turn depends of the kind of page (is it
a lab page or an experiment page).

The first step towards creating a plugin for analytics requires
separating the page building process from the core.


<a id="org0258cd2"></a>

# References

<https://medium.com/omarelgabrys-blog/plug-in-architecture-dec207291800>

