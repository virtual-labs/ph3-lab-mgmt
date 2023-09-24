"use-strict";

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

document.getElementById('bug-report').addEventListener('vl-bug-report', (e) => {
  if (e.detail.status === 200 || e.detail.status === 201) {
    const learningUnit = document.head.querySelector('meta[name="learning-unit"]').content;
    const task = document.head.querySelector('meta[name="task-name"]').content;
    dataLayer.push({
      event: "vl-bug-report",
      "bug-type": e.detail.issues,
      "learning-unit": learningUnit ? learningUnit : "",
      "task-name": task ? task : ""
    })
    Toast.fire({
      icon: 'success',
      iconColor: "white",
      background: "#a5dc86",
      title: 'Bug Reported Successfully',
    })
  } else {
    Toast.fire({
      icon: 'error',
      iconColor: "white",
      color: "white",
      background: "#f27474",
      timer: 5000,
      title: 'Bug Report Failed, Please Try Again',
    })
  }
})

// Function to handle the rating submit logic
function handleRatingSubmit(e) {
  console.log("This is the detail in eventhandler", e.detail);
  console.log("This is the status of the button", e.detail.status);
  if (e.detail.status === 200 || e.detail.status === 201) {
    const learningUnit = document.head.querySelector('meta[name="learning-unit"]').content;
    const task = document.head.querySelector('meta[name="task-name"]').content;
    dataLayer.push({
      event: "vl-rating-submit",
      "rating": e.detail.rating,
      "learning-unit": learningUnit ? learningUnit : "",
      "task-name": task ? task : ""
    });
    Toast.fire({
      icon: 'success',
      iconColor: "white",
      background: "#a5dc86",
      title: 'Rating Submitted Successfully',
    });
  } else {
    Toast.fire({
      icon: 'error',
      iconColor: "white",
      color: "white",
      background: "#f27474",
      timer: 5000,
      title: 'Rating Submission Failed, Please Try Again',
    });
  }
}

const ratingSubmitElement = document.querySelector('rating-submit');
if (ratingSubmitElement) {
  console.log("before event listener");
  // Wait for the 'vl-rating-submit' event before adding the event listener
  ratingSubmitElement.addEventListener('vl-rating-submit', handleRatingSubmit);
  console.log("after event listener");
}