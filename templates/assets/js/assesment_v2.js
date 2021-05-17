const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");

let difficulty_levels = [];
let difficulty = "all";
let questions = { all: myQuestions };
const populate_questions = () => {
  let num = 0;
  myQuestions.forEach((currentQuestion) => {
    if (difficulty_levels.indexOf(currentQuestion.difficulty) === -1) {
      questions[currentQuestion.difficulty] = [];
      difficulty_levels.push(currentQuestion.difficulty);
    }
    currentQuestion.num = num;
    questions[currentQuestion.difficulty].push(currentQuestion);
    num += 1;
  });
  let dropdown_div = document.getElementById("dropdowncontainer");
  for (i in difficulty_levels) {
    let diff = difficulty_levels[i];
    let dropdown = document.getElementById("dropdown");
    let option = document.createElement("option");
    option.text = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
    option.value = diff;
    dropdown.add(option);
    dropdown_div.style.display = "block";
  }
};

function updateQuestions() {
  difficulty = document.getElementById("dropdown").value;
  const quiz = document.getElementById("quiz");
  let questions = quiz.getElementsByTagName("div");
  for (let i = 0; i < questions.length; i += 3) {
    if (!questions[i].classList.contains(difficulty) && difficulty !== "all") {
      questions[i].style.display = "none";
      questions[i + 1].style.display = "none";
      questions[i + 2].style.display = "none";
    } else {
      questions[i].style.display = "block";
      questions[i + 1].style.display = "flex";
      questions[i + 2].style.display = "block";
    }
  }
}

function showResults() {
  // gather answer containers from our quiz
  const answerContainers = quizContainer.querySelectorAll(".answers");
  answerContainers.forEach((e) => (e.style.color = "black"));

  // keep track of user's answers
  let numCorrect = 0;
  // for each question...
  questions[difficulty].forEach((currentQuestion) => {
    // find selected answer
    let questionNumber = currentQuestion.num;
    const answerContainer = answerContainers[questionNumber];
    const selector = `input[name=question${questionNumber}]:checked`;
    const userAnswer = (answerContainer.querySelector(selector) || {}).value;
    // if answer is correct
    if (userAnswer === currentQuestion.correctAnswer) {
      // add to the number of correct answers
      numCorrect++;

      // color the answers green
      //answerContainers[questionNumber].style.color = "lightgreen";
    } else {
      // if answer is wrong or blank
      // color the answers red
      answerContainers[questionNumber].style.color = "red";
    }
    if (currentQuestion.explanations) {
      let explanation = currentQuestion.explanations[userAnswer];
      let explanation_div = document.getElementById(
        "explanation" + questionNumber.toString()
      );
      if (explanation) {
        explanation_div.innerHTML = "Explanation: " + explanation;
        explanation_div.style.display = "block";
      } else {
        explanation_div.style.display = "none";
      }
    }
  });
  // show number of correct answers out of total
  resultsContainer.innerHTML = `${numCorrect} out of ${questions[difficulty].length}`;
}

populate_questions();
submitButton.addEventListener("click", showResults);
