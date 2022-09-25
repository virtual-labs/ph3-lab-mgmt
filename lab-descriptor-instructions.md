# Instructions to fill the lab-descriptor while hosting
   The following are the instructions to fill or update the lab-descriptor.json file which is used to host a lab. Make Sure that everything in the JSON file is updated correctly before sending it for verification and hosting

## Section I - Lab
	
   1. Name: Should be Discipline name  
   2. Link: - Crosscheck the discipline link from vlab.co.in and update correctly
   		<strong>- Discipline Should be in the following format:</strong>
			- Mechanical Engineering
			- Computer Science and Engineering
			- Electronics and Communication Engineering
			- Electrical Engineering
			- Civil Engineering
			- Chemical Sciences
			- Biotechnology and Biomedical Engineering
			- Physical Sciences
			- Chemical Engineering
			- Humanity
			- Metallurgical and Materials Engineering
			- Design Engineering
			- Aerospace Engineering

Lab Name: Should be same in the JSON file, GitHub repo name, and in /var/www/html/. This name acts as the lab identifier and hence must be unique across all labs and cannot be changed once given.

Lab Display Name: This name will be displayed on the Lab web pages as the Lab name. This must be unique across all the labs but it can be changed later as long as another unique name is chosen.

Phase: Should be the number of the phase that the lab belongs to, e.g. Phase 3 or Phase 4
	
Deploy Lab: This should be true if we are hosting a lab along with experiments or only a lab but no experiments. If we want to host only experiments without rehosting the lab then it should be false. This may be useful in cases where the lab developer makes a fix in the lab and only wants to rehost the lab without rehosting all the experiments with it or in cases where the lab developer has changed something on an experiment and the complete lab need not be rehosted.
	
College Name(Institute Name): Update from the R0 file (which is given in the request for hosting issue)

The following are the supported institutes and their ids (to be given in the URL along with the lab id. Ex:- cse01-iiith) 

- <strong> Institute Names and their Id’s:</strong>

	- IIITHyderabad - iiith
	- Amrita - au
		- IIT Delhi -iitd
		- IIT Kanpur - iitk
		- IIT Guwahati - iitg
		- IIT Roorkee - iitr
		- IIT Bombay - iitb
		- COEP -coep
		- Dayalbagh - dei 
		- IIT Kharagpur - iitkgp
		- NIT Karnataka -nitk

	Base URL: Crosscheck the lab domain in the reverse proxy and update correctly in the JSON
	
	Introduction: from R0 file 

## Section II - Experiment
	
   1. Name: experiment name from R0 file
   2. Short Name: it should be in small letters and not more than 4 words or can give exp repo name from GitLab (if it has only 4 words)
   3. Repo: give the experiment repo URL from GitLab
   4. Tag: for every request for hosting, a repo should have a new tag
   5. Deploy: This should be true if we are hosting a lab and exp or only exp. If we want to host the only lab then it should be false


## Section III 
   Target Audience, Objective, and Courses Alignment: Should be updated from the R0 file.

   - <strong>Recommendations</strong>

   - Condition 1: if we get a hosting request to update only the lab content, then a hosting person should host only the lab but not the content of the experiments. In the JSON file, deployLab should be true in the lab section, and deploy should be false in the experiments section.

   - Condition 2:  if we get a hosting request to update only the experiment content, then a hosting person should host only the experiments but not the lab. In the JSON file, deployLab should be false in the lab section, and deploy should be true in the experiments section.
	
   - Condition 3: If the lab is hosted multiple times with spelling mistakes or so, then the multiple labs will be created in the analytics and we will lose the lab/experiments usage.

   - Condition 4: After hosting the lab, test it thoroughly compared with analytics data.

#### Sample JSON file
```
{
  "broadArea": {
    "name": "Electronics and Communication Engineering",
    "link": "http://www.vlab.co.in/broad-area-electronics-and-communications"
  },
  "lab": "Digital Electronics IITR",
  "phase": 3,
  "collegeName": "IITR",
  "baseUrl": "de-iitr.vlabs.ac.in",
  "introduction": "Welcome to the Digital Electronics Lab",
  "experiments": [
    {
      "name": "Verification and interpretation of truth table for AND, OR, NOT, NAND, NOR, Ex-OR, Ex-NOR gates",
      "short-name": "truth-table-gates",
      "repo": "https://github.com/virtual-labs/exp-truth-table-gates-iitr",
      "tag": "v1.0.0",
      "deploy": true
    },
    {
      "name": "Construction of half and full adder using XOR and NAND gates and verification of its operation",
      "short-name": "half-full-adder",
      "repo": "https://github.com/virtual-labs/exp-half-full-adder-iitr",
      "tag": "v1.0.0",
      "deploy": true
    },
    {
      "name": "Verify the truth table of one bit and two bit comparator using logic gates",
      "short-name": "comparator-using-logic-gates",
      "repo": "https://github.com/virtual-labs/exp-comparator-using-logic-gates-iitr",
      "tag": "v1.0.0",
      "deploy": true
    }
  ],
  "targetAudience": {
    "UG": ["B. Tech./ B.E in Electronics and Communications"],
    "PG": [
      "MS/Ph. D. Beginners in Electronics and Communications and related topics"
    ]
  },
  "objective": "To learn and understand the basic concepts of digital electronics.",
  "courseAlignment": {
    "description": "The syllabi of this lab aligns to the following universities in India.",
    "universities": [
      "Uttarakhand Technical University Uttarakhand",
      "Himachal Pradesh Technical University Himachal Pradesh",
      "Central Library, H.N.B.Garhwal University Uttarakhand",
      "I. K. Gujral Punjab Technical University Punjab",
      "Graphic Era University, Dehradun Uttarakhand",
      "Quantum University Uttarakhand",
      "Bhagwant University, Ajmer Rajasthan",
      "Dr. A.P.J. Abdul Kalam Technical University, Lucknow, Uttar Pradesh Uttar Pradesh"
    ]
  }
}
```
