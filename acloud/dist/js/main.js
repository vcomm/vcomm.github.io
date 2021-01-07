
function openNav(x) {
  x.classList.toggle("change");
  var nav  = document.getElementById("mySidenav");
  //console.log(nav.style.width);
  if ( nav.style.width == "0px")
	   nav.style.width = "250px";	
  else	  
	   nav.style.width = "0px";	
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0px";
  document.getElementById("navi").classList.toggle("change");  
}

function showTitle(elem) {
  var rect = elem.getBoundingClientRect();
  //console.log(rect.top, rect.right, rect.bottom, rect.left);
  var tiptext = document.getElementById("tooltip");
  tiptext.classList.remove("tooltiptexthide");
  tiptext.classList.add("tooltiptextshow");
  tiptext.style.top  = ''+rect.bottom+'px';
  tiptext.style.left = ''+rect.left+'px';
  tiptext.children[0].innerHTML = elem.getAttribute("title");
  elem.setAttribute("title","");
}

function hideTitle(elem) {
  var tiptext = document.getElementById("tooltip");
  tiptext.classList.remove("tooltiptextshow");
  tiptext.classList.add("tooltiptexthide");  
  elem.setAttribute("title",tiptext.children[0].innerHTML);
}

function mySearch() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
};

var navbar = document.getElementById("navi");
var sticky = navbar.offsetTop;

function onScroll() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky");
	document.getElementById("mySidenav").style.top = "80px";
  } else {
    navbar.classList.remove("sticky");
	document.getElementById("mySidenav").style.top = "210px";
  }
}

var elemCreate = {
  docum : function(parent,src) {
    var elem = document.createElement("iframe");
    elem.setAttribute("class","modal-content");
    elem.setAttribute("id", "modalCntn");
    elem.setAttribute("src", src);
    elem.setAttribute("frameborder", "0");
    elem.setAttribute("allowfullscreen", true);
    elem.setAttribute("width", "100%");
    elem.setAttribute("height", "90%");
    parent.appendChild(elem);
  },
  image : function(parent,src) {
    var elem = document.createElement("img");
    elem.setAttribute("class","modal-content");
    elem.setAttribute("id", "modalCntn");
    elem.setAttribute("src", src);
    parent.appendChild(elem);
  },
  video : function(parent,src) {
    var elem = document.createElement("video");
    elem.setAttribute("class","modal-content");
    elem.setAttribute("id", "modalCntn");
    elem.setAttribute("controls",true);
    elem.setAttribute("autoplay",true);
    elem.setAttribute("loop",true);
    var source = document.createElement("source");
    source.setAttribute("src", src);
    source.setAttribute("type", "video/mp4");
    elem.appendChild(source);
    parent.appendChild(elem);
  },
  iframe : function(parent,src) {
    var elem = document.createElement("iframe");
    elem.setAttribute("class","modal-content");
    elem.setAttribute("id", "modalCntn");
    elem.setAttribute("src", src);
    elem.setAttribute("frameborder", "0");
    elem.setAttribute("allowfullscreen", true);
    elem.setAttribute("width", "100%");
    elem.setAttribute("height", "450");
    parent.appendChild(elem);
  },
  window : function(parent,src) {
	window.open(src);
  }
};

function initPosters() {
  var i;
  var posters = document.getElementsByTagName('li');
  for (i = 0; i < posters.length; i++) {
      posters[i].onclick = function() {          
		  var doc = this.getAttribute("dir");
		  if (doc)
			  elemCreate["window"](null,doc);
      }
	  posters[i].onmouseenter = function() {
		var title = this.getAttribute("title");
		if (title) showTitle(this);
	  }
	  posters[i].onmouseleave = function() {
		hideTitle(this);
	  }
  }
  // Get the modal
  var modal = document.getElementById('myModal');
  var contact = document.getElementById('contact');
  contact.onclick = function(){
		modal.style.display = "block";
	}

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
      modal.style.display = "none";
      //var modalCntn = document.getElementById('modalCntn');
      //modalCntn.parentNode.removeChild(modalCntn);
  }
};

initPosters();
