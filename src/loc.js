const en = {
  imageQualityDescription: `
    Choose the quality level for your PNG image:

    - Low Quality: Produces a smaller file size, ideal for quick loading or situations where minimal detail is needed.
    - Medium Quality: Balances file size and image clarity, making it suitable for general use cases.
    - High Quality: Offers the best image clarity and detail, perfect for professional or highly detailed visuals.
  `,
  
  themeToggleDescription: `Toggle between light and dark modes for a better viewing experience!`,
};

// The object you want to save
const itemID = {
  config: {
    theme: "dark",
    language: "en-US",
    perPageLimitItem: 200,
    pngsQuality: "300x300",
  },
  state: {
    displayMode: 2, // Default Mode: ALL
  },
};
let current_data;
let itemData;
let currentPage = 1;
let cdn_img_json;
let pngs_json_list;
const notFoundText = () => document.getElementById("not_found_text");