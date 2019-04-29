const DELAY = 5;

let getContent = {
  "overview": {
    "html": '<i class="far fa-circle"></i>',
  },
  "details": {
    "html": '<i class="fas fa-circle dot"></i>',
  },
  "both": {
    "html": '<i class="far fa-dot-circle"></i>',
  }
}

let getGridLayout = [6, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 6]

document.addEventListener("DOMContentLoaded", async function () {
  listOfElements = await loadData();
  processData(listOfElements);
  layOutGrid();

  listOfDefinitions = await loadDefinition();
  processDefintions(listOfDefinitions);


  document.querySelectorAll(".element").forEach((item) => {
    item.addEventListener("mouseup", function () {
      modalAnimation(this);
    })
  })

  containerElement = document.querySelector(".container");
  keyBoxElement = document.querySelector(".key-box");
  footer = document.querySelector(".footer");
  containerElement.appendChild(keyBoxElement);
  containerElement.appendChild(footer);


  document.querySelectorAll(".legend-item").forEach((item) => {
    item.addEventListener("mouseenter", function () {
      document.querySelectorAll(".element." + this.getAttribute("data-key")).forEach((element, index) => {
        addClass("highlight", element, index);
      })
    })
  })

  document.querySelectorAll(".legend-item").forEach((item) => {
    item.addEventListener("mouseleave", function () {
      document.querySelectorAll("." + this.getAttribute("data-key")).forEach((element, index) => {
        removeClass("highlight", element, index);
      })
    })
  })

  tippy.setDefaults({
    animateFill: false,
    animation: 'shift-away',
    inertia: true
  })

  tippy('.element');
  tippy('.key-item', {
    placement: 'top-start'
  });

  document.querySelector(".cover").addEventListener("click", hideModal);

});

function modalAnimation(self) {
  let selfProperties = self.getBoundingClientRect(),
    translateX,
    translateY,
    scale,
    positionX = window.innerWidth / 2,
    positionY = window.innerHeight / 2,
    key = self.getAttribute("data-wikipedia-key");

  scale = window.innerWidth / 250;

  document.querySelector(".cover").style.display = "block";


  translateX = Math.round(positionX - selfProperties.left - selfProperties.width / 2);
  translateY = Math.round(positionY - selfProperties.top - selfProperties.height / 2);
  self.style.zIndex = 9998;
  self.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
  self.classList.add("is-active");

  setTimeout(function () {
    document.querySelector(".stage").style.filter = "blur(2px)";
    document.querySelector(".modal").style.visibility = "visible";
    populateModal(key);
    document.querySelector(".modal").centre();
  }, 210);

}



// document.addEventListener("mouseup", async function () {
//   layOutGrid();
// });

async function loadData() {
  response = await fetch("json/db.json")
  data = await response.json();

  return data;
}

async function loadDefinition() {
  response = await fetch("json/definitions.json")
  data = await response.json();

  return data;
}

function processData(data) {
  let outputHTML = "";
  for (let i = 0; i < (data.methods.length); i++) {

    let method = data.methods[i];
    let name = Object.keys(method);

    let { category, symbol, basis, thinking, view, wikipedia, exampleURL, description } = method[name];
    let shortName = JSON.stringify(name).slice(2, name.length - 3);
    wikipedia = wikipedia.substr(wikipedia.lastIndexOf("/") + 1, wikipedia.length)

    //let shortName = truncate(JSON.stringify(name));

    outputHTML += `<div class="element ${category.toLowerCase()} " data-tippy-content="${name}" `

    if (wikipedia) {
      outputHTML += `data-wikipedia-key="${wikipedia}"`
    } else {
      outputHTML += ` data-example-url="${exampleURL}" data-description="${description}"`
    }
    outputHTML += `><div class="element__legend">`
    outputHTML += (thinking == "convergent") ? `<i class="fas fa-angle-right"></i>` : `<i class="fas fa-angle-left"></i>`;
    outputHTML += `&nbsp;${getContent[view].html}&nbsp;`
    outputHTML += (thinking == "convergent") ? `<i class="fas fa-angle-left"></i>` : `<i class="fas fa-angle-right"></i>`;
    outputHTML += `
      </div><div class="element__symbol ${basis}">${symbol}</div>
      <div class="element__name hyphenate">${truncate(shortName)}</div>
      <div class="element__position">${i + 1}</div>
    </div>`
  }

  document.querySelector(".container").innerHTML += outputHTML;
}

function layOutGrid() {

  layoutData = []

  for (i = 0; i < getGridLayout.length; i++) {
    for (j = 0; j < getGridLayout[i]; j++) {
      intial = 6 - getGridLayout[i]; //required for grid space loayout from top to down


      layoutData.push("grid-area: " + (intial + j + 1) + " / " + (i + 1));
    }
  }

  //for laying out the grid items on row 8 to 9 and column 5 to 18 the strategy items

  for (i = 5; i < 19; i++) {
    for (j = 8; j < 10; j++) {
      layoutData.push("grid-area: " + (j) + "/" + (i));
    }
  }

  document.querySelector(".container").childNodes.forEach((item, index) => {
    item.style = layoutData[index];
  })


}

//https://hibbard.eu/how-to-center-an-html-element-using-javascript/

HTMLElement.prototype.centre = function () {
  let w = window.innerWidth,
    h = window.innerHeight;
  this.style.position = 'absolute';
  this.style.left = (w - this.offsetWidth) / 2 + 'px';
  this.style.top = (h - this.offsetHeight) / 2 + window.pageYOffset + 'px';
}

//https://flaviocopes.com/how-to-uppercase-first-letter-javascript/

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}



function truncate(words) {
  return (words.length > 20) ? words.substr(0, words.lastIndexOf(" ")) : words;
}

function processDefintions(data) {
  let outputHTML = `<div class="legend-box">`;

  data.definitions.forEach((item) => {
    outputHTML += `<div class="legend-item" data-key="${item.key}">
      <div class="legend-preview"><div class="${item.key} legend-key"></div></div>
      <div class="legend-text">
        <div class="legend-title"> ${item.key.capitalize()} Visualizations</div>
        <div class="legend-description">
          ${item.definition}
          </div>
      </div>
    </div>`;
  })

  outputHTML += "</div>";

  document.querySelector(".container").innerHTML += outputHTML;
  document.querySelector(".legend-box").style = "grid-area: 2 /3;"
}

//utility functions

function addClass(className, element, index) {
  setTimeout(() => {
    element.classList.add(className);
  }, index * DELAY);
}

function removeClass(className, element, index) {
  setTimeout(() => {
    element.classList.remove(className);
  }, index * DELAY);
}

async function populateModal(key) {
  data = await getWikipedia(key);
  document.querySelector(".modal-description").innerHTML = data.extract_html;
  document.querySelector(".modal-title").innerHTML = `<h1>${data.displaytitle}</h1>`;
}

async function getWikipedia(entry) {
  xhr = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${entry}`);
  res = await xhr.json()
  return res;
}

function hideModal() {
  document.querySelector(".stage").removeAttribute("style");
  document.querySelector(".modal").style.visibility = "hidden";
  document.querySelector(".cover").style.display = "none";
  document.querySelector(".is-active").style.transform = "translate(0px, 0px) scale(1)";
  window.setTimeout(function () {
    document.querySelector(".is-active").style.zIndex = '';
    document.querySelector(".is-active").style.transform = "";
    document.querySelector(".is-active").classList.remove("is-active");
  }, 1000)
}