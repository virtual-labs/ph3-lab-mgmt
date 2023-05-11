---
title: contributors
author: "Shreyash Jain and Aditya Malhotra"
audience: "Experiment Developer"
date: 2023-05-11T13:49:21.348Z
phase: "Ext Phase 3"
summary: "This document describes the how to enable the contributors page in your experiment."
tags: []
---

## Introduction
We at Virtual Labs have always believed in giving credit where its due. Developers and SMEs now have a dedicated page to get the credit for their contributions in the experiment. 

## How to use
The contributors.md file will look like this:
```markdown
EMPTY
<!-- Remove all lines above this line before making changes to the file -->
## Subject Matter Experts
| SNo. | Name | Email | Institute | ID |
| :---: | :---: | :---: | :---: | :---: |
| 1 | name | email | institute | id |

## Developers
| SNo. | Name | Email | Institute | ID |
| :---: | :---: | :---: | :---: | :---: |
| 1 | name | email | institute | id |
| 2 | name | email | institute | id |
```
This file will be present in the experiment directory. You can add the details of the contributors in the table. 
You will need to remove the `EMPTY` line before adding the details.
If the file is not present in the experiment directory, you can copy the template above and add it to your experiment directory.


## How to verify
You can verify the contributors page by deploying the experiment. The contributors page will be available in the experiment in the sidebar.
The page will look like this:
![Contributors](/docs/images/Contributors.png)


## Important Points
1. The contributors.md file should be present in the experiment directory.
2. The contributors.md file should be in the above format.
3. The contributors page will not be rendered if you dont remove the `EMPTY` line.



