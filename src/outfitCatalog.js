export const TEMP_MIN = -25;
export const TEMP_MAX = 30;

const dressItem = { id: "dress", name: "Dress", icon: "👗" };

/** Cap for mild weather; panama for hot sun. */
const capItem = { id: "hat", name: "Cap", icon: "🧢" };
const panamaItem = { id: "sun-hat", name: "Panama", icon: "👒" };
const winterHatItem = { id: "winter-hat", name: "Winter hat", icon: "🧢" };

export const SKY_CONDITIONS = [
  { id: "clear", label: "Clear", icon: "☀️" },
  { id: "rain", label: "Rain", icon: "🌧️" },
  { id: "snow", label: "Snow", icon: "🌨️" },
];

export const TEMPERATURE_WEATHER_KEYS = ["hot", "warm", "cool", "cold", "veryCold"];

const boyWeatherSets = {
  hot: {
    label: "Hot",
    subtitle: "Above +20°C",
    outside: "Hot outside",
    icon: "☀️",
    color: "#FF8A3D",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "t-shirt", name: "T-shirt", icon: "👕" },
      { id: "shorts", name: "Shorts", icon: "🩳" },
      { id: "sunglasses", name: "Sunglasses", icon: "🕶️" },
      { ...panamaItem },
      { id: "sandals", name: "Sandals", icon: "👡" },
    ],
  },
  warm: {
    label: "Warm",
    subtitle: "+10 to +20°C",
    outside: "Warm outside",
    icon: "🌤️",
    color: "#FFB13D",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "long-sleeve-shirt", name: "Long-sleeve shirt", icon: "👕" },
      { id: "pants", name: "Pants", icon: "👖" },
      { id: "hoodie", name: "Hoodie", icon: "🧥" },
      { ...capItem },
      { id: "sneakers", name: "Sneakers", icon: "👟" },
    ],
  },
  cool: {
    label: "Cool",
    subtitle: "0 to +10°C",
    outside: "Cool outside",
    icon: "🍂",
    color: "#F2C14E",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "long-sleeve-shirt", name: "Long-sleeve shirt", icon: "👕" },
      { id: "pants", name: "Pants", icon: "👖" },
      { id: "hoodie", name: "Warm hoodie", icon: "🧥" },
      { id: "jacket", name: "Winter jacket", icon: "🧥" },
      { ...capItem },
      { id: "gloves", name: "Gloves", icon: "🧤" },
      { id: "boots", name: "Boots", icon: "👢" },
    ],
  },
  cold: {
    label: "Cold",
    subtitle: "-10 to 0°C",
    outside: "Cold outside",
    icon: "❄️",
    color: "#6CB6FF",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "thermal-bottoms", name: "Thermal bottoms", icon: "👖" },
      { id: "fleece-layer", name: "Fleece shirt", icon: "🧥" },
      { id: "jacket", name: "Winter jacket", icon: "🧥" },
      { id: "pants", name: "Winter pants", icon: "👖" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { id: "mittens", name: "Mittens", icon: "🧤" },
      { id: "winter-boots", name: "Winter boots", icon: "🥾" },
    ],
  },
  coldOverall: {
    label: "Cold (overall)",
    subtitle: "-10 to 0°C",
    outside: "Cold outside (overall)",
    icon: "❄️",
    color: "#6CB6FF",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "thermal-bottoms", name: "Thermal bottoms", icon: "👖" },
      { id: "fleece-layer", name: "Fleece shirt", icon: "🧥" },
      { id: "inner-overall", name: "Winter overalls", icon: "🧥" },
      { id: "winter-overall", name: "Winter suit", icon: "🧥" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { id: "mittens", name: "Mittens", icon: "🧤" },
      { id: "winter-boots", name: "Winter boots", icon: "🥾" },
    ],
  },
  veryCold: {
    label: "Very cold",
    subtitle: "Below -10°C",
    outside: "Very cold outside",
    icon: "🥶",
    color: "#3E91E5",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "warm-socks", name: "Thick socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "thermal-bottoms", name: "Thermal bottoms", icon: "👖" },
      { id: "fleece-layer", name: "Fleece suit", icon: "🧥" },
      { id: "jacket", name: "Winter jacket", icon: "🧥" },
      { id: "pants", name: "Insulated pants", icon: "👖" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { ...winterHatItem },
      { id: "heavy-mittens", name: "Heavy mittens", icon: "🧤" },
      { id: "winter-boots", name: "Heavy winter boots", icon: "🥾" },
    ],
  },
  veryColdOverall: {
    label: "Very cold (overall)",
    subtitle: "Below -10°C",
    outside: "Very cold outside (overall)",
    icon: "🥶",
    color: "#3E91E5",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "warm-socks", name: "Thick socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "thermal-bottoms", name: "Thermal bottoms", icon: "👖" },
      { id: "fleece-layer", name: "Fleece suit", icon: "🧥" },
      { id: "inner-overall", name: "Inner winter suit", icon: "🧥" },
      { id: "winter-overall", name: "Outer winter suit", icon: "🧥" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { ...winterHatItem },
      { id: "heavy-mittens", name: "Heavy mittens", icon: "🧤" },
      { id: "winter-boots", name: "Heavy winter boots", icon: "🥾" },
    ],
  },
  rain: {
    label: "Rain",
    subtitle: "Wet outside",
    outside: "Rainy outside",
    icon: "🌧️",
    color: "#5B8DEF",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "socks", name: "Socks", icon: "🧦" },
      { id: "long-sleeve-shirt", name: "Long-sleeve shirt", icon: "👕" },
      { id: "pants", name: "Pants", icon: "👖" },
      { id: "hoodie", name: "Hoodie", icon: "🧥" },
      { id: "jacket", name: "Jacket", icon: "🧥" },
      { id: "raincoat", name: "Raincoat", icon: "🧥" },
      { ...capItem },
      { id: "umbrella", name: "Umbrella", icon: "☂️" },
      { id: "rain-boots", name: "Rain boots", icon: "👢" },
    ],
  },
  snow: {
    label: "Snow",
    subtitle: "Snowy outside",
    outside: "Snowy outside",
    icon: "🌨️",
    color: "#8EC5FF",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "warm-socks", name: "Thick socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "thermal-bottoms", name: "Thermal bottoms", icon: "👖" },
      { id: "fleece-layer", name: "Fleece shirt", icon: "🧥" },
      { id: "jacket", name: "Winter jacket", icon: "🧥" },
      { id: "pants", name: "Snow pants", icon: "👖" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { ...winterHatItem },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { id: "mittens", name: "Mittens", icon: "🧤" },
      { id: "winter-boots", name: "Winter boots", icon: "🥾" },
    ],
  },
  snowOverall: {
    label: "Snow (overall)",
    subtitle: "Snowy outside",
    outside: "Snowy outside (overall)",
    icon: "🌨️",
    color: "#8EC5FF",
    items: [
      { id: "underwear", name: "Underwear", icon: "🩲" },
      { id: "warm-socks", name: "Thick socks", icon: "🧦" },
      { id: "thermal-top", name: "Thermal top", icon: "👕" },
      { id: "thermal-bottoms", name: "Thermal bottoms", icon: "👖" },
      { id: "fleece-layer", name: "Fleece shirt", icon: "🧥" },
      { id: "inner-overall", name: "Winter overalls", icon: "🧥" },
      { id: "winter-overall", name: "Winter suit", icon: "🧥" },
      { id: "balaclava", name: "Balaclava", icon: "🎭" },
      { ...winterHatItem },
      { id: "neck-warmer", name: "Neck warmer", icon: "🧣" },
      { id: "mittens", name: "Mittens", icon: "🧤" },
      { id: "winter-boots", name: "Winter boots", icon: "🥾" },
    ],
  },
};

function cloneWeatherSet(set, items) {
  return {
    ...set,
    items: items.map((item) => ({ ...item })),
  };
}

const girlWeatherSets = {
  hot: cloneWeatherSet(boyWeatherSets.hot, [
    { id: "underwear", name: "Underwear", icon: "🩲" },
    { id: "socks", name: "Socks", icon: "🧦" },
    dressItem,
    { id: "sunglasses", name: "Sunglasses", icon: "🕶️" },
    { ...panamaItem },
    { id: "sandals", name: "Sandals", icon: "👡" },
  ]),
  warm: cloneWeatherSet(boyWeatherSets.warm, [
    { id: "underwear", name: "Underwear", icon: "🩲" },
    { id: "socks", name: "Socks", icon: "🧦" },
    dressItem,
    { id: "hoodie", name: "Hoodie", icon: "🧥" },
    { ...capItem },
    { id: "sneakers", name: "Sneakers", icon: "👟" },
  ]),
  cool: cloneWeatherSet(boyWeatherSets.cool, boyWeatherSets.cool.items),
  cold: cloneWeatherSet(boyWeatherSets.cold, boyWeatherSets.cold.items),
  coldOverall: cloneWeatherSet(boyWeatherSets.coldOverall, boyWeatherSets.coldOverall.items),
  veryCold: cloneWeatherSet(boyWeatherSets.veryCold, boyWeatherSets.veryCold.items),
  veryColdOverall: cloneWeatherSet(boyWeatherSets.veryColdOverall, boyWeatherSets.veryColdOverall.items),
  rain: cloneWeatherSet(boyWeatherSets.rain, [
    { id: "underwear", name: "Underwear", icon: "🩲" },
    { id: "socks", name: "Socks", icon: "🧦" },
    dressItem,
    { id: "pants", name: "Pants", icon: "👖" },
    { id: "hoodie", name: "Hoodie", icon: "🧥" },
    { id: "jacket", name: "Jacket", icon: "🧥" },
    { id: "raincoat", name: "Raincoat", icon: "🧥" },
    { ...capItem },
    { id: "umbrella", name: "Umbrella", icon: "☂️" },
    { id: "rain-boots", name: "Rain boots", icon: "👢" },
  ]),
  snow: cloneWeatherSet(boyWeatherSets.snow, boyWeatherSets.snow.items),
  snowOverall: cloneWeatherSet(boyWeatherSets.snowOverall, boyWeatherSets.snowOverall.items),
};

/** @deprecated Prefer getWeatherSets(gender). Kept for callers that expect the boy set. */
export const weatherSets = boyWeatherSets;

export function getWeatherSets(gender = "boy") {
  return gender === "girl" ? girlWeatherSets : boyWeatherSets;
}

export function getWeatherSet(weatherKey, gender = "boy") {
  return getWeatherSets(gender)[weatherKey];
}

const catalogMap = new Map();

Object.values(boyWeatherSets).forEach((set) => {
  set.items.forEach((item) => {
    if (!catalogMap.has(item.id)) {
      catalogMap.set(item.id, { ...item });
    }
  });
});

if (!catalogMap.has(dressItem.id)) {
  catalogMap.set(dressItem.id, { ...dressItem });
}

export const clothingCatalog = Array.from(catalogMap.values()).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function getWeatherKey(temp) {
  if (temp > 20) return "hot";
  if (temp >= 10) return "warm";
  if (temp >= 0) return "cool";
  if (temp >= -10) return "cold";
  return "veryCold";
}

/** Resolve active weather: rain/snow override temperature bands. */
export function resolveWeatherKey(temperature, skyCondition = "clear") {
  if (skyCondition === "rain" || skyCondition === "snow") return skyCondition;
  return getWeatherKey(temperature);
}

export function getRepresentativeTemperature(weatherKey) {
  switch (weatherKey) {
    case "hot":
      return 25;
    case "warm":
      return 15;
    case "cool":
      return 5;
    case "cold":
      return -5;
    case "veryCold":
      return -15;
    case "rain":
      return 8;
    case "snow":
      return -3;
    default:
      return 5;
  }
}

export function getPresetOutfitId(weatherKey) {
  return `preset-${weatherKey}`;
}

export function getWeatherKeyFromPresetId(outfitId) {
  if (!outfitId?.startsWith("preset-")) return null;
  return outfitId.slice("preset-".length);
}

export function createPresetOutfit(weatherKey, gender = "boy") {
  const set = getWeatherSet(weatherKey, gender);
  return {
    id: getPresetOutfitId(weatherKey),
    name: set.outside,
    source: "preset",
    weatherKey,
    items: set.items.map((item) => ({ ...item })),
  };
}

export function listPresetOutfits(gender = "boy") {
  return Object.keys(getWeatherSets(gender)).map((weatherKey) =>
    createPresetOutfit(weatherKey, gender),
  );
}

export function getClothingItem(id) {
  return catalogMap.get(id) ?? null;
}

export function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}
