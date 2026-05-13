filterSelection("all");

function filterSelection(category) {
  const items = document.querySelectorAll(".column");

  if (category === "all") category = "";

  items.forEach(item => {
    item.classList.remove("show");

    if (item.className.includes(category)) {
      item.classList.add("show");
    }
  });
}


var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");

for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {

    // Nur im Container entfernen
    btnContainer.querySelectorAll(".active").forEach(el => {
      el.classList.remove("active");
    });

    // Neues active setzen
    this.classList.add("active");
  });

}

function myFunction() {
  // Declare variables
  var input, filter, ul, li, a, i;
  input = document.getElementById("mySearch");
  filter = input.value.toUpperCase();
  ul = document.getElementById("myBtnContainer");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}