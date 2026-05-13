function showPage(button, pageId) {

  let pages = document.getElementsByClassName("page");

  for (let page of pages) {
    page.style.display = "none";
  }

  document.getElementById(pageId).style.display = "block";


  // nur wenn ein Button übergeben wurde
  if (button) {

    let buttons = document.querySelectorAll("#main-navbar a");

    for (let b of buttons) {
      b.classList.remove("active");
    }

    button.classList.add("active");
  }
}

function toggleSubnav(subnavId) {

    //let subnavs = document.getElementsByClassName("subnav");

    //for (let subnav of subnavs) {
    //    subnav.style.display = "none";
    //}


    if (document.getElementById(subnavId).style.display == "none")
    {
        document.getElementById(subnavId).style.display = "block";
    }
    else
    {
        document.getElementById(subnavId).style.display = "none";
    }
    
}

function toggleSubHeader(headerID, closeHeaderId)
{
  if (document.getElementById(headerID).classList.contains("hidden"))
  {
    document.getElementById(headerID).classList.remove("hidden");
  } else
  {
    document.getElementById(headerID).classList.add("hidden");
  }

  document.getElementById(closeHeaderId).classList.add("hidden");
}