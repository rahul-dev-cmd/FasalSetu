import { CROP_KNOWLEDGE_BASE, CropData } from '../data/cropKnowledgeBase';
import {
  CROP_FAMILY_MAP,
  SPECIFIC_ROTATION_RECOMMENDATIONS,
  FAMILY_ROTATION_RULES,
} from '../data/rotationKnowledgeBase';

export interface CropAdvisorInputs {
  // Step 1: Location
  state: string;
  district: string;
  village?: string;

  // Step 2: Soil Type
  soilType: string;

  // Step 3: Soil Condition
  fertility: string;
  waterlogging: string;
  waterRetention: string;

  // Step 4: Water Availability
  waterLevel: string;
  waterSource: string;
  irrigationAvailability: string;

  // Step 5: Season & Weather
  season: 'Kharif' | 'Rabi' | 'Zaid';
  sowingMonth: string;
  temperature: string;
  expectedRainfall: string;
  recentWeather: string;

  // Step 6: Previous Crop
  previousCrop: string;

  // Step 7: Priority & Land Size
  priority: string;
  landArea: number;
  landUnit: string;
}

export interface FactorBreakdown {
  score: number;
  status: 'Suitable' | 'Highly suitable' | 'Moderate' | 'Less suitable' | 'Good rotation' | 'Acceptable' | 'Poor rotation' | 'Suitable for your requirement';
  reason: string;
}

export interface ScoredCrop {
  crop: CropData;
  overallScore: number;
  breakdown: {
    soil: FactorBreakdown;
    water: FactorBreakdown;
    weather: FactorBreakdown;
    season: FactorBreakdown;
    rotation: FactorBreakdown;
    duration: FactorBreakdown;
    priority: FactorBreakdown;
  };
  lowScoreReasons?: string[];
  betterAlternatives?: string[];
}

export interface RecommendationResult {
  topCrop: ScoredCrop;
  otherSuitable: ScoredCrop[];
  lowerScoring: ScoredCrop[];
  inputSummary: CropAdvisorInputs;
}

const WATER_LEVEL_SCALE: Record<string, number> = {
  'Very low': 1,
  'Low': 2,
  'Moderate': 3,
  'High': 4,
  'Very high': 5,
};

/**
 * Client-side Rule-based Weighted Crop Scorer
 */
export function calculateCropRecommendations(inputs: CropAdvisorInputs): RecommendationResult {
  // 1. Dynamic weights based on farmer priority
  let wSoil = 0.25;
  let wWater = 0.20;
  let wSeasonClimate = 0.20;
  let wRotation = 0.15;
  let wDuration = 0.05;
  let wPriority = 0.10;
  let wResource = 0.05;

  if (inputs.priority === 'Less water') {
    wWater = 0.30;
    wSoil = 0.20;
    wSeasonClimate = 0.15;
    wPriority = 0.15;
    wRotation = 0.10;
    wDuration = 0.05;
    wResource = 0.05;
  } else if (inputs.priority === 'Faster harvest') {
    wDuration = 0.20;
    wPriority = 0.15;
    wSoil = 0.20;
    wWater = 0.15;
    wSeasonClimate = 0.15;
    wRotation = 0.10;
    wResource = 0.05;
  } else if (inputs.priority === 'Better soil health') {
    wRotation = 0.25;
    wPriority = 0.15;
    wSoil = 0.20;
    wWater = 0.15;
    wSeasonClimate = 0.15;
    wDuration = 0.05;
    wResource = 0.05;
  } else if (inputs.priority === 'Higher income') {
    wPriority = 0.20;
    wSoil = 0.20;
    wSeasonClimate = 0.20;
    wWater = 0.15;
    wRotation = 0.10;
    wDuration = 0.10;
    wResource = 0.05;
  }

  const scoredList: ScoredCrop[] = CROP_KNOWLEDGE_BASE.map((crop) => {
    // ── A. SOIL SCORE (0-100) ──────────────────────────
    let soilScore = 75;
    let soilReason = 'Moderate compatibility with selected soil profile.';
    let soilStatus: FactorBreakdown['status'] = 'Moderate';

    if (inputs.soilType === "Don't know") {
      soilScore = 80;
      soilReason = 'General loam/alluvial compatibility assumed.';
      soilStatus = 'Suitable';
    } else if (crop.suitableSoils.includes(inputs.soilType)) {
      soilScore = 95;
      soilReason = `${crop.name} thrives in ${inputs.soilType} texture and drainage conditions.`;
      soilStatus = 'Suitable';
    } else {
      soilScore = 48;
      soilReason = `${crop.name} prefers ${crop.suitableSoils.slice(0, 2).join(', ')} rather than ${inputs.soilType}.`;
      soilStatus = 'Less suitable';
    }

    // Waterlogging adjustment
    if (inputs.waterlogging === 'Frequently') {
      if (crop.waterloggingTolerance === 'High') {
        soilScore = Math.min(100, soilScore + 10);
        soilReason += ' Handles standing water well.';
      } else if (crop.waterloggingTolerance === 'Very low' || crop.waterloggingTolerance === 'Low') {
        soilScore = Math.max(10, soilScore - 30);
        soilReason += ' Highly susceptible to collar and root rot under frequent waterlogging.';
        soilStatus = 'Less suitable';
      }
    }

    // Water retention adjustment
    if (inputs.waterRetention === 'Dries quickly' && (crop.waterRequirement === 'Very high' || crop.waterRequirement === 'High')) {
      soilScore = Math.max(20, soilScore - 20);
      soilReason += ' Fast-drying soil causes moisture stress for this water-demanding crop.';
      soilStatus = 'Less suitable';
    }

    // ── B. WATER SCORE (0-100) ─────────────────────────
    let waterScore = 70;
    let waterReason = 'Acceptable moisture match.';
    let waterStatus: FactorBreakdown['status'] = 'Moderate';

    const farmerWaterNum = WATER_LEVEL_SCALE[inputs.waterLevel] || 3;
    const cropWaterNum = WATER_LEVEL_SCALE[crop.waterRequirement] || 3;
    const waterDiff = farmerWaterNum - cropWaterNum;

    if (waterDiff === 0) {
      waterScore = 96;
      waterReason = `Water requirement (${crop.waterRequirement}) perfectly matches your available supply.`;
      waterStatus = 'Suitable';
    } else if (waterDiff > 0) {
      // Farmer has more water than crop requires
      if (crop.waterRequirement === 'Very low' && farmerWaterNum >= 4) {
        waterScore = 65;
        waterReason = 'Excess standing water can cause fungal disease for this dryland crop.';
        waterStatus = 'Moderate';
      } else {
        waterScore = 88;
        waterReason = `Ample water supply ensures optimal vegetative and reproductive development.`;
        waterStatus = 'Suitable';
      }
    } else {
      // Farmer has less water than crop requires
      if (waterDiff === -1) {
        waterScore = 62;
        waterReason = `Requires careful water scheduling as crop needs ${crop.waterRequirement} water.`;
        waterStatus = 'Moderate';
      } else if (waterDiff === -2) {
        waterScore = 38;
        waterReason = `Water availability (${inputs.waterLevel}) is low for ${crop.name}'s typical ${crop.waterRequirement} requirement.`;
        waterStatus = 'Less suitable';
      } else {
        waterScore = 15;
        waterReason = `Severe deficit: ${crop.name} requires ${crop.waterRequirement} water which exceeds your current supply.`;
        waterStatus = 'Less suitable';
      }
    }

    // ── C. SEASON SCORE (0-100) ────────────────────────
    let seasonScore = 50;
    let seasonReason = '';
    let seasonStatus: FactorBreakdown['status'] = 'Suitable';

    const isSeasonMatch = crop.seasons.includes(inputs.season);
    if (isSeasonMatch) {
      seasonScore = 95;
      seasonReason = `Naturally sown during ${inputs.season} season (${crop.sowingPeriod}).`;
      seasonStatus = 'Highly suitable';
    } else {
      seasonScore = 20;
      seasonReason = `Out of primary season. ${crop.name} is recommended for ${crop.seasons.join(' or ')}.`;
      seasonStatus = 'Less suitable';
    }

    // ── D. WEATHER & TEMPERATURE SCORE (0-100) ────────
    let weatherScore = 80;
    let weatherReason = 'Current climate parameters are within acceptable growth thresholds.';
    let weatherStatus: FactorBreakdown['status'] = 'Suitable';

    if (inputs.temperature !== "Don't know") {
      const isTempOk = (crop.temperatureTolerance as string[]).includes(inputs.temperature);
      if (isTempOk) {
        weatherScore = 92;
        weatherReason = `${inputs.temperature} temperatures are well-tolerated by ${crop.name}.`;
        weatherStatus = 'Suitable';
      } else {
        weatherScore = 40;
        weatherReason = `${inputs.temperature} weather is outside the optimal thermal comfort zone for this crop.`;
        weatherStatus = 'Less suitable';
      }
    }

    // ── E. ROTATION & PREVIOUS CROP SCORE (0-100) ──────
    let rotationScore = 75;
    let rotationReason = 'Acceptable standard crop sequence.';
    let rotationStatus: FactorBreakdown['status'] = 'Acceptable';

    const prevCropFamily = CROP_FAMILY_MAP[inputs.previousCrop] || 'General';
    const specificRule = SPECIFIC_ROTATION_RECOMMENDATIONS[inputs.previousCrop];

    if (inputs.previousCrop === 'Fallow land') {
      rotationScore = 92;
      rotationReason = 'Fallow land has replenished nutrients and soil biology.';
      rotationStatus = 'Good rotation';
    } else if (specificRule && specificRule.goodNext.includes(crop.id)) {
      rotationScore = 98;
      rotationReason = `Ideal succession after ${inputs.previousCrop}: ${specificRule.tip}`;
      rotationStatus = 'Good rotation';
    } else if (specificRule && specificRule.badNext.includes(crop.id)) {
      rotationScore = 25;
      rotationReason = `Monoculture warning: Avoid planting ${crop.name} directly after ${inputs.previousCrop}.`;
      rotationStatus = 'Poor rotation';
    } else if (prevCropFamily !== 'General' && prevCropFamily !== 'Unknown' && prevCropFamily === crop.family) {
      rotationScore = 28;
      rotationReason = `Same botanical family (${crop.family}) as previous ${inputs.previousCrop}; high risk of pest and disease carryover.`;
      rotationStatus = 'Poor rotation';
    } else if (prevCropFamily === 'Cereals' && crop.category === 'Pulses') {
      rotationScore = 94;
      rotationReason = `Excellent rotation: Pulse fixes nitrogen and breaks previous cereal disease cycles.`;
      rotationStatus = 'Good rotation';
    } else if (prevCropFamily === 'Legumes' && (crop.category === 'Cereals' || crop.category === 'Commercial')) {
      rotationScore = 92;
      rotationReason = `Takes advantage of nitrogen left by preceding ${inputs.previousCrop}.`;
      rotationStatus = 'Good rotation';
    } else if (crop.category === 'Pulses') {
      rotationScore = 88;
      rotationReason = 'Leguminous root nodules restore organic nitrogen and soil structure.';
      rotationStatus = 'Good rotation';
    }

    // ── F. DURATION & HARVEST FIT (0-100) ───────────────
    let durationScore = 80;
    let durationReason = `Standard growth cycle (~${crop.durationDaysRange}).`;
    let durationStatus: FactorBreakdown['status'] = 'Suitable for your requirement';

    if (inputs.priority === 'Faster harvest') {
      if (crop.durationCategory === 'Short') {
        durationScore = 98;
        durationReason = `Fast-maturing variety (~${crop.durationDaysRange}), ideal for rapid harvest and turnover.`;
        durationStatus = 'Suitable for your requirement';
      } else if (crop.durationCategory === 'Medium') {
        durationScore = 70;
        durationReason = `Moderate duration (~${crop.durationDaysRange}).`;
        durationStatus = 'Acceptable';
      } else {
        durationScore = 32;
        durationReason = `Long duration (~${crop.durationDaysRange}) conflicts with fast-harvest priority.`;
        durationStatus = 'Less suitable';
      }
    }

    // ── G. PRIORITY ALIGNMENT SCORE (0-100) ────────────
    let priorityScore = 78;
    let priorityReason = 'Balanced fit with operational goals.';
    let priorityStatus: FactorBreakdown['status'] = 'Suitable';

    if (inputs.priority === 'Higher income') {
      if (crop.incomePotential === 'High') {
        priorityScore = 96;
        priorityReason = 'High market value and strong wholesale mandi price potential.';
      } else if (crop.incomePotential === 'Steady') {
        priorityScore = 80;
        priorityReason = 'Assured government MSP or steady staple market demand.';
      } else {
        priorityScore = 60;
        priorityReason = 'Moderate commercial return per hectare.';
      }
    } else if (inputs.priority === 'Less water') {
      if (crop.droughtTolerance === 'High' || crop.waterRequirement === 'Very low' || crop.waterRequirement === 'Low') {
        priorityScore = 98;
        priorityReason = 'Exceptional drought resilience and low irrigation requirement.';
      } else {
        priorityScore = 45;
        priorityReason = 'Requires consistent water which conflicts with water-saving priority.';
      }
    } else if (inputs.priority === 'Better soil health') {
      if (crop.category === 'Pulses' || crop.family === 'Fabaceae') {
        priorityScore = 98;
        priorityReason = crop.soilHealthBenefit;
      } else if (crop.id === 'mustard') {
        priorityScore = 90;
        priorityReason = 'Bio-fumigant root exudates sanitize fungal pathogens.';
      } else {
        priorityScore = 65;
        priorityReason = 'Moderate soil organic carbon addition.';
      }
    } else if (inputs.priority === 'Lower disease-pest risk') {
      if (crop.category === 'Pulses' || crop.category === 'Cereals') {
        priorityScore = 90;
        priorityReason = 'Hardy, resilient canopy with well-established IPM practices.';
      } else {
        priorityScore = 68;
        priorityReason = 'Requires regular pest surveillance.';
      }
    }

    // ── H. WEIGHTED FINAL CALCULATION ──────────────────
    let rawWeightedScore =
      soilScore * wSoil +
      waterScore * wWater +
      seasonScore * wSeasonClimate +
      rotationScore * wRotation +
      durationScore * wDuration +
      priorityScore * wPriority +
      80 * wResource;

    // Hard ceiling for completely out of season crops
    if (!isSeasonMatch) {
      rawWeightedScore = Math.min(rawWeightedScore, 58);
    }

    // Hard penalty for extreme water deficit
    if (waterDiff <= -3) {
      rawWeightedScore = Math.min(rawWeightedScore, 52);
    }

    // Monoculture penalty ceiling
    if (rotationStatus === 'Poor rotation') {
      rawWeightedScore = Math.min(rawWeightedScore, 64);
    }

    const finalPercent = Math.min(96, Math.max(30, Math.round(rawWeightedScore)));

    return {
      crop,
      overallScore: finalPercent,
      breakdown: {
        soil: { score: soilScore, status: soilStatus, reason: soilReason },
        water: { score: waterScore, status: waterStatus, reason: waterReason },
        weather: { score: weatherScore, status: weatherStatus, reason: weatherReason },
        season: { score: seasonScore, status: seasonStatus, reason: seasonReason },
        rotation: { score: rotationScore, status: rotationStatus, reason: rotationReason },
        duration: { score: durationScore, status: durationStatus, reason: durationReason },
        priority: { score: priorityScore, status: priorityStatus, reason: priorityReason },
      },
    };
  });

  // Sort by overallScore descending
  scoredList.sort((a, b) => b.overallScore - a.overallScore);

  const topCrop = scoredList[0];
  const otherSuitable = scoredList.slice(1, 5);
  const topCandidateNames = [topCrop.crop.name, ...otherSuitable.map((s) => s.crop.name)].slice(0, 3);

  // Identify low scoring crops and attach human readable reasons
  const lowerScoring = scoredList.slice(scoredList.length - 4).map((item) => {
    const reasons: string[] = [];

    if (item.breakdown.water.score < 50) {
      reasons.push(`Water availability (${inputs.waterLevel}) is insufficient for ${item.crop.name}'s typical ${item.crop.waterRequirement} requirement.`);
    }
    if (item.breakdown.season.score < 50) {
      reasons.push(`Current season (${inputs.season}) is outside the normal sowing window (${item.crop.sowingPeriod}).`);
    }
    if (item.breakdown.rotation.score < 50) {
      reasons.push(`High disease and pest risk if following ${inputs.previousCrop} (same plant family).`);
    }
    if (item.breakdown.soil.score < 60) {
      reasons.push(`${item.crop.name} prefers ${item.crop.suitableSoils.join(', ')} rather than ${inputs.soilType}.`);
    }

    if (reasons.length === 0) {
      reasons.push(`Lower overall synergy with your soil moisture, season, and ${inputs.priority} priority.`);
    }

    return {
      ...item,
      lowScoreReasons: reasons,
      betterAlternatives: topCandidateNames,
    };
  });

  return {
    topCrop,
    otherSuitable,
    lowerScoring,
    inputSummary: inputs,
  };
}
