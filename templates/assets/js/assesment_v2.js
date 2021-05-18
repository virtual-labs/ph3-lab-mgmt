const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");

let difficulty_levels = ["beginner", "intermediate", "advanced"];
let difficulty = "all";
let questions = { all: myQuestions };

const addEventListener_explanations = () => {
  let acc = document.getElementsByClassName("accordion");
  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
      acc[i].classList.toggle("active");

      /* Toggle between hiding and showing the active panel */
      let panel = acc[i].parentElement.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
};

const populate_questions = () => {
  let num = 0;
  myQuestions.forEach((currentQuestion) => {
    if (difficulty_levels.indexOf(currentQuestion.difficulty) !== -1) {
      currentQuestion.num = num;
      if (!(currentQuestion.difficulty in questions)) {
        questions[currentQuestion.difficulty] = [];
      }
      questions[currentQuestion.difficulty].push(currentQuestion);
      num += 1;
    }
  });
  let dropdown_div = document.getElementById("dropdowncontainer");
  for (i in difficulty_levels) {
    let diff = difficulty_levels[i];
    if (!(diff in questions)) {
      continue;
    }
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
    if (
      !questions[i].classList.contains(difficulty.split(" ").join("")) &&
      difficulty !== "all"
    ) {
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
      // Show all explanations
      if (currentQuestion.explanations) {
        for (let answer in currentQuestion.answers) {
          let explanation = currentQuestion.explanations[answer];
          let explanation_button = document.getElementById(
            "explanation" + questionNumber.toString() + answer
          );
          if (explanation) {
            explanation_button.parentElement.nextElementSibling.innerHTML =
              "Explanation: " + explanation;
            explanation_button.style.display = "inline-block";
          } else {
            explanation_button.style.display = "none";
          }
        }
      }
    } else {
      // if answer is wrong or blank
      // color the answers red
      answerContainers[questionNumber].style.color = "red";
      // Show only explanation for wrong answer
      if (currentQuestion.explanations) {
        let explanation = currentQuestion.explanations[userAnswer];
        let explanation_button = document.getElementById(
          "explanation" + questionNumber.toString() + userAnswer
        );
        if (explanation) {
          explanation_button.parentElement.nextElementSibling.innerHTML =
            "Explanation: " + explanation;
          explanation_button.style.display = "inline-block";
        } else {
          explanation_button.style.display = "none";
        }
      }
    }
  });
  // show number of correct answers out of total
  resultsContainer.innerHTML = `${numCorrect} out of ${questions[difficulty].length}`;
}

populate_questions();
addEventListener_explanations();
submitButton.addEventListener("click", showResults);
