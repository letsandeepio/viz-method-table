/* eslint-disable func-names */
/* eslint-disable comma-dangle */
const DELAY = 5;
let IS_MODEL_OPEN = false;

const getContent = {
  overview: {
    html: '<i class="far fa-circle"></i>'
  },
  details: {
    html: '<i class="fas fa-circle dot"></i>'
  },
  both: {
    html: '<i class="far fa-dot-circle"></i>'
  }
};

const getGridLayout = [6, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 6];

async function loadData() {
  const response = await fetch('json/db.json');
  const data = await response.json();
  return data;
}

document.addEventListener('DOMContentLoaded', async () => {
  const listOfElements = await loadData();
  processData(listOfElements);
  layOutGrid();

  const listOfDefinitions = await loadDefinition();
  processDefintions(listOfDefinitions);

  document.querySelectorAll('.element').forEach((item) => {
    item.addEventListener('mouseup', function () {
      modalAnimation(this);
    });
  });

  const containerElement = document.querySelector('.container');
  const keyBoxElement = document.querySelector('.key-box');
  const footer = document.querySelector('.footer');
  containerElement.appendChild(keyBoxElement);
  containerElement.appendChild(footer);

  document.querySelectorAll('.legend-item').forEach((item) => {
    item.addEventListener('mouseenter', function () {
      document
        .querySelectorAll(`.element.${this.getAttribute('data-key')}`)
        .forEach((element, index) => {
          addClass('highlight', element, index);
        });
    });
  });

  document.querySelectorAll('.legend-item').forEach((item) => {
    item.addEventListener('mouseleave', function () {
      document
        .querySelectorAll(`.${this.getAttribute('data-key')}`)
        .forEach((element, index) => {
          removeClass('highlight', element, index);
        });
    });
  });

  tippy.setDefaults({
    animateFill: false,
    animation: 'shift-away',
    inertia: true
  });

  tippy('.element');
  tippy('.key-item', {
    placement: 'top-start'
  });

  document.querySelector('.modal').centre();
});

// document.querySelector(".cover").addEventListener("click", hideModal);

document.onkeydown = function (evt) {
  if (evt.keyCode === 27) {
    hideModal();
  }
};

function modalAnimation(self) {
  IS_MODEL_OPEN = true;
  document.querySelector('.cover').style.display = 'block';
  const selfProperties = self.getBoundingClientRect();
  const positionX = window.innerWidth / 2;
  const positionY = window.innerHeight / 2;

  const scale = window.innerWidth / 250;

  const translateX = Math.round(
    positionX - selfProperties.left - selfProperties.width / 2
  );
  const translateY = Math.round(
    positionY - selfProperties.top - selfProperties.height / 2
  );
  self.style.zIndex = 9998;
  self.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  self.classList.add('is-active');

  populateModal(self);
  setTimeout(showModal, 210);
}

function showModal() {
  document.querySelector('.stage').style.filter = 'blur(2px)';
  document.querySelector('.modal').style.visibility = 'visible';
}

async function loadDefinition() {
  const response = await fetch('json/definitions.json');
  const data = await response.json();

  return data;
}

function processData(data) {
  let outputHTML = '';
  for (let i = 0; i < data.methods.length; i += 1) {
    const method = data.methods[i];
    const name = Object.keys(method);

    const {
      category,
      symbol,
      basis,
      thinking,
      view,
      wikipedia,
      exampleURL,
      description
    } = method[name];
    const shortName = JSON.stringify(name).slice(2, name.length - 3);
    const wikipediaKey = wikipedia.substr(
      wikipedia.lastIndexOf('/') + 1,
      wikipedia.length
    );

    outputHTML += `<div class="element ${category.toLowerCase()} " data-tippy-content="${name}" `;

    if (wikipediaKey) {
      outputHTML += `data-wikipedia-key="${wikipediaKey}"`;
    } else {
      outputHTML += ` data-description="${
        description || 'No desciption available'
      }"`;
    }
    outputHTML += ` data-example-url="${exampleURL}"><div class="element__legend">`;
    outputHTML +=
      thinking === 'convergent'
        ? '<i class="fas fa-angle-right"></i>'
        : '<i class="fas fa-angle-left"></i>';
    outputHTML += `&nbsp;${getContent[view].html}&nbsp;`;
    outputHTML +=
      thinking === 'convergent'
        ? '<i class="fas fa-angle-left"></i>'
        : '<i class="fas fa-angle-right"></i>';
    outputHTML += `
      </div><div class="element__symbol ${basis}">${symbol}</div>
      <div class="element__name hyphenate">${truncate(shortName)}</div>
      <div class="element__position">${i + 1}</div>
    </div>`;
  }

  document.querySelector('.container').innerHTML += outputHTML;
}

function layOutGrid() {
  const layoutData = [];

  for (let i = 0; i < getGridLayout.length; i += 1) {
    for (let j = 0; j < getGridLayout[i]; j += 1) {
      const intial = 6 - getGridLayout[i]; // required for grid space loayout from top to down

      layoutData.push(`grid-area: ${intial + j + 1} / ${i + 1}`);
    }
  }

  // for laying out the grid items on row 8 to 9 and column 5 to 18 the strategy items

  for (let i = 5; i < 19; i += 1) {
    for (let j = 8; j < 10; j += 1) {
      layoutData.push(`grid-area: ${j}/${i}`);
    }
  }

  document.querySelector('.container').childNodes.forEach((item, index) => {
    item.style = layoutData[index];
  });
}

// https://hibbard.eu/how-to-center-an-html-element-using-javascript/

HTMLElement.prototype.centre = function () {
  const w = window.innerWidth;
  const h = window.innerHeight;
  this.style.position = 'absolute';
  this.style.left = `${(w - this.offsetWidth) / 2}px`;
  this.style.top = `${(h - this.offsetHeight) / 2 + window.pageYOffset}px`;
};

const capitalize = function (text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function truncate(words) {
  return words.length > 20 ? words.substr(0, words.lastIndexOf(' ')) : words;
}

function processDefintions(data) {
  let outputHTML = '<div class="legend-box">';

  data.definitions.forEach((item) => {
    outputHTML += `<div class="legend-item" data-key="${item.key}">
      <div class="legend-preview"><div class="${
        item.key
      } legend-key"></div></div>
      <div class="legend-text">
        <div class="legend-title"> ${capitalize(item.key)} Visualizations</div>
        <div class="legend-description">
          ${item.definition}
          </div>
      </div>
    </div>`;
  });

  outputHTML += '</div>';

  document.querySelector('.container').innerHTML += outputHTML;
  document.querySelector('.legend-box').style = 'grid-area: 2 /3;';
}

// utility functions

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

async function populateModal(element) {
  const key = element.getAttribute('data-wikipedia-key');

  const exampleImage = `<img src="${element.getAttribute(
    'data-example-url'
  )}"><br>`;

  if (key) {
    const data = await getWikipedia(key);
    document.querySelector('.modal-description').innerHTML = `${
      exampleImage + data.extract_html
    }<br>`;
    document.querySelector(
      '.modal-title'
    ).innerHTML = `<h1>${data.displaytitle}</h1>`;
    document.querySelector(
      '.wikipedia-url'
    ).innerHTML = `<a href='https://en.wikipedia.org/wiki/${key}' target='_blank'>View on wikipedia</a>`;
  } else {
    document.querySelector('.modal-description').innerHTML = `${
      exampleImage + element.getAttribute('data-description')
    }<br>`;
    document.querySelector(
      '.modal-title'
    ).innerHTML = `<h1>${element.getAttribute('data-tippy-content')}</h1>`;
  }
}

async function getWikipedia(entry) {
  const xhr = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${entry}`
  );
  const res = await xhr.json();
  return res;
}

function hideModal() {
  document.querySelector('.stage').removeAttribute('style');
  document.querySelector('.modal').style.visibility = 'hidden';
  document.querySelector('.cover').style.display = 'none';
  document.querySelector('.is-active').style.transform = '';
  window.setTimeout(() => {
    document.querySelector('.is-active').style.zIndex = '';
    document.querySelector('.is-active').classList.remove('is-active');
  }, 500);
}
