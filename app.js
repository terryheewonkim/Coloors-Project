// GLOBAL SELECTORS AND VARIABLES
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll(`input[type="range"]`);
const currentHexes = document.querySelectorAll(".color h2");
let initialColors;

///////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////

// Color Generator
function generateHex() {
  // HERE we use chroma.js library

  const hexColor = chroma.random();
  return hexColor;

  // BELOW is a written out function without using chroma.js

  // const letters = "0123456789ABCDEF";
  // let hash = "#";
  // for (let i = 0; i < 6; i++) {
  //   hash += letters[Math.floor(Math.random() * 16)];
  // }
  // return hash;
}

// Loop through each color div and assign a random color
function randomColors() {
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    // Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Check for contrast
    checkTextContrast(randomColor, hexText);
  });
}

// Check contrast of h2 text with background color
function checkTextContrast(color, text) {
  // Check luminance
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

randomColors();
