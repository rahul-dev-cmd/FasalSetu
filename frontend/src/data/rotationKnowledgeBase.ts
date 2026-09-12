export interface RotationRule {
  family: string;
  recommendedFollowUps: string[]; // Crop IDs or family types that thrive after this
  avoidFollowUps: string[];        // Same family or disease carryover crops
  benefitReason: string;
  avoidReason: string;
}

export const CROP_FAMILY_MAP: Record<string, string> = {
  // Cereals (Poaceae)
  'Rice': 'Cereals',
  'Wheat': 'Cereals',
  'Maize': 'Cereals',
  'Sorghum': 'Cereals',
  'Bajra': 'Cereals',
  'Barley': 'Cereals',
  'Ragi': 'Cereals',
  'Sugarcane': 'Cereals',

  // Legumes / Pulses / Oilseed Legumes (Fabaceae)
  'Chickpea': 'Legumes',
  'Lentil': 'Legumes',
  'Pigeon pea': 'Legumes',
  'Green gram': 'Legumes',
  'Black gram': 'Legumes',
  'Field pea': 'Legumes',
  'Peas': 'Legumes',
  'Cowpea': 'Legumes',
  'Soybean': 'Legumes',
  'Groundnut': 'Legumes',

  // Solanaceae (Nightshades)
  'Potato': 'Solanaceae',
  'Tomato': 'Solanaceae',
  'Brinjal': 'Solanaceae',
  'Chilli': 'Solanaceae',

  // Brassicas
  'Mustard': 'Brassicaceae',
  'Cabbage': 'Brassicaceae',
  'Cauliflower': 'Brassicaceae',

  // Alliaceae (Alliums)
  'Onion': 'Alliaceae',
  'Garlic': 'Alliaceae',

  // Malvaceae
  'Cotton': 'Malvaceae',
  'Okra': 'Malvaceae',

  // Cucurbitaceae
  'Cucumber': 'Cucurbitaceae',

  // Others
  'Jute': 'Commercial',
  'Vegetables': 'General Vegetables',
  'Fruits': 'Perennial',
  'Fallow land': 'Fallow',
  'Other': 'General',
  "Don't know": 'Unknown',
};

// Explicit high-yield rotation pairings in Indian farming systems
export const SPECIFIC_ROTATION_RECOMMENDATIONS: Record<string, { goodNext: string[]; badNext: string[]; tip: string }> = {
  'Rice': {
    goodNext: ['chickpea', 'lentil', 'mustard', 'wheat', 'greengram', 'potato', 'sunflower'],
    badNext: ['rice'],
    tip: 'After paddy, residual moisture supports short-duration pulses (lentil, chickpea) or oilseeds (mustard, sunflower) without extra deep tillage.',
  },
  'Wheat': {
    goodNext: ['greengram', 'maize', 'soybean', 'groundnut', 'cotton', 'okra', 'cucumber'],
    badNext: ['wheat', 'barley'],
    tip: 'Rotating wheat with summer legumes (Moong / Green gram) fixes up to 40 kg/ha atmospheric nitrogen for the subsequent Kharif crop.',
  },
  'Cotton': {
    goodNext: ['wheat', 'chickpea', 'mustard', 'sorghum', 'onion', 'garlic'],
    badNext: ['cotton', 'okra'],
    tip: 'Deep-rooted cotton depletes subsoil nutrients; follow with shallow-rooted winter cereals (wheat) or nitrogen-restoring chickpea.',
  },
  'Soybean': {
    goodNext: ['wheat', 'mustard', 'chickpea', 'garlic', 'onion', 'potato'],
    badNext: ['soybean', 'groundnut'],
    tip: 'Soybean leaves 30-40 kg residual nitrogen in the root zone, giving wheat or mustard a 15-20% yield boost.',
  },
  'Maize': {
    goodNext: ['chickpea', 'potato', 'mustard', 'wheat', 'fieldpea', 'lentil'],
    badNext: ['maize', 'sorghum'],
    tip: 'Heavy feeder maize should be succeeded by leguminous pulses (chickpea, peas) to restore soil organic balance.',
  },
  'Potato': {
    goodNext: ['maize', 'greengram', 'sunflower', 'wheat', 'cucumber', 'okra'],
    badNext: ['potato', 'tomato', 'brinjal', 'chilli'],
    tip: 'High leftover fertilizer and loose friable soil after potato creates an ideal seedbed for summer vegetables or maize.',
  },
  'Tomato': {
    goodNext: ['maize', 'onion', 'cabbage', 'cauliflower', 'greengram', 'cowpea'],
    badNext: ['tomato', 'potato', 'brinjal', 'chilli'],
    tip: 'Never plant nightshades (tomato, potato, brinjal, chilli) back-to-back due to persistent soil-borne bacterial wilt and root-knot nematodes.',
  },
  'Onion': {
    goodNext: ['maize', 'soybean', 'groundnut', 'cowpea', 'cotton'],
    badNext: ['onion', 'garlic'],
    tip: 'Sulfur compounds from onion roots naturally suppress fungal pathogens; followed well by cereals or oilseeds.',
  },
  'Garlic': {
    goodNext: ['maize', 'greengram', 'soybean', 'groundnut', 'cotton'],
    badNext: ['garlic', 'onion'],
    tip: 'Garlic roots disinfect soil nematodes; great precursor for warm-season Kharif cash crops.',
  },
  'Mustard': {
    goodNext: ['greengram', 'maize', 'cotton', 'soybean', 'sorghum'],
    badNext: ['mustard', 'cabbage', 'cauliflower'],
    tip: 'Mustard bio-fumigant root exudates sanitize fungal spores, giving green gram or maize healthy root initiation.',
  },
  'Groundnut': {
    goodNext: ['wheat', 'sorghum', 'bajra', 'maize', 'chilli', 'onion'],
    badNext: ['groundnut', 'soybean'],
    tip: 'Groundnut leaves soft friable topsoil rich in rhizobium colonies, boosting winter cereals or spice crops.',
  },
  'Chickpea': {
    goodNext: ['maize', 'rice', 'sorghum', 'bajra', 'cotton', 'sesame'],
    badNext: ['chickpea', 'lentil'],
    tip: 'Chickpea adds biological nitrogen and breaks cereal stem-borer cycles.',
  },
  'Pigeon pea': {
    goodNext: ['wheat', 'mustard', 'greengram', 'maize', 'vegetables'],
    badNext: ['pigeonpea'],
    tip: 'Deep taproot of arhar breaks clay hardpans and releases fixed organic phosphorus.',
  },
  'Fallow land': {
    goodNext: ['rice', 'wheat', 'maize', 'cotton', 'chickpea', 'mustard', 'soybean', 'potato', 'tomato'],
    badNext: [],
    tip: 'Rested fallow soil has accumulated mineral nutrients and moisture; well suited for any season-appropriate crop.',
  },
};

export const FAMILY_ROTATION_RULES: Record<string, RotationRule> = {
  'Cereals': {
    family: 'Cereals (Poaceae)',
    recommendedFollowUps: ['Legumes', 'Brassicaceae', 'Solanaceae', 'Alliaceae'],
    avoidFollowUps: ['Cereals'],
    benefitReason: 'Breaks cereal rust and borer cycles; allows nitrogen replenishing by legumes.',
    avoidReason: 'Monoculture cereals deplete similar root depths and encourage persistent weed and insect buildup.',
  },
  'Legumes': {
    family: 'Legumes & Pulses (Fabaceae)',
    recommendedFollowUps: ['Cereals', 'Brassicaceae', 'Alliaceae', 'Commercial'],
    avoidFollowUps: ['Legumes'],
    benefitReason: 'Subsequent heavy feeders take full advantage of biological nitrogen fixed by pulse nodules.',
    avoidReason: 'Repeated legumes risk soil-borne Fusarium wilt and root-knot nematode accumulation.',
  },
  'Solanaceae': {
    family: 'Nightshades (Solanaceae)',
    recommendedFollowUps: ['Cereals', 'Legumes', 'Brassicaceae', 'Alliaceae', 'Cucurbitaceae'],
    avoidFollowUps: ['Solanaceae'],
    benefitReason: 'Restores balanced fertility and starves out soil-borne bacterial wilt (Ralstonia) and nematodes.',
    avoidReason: 'High risk of bacterial wilt, late blight, and root-knot nematode transmission across nightshades.',
  },
  'Brassicaceae': {
    family: 'Mustard & Cole Crops (Brassicaceae)',
    recommendedFollowUps: ['Legumes', 'Cereals', 'Solanaceae', 'Alliaceae'],
    avoidFollowUps: ['Brassicaceae'],
    benefitReason: 'Bio-fumigant effect suppresses soil pathogens, benefiting subsequent legumes or cereals.',
    avoidReason: 'Repeated Brassicas harbor clubroot fungus and diamondback moth larvae.',
  },
  'Malvaceae': {
    family: 'Mallow Family (Cotton / Okra)',
    recommendedFollowUps: ['Cereals', 'Legumes', 'Brassicaceae', 'Alliaceae'],
    avoidFollowUps: ['Malvaceae'],
    benefitReason: 'Alternates tap-root depth with fibrous cereal roots and reduces bollworm pupae in soil.',
    avoidReason: 'Cotton and Okra share severe pests like bollworms, whiteflies, and fungal wilt.',
  },
  'Alliaceae': {
    family: 'Alliums (Onion / Garlic)',
    recommendedFollowUps: ['Cereals', 'Legumes', 'Solanaceae', 'Cucurbitaceae'],
    avoidFollowUps: ['Alliaceae'],
    benefitReason: 'Natural allicin compounds clean root zone nematodes for following vegetable or cereal crops.',
    avoidReason: 'Re-planting alliums can harbor thrips and basal rot pathogens in soil.',
  },
};
