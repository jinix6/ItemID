let current_data;
let itemData;
let gl_ob47_added_itemData;
let gl_ob46_added_itemData;
let currentPage = 1;
let cdn_img_json;
let pngs_json_list;
const bodyElement = document.body;
const extra_set = document.getElementById("extra_set");
//extra_set.classList.remove("collapsed2");
//extra_set.classList.add("expanded2");

//extra_set.classList.add("collapsed2");
//extra_set.classList.remove("expanded2");

const notFoundText = () => document.getElementById("not_found_text");
// Fetch data from multiple JSON files concurrently using Promise.all
Promise.all([
  // Fetching 'cdn.json' and parsing it as JSON
  fetch("assets/cdn.json").then((response) => response.json()),
  // Fetching 'pngs.json' and parsing it as JSON
  fetch(
    "https://raw.githubusercontent.com/jinix6/ff-resources/refs/heads/main/pngs/300x300/list.json",
  ).then((response) => response.json()),
  // Fetching 'itemData.json' and parsing it as JSON
  fetch("assets/itemData.json").then((response) => response.json()),
  // Fetching 'ob47_added_itemData.json' and parsing it as JSON
  fetch("assets/ob47_added_itemData.json").then((response) => response.json()),

  fetch("assets/ob46_added_itemData.json").then((response) => response.json()),
])
  .then(
    ([
      cdnData,
      pngsData,
      itemDatar,
      ob47_added_itemData,
      ob46_added_itemData,
    ]) => {
      // Assign the fetched data to global variables for further use
      cdn_img_json = cdnData.reduce((map, obj) => Object.assign(map, obj), {});
      pngs_json_list = pngsData; // Contains data from 'pngs.json'
      itemData = itemDatar; // Contains data from 'itemData.json'
      gl_ob47_added_itemData = ob47_added_itemData; // Contains data from 'ob47_added_itemData.json'
      gl_ob46_added_itemData = ob46_added_itemData;
      handleDisplayBasedOnURL();
    },
  )
  .catch((error) => {
    // Log any errors encountered during the fetch or processing
    console.error("Error fetching data:", error);
  });

function addParameterWithoutRefresh(param, value) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(param, value);
  const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
  history.pushState({ path: newUrl }, "", newUrl);
}

function getUrlWithoutParameters() {
  const newUrl = `${window.location.origin}${window.location.pathname}`;
  return newUrl;
}

function Share_tg() {
  var iconName = document
    .getElementById("dialog-tittle-pp")
    .textContent.replace("Icon Name: ", "");
  var url =
    getUrlWithoutParameters() +
    "?q=" +
    iconName +
    "&mode=" +
    itemID.state.displayMode;
  var message =
    "Title: `" +
    document.getElementById("dialog-tittle").textContent +
    "`\nID: `" +
    document.getElementById("dialog-tittle-p").textContent.replace("Id: ", "") +
    "`\nIcon Name: `" +
    iconName +
    "`\n\nView: " +
    url;
  window.open(
    "https://t.me/share/url?url=" + encodeURIComponent(message) + "&text=",
  );
}

function filterWebpsBySearch(webps, searchTerm) {
  return webps.filter((webp) =>
    webp.toLowerCase().includes(searchTerm.toLowerCase()),
  );
}

function filterItemsBySearch(items, searchTerm) {
  return items.filter((item) =>
    Object.keys(item).some((key) =>
      item[key].toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );
}

async function displayPage(pageNumber, searchTerm, webps) {
  current_data = webps;
  const filteredItems = filterItemsBySearch(webps, searchTerm);
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
    const image = document.createElement("img");
    image.className = "image border p-3 bounce-click ";
    image.loading = "lazy";
    image.id = "list_item_img";
    // Determine image source
    let imgSrc =
      "https://raw.githubusercontent.com/jinix6/ff-resources/refs/heads/main/pngs/300x300/UI_EPFP_unknown.png";
    if (pngs_json_list?.includes(item.icon + ".png")) {
      imgSrc = `https://raw.githubusercontent.com/jinix6/ff-resources/refs/heads/main/pngs/300x300/${item.icon}.png`;
    } else {
      const keyToFind = item.itemID.toString();
      const value = cdn_img_json[item.itemID.toString()] ?? null;
      if (value) imgSrc = value;
    }
    image.src = imgSrc;
    // Apply background color if description matches
    if (item.description === "Didn't have an ID and description.") {
      image.style.background = "#607D8B";
    }
    // Add click event listener
    image.addEventListener("click", () =>
      displayItemInfo(item, imgSrc, image, (isTrashMode = false)),
    );
    // Append image to fragment
    fragment.appendChild(image);
  }
  webpGallery.appendChild(fragment); // Add all images at once
  let totalPages = Math.ceil(
    filteredItems.length / itemID.config.perPageLimitItem,
  );
  renderPagination(searchTerm, webps, (isTrashMode = false), totalPages); // Render pagination
  updateUrl(); // Update URL
}

async function renderPagination(searchTerm, webps, isTrashMode, totalPages) {
  const paginationNumbers = await generatePaginationNumbers(totalPages);
  const pagi73hd = document.getElementById("pagi73hd");
  if (paginationNumbers.length === 0) {
    pagi73hd.style.visibility = "hidden";
    if (!notFoundText()) {
      const notFoundText = document.createElement("h1");
      notFoundText.id = "not_found_text";
      notFoundText.className =
        "transition-all duration-100 ease-in-out mt-[10vh] font-black select-none space-mono-regular text-zinc-500 rotate-90 text-[1000%] w-[100vw] text-center whitespace-nowrap";
      notFoundText.innerText = "NOT FOUND";
      document.getElementById("container").appendChild(notFoundText);
    }
  } else {
    pagi73hd.style.visibility = "visible";
    if (notFoundText()) {
      notFoundText().remove();
    }
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    paginationNumbers.forEach((pageNumber) => {
      const pageButton = document.createElement("button");
      pageButton.className =
        "px-[8%] bg-[var(--secondary)] bounce-click select-none rounded-[11px] text-center space-mono-regular font-medium uppercase text-[var(--primary)] disabled:pointer-events-none disabled:shadow-none";
      if (pageNumber === currentPage) {
        pageButton.classList.remove(
          "bg-[var(--secondary)]",
          "text-[var(--primary)]",
          "border",
          "border-2",
          "border-[var(--border-color)]",
        );
        pageButton.classList.add(
          "text-[var(--secondary)]",
          "bg-[var(--primary)]",
        );
      }
      pageButton.textContent = pageNumber;
      pageButton.addEventListener("click", async () => {
        await goToPage(pageNumber, searchTerm, webps, isTrashMode, totalPages);
      });
      pagination.appendChild(pageButton);
    });
  }
}

// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  initializeInterfaceEdgeBtn();
  const inputField = document.getElementById("search-input");
  addEnterKeyListener(inputField, search);
});

//document.body.style.overflowY = "hidden";
