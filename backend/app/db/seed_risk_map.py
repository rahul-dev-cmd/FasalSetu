"""
FasalSetu Government Risk Map Seeder
====================================
Populates synthetic agricultural risk map dataset for Feature 15b:
- 17 Hotspots (rank-ordered, multi-crop, high/medium/low severity)
- 17 Map Markers (spatial overlay coordinates and categories)
- 11 District Zones (regional polygon bounding boxes & styling)

Idempotent: Skips if data is already present in the database.
"""

import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.risk_map import Hotspot, MapMarker, DistrictZone

logger = logging.getLogger("fasalsetu_seed")

# 17 Hotspots
HOTSPOTS_SEED_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "rank": 1,
        "district": "Warangal",
        "risk_level": "High",
        "crop": "Rice",
        "issue_type": "Brown Planthopper (BPH) Outbreak",
        "affected_area_label": "14,800 ha",
        "affected_area_ha": 14800.0,
        "trend": "up",
        "trend_label": "+18% vs last week",
        "trend_percent": 18.0,
        "economic_impact_cr": 24.5,
        "farmers_impacted": 16200,
        "mandals_count": 6,
        "mandals_list": ["Wardhannapet", "Narsampet", "Parkal", "Atmakur", "Geesugonda", "Rayaparthy"],
        "intervention_summary": "Aerial drone spraying and Pymetrozine distribution initiated across 6 mandals.",
        "interventions_list": [
            "Subsidy on Pymetrozine 50% WDG released via PACS",
            "Emergency advisory broadcast via Kisan SMS & WhatsApp",
            "5 mobile plant protection squads deployed for field scouting"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 48}, {"date": "Day 10", "value": 55},
            {"date": "Day 15", "value": 62}, {"date": "Day 20", "value": 71},
            {"date": "Day 25", "value": 84}, {"date": "Day 30", "value": 95}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 28}, {"date": "Day 20", "value": 36},
            {"date": "Day 30", "value": 48}, {"date": "Day 40", "value": 64},
            {"date": "Day 50", "value": 79}, {"date": "Day 60", "value": 95}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 18}, {"date": "Day 30", "value": 26},
            {"date": "Day 45", "value": 42}, {"date": "Day 60", "value": 58},
            {"date": "Day 75", "value": 76}, {"date": "Day 90", "value": 95}
        ],
        "map_position_x": 42.5,
        "map_position_y": 38.2
    },
    {
        "id": 2,
        "rank": 2,
        "district": "Nizamabad",
        "risk_level": "High",
        "crop": "Rice",
        "issue_type": "Bacterial Leaf Blight & Sheath Rot",
        "affected_area_label": "12,300 ha",
        "affected_area_ha": 12300.0,
        "trend": "up",
        "trend_label": "+12% vs last week",
        "trend_percent": 12.0,
        "economic_impact_cr": 19.8,
        "farmers_impacted": 13400,
        "mandals_count": 5,
        "mandals_list": ["Armoor", "Bodhan", "Bheemgal", "Kotgiri", "Varni"],
        "intervention_summary": "Copper hydroxide demonstration drives and field water-drainage guidance.",
        "interventions_list": [
            "Field water drainage advisory issued to mitigate humid microclimate",
            "Plant pathologists dispatched to Bodhan & Armoor clusters",
            "Streptocycline + Copper Oxychloride buffer stocks verified"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 40}, {"date": "Day 10", "value": 46},
            {"date": "Day 15", "value": 54}, {"date": "Day 20", "value": 63},
            {"date": "Day 25", "value": 72}, {"date": "Day 30", "value": 81}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 24}, {"date": "Day 20", "value": 32},
            {"date": "Day 30", "value": 42}, {"date": "Day 40", "value": 55},
            {"date": "Day 50", "value": 69}, {"date": "Day 60", "value": 81}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 15}, {"date": "Day 30", "value": 22},
            {"date": "Day 45", "value": 35}, {"date": "Day 60", "value": 50},
            {"date": "Day 75", "value": 66}, {"date": "Day 90", "value": 81}
        ],
        "map_position_x": 31.8,
        "map_position_y": 26.4
    },
    {
        "id": 3,
        "rank": 3,
        "district": "Jagtial",
        "risk_level": "High",
        "crop": "Cotton",
        "issue_type": "Pink Bollworm Larval Penetration",
        "affected_area_label": "11,500 ha",
        "affected_area_ha": 11500.0,
        "trend": "up",
        "trend_label": "+15% vs last week",
        "trend_percent": 15.0,
        "economic_impact_cr": 21.2,
        "farmers_impacted": 11800,
        "mandals_count": 5,
        "mandals_list": ["Adoni", "Yemmiganur", "Alur", "Pattikonda", "Aspari"],
        "intervention_summary": "Pheromone trap mass installations and mating disruption rope trials.",
        "interventions_list": [
            "15,000 PBW pheromone lures distributed at 75% subsidy",
            "Night trap surveillance protocol established in Adoni ginning zone",
            "Advisory on stalk shredding post final picking"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 35}, {"date": "Day 10", "value": 42},
            {"date": "Day 15", "value": 51}, {"date": "Day 20", "value": 62},
            {"date": "Day 25", "value": 70}, {"date": "Day 30", "value": 79}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 20}, {"date": "Day 20", "value": 28},
            {"date": "Day 30", "value": 39}, {"date": "Day 40", "value": 53},
            {"date": "Day 50", "value": 66}, {"date": "Day 60", "value": 79}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 12}, {"date": "Day 30", "value": 19},
            {"date": "Day 45", "value": 30}, {"date": "Day 60", "value": 47},
            {"date": "Day 75", "value": 63}, {"date": "Day 90", "value": 79}
        ],
        "map_position_x": 48.2,
        "map_position_y": 62.1
    },
    {
        "id": 4,
        "rank": 4,
        "district": "Mancherial",
        "risk_level": "High",
        "crop": "Chilli",
        "issue_type": "Black Thrips (Thrips parvispinus) Infestation",
        "affected_area_label": "10,200 ha",
        "affected_area_ha": 10200.0,
        "trend": "up",
        "trend_label": "+9% vs last week",
        "trend_percent": 9.0,
        "economic_impact_cr": 28.0,
        "farmers_impacted": 14100,
        "mandals_count": 6,
        "mandals_list": ["Tadikonda", "Prathipadu", "Mangalagiri", "Tenali", "Medikonduru", "Pedakakani"],
        "intervention_summary": "Blue sticky trap deployment and bio-agent Beauveria bassiana spraying.",
        "interventions_list": [
            "50 blue sticky traps per acre supplied through Rythu Bharosa Kendras",
            "Biological control demonstration with Lecanicillium lecanii",
            "Ban enforced on indiscriminate synthetic pyrethroid sprays"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 50}, {"date": "Day 10", "value": 58},
            {"date": "Day 15", "value": 65}, {"date": "Day 20", "value": 72},
            {"date": "Day 25", "value": 81}, {"date": "Day 30", "value": 88}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 31}, {"date": "Day 20", "value": 42},
            {"date": "Day 30", "value": 54}, {"date": "Day 40", "value": 66},
            {"date": "Day 50", "value": 78}, {"date": "Day 60", "value": 88}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 20}, {"date": "Day 30", "value": 32},
            {"date": "Day 45", "value": 48}, {"date": "Day 60", "value": 63},
            {"date": "Day 75", "value": 75}, {"date": "Day 90", "value": 88}
        ],
        "map_position_x": 65.4,
        "map_position_y": 55.7
    },
    {
        "id": 5,
        "rank": 5,
        "district": "Karimnagar",
        "risk_level": "High",
        "crop": "Cotton",
        "issue_type": "Sucking Pest Complex (Aphids & Jassids)",
        "affected_area_label": "8,900 ha",
        "affected_area_ha": 8900.0,
        "trend": "stable",
        "trend_label": "Stable (+1% vs last week)",
        "trend_percent": 1.0,
        "economic_impact_cr": 14.1,
        "farmers_impacted": 8700,
        "mandals_count": 4,
        "mandals_list": ["Choppadandi", "Gangadhara", "Manakondur", "Thimmapur"],
        "intervention_summary": "Neem oil emulsion guidance and systemic neonicotinoid rotation protocols.",
        "interventions_list": [
            "Farmer awareness camps on beneficial predators (ladybird beetles)",
            "Yellow sticky traps distributed to 3,000 smallholders",
            "Soil moisture monitoring to reduce drought-induced pest surges"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 61}, {"date": "Day 10", "value": 64},
            {"date": "Day 15", "value": 66}, {"date": "Day 20", "value": 65},
            {"date": "Day 25", "value": 67}, {"date": "Day 30", "value": 68}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 45}, {"date": "Day 20", "value": 52},
            {"date": "Day 30", "value": 59}, {"date": "Day 40", "value": 64},
            {"date": "Day 50", "value": 67}, {"date": "Day 60", "value": 68}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 30}, {"date": "Day 30", "value": 41},
            {"date": "Day 45", "value": 52}, {"date": "Day 60", "value": 61},
            {"date": "Day 75", "value": 65}, {"date": "Day 90", "value": 68}
        ],
        "map_position_x": 46.1,
        "map_position_y": 28.9
    },
    {
        "id": 6,
        "rank": 6,
        "district": "Bhadradri Kothagudem",
        "risk_level": "High",
        "crop": "Rice",
        "issue_type": "Stem Borer & False Smut",
        "affected_area_label": "8,400 ha",
        "affected_area_ha": 8400.0,
        "trend": "down",
        "trend_label": "-4% vs last week",
        "trend_percent": -4.0,
        "economic_impact_cr": 13.5,
        "farmers_impacted": 9200,
        "mandals_count": 4,
        "mandals_list": ["Tanuku", "Bhimavaram", "Palakollu", "Narsapur"],
        "intervention_summary": "Trichogramma egg parasitoid card distribution and light trap monitoring.",
        "interventions_list": [
            "Trichogramma chilonis egg cards distributed covering 4,000 ha",
            "Light traps set up at Panchayat demonstration points",
            "Drainage sluice gates cleared to reduce stagnant water humidity"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 76}, {"date": "Day 10", "value": 75},
            {"date": "Day 15", "value": 73}, {"date": "Day 20", "value": 71},
            {"date": "Day 25", "value": 69}, {"date": "Day 30", "value": 67}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 50}, {"date": "Day 20", "value": 62},
            {"date": "Day 30", "value": 74}, {"date": "Day 40", "value": 77},
            {"date": "Day 50", "value": 72}, {"date": "Day 60", "value": 67}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 35}, {"date": "Day 30", "value": 49},
            {"date": "Day 45", "value": 66}, {"date": "Day 60", "value": 75},
            {"date": "Day 75", "value": 72}, {"date": "Day 90", "value": 67}
        ],
        "map_position_x": 72.8,
        "map_position_y": 48.3
    },
    {
        "id": 7,
        "rank": 7,
        "district": "Khammam",
        "risk_level": "Medium",
        "crop": "Chilli",
        "issue_type": "Gemini Virus (Chilli Leaf Curl)",
        "affected_area_label": "7,100 ha",
        "affected_area_ha": 7100.0,
        "trend": "up",
        "trend_label": "+7% vs last week",
        "trend_percent": 7.0,
        "economic_impact_cr": 16.4,
        "farmers_impacted": 8100,
        "mandals_count": 4,
        "mandals_list": ["Kallur", "Wyra", "Tallada", "Madhira"],
        "intervention_summary": "Whitefly vector vector-control campaign using spiromesifen sprays.",
        "interventions_list": [
            "Whitefly suppression advisory issued across Wyra canal basin",
            "Border crop planting (maize/sorghum) recommended as barrier",
            "Removal of infected rogue plants demonstrated in village meetings"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 32}, {"date": "Day 10", "value": 36},
            {"date": "Day 15", "value": 41}, {"date": "Day 20", "value": 45},
            {"date": "Day 25", "value": 49}, {"date": "Day 30", "value": 53}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 20}, {"date": "Day 20", "value": 25},
            {"date": "Day 30", "value": 33}, {"date": "Day 40", "value": 42},
            {"date": "Day 50", "value": 48}, {"date": "Day 60", "value": 53}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 14}, {"date": "Day 30", "value": 19},
            {"date": "Day 45", "value": 28}, {"date": "Day 60", "value": 38},
            {"date": "Day 75", "value": 46}, {"date": "Day 90", "value": 53}
        ],
        "map_position_x": 56.4,
        "map_position_y": 42.1
    },
    {
        "id": 8,
        "rank": 8,
        "district": "Nalgonda",
        "risk_level": "Medium",
        "crop": "Cotton",
        "issue_type": "Dry Root Rot & Wilt",
        "affected_area_label": "6,500 ha",
        "affected_area_ha": 6500.0,
        "trend": "stable",
        "trend_label": "Stable (0% vs last week)",
        "trend_percent": 0.0,
        "economic_impact_cr": 10.2,
        "farmers_impacted": 6900,
        "mandals_count": 4,
        "mandals_list": ["Miryalaguda", "Devarakonda", "Nakrekal", "Suryapet"],
        "intervention_summary": "Trichoderma viride bio-fertilizer seed treatment and micro-irrigation guidance.",
        "interventions_list": [
            "Bio-control enrichment with Farm Yard Manure advocated",
            "Drip irrigation subsidy priority for severely affected tail-end areas",
            "Emergency soil moisture conservation workshops"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 48}, {"date": "Day 10", "value": 49},
            {"date": "Day 15", "value": 50}, {"date": "Day 20", "value": 49},
            {"date": "Day 25", "value": 51}, {"date": "Day 30", "value": 50}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 38}, {"date": "Day 20", "value": 42},
            {"date": "Day 30", "value": 46}, {"date": "Day 40", "value": 49},
            {"date": "Day 50", "value": 51}, {"date": "Day 60", "value": 50}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 26}, {"date": "Day 30", "value": 34},
            {"date": "Day 45", "value": 42}, {"date": "Day 60", "value": 47},
            {"date": "Day 75", "value": 50}, {"date": "Day 90", "value": 50}
        ],
        "map_position_x": 45.3,
        "map_position_y": 48.7
    },
    {
        "id": 9,
        "rank": 9,
        "district": "Nagarkurnool",
        "risk_level": "Medium",
        "crop": "Groundnut",
        "issue_type": "Tikka Leaf Spot & Collar Rot",
        "affected_area_label": "6,100 ha",
        "affected_area_ha": 6100.0,
        "trend": "down",
        "trend_label": "-6% vs last week",
        "trend_percent": -6.0,
        "economic_impact_cr": 8.9,
        "farmers_impacted": 7400,
        "mandals_count": 3,
        "mandals_list": ["Dharmavaram", "Kadiri", "Penukonda"],
        "intervention_summary": "Tebuconazole fungicide distribution and moisture stress alleviation.",
        "interventions_list": [
            "Fungicidal spray demonstrations held in Kadiri cluster",
            "Farm pond water harvesting utilized for protective irrigation",
            "Weather-based agro-advisories updated via local radios"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 56}, {"date": "Day 10", "value": 54},
            {"date": "Day 15", "value": 52}, {"date": "Day 20", "value": 49},
            {"date": "Day 25", "value": 47}, {"date": "Day 30", "value": 45}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 40}, {"date": "Day 20", "value": 48},
            {"date": "Day 30", "value": 58}, {"date": "Day 40", "value": 55},
            {"date": "Day 50", "value": 49}, {"date": "Day 60", "value": 45}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 28}, {"date": "Day 30", "value": 37},
            {"date": "Day 45", "value": 50}, {"date": "Day 60", "value": 56},
            {"date": "Day 75", "value": 51}, {"date": "Day 90", "value": 45}
        ],
        "map_position_x": 39.7,
        "map_position_y": 74.2
    },
    {
        "id": 10,
        "rank": 10,
        "district": "Mahabubnagar",
        "risk_level": "Medium",
        "crop": "Maize",
        "issue_type": "Fall Armyworm (Spodoptera frugiperda)",
        "affected_area_label": "5,800 ha",
        "affected_area_ha": 5800.0,
        "trend": "up",
        "trend_label": "+5% vs last week",
        "trend_percent": 5.0,
        "economic_impact_cr": 7.6,
        "farmers_impacted": 6100,
        "mandals_count": 3,
        "mandals_list": ["Jadcherla", "Nagarkurnool", "Wanaparthy"],
        "intervention_summary": "Whorl application of sand-lime mixture and Emamectin benzoate distribution.",
        "interventions_list": [
            "Whorl placement technique demonstrated to prevent kernel damage",
            "Pheromone traps provided to secondary schools for community monitoring",
            "Early harvesting advisory for matured green cobs"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 33}, {"date": "Day 10", "value": 36},
            {"date": "Day 15", "value": 39}, {"date": "Day 20", "value": 42},
            {"date": "Day 25", "value": 45}, {"date": "Day 30", "value": 48}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 22}, {"date": "Day 20", "value": 27},
            {"date": "Day 30", "value": 32}, {"date": "Day 40", "value": 38},
            {"date": "Day 50", "value": 43}, {"date": "Day 60", "value": 48}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 15}, {"date": "Day 30", "value": 20},
            {"date": "Day 45", "value": 26}, {"date": "Day 60", "value": 34},
            {"date": "Day 75", "value": 41}, {"date": "Day 90", "value": 48}
        ],
        "map_position_x": 37.2,
        "map_position_y": 51.5
    },
    {
        "id": 11,
        "rank": 11,
        "district": "Wanaparthy",
        "risk_level": "Medium",
        "crop": "Rice",
        "issue_type": "Neck Blast & Grain Discoloration",
        "affected_area_label": "5,200 ha",
        "affected_area_ha": 5200.0,
        "trend": "down",
        "trend_label": "-3% vs last week",
        "trend_percent": -3.0,
        "economic_impact_cr": 9.1,
        "farmers_impacted": 5800,
        "mandals_count": 3,
        "mandals_list": ["Gudivada", "Machilipatnam", "Vuyyuru"],
        "intervention_summary": "Tricyclazole preventive spraying and moisture management.",
        "interventions_list": [
            "Prophylactic spraying of Tricyclazole 75% WP conducted",
            "Canal water rotation scheduled with irrigation department",
            "Field surveillance bulletins shared with Rythu Bharosa Kendras"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 49}, {"date": "Day 10", "value": 48},
            {"date": "Day 15", "value": 46}, {"date": "Day 20", "value": 44},
            {"date": "Day 25", "value": 43}, {"date": "Day 30", "value": 41}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 35}, {"date": "Day 20", "value": 44},
            {"date": "Day 30", "value": 52}, {"date": "Day 40", "value": 49},
            {"date": "Day 50", "value": 45}, {"date": "Day 60", "value": 41}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 22}, {"date": "Day 30", "value": 31},
            {"date": "Day 45", "value": 44}, {"date": "Day 60", "value": 51},
            {"date": "Day 75", "value": 47}, {"date": "Day 90", "value": 41}
        ],
        "map_position_x": 68.9,
        "map_position_y": 59.3
    },
    {
        "id": 12,
        "rank": 12,
        "district": "Adilabad",
        "risk_level": "Medium",
        "crop": "Cotton",
        "issue_type": "Fusarium Wilt & Nematode Complex",
        "affected_area_label": "4,700 ha",
        "affected_area_ha": 4700.0,
        "trend": "up",
        "trend_label": "+3% vs last week",
        "trend_percent": 3.0,
        "economic_impact_cr": 6.8,
        "farmers_impacted": 4900,
        "mandals_count": 3,
        "mandals_list": ["Boath", "Utnoor", "Ichoda"],
        "intervention_summary": "Soil solarization guidance and Paecilomyces lilacinus bio-nematicide supply.",
        "interventions_list": [
            "Biological nematicide distribution via tribal welfare cooperative",
            "Crop rotation advisory away from continuous cotton mono-cropping",
            "Mobile diagnostic clinic visit to remote tribal hamlets"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 30}, {"date": "Day 10", "value": 32},
            {"date": "Day 15", "value": 34}, {"date": "Day 20", "value": 36},
            {"date": "Day 25", "value": 37}, {"date": "Day 30", "value": 39}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 20}, {"date": "Day 20", "value": 24},
            {"date": "Day 30", "value": 29}, {"date": "Day 40", "value": 33},
            {"date": "Day 50", "value": 36}, {"date": "Day 60", "value": 39}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 12}, {"date": "Day 30", "value": 18},
            {"date": "Day 45", "value": 23}, {"date": "Day 60", "value": 30},
            {"date": "Day 75", "value": 35}, {"date": "Day 90", "value": 39}
        ],
        "map_position_x": 36.4,
        "map_position_y": 14.8
    },
    {
        "id": 13,
        "rank": 13,
        "district": "Vikarabad",
        "risk_level": "Medium",
        "crop": "Banana",
        "issue_type": "Sigatoka Leaf Spot (Mycosphaerella)",
        "affected_area_label": "4,100 ha",
        "affected_area_ha": 4100.0,
        "trend": "down",
        "trend_label": "-5% vs last week",
        "trend_percent": -5.0,
        "economic_impact_cr": 7.3,
        "farmers_impacted": 3800,
        "mandals_count": 3,
        "mandals_list": ["Chirala", "Ongole", "Vetapalem"],
        "intervention_summary": "De-leafing of diseased foliage and mineral oil spray application.",
        "interventions_list": [
            "Sanitation drives organized through banana growers association",
            "Propiconazole fungicide demonstration plots established",
            "Windbreak maintenance guidelines published"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 45}, {"date": "Day 10", "value": 43},
            {"date": "Day 15", "value": 41}, {"date": "Day 20", "value": 39},
            {"date": "Day 25", "value": 37}, {"date": "Day 30", "value": 35}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 31}, {"date": "Day 20", "value": 38},
            {"date": "Day 30", "value": 46}, {"date": "Day 40", "value": 42},
            {"date": "Day 50", "value": 38}, {"date": "Day 60", "value": 35}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 20}, {"date": "Day 30", "value": 27},
            {"date": "Day 45", "value": 38}, {"date": "Day 60", "value": 44},
            {"date": "Day 75", "value": 39}, {"date": "Day 90", "value": 35}
        ],
        "map_position_x": 58.1,
        "map_position_y": 66.8
    },
    {
        "id": 14,
        "rank": 14,
        "district": "Medak",
        "risk_level": "Low",
        "crop": "Maize",
        "issue_type": "Turcicum Leaf Blight",
        "affected_area_label": "3,400 ha",
        "affected_area_ha": 3400.0,
        "trend": "stable",
        "trend_label": "Stable (+0.5% vs last week)",
        "trend_percent": 0.5,
        "economic_impact_cr": 4.2,
        "farmers_impacted": 3400,
        "mandals_count": 2,
        "mandals_list": ["Siddipet", "Gajwel"],
        "intervention_summary": "Routine scouting and advisory on resistant hybrid seed selection.",
        "interventions_list": [
            "Mancozeb spray advisories shared at Rythu Vedikas",
            "Leaf blight severity tracking via district mobile app"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 25}, {"date": "Day 10", "value": 25},
            {"date": "Day 15", "value": 26}, {"date": "Day 20", "value": 26},
            {"date": "Day 25", "value": 27}, {"date": "Day 30", "value": 26}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 21}, {"date": "Day 20", "value": 23},
            {"date": "Day 30", "value": 25}, {"date": "Day 40", "value": 26},
            {"date": "Day 50", "value": 27}, {"date": "Day 60", "value": 26}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 15}, {"date": "Day 30", "value": 18},
            {"date": "Day 45", "value": 22}, {"date": "Day 60", "value": 24},
            {"date": "Day 75", "value": 26}, {"date": "Day 90", "value": 26}
        ],
        "map_position_x": 38.6,
        "map_position_y": 34.1
    },
    {
        "id": 15,
        "rank": 15,
        "district": "Suryapet",
        "risk_level": "Low",
        "crop": "Mango",
        "issue_type": "Anthracnose & Fruit Fly (Bactrocera dorsalis)",
        "affected_area_label": "2,900 ha",
        "affected_area_ha": 2900.0,
        "trend": "down",
        "trend_label": "-7% vs last week",
        "trend_percent": -7.0,
        "economic_impact_cr": 5.1,
        "farmers_impacted": 2700,
        "mandals_count": 2,
        "mandals_list": ["Bangarupalem", "Palamaner"],
        "intervention_summary": "Methyl eugenol bottle trap deployment and post-harvest orchard hygiene.",
        "interventions_list": [
            "5,000 methyl eugenol fruit fly traps supplied",
            "Pruning and orchard floor sanitation demonstrations"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 31}, {"date": "Day 10", "value": 29},
            {"date": "Day 15", "value": 27}, {"date": "Day 20", "value": 25},
            {"date": "Day 25", "value": 24}, {"date": "Day 30", "value": 22}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 26}, {"date": "Day 20", "value": 32},
            {"date": "Day 30", "value": 34}, {"date": "Day 40", "value": 30},
            {"date": "Day 50", "value": 26}, {"date": "Day 60", "value": 22}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 18}, {"date": "Day 30", "value": 24},
            {"date": "Day 45", "value": 30}, {"date": "Day 60", "value": 33},
            {"date": "Day 75", "value": 27}, {"date": "Day 90", "value": 22}
        ],
        "map_position_x": 49.3,
        "map_position_y": 82.5
    },
    {
        "id": 16,
        "rank": 16,
        "district": "Rangareddy",
        "risk_level": "Low",
        "crop": "Rice",
        "issue_type": "Minor Leaf Folder Occurrence",
        "affected_area_label": "2,200 ha",
        "affected_area_ha": 2200.0,
        "trend": "stable",
        "trend_label": "Stable (0% vs last week)",
        "trend_percent": 0.0,
        "economic_impact_cr": 3.0,
        "farmers_impacted": 2100,
        "mandals_count": 2,
        "mandals_list": ["Chevella", "Ibrahimpatnam"],
        "intervention_summary": "Scouting and bio-rational neem formulation recommendations.",
        "interventions_list": [
            "Weekly pest surveillance by village agriculture assistants",
            "Neem-based botanical pesticide spray advisory"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 19}, {"date": "Day 10", "value": 20},
            {"date": "Day 15", "value": 20}, {"date": "Day 20", "value": 19},
            {"date": "Day 25", "value": 20}, {"date": "Day 30", "value": 19}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 16}, {"date": "Day 20", "value": 18},
            {"date": "Day 30", "value": 19}, {"date": "Day 40", "value": 20},
            {"date": "Day 50", "value": 20}, {"date": "Day 60", "value": 19}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 12}, {"date": "Day 30", "value": 15},
            {"date": "Day 45", "value": 18}, {"date": "Day 60", "value": 20},
            {"date": "Day 75", "value": 20}, {"date": "Day 90", "value": 19}
        ],
        "map_position_x": 39.2,
        "map_position_y": 42.6
    },
    {
        "id": 17,
        "rank": 17,
        "district": "Siddipet",
        "risk_level": "Low",
        "crop": "Banana",
        "issue_type": "Banana Aphid (Pentalonia nigronervosa)",
        "affected_area_label": "1,800 ha",
        "affected_area_ha": 1800.0,
        "trend": "down",
        "trend_label": "-8% vs last week",
        "trend_percent": -8.0,
        "economic_impact_cr": 2.5,
        "farmers_impacted": 1750,
        "mandals_count": 2,
        "mandals_list": ["Rajahmundry Rural", "Kadiam"],
        "intervention_summary": "Bunchy top virus surveillance and disease-free sucker selection protocol.",
        "interventions_list": [
            "Tissue culture certification protocol enforced in nursery hub Kadiam",
            "Direct entomological inspections of nursery planting material"
        ],
        "historical_trend_30d": [
            {"date": "Day 5", "value": 24}, {"date": "Day 10", "value": 22},
            {"date": "Day 15", "value": 20}, {"date": "Day 20", "value": 19},
            {"date": "Day 25", "value": 17}, {"date": "Day 30", "value": 16}
        ],
        "historical_trend_60d": [
            {"date": "Day 10", "value": 19}, {"date": "Day 20", "value": 23},
            {"date": "Day 30", "value": 25}, {"date": "Day 40", "value": 22},
            {"date": "Day 50", "value": 18}, {"date": "Day 60", "value": 16}
        ],
        "historical_trend_90d": [
            {"date": "Day 15", "value": 14}, {"date": "Day 30", "value": 19},
            {"date": "Day 45", "value": 24}, {"date": "Day 60", "value": 24},
            {"date": "Day 75", "value": 20}, {"date": "Day 90", "value": 16}
        ],
        "map_position_x": 76.5,
        "map_position_y": 42.9
    }
]

# 17 Map Markers corresponding to Hotspots
MAP_MARKERS_SEED_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "x": 42.5,
        "y": 38.2,
        "size": 22.0,
        "risk_level": "High",
        "category": "Pest Outbreak",
        "district": "Warangal",
        "crop": "Rice",
        "affected_area_label": "14,800 ha",
        "intervention": "Aerial drone spraying & Pymetrozine distribution"
    },
    {
        "id": 2,
        "x": 31.8,
        "y": 26.4,
        "size": 20.0,
        "risk_level": "High",
        "category": "Bacterial Disease",
        "district": "Nizamabad",
        "crop": "Rice",
        "affected_area_label": "12,300 ha",
        "intervention": "Copper hydroxide demonstration & field drainage"
    },
    {
        "id": 3,
        "x": 48.2,
        "y": 62.1,
        "size": 20.0,
        "risk_level": "High",
        "category": "Pest Outbreak",
        "district": "Jagtial",
        "crop": "Cotton",
        "affected_area_label": "11,500 ha",
        "intervention": "Pheromone trap mass installation & PBW surveillance"
    },
    {
        "id": 4,
        "x": 65.4,
        "y": 55.7,
        "size": 19.0,
        "risk_level": "High",
        "category": "Pest Outbreak",
        "district": "Mancherial",
        "crop": "Chilli",
        "affected_area_label": "10,200 ha",
        "intervention": "Blue sticky trap deployment & bio-agents"
    },
    {
        "id": 5,
        "x": 46.1,
        "y": 28.9,
        "size": 18.0,
        "risk_level": "High",
        "category": "Pest Outbreak",
        "district": "Karimnagar",
        "crop": "Cotton",
        "affected_area_label": "8,900 ha",
        "intervention": "Neem oil emulsion & predator conservation"
    },
    {
        "id": 6,
        "x": 72.8,
        "y": 48.3,
        "size": 18.0,
        "risk_level": "High",
        "category": "Fungal Disease",
        "district": "Bhadradri Kothagudem",
        "crop": "Rice",
        "affected_area_label": "8,400 ha",
        "intervention": "Trichogramma egg cards & light traps"
    },
    {
        "id": 7,
        "x": 56.4,
        "y": 42.1,
        "size": 16.0,
        "risk_level": "Medium",
        "category": "Viral Disease",
        "district": "Khammam",
        "crop": "Chilli",
        "affected_area_label": "7,100 ha",
        "intervention": "Whitefly vector suppression campaign"
    },
    {
        "id": 8,
        "x": 45.3,
        "y": 48.7,
        "size": 16.0,
        "risk_level": "Medium",
        "category": "Fungal Disease",
        "district": "Nalgonda",
        "crop": "Cotton",
        "affected_area_label": "6,500 ha",
        "intervention": "Trichoderma bio-fertilizer seed treatment"
    },
    {
        "id": 9,
        "x": 39.7,
        "y": 74.2,
        "size": 15.0,
        "risk_level": "Medium",
        "category": "Fungal Disease",
        "district": "Nagarkurnool",
        "crop": "Groundnut",
        "affected_area_label": "6,100 ha",
        "intervention": "Tebuconazole fungicide spray demos"
    },
    {
        "id": 10,
        "x": 37.2,
        "y": 51.5,
        "size": 15.0,
        "risk_level": "Medium",
        "category": "Pest Outbreak",
        "district": "Mahabubnagar",
        "crop": "Maize",
        "affected_area_label": "5,800 ha",
        "intervention": "Whorl application & pheromone monitoring"
    },
    {
        "id": 11,
        "x": 68.9,
        "y": 59.3,
        "size": 15.0,
        "risk_level": "Medium",
        "category": "Fungal Disease",
        "district": "Wanaparthy",
        "crop": "Rice",
        "affected_area_label": "5,200 ha",
        "intervention": "Tricyclazole preventive spraying & canal rotation"
    },
    {
        "id": 12,
        "x": 36.4,
        "y": 14.8,
        "size": 14.0,
        "risk_level": "Medium",
        "category": "Soilborne Complex",
        "district": "Adilabad",
        "crop": "Cotton",
        "affected_area_label": "4,700 ha",
        "intervention": "Bio-nematicide & crop rotation advisory"
    },
    {
        "id": 13,
        "x": 58.1,
        "y": 66.8,
        "size": 14.0,
        "risk_level": "Medium",
        "category": "Fungal Disease",
        "district": "Vikarabad",
        "crop": "Banana",
        "affected_area_label": "4,100 ha",
        "intervention": "Sanitation drives & Propiconazole demos"
    },
    {
        "id": 14,
        "x": 38.6,
        "y": 34.1,
        "size": 12.0,
        "risk_level": "Low",
        "category": "Fungal Disease",
        "district": "Medak",
        "crop": "Maize",
        "affected_area_label": "3,400 ha",
        "intervention": "Resistant hybrid seed selection advisories"
    },
    {
        "id": 15,
        "x": 49.3,
        "y": 82.5,
        "size": 12.0,
        "risk_level": "Low",
        "category": "Pest Outbreak",
        "district": "Suryapet",
        "crop": "Mango",
        "affected_area_label": "2,900 ha",
        "intervention": "Methyl eugenol bottle trap deployment"
    },
    {
        "id": 16,
        "x": 39.2,
        "y": 42.6,
        "size": 11.0,
        "risk_level": "Low",
        "category": "Pest Outbreak",
        "district": "Rangareddy",
        "crop": "Rice",
        "affected_area_label": "2,200 ha",
        "intervention": "Botanical neem-based spray advisory"
    },
    {
        "id": 17,
        "x": 76.5,
        "y": 42.9,
        "size": 11.0,
        "risk_level": "Low",
        "category": "Pest Outbreak",
        "district": "Siddipet",
        "crop": "Banana",
        "affected_area_label": "1,800 ha",
        "intervention": "Tissue culture certification in nurseries"
    }
]

# 11 District Zones
DISTRICT_ZONES_SEED_DATA: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "North Telangana Plateau",
        "x": 28.0,
        "y": 10.0,
        "width": 30.0,
        "height": 22.0,
        "bg_class": "bg-red-500/10"
    },
    {
        "id": 2,
        "name": "Central Godavari Basin",
        "x": 38.0,
        "y": 28.0,
        "width": 24.0,
        "height": 20.0,
        "bg_class": "bg-red-500/15"
    },
    {
        "id": 3,
        "name": "Eastern Delta Region",
        "x": 64.0,
        "y": 38.0,
        "width": 25.0,
        "height": 26.0,
        "bg_class": "bg-amber-500/15"
    },
    {
        "id": 4,
        "name": "Southern Rayalaseema Belt",
        "x": 34.0,
        "y": 58.0,
        "width": 32.0,
        "height": 24.0,
        "bg_class": "bg-red-500/15"
    },
    {
        "id": 5,
        "name": "Krishna-Godavari Fertile Plain",
        "x": 60.0,
        "y": 48.0,
        "width": 22.0,
        "height": 20.0,
        "bg_class": "bg-amber-500/10"
    },
    {
        "id": 6,
        "name": "Guntur Chilli & Commercial Zone",
        "x": 58.0,
        "y": 52.0,
        "width": 18.0,
        "height": 18.0,
        "bg_class": "bg-red-500/15"
    },
    {
        "id": 7,
        "name": "Nalgonda Rainfed Agrarian Corridor",
        "x": 42.0,
        "y": 44.0,
        "width": 16.0,
        "height": 16.0,
        "bg_class": "bg-amber-500/10"
    },
    {
        "id": 8,
        "name": "Kurnool Tungabhadra Basin",
        "x": 44.0,
        "y": 58.0,
        "width": 20.0,
        "height": 18.0,
        "bg_class": "bg-red-500/15"
    },
    {
        "id": 9,
        "name": "Anantapur Arid Zone",
        "x": 32.0,
        "y": 68.0,
        "width": 20.0,
        "height": 22.0,
        "bg_class": "bg-amber-500/10"
    },
    {
        "id": 10,
        "name": "Adilabad Highland Forest Zone",
        "x": 30.0,
        "y": 8.0,
        "width": 18.0,
        "height": 16.0,
        "bg_class": "bg-amber-500/10"
    },
    {
        "id": 11,
        "name": "Chittoor Horticulture Foothills",
        "x": 44.0,
        "y": 78.0,
        "width": 20.0,
        "height": 18.0,
        "bg_class": "bg-emerald-500/10"
    }
]

# Static Reference Filters
STATIC_FILTERS = {
    "legendCategories": [
        {"id": "pest", "label": "Pest Outbreak", "color": "#EF4444"},
        {"id": "disease", "label": "Crop Disease & Blight", "color": "#F59E0B"},
        {"id": "drought", "label": "Moisture Deficit", "color": "#8B5CF6"},
        {"id": "weather", "label": "Climate Risk", "color": "#3B82F6"}
    ],
    "cropFilterOptions": [
        "All Crops",
        "Rice",
        "Cotton",
        "Chilli",
        "Maize",
        "Groundnut",
        "Mango",
        "Banana"
    ],
    "riskFilterOptions": [
        "All Risks",
        "High",
        "Medium",
        "Low"
    ],
    "timeFilterOptions": [
        {"id": "30d", "label": "Last 30 Days"},
        {"id": "60d", "label": "Last 60 Days"},
        {"id": "90d", "label": "Last 90 Days"},
        {"id": "this_season", "label": "This Season (90d)"}
    ]
}


def seed_risk_map_data(db: Session) -> None:
    """
    Idempotent seeder:
    Inserts 17 hotspots, 17 map markers, and 11 district zones if not already present.
    """
    existing = db.query(Hotspot).first()
    if existing:
        logger.info("Risk map hotspots already seeded (%d hotspots found). Skipping seed.", db.query(Hotspot).count())
        return

    logger.info("Seeding Feature 15b Risk Map data: 17 hotspots, 17 markers, 11 district zones...")

    # Seed Hotspots
    for item in HOTSPOTS_SEED_DATA:
        hotspot = Hotspot(**item)
        db.add(hotspot)

    # Seed Map Markers
    for marker in MAP_MARKERS_SEED_DATA:
        m = MapMarker(**marker)
        db.add(m)

    # Seed District Zones
    for zone in DISTRICT_ZONES_SEED_DATA:
        z = DistrictZone(**zone)
        db.add(z)

    db.commit()
    logger.info("Feature 15b Risk Map seeding completed successfully.")
