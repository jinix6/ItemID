// Fetch data from multiple JSON files concurrently using Promise.all
Promise.all([
    // Fetching 'cdn.json' and parsing it as JSON
    smartFetch("assets/cdn.json", "data-cache-v1")
    .then((data) => new TextDecoder().decode(data))
    .then((text) => JSON.parse(text)),
    // Fetching 'pngs.json' and parsing it as JSON
    smartFetch(
      `https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/list.json`,
      "data-cache-v1",
    )
    .then((data) => new TextDecoder().decode(data))
    .then((text) => JSON.parse(text)),
    // Fetching 'itemData.json' and parsing it as JSON
    smartFetch("assets/itemData.json", "data-cache-v1")
    .then((data) => new TextDecoder().decode(data))
    .then((text) => JSON.parse(text)),
  ])
  .then(([cdnData, pngsData, itemDatar]) => {
    // Assign the fetched data to global variables for further use
    cdn_img_json = cdnData.reduce((map, obj) => Object.assign(map, obj), {});
    pngs_json_list = pngsData; // Contains data from 'pngs.json'
    itemData = itemDatar; // Contains data from 'itemData.json'
    
    handleDisplayBasedOnURL();
  })
  .catch((error) => {
    // Log any errors encountered during the fetch or processing
    console.error("Error fetching data:", error);
  });

async function displayPage(pageNumber, searchTerm, webps) {
  current_data = webps;
  let filteredItems;
  if (!searchTerm.trim()) {
    filteredItems = webps;
  } else {
    filteredItems = filterItemsBySearch(webps, searchTerm);
  }
  const startIdx = (pageNumber - 1) * itemID.config.perPageLimitItem;
  const endIdx = Math.min(
    startIdx + itemID.config.perPageLimitItem,
    filteredItems.length,
  );
  const webpGallery = document.getElementById("webpGallery");
  const fragment = document.createDocumentFragment(); // Use DocumentFragment for batch DOM updates
  webpGallery.innerHTML = ""; // Clear existing content
  
  for (let i = startIdx; i < endIdx; i++) {
    const item = filteredItems[i];
    
    let imgSrc = `https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/UI_EPFP_unknown.png`;
    if (pngs_json_list?.includes(item.icon + ".png")) {
      imgSrc = `https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/${item.icon}.png`;
    } else {
      const keyToFind = item?.itemID ? String(item.itemID) : "Not Provided";
      const value = cdn_img_json[item.itemID.toString()] ?? null;
      if (value) {
        imgSrc = value;
      } else {
        // try {
        //   const astcData = new Uint8Array(await smartFetch(
        //     `https://dl-tata.freefireind.in/live/ABHotUpdates/IconCDN/android/${keyToFind}_rgb.astc`));
        //   if (astcData) {
        //     console.log(astcData);
        //   }
        // } catch (err) {
        //   console.warn(`ASTC fetch failed for ${keyToFind}`, err);
        // }
      }
    }
    const figure = document.createElement("figure");
    figure.className =
      "bg-center bg-no-repeat [background-size:120%] image p-3 bounce-click border border-[var(--border-color)]";
    figure.setAttribute(
      "aria-label",
      `${item.description}, ${item.Rare} ${item.itemType}`,
    );
    const fileName = bgMap[item.Rare] || "UI_GachaLimit_QualitySlotBg2_01.png";
    figure.style.backgroundImage = `url('https://raw.githubusercontent.com/0xme/ff-resources/main/pngs/300x300/${fileName}')`;
    
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = item.description;
    img.src = imgSrc;
    img.setAttribute("crossorigin", "anonymous");
    
    figure.addEventListener("click", () => {
      displayItemInfo(item, imgSrc, img, (isTrashMode = false));
    });
    
    figure.appendChild(img);
    fragment.appendChild(figure);
  }
  
  webpGallery.appendChild(fragment); // Add all images at once
  let totalPages = Math.ceil(
    filteredItems.length / itemID.config.perPageLimitItem,
  );
  renderPagination(searchTerm, webps, (isTrashMode = false), totalPages); // Render pagination
  updateUrl(); // Update URL
}

/**
 * Main initialization script that runs after DOM content is fully loaded
 * Sets up search functionality, autocomplete, and various UI interactions
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeInterfaceEdgeBtn();
  
  const searchInput = document.getElementById("search-input");
  const lensButton = document.getElementById("google-lens-btn");
  const clearButton = document.getElementById("clear_btn");
  const searchContainer = document.getElementById("input_search_bg");
  
  // Set up enter key listener for search
  addEnterKeyListener(searchInput, search);
  
  // Configure Google Lens button functionality
  if (lensButton) {
    lensButton.addEventListener("click", handleGoogleLensSearch);
  }
  
  // Set up clear button behavior
  if (clearButton) {
    // Show/hide clear button based on input content
    searchInput.addEventListener("input", function() {
      clearButton.style.display = this.value ? "block" : "none";
    });
    
    // Clear input and trigger search when clicked
    clearButton.addEventListener("click", function() {
      searchInput.value = "";
      clearButton.style.display = "none";
      search(); // Reset search results
    });
  }
  
  // Create and configure autocomplete dropdown
  const autocompleteDropdown = document.createElement("div");
  autocompleteDropdown.id = "autocomplete-dropdown";
  autocompleteDropdown.className =
    "mt-3 absolute top-full left-0 right-0 bg-[var(--popup-bg)] border border-gray-600 rounded-[var(--border-radius)] max-h-72 overflow-y-auto z-50 shadow-lg hidden";
  
  searchContainer.classList.add("relative");
  searchContainer.appendChild(autocompleteDropdown);
  
  // Set up autocomplete functionality
  searchInput.addEventListener("input", function(e) {
    handleAutocomplete(e.target.value);
  });
  
  // Close dropdown when clicking outside
  document.addEventListener("click", function(e) {
    if (!searchContainer.contains(e.target)) {
      autocompleteDropdown.classList.add("hidden");
    }
  });
  
  // Add keyboard navigation for autocomplete
  searchInput.addEventListener("keydown", function(e) {
    const dropdown = document.getElementById("autocomplete-dropdown");
    if (dropdown.classList.contains("hidden")) return;
    
    const suggestions = dropdown.querySelectorAll(".autocomplete-suggestion");
    let activeIndex = -1;
    
    // Find currently active suggestion
    suggestions.forEach((suggestion, index) => {
      if (suggestion.classList.contains("bg-[var(--button-hover)]")) {
        activeIndex = index;
      }
    });
    
    // Handle keyboard navigation
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        activeIndex = (activeIndex + 1) % suggestions.length;
        setActiveSuggestion(activeIndex);
        break;
        
      case "ArrowUp":
        e.preventDefault();
        activeIndex =
          (activeIndex - 1 + suggestions.length) % suggestions.length;
        setActiveSuggestion(activeIndex);
        break;
        
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          suggestions[activeIndex].click();
        }
        break;
        
      case "Escape":
        dropdown.classList.add("hidden");
        break;
    }
  });
});

/**
 * Handles Google Lens search by opening the current card image in Google Lens
 */
function handleGoogleLensSearch() {
  const cardImage = document.getElementById("cardimage");
  if (!cardImage || !cardImage.src) return;
  
  const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(cardImage.src)}`;
  window.open(googleLensUrl, "_blank");
}