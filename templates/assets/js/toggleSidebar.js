const sidebar = document.querySelector(".sidebar");
const breakpointLg = 992;

function toggle() {
  if(sidebar.classList.contains("hidden")) {
    sidebar.classList.remove("hidden");
  }
  else {
    sidebar.classList.add("hidden");
  }
}

$(window).resize(() => {
  const w = $(this).width();
  if (w < breakpointLg) {
    sidebar.classList.add("hidden");
  }
});

$(document).ready(() => {
  const w = $(this).width();
  if (w >= breakpointLg) {
    sidebar.classList.remove("hidden");
  }
});