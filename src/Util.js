/**
 * Initializes the interactive behavior for the edge button and related elements.
 */
function initializeInterfaceEdgeBtn() {
  const bodyElement = document.body;
  const extraSetElement = document.getElementById("settings-bg");
  const edgeButtonElement = document.getElementById("edge_btn");
  const settingsCloseBtn = document.getElementById("settings-close-btn");

  /**
   * Handles the animation for the specified elements.
   * @param {string} action - The action to perform ('expand' or 'collapse').
   */
  const handleAnimation = (action) => {
    const animationType = action === "expand" ? "fadeOut" : "fadeIn";
    const duration = "250ms";

    ["extra_set"].forEach((id) => {
      const element = document.getElementById(id);
      element.style.animation = `${animationType} ${duration} 1 forwards`;
    });
  };

  /**
   * Expands the interface by updating classes and triggering animations.
   */
  const expandInterface = () => {
    bodyElement.classList.remove("collapsed");
    extraSetElement.classList.add("expanded2");
    handleAnimation("expand");
  };

  /**
   * Collapses the interface by updating classes and triggering animations.
   */
  const collapseInterface = () => {
    bodyElement.classList.add("collapsed");
    extraSetElement.classList.remove("expanded2");
    extraSetElement.classList.add("collapsed2");
    handleAnimation("collapse");
  };

  //collapseInterface() // for test

  // Attach event listeners
  edgeButtonElement.addEventListener("click", collapseInterface);
  settingsCloseBtn.addEventListener("click", expandInterface);
}

// Define an object containing key-value pairs for link identifiers and their corresponding URLs
const links = {
  gt: "https://github.com/0xMe/ItemID2/", // GitHub profile link
};
// Iterate over the entries of the 'links' object
Object.entries(links).forEach(([t, e]) => {
  // For each entry, add a 'click' event listener to the element with the corresponding ID
  document.getElementById(t).addEventListener("click", () => {
    // On click, open the associated URL in a new browser tab/window
    window.open(e);
  });
});

/**
 * Filters items in trash mode based on a search term and logs the results.
 *
 * @param {number} currentPage - The current page number (future implementation for pagination).
 * @param {string} searchTerm - The term used to filter items in trash mode.
 * @param {Array<string>} trashItems - The array of items in trash to filter.
 * @returns {Promise<void>} A promise that resolves after logging the filtered results.
 * @throws {TypeError} Throws if input parameters are invalid.
 */
async function displayFilteredTrashItems(currentPage, searchTerm, trashItems) {
  // Validate input types
  if (typeof currentPage !== "number" || currentPage < 1) {
    throw new TypeError(
      "The 'currentPage' parameter must be a positive number.",
    );
  }
  if (typeof searchTerm !== "string") {
    throw new TypeError("The 'searchTerm' parameter must be a string.");
  }
  if (!Array.isArray(trashItems)) {
    throw new TypeError(
      "The 'trashItems' parameter must be an array of strings.",
    );
  }
  // Normalize the search term for case-insensitive matching
  const normalizedTerm = searchTerm.trim().toLowerCase();
  // Filter the trash items based on the search term
  const filteredTrash = trashItems.filter((item) =>
    item.toString().toLowerCase().includes(normalizedTerm),
  );
  const startIdx = (currentPage - 1) * 200;
  const endIdx = Math.min(startIdx + 200, filteredTrash.length);
  const webpGallery = document.getElementById("webpGallery");
  const fragment = document.createDocumentFragment(); // Use DocumentFragment for batch DOM updates
  webpGallery.innerHTML = ""; // Clear existing content
  for (let i = startIdx; i < endIdx; i++) {
    const item = filteredTrash[i];
    const image = document.createElement("img");
    image.className = "image p-3 bounce-click ";
    image.loading = "lazy";
    image.id = "list_item_img";
    image.setAttribute('crossorigin', 'anonymous');
    let imgSrc =
      `https://raw.githubusercontent.com/jinix6/ff-resources/refs/heads/main/pngs/${itemID.config.pngsQuality}/` +
      item;
    image.src = imgSrc;
    image.addEventListener("click", () =>
      displayItemInfo(item, imgSrc, image, (isTrashMode = true)),
    );
    fragment.appendChild(image);
  }
  webpGallery.appendChild(fragment); // Add all images at once
  totalPages = Math.ceil(filteredTrash.length / 200);
  renderPagination(searchTerm, trashItems, (isTrashMode = true), totalPages); // Render pagination
}

// Class utility functions
const removeClasses = (elements, ...classes) => {
  elements.forEach((el) => el.classList.remove(...classes));
};

const addClasses = (element, ...classes) => {
  element.classList.remove("Mtext-color2");
  element.classList.add(...classes);
};

const addClassesList = (elements, ...classes) => {
  elements.forEach((el) => el.classList.add(...classes));
};

/**
 * Handles data display mode changes and UI updates.
 *
 * @param {HTMLElement} element - The clicked element triggering the mode change.
 * @param {string} searchKeyword - The search keyword to filter the items.
 */
function handleDisplayChange(element, searchKeyword) {
  const displayMode = element.value;

  // Encrypt and update the URL parameter for 'mode'
  updateUrlParameter("mode", displayMode);

  let [all_tag_id, ob46_tag_id, ob47_tag_id, trashItem_btn] = [
    "AllItem_btn",
    "Ob46Item_btn",
    "Ob47Item_btn",
    "trashItem_btn",
  ].map((id) => document.getElementById(id));
  // Common UI elements for mode switching
  const uiElements = {
    tags: [ob46_tag_id, ob47_tag_id, all_tag_id, trashItem_btn],
    webpGallery: document.getElementById("webpGallery"),
  };

  /**
   * Resets the UI elements to their default state.
   */
  const resetUI = () => {
    removeClasses(uiElements.tags, "Mtext-color", "Mbg-color");
  };

  // Update UI and call specific functions based on the selected mode
  resetUI();
  searchKeyword = searchKeyword === null ? "" : searchKeyword;
  switch (displayMode) {
    case "1":
      addClassesList([ob46_tag_id, ob47_tag_id, all_tag_id], "Mtext-color2");
      addClasses(element, "Mtext-color", "Mbg-color");
      displayFilteredTrashItems(1, searchKeyword, pngs_json_list);
      itemID.state.displayMode = 1;
      break;

    case "2":
      addClassesList([ob46_tag_id, ob47_tag_id, trashItem_btn], "Mtext-color2");
      addClasses(element, "Mtext-color", "Mbg-color");
      displayPage(1, searchKeyword, itemData);
      itemID.state.displayMode = 2;
      break;

    case "3":
      addClassesList([all_tag_id, ob47_tag_id, trashItem_btn], "Mtext-color2");
      addClasses(element, "Mtext-color", "Mbg-color");
      displayPage(1, searchKeyword, gl_ob46_added_itemData);
      itemID.state.displayMode = 3;
      break;

    case "4":
      addClassesList([ob46_tag_id, all_tag_id, trashItem_btn], "Mtext-color2");
      addClasses(element, "Mtext-color", "Mbg-color");
      displayPage(1, searchKeyword, gl_ob47_added_itemData);
      itemID.state.displayMode = 4;
      break;

    default:
      console.warn(`Unsupported display mode: ${displayMode}`);
      return; // Exit if the mode is invalid
  }

  // Trigger animation on the gallery element
  if (uiElements.webpGallery) {
    uiElements.webpGallery.classList.remove("slide-top");
    void uiElements.webpGallery.offsetWidth; // Force reflow to restart animation
    uiElements.webpGallery.classList.add("slide-top");
  }
}

/**
 * Adds an event listener to trigger the search function when the Enter key is pressed.
 *
 * @param {HTMLElement} inputElement - The input field element to listen for keydown events.
 * @param {Function} searchFunction - The function to call when the Enter key is pressed.
 */
function addEnterKeyListener(inputElement, searchFunction) {
  if (!inputElement || typeof searchFunction !== "function") {
    console.error(
      "Invalid parameters: Input element or search function is missing.",
    );
    return;
  }

  // Add event listener for keydown events
  inputElement.addEventListener("keydown", function(event) {
    // Trigger search function when the Enter key is pressed
    if (event.key === "Enter") {
      searchFunction();
    }
  });
}


/**
 * @function getDominantColor
 * @description Extracts the dominant RGB color from an image, canvas, or video element.
 * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} element - The source element (image, canvas, or video).
 * @returns {{ r: number, g: number, b: number } | null} The dominant color as an object with red, green, and blue components, or `null` if an error occurs.
 */
function getDominantColor(element) {
  try {
    // Validate the input element
    if (!(element instanceof HTMLImageElement || element instanceof HTMLCanvasElement || element instanceof HTMLVideoElement)) {
      throw new Error("Invalid element type. Expected an HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement.");
    }

    // Ensure the element has valid dimensions
    const width = element.naturalWidth || element.width || element.videoWidth;
    const height = element.naturalHeight || element.height || element.videoHeight;
    if (!width || !height) {
      throw new Error("The element has invalid or zero dimensions.");
    }

    // Create a canvas to draw the element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas 2D context.");
    }

    // Set canvas dimensions and draw the element
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(element, 0, 0, width, height);

    // Extract pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Calculate the average RGB values
    let r = 0,
      g = 0,
      b = 0,
      count = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i]; // Red
      g += imageData[i + 1]; // Green
      b += imageData[i + 2]; // Blue
      count++;
    }

    // Compute average values
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    return { r, g, b };
  } catch (error) {
    console.error("Error in getDominantColor:", error.message);
    return null; // Return null if an error occurs
  }
}

/**
 * Calculates the contrast color (text color) based on the background color.
 * This function adjusts the brightness or darkness of the text color based on the luminance
 * of the background color to ensure sufficient contrast.
 *
 * @param {object} rgbColor - The background color in RGB format.
 * @param {number} rgbColor.r - The red component of the background color (0-255).
 * @param {number} rgbColor.g - The green component of the background color (0-255).
 * @param {number} rgbColor.b - The blue component of the background color (0-255).
 * @param {number} adjustBrightness - The factor by which to brighten the text (positive number).
 * @param {number} adjustDarkness - The factor by which to darken the text (positive number).
 * @returns {string} - The calculated text color in hexadecimal format.
 * @throws {Error} - Throws an error if the input `rgbColor` is not in the correct format or out of range.
 */
function getContrastColor(rgbColor, adjustBrightness = 1, adjustDarkness = 1) {
  // Validate input type for rgbColor
  if (typeof rgbColor !== 'object' || !rgbColor || !('r' in rgbColor) || !('g' in rgbColor) || !('b' in rgbColor)) {
    throw new Error('Invalid RGB color format. Expected an object with properties "r", "g", and "b".');
  }

  // Extract RGB values and ensure they're within valid range (0-255)
  const { r, g, b } = rgbColor;
  if (![r, g, b].every(val => Number.isInteger(val) && val >= 0 && val <= 255)) {
    throw new Error('RGB values must be integers between 0 and 255.');
  }

  // Create a color object using chroma.js
  const bgColorObj = chroma(r, g, b);

  // Calculate luminance of the background color
  const luminanceValue = bgColorObj.luminance();

  // Default text color
  let textColor;

  // Adjust brightness or darkness based on luminance value
  if (luminanceValue < 0.5) {
    // If the background is dark, brighten the text
    textColor = bgColorObj.brighten(adjustBrightness).hex();
  } else {
    // If the background is light, darken the text
    textColor = bgColorObj.darken(adjustDarkness).hex();
  }

  // Return the calculated text color in hex format
  return textColor;
}


/**
 * Displays detailed information about an item when the user interacts with an element.
 * This function handles UI updates, animations, and transitions for both normal and trash modes.
 *
 * @param {Object} itemData - An object containing the item's data (e.g., id, icon, descriptions).
 * @param {string} imageSource - The URL or path to the item's image.
 * @param {HTMLElement} sharedElement - The DOM element shared between pages for transition/animation.
 * @param {boolean} isTrashMode - A flag indicating whether the app is in trash/recycle mode.
 */
function displayItemInfo(itemData, imageSource, sharedElement, isTrashMode) {
  const targetElement = document.getElementById("cardimage");
  const pageBackgrounds = ["mainnnnn-bg", "dialog-main-bg"];
  const dialogTitleParagraphs = {
    hedear: document.getElementById("dialog-tittle"),
    title: document.getElementById("dialog-tittle-p"),
    iconName: document.getElementById("dialog-tittle-pp"),
    closeBtn: document.getElementById("hide_dialg_btn"),
    shareButton: document.getElementById("share-btn"),
  };

  // Set the image source for the item
  targetElement.src = imageSource || "";

  const imgBg = document.getElementById("info-dialoh-bg");
  const dominantColor = getDominantColor(sharedElement);
  if (dominantColor) {
    imgBg.style.backgroundColor = `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
    const dominantColorobj = {
      r: dominantColor.r,
      g: dominantColor.g,
      b: dominantColor.b,
    }
    const dialogTitleElements = ["dialog-tittle", "dialog-tittle-p", "dialog-tittle-pp"];
    const textColor = getContrastColor(dominantColorobj, 5, 5);
    dialogTitleElements.forEach(id => document.getElementById(id).style.color = textColor);
    const closebtnBgColor = getContrastColor(dominantColorobj, 3, 3);
    const closebtnBrColor = getContrastColor(dominantColorobj, 4, 4);
    const closebtnTextColor = getContrastColor(dominantColorobj, 0, 0);
    ["hide_dialg_btn", "share-btn"].forEach(id => {
      const btn = document.getElementById(id);
      btn.style.background = closebtnBgColor;
      btn.style.borderColor = closebtnBrColor;
      btn.style.textColor = closebtnTextColor;

    });
  } else {
    console.error("Failed to extract the dominant color.");
  }

  // Apply fade-in animation to background elements
  pageBackgrounds.forEach((id) => {
    document.getElementById(id).style.animation = "fadeIn 250ms 1 forwards";
  });

  // Handle display content based on trash mode
  if (!isTrashMode) {
    // Extract and display item details when not in trash mode
    const { icon, description, description2, itemID } = itemData;
    const itemDetail = description2 ?
      `${description} - ${description2}` :
      description;
    dialogTitleParagraphs.hedear.textContent = itemDetail;
    dialogTitleParagraphs.title.textContent = `Id: ${itemID}`;
    dialogTitleParagraphs.iconName.textContent = `Icon Name: ${icon}`;

    // Show dialog title, description, and icon name with animation
    [
      dialogTitleParagraphs.hedear,
      dialogTitleParagraphs.title,
      dialogTitleParagraphs.iconName,
    ].forEach((element, index) => {
      element.style.display = "";
      setTimeout(() => {
        element.classList.add("slide-top");
        element.classList.remove("slide-bottom");
      }, index * 200);
    });

    // Ensure the share button is visible in normal mode
    if (dialogTitleParagraphs.shareButton) {
      dialogTitleParagraphs.shareButton.style.display = "";
    }
  } else {
    // Display item name in trash mode (without description)
    dialogTitleParagraphs.hedear.textContent = itemData.replace(".png", "");

    // Hide unnecessary elements (title, iconName) in trash mode
    [dialogTitleParagraphs.title, dialogTitleParagraphs.iconName].forEach(
      (element) => {
        element.style.display = "none";
      },
    );

    // Apply animation for dialog title in trash mode
    setTimeout(() => {
      dialogTitleParagraphs.hedear.classList.add("slide-top");
      dialogTitleParagraphs.hedear.classList.remove("slide-bottom");
    }, 0);

    // Hide the share button in trash mode
    if (dialogTitleParagraphs.shareButton) {
      dialogTitleParagraphs.shareButton.style.display = "none";
    }
  }

  // Disable interactions with the shared element during transition
  sharedElement.classList.add("touch-none");

  // Get the position and size of the shared element and target element
  const startRect = sharedElement.getBoundingClientRect();
  const endRect = targetElement.getBoundingClientRect();

  // Clone the shared element for the animation
  const clone = sharedElement.cloneNode(true);
  document.body.appendChild(clone);

  // Style the clone element to match the shared element's position and size
  gsap.set(clone, {
    position: "absolute",
    top: startRect.top + window.scrollY,
    left: startRect.left + window.scrollX,
    width: startRect.width,
    height: startRect.height,
    zIndex: 10,
  });

  // Animate the clone to the target element's position
  gsap.to(clone, {
    duration: 0.5,
    top: endRect.top + window.scrollY,
    left: endRect.left + window.scrollX,
    width: endRect.width,
    height: endRect.height,
    ease: "power2.inOut",
  });

  // Event listener to close the dialog and return the shared element to its original position
  dialogTitleParagraphs.closeBtn.addEventListener("click", () => {
    // Restore interaction with the shared element
    sharedElement.classList.remove("touch-none");

    // Animate closing of dialog title and paragraphs
    [
      dialogTitleParagraphs.hedear,
      dialogTitleParagraphs.title,
      dialogTitleParagraphs.iconName,
    ].forEach((element, index) => {
      setTimeout(() => {
        element.classList.remove("slide-top");
        element.classList.add("slide-bottom");
      }, index * 100);
    });

    // Apply fade-out animation to the background
    setTimeout(() => {
      pageBackgrounds.forEach((id) => {
        document.getElementById(id).style.animation =
          "fadeOut 300ms 1 forwards";
      });
    }, 250);

    // Animate the clone back to its original position and remove it after completion
    gsap.to(clone, {
      duration: 0.5,
      top: startRect.top + window.scrollY,
      left: startRect.left + window.scrollX,
      width: startRect.width,
      height: startRect.height,
      ease: "power2.inOut",
      onComplete: () => {
        clone.remove();
      },
    });
  });
}

/**
 * Handles the search functionality for filtering items based on the provided keyword.
 * It updates the URL parameters and triggers the appropriate display function based on the current display mode.
 */
function search() {
  // Retrieve the search keyword from the input field
  const searchKeyword = document.getElementById("search-input").value;

  // Encrypt and update the URL parameter for 'icon'
  updateUrlParameter("q", searchKeyword);

  // Determine the current display mode and call the corresponding function
  if (itemID.state.displayMode === 1) {
    // Display filtered trash items if the display mode is set to 1
    filterAndDisplayTrashItems(searchKeyword);
  } else {
    // Otherwise, display the filtered page with the current data
    filterAndDisplayPage(searchKeyword);
  }
}

/**
 * Updates the URL parameter without refreshing the page.
 * @param {string} paramName - The name of the URL parameter.
 * @param {string} paramValue - The value of the URL parameter.
 */
function updateUrlParameter(paramName, paramValue) {
  addParameterWithoutRefresh(paramName, paramValue);
}

/**
 * Filters and displays trash items based on the search keyword.
 * @param {string} searchKeyword - The keyword to filter trash items.
 */
function filterAndDisplayTrashItems(searchKeyword) {
  displayFilteredTrashItems(1, searchKeyword, pngs_json_list);
}

/**
 * Filters and displays the page content based on the search keyword.
 * @param {string} searchKeyword - The keyword to filter the page content.
 */
function filterAndDisplayPage(searchKeyword) {
  displayPage(1, searchKeyword, current_data);
}

/**
 * Navigates to a specific page and performs an action based on search term and mode.
 *
 * @param {number} pageNumber - The page number to navigate to.
 * @param {string} searchTerm - The term to search for.
 * @param {Array} webps - The list of webps to be used in displaying the page.
 * @param {boolean} isTrashMode - A flag indicating whether trash mode is enabled.
 * @returns {Promise<void>} A promise that resolves when the page is displayed.
 */
async function goToPage(
  pageNumber,
  searchTerm,
  webps,
  isTrashMode,
  totalPages,
) {
  // Validate input
  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > totalPages
  ) {
    console.error("Invalid page number:", pageNumber);
    return;
  }

  if (typeof searchTerm !== "string") {
    console.error("Invalid search term:", searchTerm);
    return;
  }

  if (!Array.isArray(webps)) {
    console.error("Invalid webps array:", webps);
    return;
  }

  // Set the current page and search term
  currentPage = pageNumber;
  currentSearchTerm = searchTerm;

  try {
    // Display content based on trash mode
    if (isTrashMode) {
      await displayFilteredTrashItems(currentPage, currentSearchTerm, webps);
    } else {
      await displayPage(currentPage, currentSearchTerm, webps);
    }
  } catch (error) {
    // Handle any errors during the page display
    console.error("Error displaying page:", error);
  }
}

/**
 * Generates an array of pagination numbers from 1 to the total number of pages.
 *
 * @param {number} totalPages - The total number of pages.
 * @returns {Promise<number[]>} A promise that resolves to an array of pagination numbers.
 *
 * @example
 * // Example usage
 * generatePaginationNumbers(10).then(paginationNumbers => {
 *   console.log(paginationNumbers); // [1, 2, 3, ..., 10]
 * });
 */
async function generatePaginationNumbers(totalPages) {
  if (typeof totalPages !== "number") {
    throw new Error("Invalid totalPages value.");
  }

  const paginationNumbers = Array.from({ length: totalPages },
    (_, index) => index + 1,
  );
  return paginationNumbers;
}

/**
 * Updates the URL by removing all query parameters with empty values.
 */
function updateUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  let isUrlUpdated = false;

  // Iterate through all parameters and remove those with empty values
  for (const [key, value] of urlParams.entries()) {
    if (value === "") {
      urlParams.delete(key);
      isUrlUpdated = true;
    }
  }

  // Update the URL in the browser if changes were made
  if (isUrlUpdated) {
    const newUrl = `${window.location.origin}${window.location.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}`;
    history.pushState({ path: newUrl }, "", newUrl);
  }
}

/**
 * Checks URL parameters for a search keyword and display mode, then updates the UI accordingly.
 */
function handleDisplayBasedOnURL() {
  // Retrieve URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const searchKeyword = urlParams.get("q") || ""; // Default to empty string if 'q' is not set
  const displayMode = urlParams.get("mode");

  // Set the input field's value to the search keyword
  document.getElementById("search-input").value = searchKeyword;

  // Map of display modes to buttons
  const buttonMap = {
    1: "trashItem_btn",
    2: "AllItem_btn",
    3: "Ob46Item_btn",
    4: "Ob47Item_btn",
  };

  // Determine the button to show based on the display mode or fallback to 'AllItem_btn'
  const buttonId = buttonMap[displayMode] || "AllItem_btn";
  const targetButton = document.getElementById(buttonId);

  // Call the function to change the display with the selected button and search keyword
  handleDisplayChange(targetButton, searchKeyword);
}

/**
 * Theme Switcher Module
 * Responsible for toggling between light and dark themes,
 * persisting the user's preference in localStorage, and detecting
 * system theme preference changes.
 */

// Constants for theme classes and localStorage keys
const THEME_STORAGE_KEY = "theme";
const LIGHT_MODE_CLASS = "light-mode";
const DARK_MODE_CLASS = "dark-mode";

/**
 * Applies the given theme to the document body.
 *
 * @param {string} theme - The theme to apply. Expected values: 'light' or 'dark'.
 */
function applyTheme(theme) {
  if (theme === "light") {
    document.getElementById("toggle-switcher").classList.add("light-toggle-on");
    document.getElementById("toggle").classList.add("light-toggle-on2");
    document.body.classList.add(LIGHT_MODE_CLASS);
    document.body.classList.remove(DARK_MODE_CLASS);
  } else if (theme === "dark") {
    document.getElementById("toggle").classList.remove("light-toggle-on2");
    document
      .getElementById("toggle-switcher")
      .classList.remove("light-toggle-on");
    document.body.classList.add(DARK_MODE_CLASS);
    document.body.classList.remove(LIGHT_MODE_CLASS);
  } else {
    console.warn("Invalid theme selected. Defaulting to dark mode.");
    document.body.classList.add(DARK_MODE_CLASS);
    document.body.classList.remove(LIGHT_MODE_CLASS);
  }
}

/**
 * Saves the theme to localStorage for persistence across sessions.
 *
 * @param {string} theme - The theme to save. Expected values: 'light' or 'dark'.
 */
function saveThemeToLocalStorage(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Retrieves the stored theme preference from localStorage.
 * Defaults to dark mode if no preference is found.
 *
 * @returns {string} - The stored theme or 'dark' if none is found.
 */
function getStoredTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "light" ? "light" : "dark"; // Default to 'dark' if no valid theme is stored
}

/**
 * Initializes the theme based on the user's preference (localStorage or system preference).
 */
function initializeTheme() {
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme);
}

/**
 * Toggles between light and dark mode when the theme button is clicked.
 * Also updates the localStorage with the user's choice.
 */
function toggleTheme() {
  document
    .getElementById("toggle-switcher")
    .classList.toggle("light-toggle-on");
  const currentTheme = document.body.classList.contains(LIGHT_MODE_CLASS) ?
    "light" :
    "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  applyTheme(newTheme);
  saveThemeToLocalStorage(newTheme);
}

/**
 * Handles changes to the system theme preference (e.g., when the user switches system-wide theme).
 * Automatically applies the appropriate theme unless the user has set a preference.
 */
function handleSystemThemeChange() {
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  const currentTheme = getStoredTheme();

  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    applyTheme(systemPrefersDark ? "dark" : "light");
  }
}

/**
 * Event listener for the theme toggle button.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the theme based on the stored or system preference
  initializeTheme();

  // Add event listener for the theme toggle button
  const themeToggleButton = document.getElementById(
    "setting-toggle-appearance-autoLanguage",
  );
  themeToggleButton.addEventListener("click", toggleTheme);

  // Listen for changes in the system's theme preference
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", handleSystemThemeChange);
});

// Initialize switcher elements
const [m_Switcher1, m_Switcher2, m_Switcher3] = [
  document.getElementById("m-Switcher-1"),
  document.getElementById("m-Switcher-2"),
  document.getElementById("m-Switcher-3"),
];

// Function to update switcher appearance based on quality index
function updateSwitcherAppearance(qualityIndex) {
  const switchers = [m_Switcher1, m_Switcher2, m_Switcher3];
  switchers.forEach((switcher, index) => {
    switcher.classList.toggle(
      "setting-button-appearance-quality-on",
      index === qualityIndex,
    );
    switcher.style.color =
      index === qualityIndex ? "var(--primary)" : "var(--secondary)";
  });
}

// Quality mappings
const qualityMapping = { "100x100": 0, "200x200": 1, "300x300": 2 };

// Load stored quality from localStorage, default to 200x200
function initializeQuality() {
  const storedQuality = localStorage.getItem("pngsQuality") || "200x200";
  const qualityIndex = qualityMapping[storedQuality];
  console.log(storedQuality);

  // Validate stored quality
  if (qualityIndex !== undefined) {
    updateSwitcherAppearance(qualityIndex);
    itemID.config.pngsQuality = storedQuality; // Ensure global config is updated
  } else {
    console.warn(`Invalid quality in localStorage: ${storedQuality}`);
    localStorage.setItem("pngsQuality", "200x200");
    updateSwitcherAppearance(1); // Default to 200x200
    itemID.config.pngsQuality = "200x200";
  }
}

// Function to set PNG quality
function setPngQuality(element) {
  const qualityMap = { 1: "100x100", 2: "200x200", 3: "300x300" };
  const selectedQuality = qualityMap[element.value];

  if (selectedQuality) {
    localStorage.setItem("pngsQuality", selectedQuality); // Save quality in localStorage
    updateSwitcherAppearance(qualityMapping[selectedQuality]); // Update switcher appearance
    itemID.config.pngsQuality = selectedQuality; // Update global config
  } else {
    console.warn(`Unsupported quality mode: ${element.value}`);
  }
}

// Initialize quality settings on load
initializeQuality();