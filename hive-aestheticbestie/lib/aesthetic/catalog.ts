export type AestheticResult = {
  label: string;
  palette: [string, string, string];
  moodSentence: string;
  outfitSuggestion?: string;
};

const labels = [
  "Soft Academic", "Midnight Siren", "Cozy Scholar", "Cloud Pop", "Velvet Nomad", "Neon Diary",
  "Rose Noir", "Sunday Film", "Museum Rebel", "Dawn Poet", "Quiet Maximalist", "Polaroid Muse",
  "Urban Daydream", "Soft Grunge", "Candlelit Minimal", "Retro Orbit", "Honey Archive", "Ocean Letter",
  "Monochrome Bloom", "City Ballet", "Velour Weekender", "Studio Stardust", "Misty Oracle", "Night Library",
  "Golden Hours Club", "Velvet Morning", "Moonlit Casual", "Indigo Tender", "Pastel Riot", "Ivory Electric",
  "Linen Charm", "After Rain Cool", "Cinema Casual", "Mellow Magnet", "Ruby Street", "Frosted Chic",
  "Cocoa Vogue", "Floral Storm", "Electric Grace", "Latte Luxe", "Nordic Spark", "Cherry Smoke",
  "Dusty Pop", "Forest Glow", "Lavender Edge", "Copper Calm", "Porcelain Pulse", "Satellite Soft",
  "Magenta Calm", "Satin Weekend", "Sunset Theory", "Cool Libra", "Warm Mirage", "Ink and Honey",
  "Petal Power", "Cobalt Whisper", "Silk Weekend", "Opal Rebel", "Velvet Sprite", "Noir Daylight"
];

const palettes: [string, string, string][] = [
  ["#F6D1E7", "#9E85FF", "#382A63"], ["#0F1029", "#6A5ACD", "#F28AB2"], ["#E8E2DA", "#7A8D8D", "#2B2D42"],
  ["#F5E8C7", "#FF8FA3", "#6A7FDB"], ["#EDE7D9", "#B08968", "#6C584C"], ["#E8FFF8", "#9AE6B4", "#1F3C3A"],
  ["#FFE5EC", "#BC6C9D", "#3A1A2F"], ["#CCD5AE", "#FAEDCD", "#5C5470"], ["#D8E2DC", "#6D6875", "#B5838D"],
  ["#DAD7CD", "#A3B18A", "#344E41"], ["#FFE8D6", "#CB997E", "#6B705C"], ["#E0FBFC", "#98C1D9", "#3D5A80"],
  ["#F3E9DC", "#C08552", "#5E3023"], ["#E4C1F9", "#A9DEF9", "#FCF6BD"], ["#EDEDE9", "#D6CCC2", "#7F5539"],
  ["#F0EFEB", "#C8B6A6", "#4A5759"], ["#D8F3DC", "#95D5B2", "#2D6A4F"], ["#FEE440", "#00BBF9", "#9B5DE5"],
  ["#F4F1DE", "#E07A5F", "#3D405B"], ["#C9ADA7", "#F2E9E4", "#22223B"], ["#FFD6FF", "#A0C4FF", "#BDB2FF"]
];

const moods = [
  "You feel like your own moodboard today: soft, certain, and impossible to ignore.",
  "Your vibe reads calm confidence with a little cinematic mischief.",
  "You are giving gentle main-character energy with clean edges.",
  "This look lands as warm, composed, and quietly magnetic.",
  "Today feels like style as self-trust, not performance.",
  "Your energy is polished but still playful in all the right places.",
  "You are moving like someone who knows their aesthetic language.",
  "This vibe says intentional softness with subtle authority.",
  "You feel like a beautiful in-between: grounded and electric at once.",
  "Your aesthetic lands as effortless and emotionally clear."
];

const outfits = [
  "Try a textured layer with one clean statement piece and simple jewelry.",
  "Go tonal: one color family head-to-toe, then one contrasting accent.",
  "Pair relaxed tailoring with soft fabric to keep it confident but warm.",
  "Build around one hero item and keep everything else low-noise.",
  "Use matte basics and one glossy element for dimension.",
  "Anchor with neutral shoes and let color live in the top layer.",
  "Keep silhouette simple, then add one dramatic texture.",
  "Mix one structured piece with one romantic piece for balance."
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function fallbackAesthetic(): AestheticResult {
  return {
    label: randomItem(labels),
    palette: randomItem(palettes),
    moodSentence: randomItem(moods),
    outfitSuggestion: randomItem(outfits),
  };
}

export function sanitizePalette(input: string[]): [string, string, string] {
  const hex = /^#?[0-9a-fA-F]{6}$/;
  const normalized = input
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => hex.test(value))
    .map((value) => (value.startsWith("#") ? value.toUpperCase() : `#${value.toUpperCase()}`));

  if (normalized.length >= 3) return [normalized[0], normalized[1], normalized[2]];
  return fallbackAesthetic().palette;
}