var a1, a2, a3, a4;
let hasRun = false;
let itemData;
let totalPages;
let currentPage = 1;
const webpsPerPage = 200;
let cdn_img_json;
let pngs_json_list;
const edge_btn = document.getElementById("edge_btn");
const bodyElement = document.body;
const extra_set = document.getElementById("extra_set")
extra_set.classList.remove("collapsed2");
extra_set.classList.add("expanded2");
const p = console.log;
fetch('cdn.img')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.arrayBuffer();
  })
  .then(data => {
    const encryptedData = new Uint8Array(data); // Convert ArrayBuffer to Uint8Array if needed
    const decryptedText = decryptBinaryData(encryptedData);
    if (decryptedText !== null) {
      cdn_img_json = JSON.parse(decryptedText);
      fetch('pngs.json')
        .then(response => response.json())
        .then(data => (pngs_json_list = data));
      fetch('itemData.json')
        .then(response => response.json())
        .then(data => {
          itemData = data
          displayPage(1, '', itemData);
          check_parameter();
        });
    }
  })


const encrypt = (longUrl) => {
  const encodedUrl = btoa(longUrl);
  return encodedUrl;
};
const decrypt = function(shortUrl) {
  return atob(shortUrl);
};

function addParameterWithoutRefresh(param, value) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(param, value);
  const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
  history.pushState({ path: newUrl }, '', newUrl);
}

function getUrlWithoutParameters() {
  const newUrl = `${window.location.origin}${window.location.pathname}`;
  return newUrl;
}

function check_parameter() {
  if (!hasRun) {
    const urlParams = new URLSearchParams(window.location.search);
    const icon = urlParams.get('icon');
    if (icon !== null) {
      const input = document.getElementById('input_d');
      input.value = decrypt(icon);
      search(decrypt(icon));
    } else {}
    hasRun = true;
  }
}

function updateUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('icon') && urlParams.get('icon') === '') {
    urlParams.delete('icon');
    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
    history.pushState({ path: newUrl }, '', newUrl);
  }
}

function Share_tg() {
  var currentURL = getUrlWithoutParameters();
  a4 = currentURL + "?icon=" + encrypt(a3);
  var message = "Title: `" + a1 + "`\nID: `" + a2 + "`\nIcon Name: `" + a3 + "`\n\nView: " + a4;
  window.open("https://t.me/share/url?url=" + encodeURIComponent(message) + "&text=");
}
function hideain_load() {
  document.getElementById("main_load").style.animation = "fadeOut 250ms 1 forwards";
}

function showeain_load() {
  var dialog_main_bg = document.getElementById('main_load');
  dialog_main_bg.style.visibility = "visible"
}



function filterWebpsBySearch(webps, searchTerm) {
  return webps.filter(webp =>
    webp.toLowerCase().includes(searchTerm.toLowerCase())
  );
}



function filterItemsBySearch(items, searchTerm) {
  return items.filter(item =>
    Object.keys(item).some(key =>
      item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
}

function removeDuplicates(jsonArray, key) {
  const uniqueItems = new Map();

  jsonArray.forEach(item => {
    if (!uniqueItems.has(item[key])) {
      uniqueItems.set(item[key], item);
    }
  });
  return Array.from(uniqueItems.values());
}
async function displayPage(pageNumber, searchTerm, webps) {
  showeain_load();
  const filteredItems = filterItemsBySearch(webps, searchTerm);
  //const filteredItems = removeDuplicates(filteredItems_, 'itemID');
  let startIdx = (pageNumber - 1) * webpsPerPage;
  const endIdx = startIdx + webpsPerPage;
  const webpGallery = document.getElementById('webpGallery');
  const pagination = document.getElementById('pagination');
  webpGallery.innerHTML = '';
  for (let i = startIdx; i < endIdx && i < filteredItems.length; i++) {
    const image = document.createElement("img");
    image.addEventListener('click', () => {
      show_item_info(filteredItems[i])
    });
    if (pngs_json_list) {
      if (pngs_json_list.includes(filteredItems[i].icon + ".png")) {
        image.src = "https://cdn.jsdelivr.net/gh/jinix6/ItemID@main/pngs/" + filteredItems[i].icon + ".png";
      } else {
        const keyToFind = (filteredItems[i].itemID).toString()
        const value = cdn_img_json.find(obj => obj[keyToFind])?.[keyToFind] ?? null;
        if (value !== null) {
          image.src = value;
        } else {
          image.src = "https://cdn.jsdelivr.net/gh/jinix6/ItemID@main/pngs/UI_EPFP_unknown.png"
        }
      }
      image.className = "image bounce-click";
      if (filteredItems[i].description === "Didn't have an ID and description.") {
      image.style.background = '#607D8B';
    } 
      webpGallery.appendChild(image);
    }
  }
  totalPages = Math.ceil(filteredItems.length / webpsPerPage);
  renderPagination(searchTerm, webps);
  hideain_load();
  updateUrl();
}

function show_item_info(data) {
  document.getElementById('cardimage').src = '';
  const { icon, description, description2, itemID } = data;
  const itemDetail = description2 ? `${description} - ${description2}` : description;
  ["mainnnnn_bg", "dialog_main_bg"].forEach(id => {
    document.getElementById(id).style.animation = "fadeIn 250ms 1 forwards";
  });
  document.getElementById('cardimage').src = `https://cdn.jsdelivr.net/gh/jinix6/ItemID@main/pngs/${icon}.png`;
  a1 = itemDetail;
  a2 = itemID;
  a3 = icon;
  a4 = `https://jinix6.github.io/Icon/webp/${icon}.webp`;
  document.getElementById('dialog_tittle').textContent = itemDetail;
  document.getElementById('dialog_tittle_p').textContent = `Id: ${itemID}`;
  document.getElementById('dialog_tittle_pp').textContent = `Icon Name: ${icon}`;
}



const hide_dialog = () => ["dialog_main_bg", "mainnnnn_bg"]
  .forEach(id => document.getElementById(id).style.animation = "fadeOut 250ms 1 forwards");





function generate_pagination_numbers() {
  const pagination_Numbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pagination_Numbers.push(i);
  }
  return pagination_Numbers;
}



async function renderPagination(searchTerm, webps) {
  const paginationNumbers = generate_pagination_numbers();
  if (paginationNumbers.length === 0) {
    document.getElementById("pagi73hd").style.visibility = "hidden";
    if (!document.getElementById('not_found_text')) {
    const notFoundText = document.createElement('h1');
    notFoundText.id = 'not_found_text';
    notFoundText.className = 'transition-all duration-100 ease-in-out mt-[10vh] font-black select-none space-mono-regular text-zinc-500 rotate-90 text-[1000%] w-[100vw] text-center whitespace-nowrap';
    notFoundText.innerText = 'NOT FOUND';
    document.getElementById("container").appendChild(notFoundText);
    }
  } else {
    document.getElementById("pagi73hd").style.visibility = "visible";
    const notFoundText = document.getElementById('not_found_text');
    if (notFoundText) {
      notFoundText.remove();
    }
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    paginationNumbers.forEach((pageNumber) => {
      const pageButton = document.createElement("button");
      pageButton.className = "px-[8%] bg-white border border-2 border-[#737373] bounce-click select-none rounded-full text-center space-mono-regular font-medium uppercase text-black disabled:pointer-events-none disabled:shadow-none";
      if (pageNumber === currentPage) {
        pageButton.classList.remove("bg-white", "text-black", "border", "border-2", "border-[#737373]");
        pageButton.classList.add("text-white", "bg-[#2B2B2B]");
      }
      pageButton.textContent = pageNumber === '...' ? '...' : pageNumber;
      pageButton.addEventListener('click', () => goToPage(pageNumber, searchTerm, webps));
      pagination.appendChild(pageButton);
    });
  }
}

async function goToPage(pageNumber, searchTerm, webps) {
  if (pageNumber === '...') return;
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    currentPage = pageNumber;
    currentSearchTerm = searchTerm;
    await displayPage(currentPage, currentSearchTerm, webps);
    updateCurrentPageSpan();
  }
}

function updateCurrentPageSpan() {
  const currentPageSpan = document.querySelector(".pagination span");
  if (currentPageSpan) {
    currentPageSpan.textContent = `Page: ${currentPage}`;
  }
}

function search() {
  const keyword = document.getElementById("input_d").value
  addParameterWithoutRefresh('icon', encrypt(keyword));
  displayPage(1, keyword, itemData);
}

function decryptBinaryData(encryptedData) {
  var iv = CryptoJS.enc.Utf8.parse("null".padEnd(16, '\0')); // Ensure IV is 16 bytes (128 bits)
  var decrypted = CryptoJS.AES.decrypt({
    ciphertext: CryptoJS.lib.WordArray.create(encryptedData)
  }, CryptoJS.enc.Utf8.parse("null".padEnd(32, '\0')), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
document.addEventListener('DOMContentLoaded', (event) => {
  edge_btn.addEventListener('click', () => {
    const notFoundText = document.getElementById('not_found_text');
    if (bodyElement.classList.contains("collapsed")) {
      bodyElement.classList.remove("collapsed");
      bodyElement.classList.add("expanded");
      extra_set.classList.remove("collapsed2");
      extra_set.classList.add("expanded2");
      document.getElementById("input_d").disabled = false;
      if (notFoundText) {
        notFoundText.style.opacity = 1
      }
    } else {
      bodyElement.classList.remove("expanded");
      bodyElement.classList.add("collapsed");
      extra_set.classList.remove("expanded2");
      extra_set.classList.add("collapsed2");
      document.getElementById("input_d").disabled = true;
      if (notFoundText) {
        notFoundText.style.opacity = 0
      }
    }
  });
});

document.getElementById("FFInformation").addEventListener("click", function() {
  window.open("https://jinix6.github.io/FFInformation");
});
document.getElementById("clgroup").addEventListener("click", function() {
  window.open("https://t.me/freefirecraftlandgroup");
});
document.getElementById("clprogroup").addEventListener("click", function() {
  window.open("https://t.me/ffcsharezone");
});

document.getElementById("tg").addEventListener("click", function() {
  window.open("https://t.me/Crystal_Person");
});

document.getElementById("ig").addEventListener("click", function() {
  window.open("https://www.instagram.com/crystal.pers0n");
});

document.getElementById("gt").addEventListener("click", function() {
  window.open("https://github.com/jinix6");
});

document.getElementById("logo").addEventListener("click", function() {
  window.open("https://ff-items.pages.dev");
});