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

const bgMap = {
  WHITE: "UI_GachaLimit_QualitySlotBg2_01.png",
  GREEN: "UI_GachaLimit_QualitySlotBg2_02.png",
  BLUE: "UI_GachaLimit_QualitySlotBg2_03.png",
  PURPLE: "UI_GachaLimit_QualitySlotBg2_04.png",
  ORANGE: "UI_GachaLimit_QualitySlotBg2_05.png",
  CARD: "UI_GachaLimit_QualitySlotBg2_06.png",
  Red: "UI_GachaLimit_QualitySlotBg2_07.png",
  PURPLE_PLUS: "UI_GachaExtraAward_QualitySlotBg_04.png",
  ORANGE_PLUS: "UI_GachaExtraAward_QualitySlotBg_05.png",
};