# Quiz
### 1. Introduction
The quiz section is designed as part of the experiment to assess students' learning and understanding. It allows for the creation of multiple-choice, single-answer quizzes. The quiz can be used for different purposes:

* Pretest: To assess prerequisite knowledge before starting.
* Posttest: To test understanding after completing the module.
* Learning Unit Quizzes: To evaluate the knowledge gained from specific sections of the content.

The quiz implementation format is explained below.

### 2. Target Audience
This guide is intended for developers building experiments the virtual lab and aiming to include a quiz section in the experiment.

### 3. Structure of quiz
The quiz is structured in a JSON file format. The quiz questions must be represented as an array of objects. Each object corresponds to a question. Below are the specifications for the quiz format :

### 3.1 Array of Questions
Each question in the quiz is defined with the following attributes:
* **question:** This represents the question to be asked.
* **answers:** This contains the possible answer choices, each labeled (for example, as a, b, c, and d).
* **correctAnswer:** The correct option for the question, specified by the corresponding letter.

Example:

```
"questions" : [
    {
        "question" : "What is 1+2 ?",
        "answers" : 
        {
            "a" : 1,
            "b" : 2,
            "c" : 3,
            "d" : 4
        },
        "correctAnswer" : c
    }
]
```
### 3.2 Explanation of Keys:

* "question": The text to be displayed as the question.
* "answers": An object of key-value pairs where the key is a label (a, b, c, d), and the value is the corresponding answer choice.
* "correctAnswer": The correct answer's label (e.g., a, b, c, or d).

### 3.3 Best Practices for Writing Questions:
* Design the questions clear and unambiguous.
* Ensure that only one answer is correct.
* Provide distinct and not confusing answer choices.
* The correct answer key should always correspond to the correct option in the answers field.

### 4. Quiz V2.0 (Enhancements done)
The new format of quiz has multiple new additions. The details for which have been described below.  
The format of json would be as linked [here](./pretest.json)  

First we will look at the additional fields added  

### 4.1 Fields 
* Mandatory Fields
    * [version](#42-version) - Ensures the enhanced quiz is rendered correctly. 
    * [levels](#44-levels) -  Adds difficulty levels to each question, allowing for filtering.

* Optional Fields
    * [explanations](#43-explanations) - Adds an explanation to each answer. If wrong answer is choosen, only it's explanation pops up.  If correct answer is choosen, all available explanations pop up.  

### 4.2 Version
The very first field is absolutely necessary. This ensures that the quiz supports the new features.
```
"version": 2.0
```   

### 4.3 Explanations
The explanations section shows up after a question is answered. It is optional and can be omitted entirely. Below are examples of how to structure the explanations:

1. All answers have explanations
```
"explanations": {
    "a" : "Explanation 1,
    "b" : "Explanation 2"
    "c" : "Explanation 3"
    "d" : "Explanation 4"
},
```  
2. Some answers have explanations
```
"explanations": {
    "a" : "Explanation 1,
    "d" : "Explanation 4"
},
```

3. No answers have explanations
```
/* Can be excluded from json */
```  

### 4.4 Levels
The difficulty level for each question is mandatory and allows filtering. The available difficulty levels are:
```
['beginner', 'intermediate', 'advanced']
```
Using any other will not work. The format for the same:
```
"difficulty" : "beginner"
```

### 5. Tips
1. **Rich Text in explanations**
Explanations can include HTML-formatted rich text, allowing features like hyperlinks and text formatting.
```
"explanations": {
    "a" : "Explanation 1  <a href='www.google.com'>here</a>",
    "b" : "Explanation 2"
},
```
[Example](https://github.com/virtual-labs/exp-stacks-queues-iiith/blob/main/experiment/pretest.json)

2. **Multi Correct Questions**
To mimic multi-correct questions, you can structure the options within the question itself and offer options like: 
```
    "answers" : 
    {
        "a" : "both i and ii",
        "b" : "All i, ii, iii, iv",
        "c" : "Only i",
        "d" : "None of the above"
    }
```
[Example](https://github.com/virtual-labs/exp-Effect-field-gradient-iiith/blob/main/experiment/pretest.json)

3. **Image Support**
Images can be added to both question and answers.

* **Image in question** :
```
"questions" : [
    {
        "question": "$\\\\$ <img src='./images/example.png' alt='question image'/>",
        "answers" : 
        {
            "a" : 1,
            "b" : 2,
            "c" : 3,
            "d" : 4
        },
        "correctAnswer" : c,
        "explanations": {},
        "difficulty": "intermediate"
    }
]
```  

* **Image and Text in question** :
```
"questions" : [
    {
        "question": "This is an example question $\\\\$ <br><img src='./images/example.png' alt='question image'/>",
        "answers" : 
        {
            "a" : 1,
            "b" : 2,
            "c" : 3,
            "d" : 4
        },
        "correctAnswer" : c,
        "explanations": {},
        "difficulty": "advanced"
    }
]
```  
The same two cases apply for answers too. 
[Example](https://github.com/virtual-labs/exp-convolutional-codes-iiith/blob/dev/experiment/posttest.json) 

* **Multiple lines in the Text in question** :
```
"questions" : [
    {
        "question": "This is an example question <br> Text line 1 <br> Text line 2",
        "answers" : 
        {
            "a" : 1,
            "b" : 2,
            "c" : 3,
            "d" : 4
        },
        "correctAnswer" : d,
        "explanations": {},
        "difficulty": "beginner"
    }
]
```
[Example](https://github.com/virtual-labs/exp-bubble-sort-iiith/blob/main/experiment/posttest.json)

4. **Debugging through JSON validator** 
Please consider running your JSON files through a JSON validator like https://jsonlint.com/ for smoother debugging.

**Make sure the image aspect ratio remains constant and good to maintain the structure**

### 6. Manual Validation of Quiz Json (wrt version 2.0)
Until automatic validation is set up, manually check:
* The first field has to be "version" with 2 or 2.0 as value.
* The questions field needs to be an array of objects containing questions.
* Each question object should have
    * question : Should be a string
    * answer : Should be an object containing options, and each option should be a string. 
    * difficulty : Should be a string and should have values from ["beginner", "intermerdiate", "advanced"]
    * correctAnswer : Should be a string and it's value should be present in keys of one of the answer.
* If explanation is present, it has to be an object and needs to follow the description of answer object.  

### 7. Test Cases
- [x] Using the mentioned quiz format  
- [x] Using the old quiz json format
- [ ] Not including the version in json
- [ ] Including incorrect version in json 
- [ ] Including correct version but following old format 
- [x] Difficulty not mentioned
- [x] Incorrect difficulty level mentioned
- [x] Explanation not provided for all options
- [x] Explanation not mentioned
- [x] Explanation object not defined
- [x] HTML in question (tags like hyper links, bold etc)
- [x] HTML in answer (tags like hyper links, bold etc)
- [x] HTML in explanation (tags like hyper links, bold etc)
- [x] On wrong answer, the corresponding answer text is colored red
- [x] On correct answer, the corresponding answer text is colored green
- [x] Combination of filters working properly
- [x] If all questions have same difficulty, filter option should be hidden.
- [x] When questions are answered after filtering, marks should be counted out of filtered questions, not total.
- [x] On wrong answer, only explanation of wrong answer is shown
- [x] On correct answer, all available explanations are shown

### 8. TODO
* Add automatic schema validation