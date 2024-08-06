"use strict";

const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");
const difficultyLevels = ["beginner", "intermediate", "advanced"];

let difficulty = [];
let questions = { all: myQuestions };

const addEventListener_explanations = () => {
  let accordions = document.getElementsByClassName("accordion");
  Array.from(accordions).forEach((accordion) => {
    accordion.addEventListener("click", function () {
      /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
      accordion.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      let panel = accordion.parentElement.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  });
};

const addEventListener_checkbox = () => {
  difficulty.forEach((diff) => {
    let cBox = document.getElementById(diff);
    cBox.addEventListener("change", function () {
      if (cBox.checked) {
        difficulty.push(diff);
      } else {
        difficulty.splice(difficulty.indexOf(diff), 1);
      }
      updateQuestions();
    });
  });
};

const populateQuestions = () => {
  let num = 0;
  myQuestions.forEach((currentQuestion) => {
    if (difficultyLevels.indexOf(currentQuestion.difficulty) === -1) {
      currentQuestion.difficulty = "beginner";
    }
    if (!(currentQuestion.difficulty in questions)) {
      questions[currentQuestion.difficulty] = [];
    }
    questions[currentQuestion.difficulty].push(currentQuestion);

    currentQuestion.num = num;
    num += 1;
  });

  if (Object.keys(questions).length > 2) {
    document.getElementById("difficulty-label").style.display = "flex";
    difficultyLevels.forEach((diff) => {
      if (!(diff in questions)) {
        return;
      }
      difficulty.push(diff);
      let checkbox = document.getElementById(diff);
      checkbox.checked = true;
      checkbox.parentElement.style.display = "flex";
    });
  } else {
    difficultyLevels.forEach((diff) => {
      if (!(diff in questions)) {
        return;
      }
      difficulty.push(diff);
    });
  }
};

const checkDifficulties = (classlist) => {
  if (difficulty.length === Object.keys(questions).length - 1) return true;
  for (let i in difficulty) {
    if (classlist.contains(difficulty[i])) return true;
  }
  // If beginner is checked list the unlisted question as beginner
  for (let i in difficultyLevels) {
    if (classlist.contains(difficultyLevels[i])) return false;
  }
  if (difficulty.indexOf("beginner") > -1) {
    return true;
  }
};

function updateQuestions() {
  const quiz = document.getElementById("quiz");
  const qquestions = quiz.getElementsByClassName("question");
  for (let i = 0; i < qquestions.length; i += 1) {
    if (!checkDifficulties(qquestions[i].classList)) {
      qquestions[i].style.display = "none";
      qquestions[i].nextElementSibling.style.display = "none";
    } else {
      qquestions[i].style.display = "block";
      qquestions[i].nextElementSibling.style.display = "flex";
    }
  }
}

function showResults() {
  let numCorrect = 0;
  const totalNum = questions.all.length;

  questions.all.forEach((currentQuestion, questionNumber) => {
    const userAnswer = document.querySelector(`input[name=question${questionNumber}]:checked`)?.value;

    if (userAnswer === currentQuestion.correctAnswer) {
      // if answer is correct
      numCorrect++;
      document.getElementById(
        "answer" + questionNumber.toString() + userAnswer
      ).style.color = "lightgreen";
      //console.log(`Question ${questionNumber}: Correct answer selected. Color changed to lightgreen.`);
    } else if (userAnswer) {
      // if answer is wrong
      document.getElementById(
        "answer" + questionNumber.toString() + userAnswer
      ).style.color = "red";
      //console.log(`Question ${questionNumber}: Incorrect answer selected. Color changed to red.`);
    }

    // Show explanation for the selected answer
    if (currentQuestion.explanations && userAnswer) {
      let explanation = currentQuestion.explanations[userAnswer];
      let explanationButton = document.getElementById(
        "explanation" + questionNumber.toString() + userAnswer
      );
      if (explanation) {
        explanationButton.parentElement.nextElementSibling.innerHTML = explanation;
        explanationButton.style.display = "inline-block";
      } else {
        explanationButton.style.display = "none";
      }
    }
  });

  // show number of correct answers out of total
  resultsContainer.innerHTML = `Score: ${numCorrect} out of ${totalNum}`;
  //console.log(`Results displayed: ${numCorrect} out of ${totalNum}`);
}

populateQuestions();
addEventListener_explanations();
addEventListener_checkbox();
submitButton.addEventListener("click", showResults);

populateQuestions();
addEventListener_explanations();
addEventListener_checkbox();
submitButton.addEventListener("click", showResults);