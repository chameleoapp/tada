const dinosaurTheme = {
  id: "dinosaurs",
  label: "Dinosaurs",
  emoji: "🦖",
  folder: "dinosaurs",
  types: [
    { id: "stego", fallback: "🦕", label: "stegosaurus" },
    { id: "trex", fallback: "🦖", label: "T-rex" },
    { id: "trike", fallback: "🦕", label: "triceratops" },
    { id: "bronto", fallback: "🦕", label: "brontosaurus" },
  ],
  praise: [
    "Great job!",
    "You found it!",
    "Dino is proud!",
    "Roar-some!",
    "Keep going!",
  ],
  burstIcons: ["⭐", "✨", "🌟", "🦖", "💛"],
};

const carsTheme = {
  id: "cars",
  label: "Cars",
  emoji: "🚗",
  folder: "cars",
  types: [
    { id: "race", fallback: "🏎️", label: "race car" },
    { id: "sedan", fallback: "🚗", label: "car" },
    { id: "truck", fallback: "🛻", label: "pickup truck" },
    { id: "bus", fallback: "🚌", label: "bus" },
  ],
  praise: [
    "Great job!",
    "You found it!",
    "Vroom vroom!",
    "Fast find!",
    "Keep going!",
  ],
  burstIcons: ["⭐", "✨", "🌟", "🚗", "💛"],
};

const constructionTheme = {
  id: "construction",
  label: "Construction",
  emoji: "🚧",
  folder: "construction",
  types: [
    { id: "excavator", fallback: "🚜", label: "excavator" },
    { id: "dump", fallback: "🚛", label: "dump truck" },
    { id: "crane", fallback: "🏗️", label: "crane" },
    { id: "roller", fallback: "🚧", label: "road roller" },
  ],
  praise: [
    "Great job!",
    "You found it!",
    "Big dig!",
    "Build-tastic!",
    "Keep going!",
  ],
  burstIcons: ["⭐", "✨", "🌟", "🚜", "💛"],
};

const unicornTheme = {
  id: "unicorns",
  label: "Unicorns",
  emoji: "🦄",
  folder: "unicorns",
  types: [
    { id: "rainbow", fallback: "🦄", label: "rainbow unicorn" },
    { id: "pastel", fallback: "🦄", label: "pastel unicorn" },
    { id: "star", fallback: "⭐", label: "star unicorn" },
    { id: "sparkle", fallback: "✨", label: "sparkle unicorn" },
  ],
  praise: [
    "Great job!",
    "You found it!",
    "Magic find!",
    "So sparkly!",
    "Keep going!",
  ],
  burstIcons: ["⭐", "✨", "🌟", "🦄", "💖"],
};

const princessTheme = {
  id: "princesses",
  label: "Princesses",
  emoji: "👑",
  folder: "princesses",
  types: [
    { id: "crown", fallback: "👑", label: "crown" },
    { id: "castle", fallback: "🏰", label: "castle" },
    { id: "carriage", fallback: "🎀", label: "carriage" },
    { id: "wand", fallback: "🪄", label: "magic wand" },
  ],
  praise: [
    "Great job!",
    "You found it!",
    "Royal find!",
    "So fancy!",
    "Keep going!",
  ],
  burstIcons: ["⭐", "✨", "🌟", "👑", "💖"],
};

const animalsTheme = {
  id: "animals",
  label: "Animals",
  emoji: "🐰",
  folder: "animals",
  types: [
    { id: "bunny", fallback: "🐰", label: "bunny" },
    { id: "kitten", fallback: "🐱", label: "kitten" },
    { id: "puppy", fallback: "🐶", label: "puppy" },
    { id: "bear", fallback: "🐻", label: "bear" },
  ],
  praise: [
    "Great job!",
    "You found it!",
    "So cute!",
    "Animal pals!",
    "Keep going!",
  ],
  burstIcons: ["⭐", "✨", "🌟", "🐰", "💛"],
};

const boyBaseThemes = {
  dinosaurs: dinosaurTheme,
  cars: carsTheme,
  construction: constructionTheme,
};

const girlBaseThemes = {
  unicorns: unicornTheme,
  princesses: princessTheme,
  animals: animalsTheme,
  dinosaurs: dinosaurTheme,
};

const allBaseThemes = {
  ...boyBaseThemes,
  ...girlBaseThemes,
};

function buildHybridTheme(baseThemes, burstExtras) {
  const themes = Object.values(baseThemes);
  return {
    id: "hybrid",
    label: "Mix all",
    emoji: "🎁",
    folder: null,
    types: themes.flatMap((theme) =>
      theme.types.map((type) => ({ ...type, folder: theme.folder })),
    ),
    praise: [
      "Great job!",
      "You found it!",
      "Awesome!",
      "Super find!",
      "Keep going!",
    ],
    burstIcons: ["⭐", "✨", "🌟", ...burstExtras, "💛"],
  };
}

const boyHybridTheme = buildHybridTheme(boyBaseThemes, ["🦖", "🚗", "🚜"]);
const girlHybridTheme = buildHybridTheme(girlBaseThemes, ["🦄", "👑", "🐰", "🦖"]);

const boyThemeOptions = [
  dinosaurTheme,
  carsTheme,
  constructionTheme,
  boyHybridTheme,
];

const girlThemeOptions = [
  unicornTheme,
  princessTheme,
  animalsTheme,
  dinosaurTheme,
  girlHybridTheme,
];

/** All themes across genders (for lookups). */
export const REWARD_THEME_OPTIONS = [
  dinosaurTheme,
  carsTheme,
  constructionTheme,
  unicornTheme,
  princessTheme,
  animalsTheme,
  boyHybridTheme,
];

export const DEFAULT_REWARD_THEME_ID = "dinosaurs";
export const REWARD_THEME_STORAGE_KEY = "tada-reward-theme";

export function getDefaultRewardThemeId(gender = "boy") {
  return gender === "girl" ? "unicorns" : DEFAULT_REWARD_THEME_ID;
}

export function getRewardThemeOptions(gender = "boy") {
  return gender === "girl" ? girlThemeOptions : boyThemeOptions;
}

export function isRewardThemeAllowed(themeId, gender = "boy") {
  return getRewardThemeOptions(gender).some((theme) => theme.id === themeId);
}

export function getRewardTheme(themeId, gender = "boy") {
  if (themeId === "hybrid") {
    return gender === "girl" ? girlHybridTheme : boyHybridTheme;
  }
  return allBaseThemes[themeId] || getRewardThemeOptions(gender)[0];
}

export function getRewardArt(theme, index) {
  const type = theme.types[index % theme.types.length];
  const folder = type.folder || theme.folder;
  return {
    typeId: type.id,
    folder,
    src: `/${folder}/${type.id}.png`,
    fallback: type.fallback,
    label: type.label,
  };
}

export function pickPraise(theme) {
  return theme.praise[Math.floor(Math.random() * theme.praise.length)];
}

export function createBurstPieces(theme, count = 10) {
  return Array.from({ length: count }, (_, index) => ({
    icon: theme.burstIcons[Math.floor(Math.random() * theme.burstIcons.length)],
    angle: index * (360 / count),
    distance: 48 + Math.random() * 42,
  }));
}

export function loadStoredRewardThemeId(gender = "boy") {
  const fallback = getDefaultRewardThemeId(gender);
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(REWARD_THEME_STORAGE_KEY);
    if (isRewardThemeAllowed(stored, gender)) {
      return stored;
    }
  } catch {
    // ignore storage errors
  }
  return fallback;
}

export function saveRewardThemeId(themeId) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REWARD_THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore storage errors
  }
}
