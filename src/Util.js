/**
 * Renders pagination controls based on total page count and current search context.
 * Handles empty results by showing a "NOT FOUND" message and hiding pagination.
 *
 * @param {string} searchTerm - Current search input
 * @param {Array} itemList - Full dataset of items
 * @param {boolean} isTrashMode - Flag for alternate rendering mode
 * @param {number} totalPages - Total number of pages to render
 */
async function renderPagination(searchTerm, itemList, isTrashMode, totalPages) {
  const pageNumbers = await generatePaginationNumbers(totalPages);
  const paginationHeader = document.getElementById("pagi73hd");
  const paginationContainer = document.getElementById("pagination");
  
  // Handle empty result set: hide pagination and show "NOT FOUND" message
  if (pageNumbers.length === 0) {
    paginationHeader.style.visibility = "hidden";
    
    // Prevent duplicate "NOT FOUND" message
    if (!notFoundText()) {
      const notFoundMessage = document.createElement("h1");
      notFoundMessage.id = "not_found_text";
      notFoundMessage.className =
        "transition-all duration-100 ease-in-out font-black select-none ibm-plex-mono-regular text-zinc-500 rotate-90 text-[500%] w-[10vw] text-center whitespace-nowrap";
      notFoundMessage.innerText = "NOT FOUND";
      document.getElementById("container").appendChild(notFoundMessage);
    }
    return;
  }
  
  // Valid results: show pagination and remove "NOT FOUND" if present
  paginationHeader.style.visibility = "visible";
  const notFoundElement = notFoundText();
  if (notFoundElement) notFoundElement.remove();
  
  // Clear existing pagination buttons
  paginationContainer.innerHTML = "";
  
  // Render each pagination button
  pageNumbers.forEach((pageNum) => {
    const button = document.createElement("button");
    button.className =
      "px-[8%] bg-[var(--secondary)] bounce-click select-none rounded-[11px] text-center ibm-plex-mono-regular font-medium uppercase text-[var(--primary)] disabled:pointer-events-none disabled:shadow-none";
    
    // Highlight the active page
    if (pageNum === currentPage) {
      button.classList.remove(
        "bg-[var(--secondary)]",
        "text-[var(--primary)]",
        "border",
        "border-2",
        "border-[var(--border-color)]"
      );
      button.classList.add(
        "text-[var(--secondary)]",
        "bg-[var(--primary)]"
      );
    }
    
    button.textContent = pageNum;
    
    // Attach click handler to navigate to selected page
    button.addEventListener("click", async () => {
      await goToPage(pageNum, searchTerm, itemList, isTrashMode, totalPages);
    });
    
    paginationContainer.appendChild(button);
  });
}






/**
 * Initializes the interactive behavior for the edge button and related elements.
 */
function initializeInterfaceEdgeBtn() {
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
    document.body.classList.remove("collapsed");
    extraSetElement.classList.add("expanded2");
    handleAnimation("expand");
  };
  
  /**
   * Collapses the interface by updating classes and triggering animations.
   */
  const collapseInterface = () => {
    fetchRecentCommits();
    document.body.classList.add("collapsed");
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
  gt: "https://github.com/0xme/ItemID2",
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
    image.setAttribute("crossorigin", "anonymous");
    let imgSrc =
      `https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/` +
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
  
  let [all_tag_id, trashItem_btn] = ["AllItem_btn", "trashItem_btn"].map((id) =>
    document.getElementById(id),
  );
  // Common UI elements for mode switching
  const uiElements = {
    tags: [all_tag_id, trashItem_btn],
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
      addClassesList([all_tag_id], "Mtext-color2");
      addClasses(element, "Mtext-color", "Mbg-color");
      displayFilteredTrashItems(1, searchKeyword, pngs_json_list);
      itemID.state.displayMode = 1;
      break;
      
    case "2":
      addClassesList([trashItem_btn], "Mtext-color2");
      addClasses(element, "Mtext-color", "Mbg-color");
      displayPage(1, searchKeyword, itemData);
      itemID.state.displayMode = 2;
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
    if (
      !(
        element instanceof HTMLImageElement ||
        element instanceof HTMLCanvasElement ||
        element instanceof HTMLVideoElement
      )
    ) {
      throw new Error(
        "Invalid element type. Expected an HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement.",
      );
    }
    
    // Ensure the element has valid dimensions
    const width = element.naturalWidth || element.width || element.videoWidth;
    const height =
      element.naturalHeight || element.height || element.videoHeight;
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
  if (
    typeof rgbColor !== "object" ||
    !rgbColor ||
    !("r" in rgbColor) ||
    !("g" in rgbColor) ||
    !("b" in rgbColor)
  ) {
    throw new Error(
      'Invalid RGB color format. Expected an object with properties "r", "g", and "b".',
    );
  }
  
  // Extract RGB values and ensure they're within valid range (0-255)
  const { r, g, b } = rgbColor;
  if (
    ![r, g, b].every((val) => Number.isInteger(val) && val >= 0 && val <= 255)
  ) {
    throw new Error("RGB values must be integers between 0 and 255.");
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
    };
    const dialogTitleElements = [
      "dialog-tittle",
      "dialog-tittle-p",
      "dialog-tittle-pp",
    ];
    const textColor = getContrastColor(dominantColorobj, 5, 5);
    dialogTitleElements.forEach(
      (id) => (document.getElementById(id).style.color = textColor),
    );
    const closebtnBgColor = getContrastColor(dominantColorobj, 3, 3);
    const closebtnBrColor = getContrastColor(dominantColorobj, 4, 4);
    const closebtnTextColor = getContrastColor(dominantColorobj, 0, 0);
    ["hide_dialg_btn", "share-btn"].forEach((id) => {
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
 * Updates the browser URL by adding or modifying a query parameter,
 * without triggering a page reload. Useful for dynamic filtering or state tracking.
 *
 * @param {string} key - The query parameter name to add or update
 * @param {string} value - The value to assign to the parameter
 */
function updateUrlParameter(key, value) {
  // Parse current query parameters
  const queryParams = new URLSearchParams(window.location.search);
  
  // Set or update the specified parameter
  queryParams.set(key, value);
  
  // Construct the new URL without reloading the page
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const updatedUrl = `${baseUrl}?${queryParams.toString()}`;
  
  // Push the new URL to browser history
  history.pushState({ path: updatedUrl }, "", updatedUrl);
}


/**
 * Returns the current page URL without any query parameters or hash fragments.
 * Useful for generating clean base URLs for sharing or navigation.
 *
 * @returns {string} Base URL (origin + pathname)
 */
function getBaseUrl() {
  const origin = window.location.origin; // e.g., https://example.com
  const path = window.location.pathname; // e.g., /gallery/view.html
  return `${origin}${path}`; // Combined clean URL
}



/**
 * Shares item details via Telegram using a formatted message and dynamic URL.
 * Extracts title, ID, and icon name from dialog elements and opens Telegram share link.
 */
function shareToTelegram() {
  // Extract icon name from dialog element
  const iconName = document
    .getElementById("dialog-tittle-pp")
    .textContent.replace("Icon Name: ", "");
  
  // Build view URL without query parameters
  const viewUrl =
    getBaseUrl() +
    "?q=" + encodeURIComponent(iconName) +
    "&mode=" + encodeURIComponent(itemID.state.displayMode);
  
  // Extract title and ID from dialog elements
  const itemTitle = document.getElementById("dialog-tittle").textContent;
  const itemId = document
    .getElementById("dialog-tittle-p")
    .textContent.replace("Id: ", "");
  
  // Construct Telegram message with Markdown formatting
  const telegramMessage =
    `Title: \`${itemTitle}\`\n` +
    `ID: \`${itemId}\`\n` +
    `Icon Name: \`${iconName}\`\n\n` +
    `View: ${viewUrl}`;
  
  // Open Telegram share URL with encoded message
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(telegramMessage)}&text=`,
    "_blank"
  );
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
 * Filters an array of objects based on a search term.
 *
 * @param {Array<Object>} items - The list of objects to search through.
 * @param {string} searchTerm - The term to match against object values.
 * @returns {Array<Object>} - Filtered list of objects.
 */
function filterItemsBySearch(items, searchTerm) {
  if (!Array.isArray(items) || typeof searchTerm !== "string") return [];
  
  const lowerSearch = searchTerm.trim().toLowerCase();
  if (!lowerSearch) return items; // Return all if search term is empty
  
  return items.filter((item) =>
    Object.values(item).some(
      (value) =>
      value != null && String(value).toLowerCase().includes(lowerSearch),
    ),
  );
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

function filterItemsBySearch(item_data, query) {
  // Validate input types
  if (!Array.isArray(item_data)) {
    throw new TypeError("Expected 'item_data' to be an array of objects.");
  }
  if (query === undefined || query === null) {
    throw new TypeError("Expected 'query' to be a string or number.");
  }
  
  // Convert query to string
  query = String(query).trim();
  
  // Return item IDs if query is empty
  if (!query) return item_data.map((item) => item.itemID);
  
  // Parse query filters
  const filters = query.split("&").map((filter) => filter.trim());
  
  // Filter data based on conditions
  return item_data.filter((item) => {
    return filters.every((filter) => {
      if (filter.includes(":")) {
        // Handle key-value filters (e.g., "collectionType:FINAL_SHOT")
        const [key, value] = filter.split(":").map((str) => str.trim());
        return (
          item.hasOwnProperty(key) &&
          typeof item[key] === "string" &&
          item[key].toLowerCase() === value.toLowerCase()
        );
      } else {
        // Handle general keyword/number search in all string values
        return Object.values(item).some(
          (value) =>
          (typeof value === "string" &&
            value.toLowerCase().includes(filter.toLowerCase())) ||
          (typeof value === "number" && value.toString().includes(filter)),
        );
      }
    });
  });
}

/**
 * Item Rarity Types
 * Maps rarity names to their corresponding numeric values.
 */
const RareType = {
  ALL: 0,
  WHITE: 1,
  GREEN: 2,
  BLUE: 3,
  PURPLE: 4,
  ORANGE: 5,
  CARD: 6,
  RED: 7,
  PURPLE_PLUS: 8,
  ORANGE_PLUS: 9,
  NONE: 10,
};

/**
 * Item Categories
 * Represents different item types within the system.
 */
const ItemType = {
  ALL: 0,
  AVATAR: 1,
  CLOTHES: 2,
  LIMITEDCARD: 3,
  TREASUREBOX: 4,
  LOADOUTBOX: 5,
  ROOMCARD: 6,
  BUNDLE: 7,
  DEBRIS: 8,
  COLLECTION: 9,
  VIRTUAL: 10,
  BONUSCARD: 11,
  STICKER: 12,
  PET: 13,
  BATTLEFLAG: 14,
  EP_DEBRIS: 15,
  OPTIONAL_BUNDLE: 17,
  HYPERBOOK: 18,
  TAILOR_EFFECT: 19,
  BP_EXP: 20,
  BR_RANKING_POINTS: 21,
  CS_PROTECT_POINTS: 22,
  NONE: 23,
};

/**
 * Collection Types
 * Represents different collectible categories.
 */
const CollectionType = {
  ALL: 0,
  BANNER: 1,
  HEADPIC: 2,
  LOOTBOX: 3,
  GAMEBAG: 4,
  PARACHUTE: 5,
  SKATE: 6,
  WEAPON_SKIN: 7,
  VEHICLE_SKIN: 8,
  EMOTE: 9,
  PIN: 10,
  FLIGHT: 11,
  GROUPANIM: 12,
  MUSIC: 13,
  TRANSFORM_EMOTE: 14,
  TITLE: 16,
  ACTION_JUMP: 17,
  ACTION_FIRST_AID_KIT: 18,
  ACTION_CROSS_WINDOW: 19,
  ACTION_FALL: 20,
  QUICK_CHAT: 21,
  SKILL_SKIN: 22,
  FINAL_SHOT: 23,
  SUPER_EMOTE: 24,
  LOADING_CARD: 25,
  NONE: 26,
};

/**
 * Populates a given `<select>` dropdown with options from a dataset.
 * @param {string} selectId - The ID of the select element.
 * @param {Object} data - The dataset mapping keys to numeric values.
 */
function populateSelect(selectId, data) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) return; // Prevent errors if element is missing
  
  Object.entries(data).forEach(([key, value]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = key.replace(/_/g, " "); // Replace underscores with spaces for readability
    selectElement.appendChild(option);
  });
}

// Populate dropdowns on page load
populateSelect("rareTypeSelect", RareType);
populateSelect("itemTypeSelect", ItemType);
populateSelect("collectionTypeSelect", CollectionType);

/**
 * Handles selection changes and updates the search input field.
 * If a category is already in the search query, it updates the value.
 * If "ALL" is selected, it removes the category from the search query.
 * Otherwise, it appends the category to the query.
 * @param {string} selectId - The ID of the select element.
 * @param {Object} data - The dataset of key-value pairs.
 * @param {string} label - The category label for filtering.
 */
function handleSelectionChange(selectId, data, label) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) return; // Ensure the select element exists
  
  selectElement.addEventListener("change", function() {
    const selectedKey = Object.keys(data).find(
      (key) => data[key] == this.value,
    );
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return; // Ensure search input exists
    
    let query = searchInput.value.trim();
    let labelPattern = new RegExp(`\\b${label}:([^&]*)`, "i");
    
    if (selectedKey === "ALL") {
      // Remove the label if "ALL" is selected
      searchInput.value = query
        .replace(new RegExp(`(&?${label}:[^&]*)`, "i"), "")
        .replace(/^&/, "");
    } else if (labelPattern.test(query)) {
      // Update existing label with the new selection
      searchInput.value = query.replace(
        labelPattern,
        `${label}:${selectedKey}`,
      );
    } else {
      // Append new label if not already present
      searchInput.value = query ?
        query + "&" + label + ":" + selectedKey :
        label + ":" + selectedKey;
    }
  });
}

// Attach event listeners for dropdowns
handleSelectionChange("rareTypeSelect", RareType, "Rare");
handleSelectionChange("itemTypeSelect", ItemType, "itemType");
handleSelectionChange("collectionTypeSelect", CollectionType, "collectionType");