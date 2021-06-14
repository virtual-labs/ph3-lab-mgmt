function toggle() {
  const sb = document.querySelector(".sidebar");
  if(sb.classList.contains("hidden")) {
    sb.classList.remove("hidden");
    sb.classList.add("visible");
  }
  else {
    sb.classList.remove("visible");
    sb.classList.add("hidden");
  }
}

$(window).resize(() => {
  const w = $(this).width();
  if (w < 992) {
    document.querySelector(".sidebar").classList.remove("visible");
    document.querySelector(".sidebar").classList.add("hidden");
  }
});

$(document).ready(() => {
  const w = $(this).width();
  if (w > 992) {
    document.querySelector(".sidebar").classList.remove("hidden");
    document.querySelector(".sidebar").classList.add("visible");
  }
});
