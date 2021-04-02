// GLOBAL SELECTORS AND VARIABLES
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll(`input[type="range"]`);
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtns = document.querySelectorAll(".adjust");
const lockBtns = document.querySelectorAll(".lock");
const closeAdjustBtns = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;
// For local storage
let savedPalettes = [];

///////////////////////////////////////
// EVENT LISTENERS
///////////////////////////////////////

// Generate button produces new colors
generateBtn.addEventListener("click", randomColors);

// Slider controls
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

// Update color of each panel based on changes made to controls
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

// Copy to clipboard when you click on hex code
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

// Remove active class when transition ends for copy popup box
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

// Open adjustment panel when you click on adjustment button
adjustBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

// Close adjustment panel
closeAdjustBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

// Toggle lock button icons
lockBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    colorDivs[index].classList.toggle("locked");
    if (colorDivs[index].classList.contains("locked")) {
      btn.innerHTML = `<i class="fas fa-lock"></i>`;
    } else {
      btn.innerHTML = `<i class="fas fa-lock-open"></i>`;
    }
  });
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
    const icons = div.querySelectorAll(".controls button");

    // Check if current div is locked.
    // If locked, push the previous value and return out of the for loop
    // If not, push to initialColors array
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    // Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Check for contrast
    checkTextContrast(randomColor, hexText);
    for (icon of icons) {
      checkTextContrast(randomColor, icon);
    }

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
  // check text & icons contrast
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

// Open adjustment panels according to index
function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
// Implement Save to palette and LOCAL STORAGE stuff
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

// EVENT LISTENERS
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

// FUNCTIONS
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function savePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // Generate object to store in local storage
  let paletteNum = savedPalettes.length;
  const paletteObj = {
    name,
    colors,
    number: paletteNum,
  };
  savedPalettes.push(paletteObj);
  // Save to local storage
  saveToLocal(paletteObj);
  // Clear input value;
  saveInput.value = "";
  // Generate palette for library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-button");
  paletteBtn.classList.add(paletteObj.number);
  paletteBtn.innerText = "Select";

  // Attach event to pick palette button
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    // Reset initial colors, push in the ones from saved library
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      // Update background color, hex text, and contrast checks
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetSliders();
  });

  // Append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localPalettes;
  // Check if local storage data already exists
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  // Push palette object & put in storage
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

// Open & close library
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("acitve");
}

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("acitve");
}

// Generate random colors on page load
randomColors();
