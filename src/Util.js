// Define a namespace
const itemID = {
  config: {
    theme: "dark",
    language: "en-US",
    perPageLimitItem: 200,
  },
  state: {
    displayMode: 2, // Default Mode: ALL
  },
};

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
  gt: "https://github.com/0xMe/ItemID2/" // GitHub profile link
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
    let imgSrc =
      "https://raw.githubusercontent.com/jinix6/ff-resources/refs/heads/main/pngs/300x300/" +
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
  inputElement.addEventListener("keydown", function (event) {
    // Trigger search function when the Enter key is pressed
    if (event.key === "Enter") {
      searchFunction();
    }
  });
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

  // Apply fade-in animation to background elements
  pageBackgrounds.forEach((id) => {
    document.getElementById(id).style.animation = "fadeIn 250ms 1 forwards";
  });

  // Handle display content based on trash mode
  if (!isTrashMode) {
    // Extract and display item details when not in trash mode
    const { icon, description, description2, itemID } = itemData;
    const itemDetail = description2
      ? `${description} - ${description2}`
      : description;
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

  const paginationNumbers = Array.from(
    { length: totalPages },
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
const THEME_STORAGE_KEY = 'theme';
const LIGHT_MODE_CLASS = 'light-mode';
const DARK_MODE_CLASS = 'dark-mode';

/**
 * Applies the given theme to the document body.
 * 
 * @param {string} theme - The theme to apply. Expected values: 'light' or 'dark'.
 */
function applyTheme(theme) {
  if (theme === 'light') {
    document.getElementById("toggle-switcher").classList.add("light-toggle-on")
    document.getElementById("toggle").classList.add("light-toggle-on2")
    document.body.classList.add(LIGHT_MODE_CLASS);
    document.body.classList.remove(DARK_MODE_CLASS);
  } else if (theme === 'dark') {
    document.getElementById("toggle").classList.remove("light-toggle-on2")
    document.getElementById("toggle-switcher").classList.remove("light-toggle-on")
    document.body.classList.add(DARK_MODE_CLASS);
    document.body.classList.remove(LIGHT_MODE_CLASS);
  } else {
    console.warn('Invalid theme selected. Defaulting to dark mode.');
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
  return storedTheme === 'light' ? 'light' : 'dark'; // Default to 'dark' if no valid theme is stored
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
  document.getElementById("toggle-switcher").classList.toggle("light-toggle-on")
  const currentTheme = document.body.classList.contains(LIGHT_MODE_CLASS) ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  applyTheme(newTheme);
  saveThemeToLocalStorage(newTheme);
}

/**
 * Handles changes to the system theme preference (e.g., when the user switches system-wide theme).
 * Automatically applies the appropriate theme unless the user has set a preference.
 */
function handleSystemThemeChange() {
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = getStoredTheme();

  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    applyTheme(systemPrefersDark ? 'dark' : 'light');
  }
}

/**
 * Event listener for the theme toggle button.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the theme based on the stored or system preference
  initializeTheme();

  // Add event listener for the theme toggle button
  const themeToggleButton = document.getElementById('setting-toggle-appearance-autoLanguage');
  themeToggleButton.addEventListener('click', toggleTheme);


  // Listen for changes in the system's theme preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChange);
});