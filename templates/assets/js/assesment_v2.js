const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");

let difficulty_levels = ["beginner", "intermediate", "advanced"];
let difficulty = [];
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

const addEventListener_checkbox = () => {
  for (i in difficulty_levels) {
    let diff = difficulty_levels[i];
    let c_box = document.getElementById(diff);
    c_box.addEventListener("change", function () {
      if (c_box.checked) {
        difficulty.push(diff);
        console.log("Clicked " + diff);
      } else {
        difficulty.splice(difficulty.indexOf(diff), 1);
        console.log("Unclicked " + diff);
      }
      updateQuestions();
    });
  }
};

const populate_questions = () => {
  let num = 0;
  myQuestions.forEach((currentQuestion) => {
    if (difficulty_levels.indexOf(currentQuestion.difficulty) !== -1) {
      if (!(currentQuestion.difficulty in questions)) {
        questions[currentQuestion.difficulty] = [];
      }
      questions[currentQuestion.difficulty].push(currentQuestion);
    }
    currentQuestion.num = num;
    num += 1;
  });

  if (Object.keys(questions).length > 2) {
    document.getElementById("difficulty-label").style.display = "block";
    for (i in difficulty_levels) {
      let diff = difficulty_levels[i];
      if (!(diff in questions)) {
        continue;
      }
      difficulty.push(diff);
      let checkbox = document.getElementById(diff);
      checkbox.checked = true;
      checkbox.parentElement.parentElement.style.display = "block";
    }
  }
};

const checkDifficulties = (classlist) => {
  if (difficulty.length === Object.keys(questions).length - 1) return true;
  for (i in difficulty) {
    if (classlist.contains(difficulty[i])) return true;
  }
  return false;
};

function updateQuestions() {
  const quiz = document.getElementById("quiz");
  let qquestions = quiz.getElementsByClassName("question");
  for (let i = 0; i < qquestions.length; i += 1) {
    if (!checkDifficulties(qquestions[i].classList)) {
      qquestions[i].style.display = "none";
      qquestions[i].nextElementSibling.style.display = "none";
      console.log("Hidden ");
      console.log(qquestions[i]);
    } else {
      qquestions[i].style.display = "block";
      qquestions[i].nextElementSibling.style.display = "flex";
      console.log("Added ");
      console.log(qquestions[i]);
    }
  }
}

function showResults() {
  // gather answer containers from our quiz
  const answerContainers = quizContainer.querySelectorAll(".answers");
  answerContainers.forEach((e) => (e.style.color = "black"));

  // keep track of user's answers
  let numCorrect = 0;
  let toatNum = 0;
  // for each question...
  myQuestions.forEach((currentQuestion) => {
    // find selected answer
    if (
      difficulty.indexOf(currentQuestion.difficulty) === -1 &&
      difficulty.length !== Object.keys(questions).length - 1
    )
      return;
    let questionNumber = currentQuestion.num;
    const answerContainer = answerContainers[questionNumber];
    const selector = `input[name=question${questionNumber}]:checked`;
    const userAnswer = (answerContainer.querySelector(selector) || {}).value;
    // Add to total
    toatNum++;
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
            explanation_button.parentElement.nextElementSibling.innerHTML = explanation;
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
      if (currentQuestion.explanations && userAnswer) {
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
  resultsContainer.innerHTML = `${numCorrect} out of ${toatNum}`;
}

populate_questions();
addEventListener_explanations();
addEventListener_checkbox();
submitButton.addEventListener("click", showResults);
