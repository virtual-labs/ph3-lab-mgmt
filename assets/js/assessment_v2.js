"use strict";

const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");
const difficultyLevels = ["beginner", "intermediate", "advanced"];

let difficulty = [];
let questions = { all: myQuestions };

// Store the correct answers and user selections
let correctAnswers = {}; // { questionId: correctAnswer }
let userSelections = {}; // { questionId: selectedAnswer }

const addEventListener_explanations = () => {
  let accordions = document.getElementsByClassName("accordion");
  Array.from(accordions).forEach((accordion) => {
    accordion.addEventListener("click", function () {
      /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
      accordion.classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      let panel = accordion.parentElement.nextElementSibling;
      panel.style.display = panel.style.display === "block" ? "none" : "block";
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

// Function to initialize the quiz
const initializeQuiz = () => {
  questions.all.forEach((question, index) => {
    correctAnswers[question.id] = question.correctAnswer;
    userSelections[question.id] = null;

    const answers = document.querySelectorAll(`#question-${question.id} .answer`);
    answers.forEach((answer) => {
      answer.addEventListener("click", () => handleAnswerSelection(question.id, answer));
    });
  });
};

// Function to handle answer selection
const handleAnswerSelection = (questionId, selectedAnswer) => {
  userSelections[questionId] = selectedAnswer.textContent;
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

const showResults = () => {
  let numCorrect = 0;
  const totalNum = questions.all.length;

  questions.all.forEach((question) => {
    const correctAnswer = correctAnswers[question.id];
    const userAnswer = userSelections[question.id];
    const answers = document.querySelectorAll(`#question-${question.id} .answer`);

    answers.forEach((answer) => {
      if (answer.textContent === correctAnswer) {
        answer.style.color = "green";
      } else if (answer.textContent === userAnswer) {
        answer.style.color = "red";
      } else {
        answer.style.color = "black";
      }
    });

    if (userAnswer === correctAnswer) {
      numCorrect++;
    }
  });

  // Show number of correct answers out of total
  resultsContainer.innerHTML = `Score: ${numCorrect} out of ${totalNum}`;
};

// Call initializeQuiz to set up the quiz after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeQuiz();
  populateQuestions();
  addEventListener_explanations();
  addEventListener_checkbox();
  submitButton.addEventListener("click", showResults);
});
