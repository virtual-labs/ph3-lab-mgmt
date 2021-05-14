const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");


function showResults() {
  // gather answer containers from our quiz
  const answerContainers = quizContainer.querySelectorAll(".answers");
  answerContainers.forEach(e => e.style.color = "black");

  // keep track of user's answers
  let numCorrect = 0;

  // for each question...
  myQuestions.forEach((currentQuestion, questionNumber) => {
    // find selected answer
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
    let explanation = currentQuestion.explanations[userAnswer]
    let explanation_div = document.getElementById("explanation"+ questionNumber.toString())
    if(explanation){
      explanation_div.innerHTML = "Explanation: " + explanation
      explanation_div.style.display = "block"
    }else{
      explanation_div.style.display = "none"
    }
  });

  // show number of correct answers out of total
  resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
}


submitButton.addEventListener("click", showResults);
