// GLOBAL SELECTORS AND VARIABLES
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll(`input[type="range"]`);
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
let initialColors;

///////////////////////////////////////
// EVENT LISTENERS
///////////////////////////////////////

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

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
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    // Add it to initial colors array
    initialColors.push(chroma(randomColor).hex());

    // Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Check for contrast
    checkTextContrast(randomColor, hexText);

    // Initialize colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  // Reset inputs/sliders
  resetSliders();
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

// Set values on sliders
function colorizeSliders(color, hue, brightness, saturation) {
  // Scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // Scale brightness (black, color value, white)
  const midBright = color.set("hsl.l", 0.5);
  const scaleBrightness = chroma.scale(["black", midBright, "white"]);

  // Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(
    0
  )}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;
}

// Update bg color according to changes in sliders
function hslControls(e) {
  const index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");
  let sliders = e.target.parentElement.querySelectorAll("input[type=range]");
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  // Refer to initial color, not the changed color
  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;
  // Colorize inputs/sliders
  colorizeSliders(color, hue, brightness, saturation);
}

// Update the text that shows the hex code
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();
  // check text contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

// Reset sliders on load
function resetSliders() {
  sliders.forEach((slider) => {
    const color = initialColors[slider.getAttribute(`data-${slider.name}`)],
      hueValue = chroma(color).hsl()[0].toFixed(2),
      saturationValue = chroma(color).hsl()[1].toFixed(2),
      brightnessValue = chroma(color).hsl()[2].toFixed(2);

    switch (slider.name) {
      case "hue":
        slider.value = hueValue;
        break;
      case "brightness":
        slider.value = brightnessValue;
        break;
      case "saturation":
        slider.value = saturationValue;
        break;
    }
  });
}

// Copy to clipboard function
function copyToClipboard(hex) {
  // Create a temporary variable to store the hex value
  const temp = document.createElement("textarea");
  temp.value = hex.innerText;
  document.body.appendChild(temp);
  // Select all text inside textarea, and then copy to clipboard
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  // Popup animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

// Generate random colors on page load
randomColors();
