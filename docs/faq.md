# Frequently Asked Questions

## What is a Lab?

A Lab is a collection of virtual experiments on a particular topic
provided to the students in the form of webpages and can be found at
[www.vlab.co.in](https://www.vlab.co.in/).


## What do you mean by the Lab build process?

A Lab is published in the form of a collection of webpages consisting
of all the learning material divided into experiments.  The lab build
process is responsible for building these webpages using the source
material created by the lab authors.  The experiment build process is
a part of the lab build process and is responsible for building the
webpages for a particular experiment in the lab.

Details about the complete lab build process can be found [here](./lab-build-process.org).


## What is the difference between developing a lab and building a lab?

### Lab Development

A lab is developed by subject matter experts at different
universities.  The lab development process involves writing the
necessary information about the lab as well as creating learning
material for each experiment (which includes creating reading
material, assesment quizzes, instructional videos, and most
importantly the interactive simulations).

The details of lab related information to be provided can be found
here.

After development of a lab is complete the development team has to
create a hosting request to get the lab published.  The details of the
process to get a lab published can be found here.

All labs are published by the VLEAD Team at IIIT Hyderabad.  To
publish a lab, the lab sources (including the experiments) have to be
first converted into webpages.  This is done by the lab build process.


### Lab Building

Upon recieving a hosting request for a lab, the hosting team at VLEAD
takes the lab information and experiment sources, and generates the
webpages for the lab related information and for each experiment.

In short the sequence of processes is as follows:

LAB DEVELOPMENT -> HOSTING REQUEST -> LAB BUILD -> PUBLISH


## Who develops a lab?

The subject matter experts on a given topic are responsible for
developing a lab.  These are usually faculty members at universities
affiliated with Virtual Labs.


## Who builds a Lab?

The VLEAD hosting team builds and publishes a lab when requested by
the developers.


## What is a Lab Descriptor?

A Lab Descriptor is a document that contains all the relevant
information about a lab.  It can be found in the repository of a lab.
Details of lab descriptor can be found
[here](docs/lab-descriptor.org).


## What is the format of a Lab Descriptor?

A lab descriptor is a json document containing an object with key
value pairs.

## What is the structure of a Lab Descriptor?

The structure of a lab descriptor can be found in
[this](docs/lab-descriptor.org) document.  Please refer to the
[schema](../labDescSchema.json) for a formal definition.

## Who writes a Lab Descriptor?

A lab descriptor is created by the hosting engineer at VLEAD.  This is
because VLEAD is responsible for creating labs.  The different team
that work on developing experiments do not create lab.

## Is it necessary to write a Lab Descriptor?

Yes, lab descriptor must be created and verified before the lab is
built.  The build process checks if the descriptor is present and
valid.

## What is an Experiment?
An experiment is a collection of webpages that contain learning
resources for a particular topic of interest.


# What is the process of building an experiment from the sources?
The process of building an individual experiment from its sources
provided by the authors, it described in [this](exp-build-process.org)
document.


## Who develops an experiment?
An experiment is developed by subject matter experts at various
insitutes.  The development teams follow the given
[template](https://github.com/virtual-labs/ph3-exp-template/) to
develop experiments.

## Who builds an experiment?
The experiment is built in two environment:
1. Testing: The teams can test their experiments while developing
   them.  This happens automatically using the experiment build
   scripts and github actions.
   
2. Production: This is done as a part of the lab build process by the
   hosting engineer.


## What is an Experiment Descriptor?
An experiment descriptor is used to as a map for building the
experiments.  It describes all the elements that go into an experiment
and where to find the sources for each page.

## What is the format of an Experiment Descriptor?
The experiment descriptor is a json document.  Find a sample
experiment descriptor
[here](https://github.com/virtual-labs/exp-bubble-sort-iiith/blob/main/experiment-descriptor.json).

## What is the structure of an Experiment Descriptor?
Details of the experiment descriptor can be found
[here](exp-build-process.org).

## Who wirtes an Experiment Descriptor?
The experiment descriptor is written by the developers of the
experiment.

## Is it necessary to write an experiment descriptor?
No.  The experiment descriptor is needed when you want a structure
that is different from the one prescribed by the template.
