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

// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  initializeInterfaceEdgeBtn();
  const inputField = document.getElementById("search-input");
  addEnterKeyListener(inputField, search);
  const lensBtn = document.getElementById("google-lens-btn");
  if (lensBtn) {
    lensBtn.addEventListener("click", () => {
      const img = document.getElementById("cardimage");
      if (!img || !img.src) return;
      const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(img.src)}`;
      window.open(googleLensUrl, "_blank");
    });
  }
});
