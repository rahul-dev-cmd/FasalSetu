"""
FasalSetu Government Interventions Seeder (Feature 15d)
======================================================
Seeds historical and active agricultural crisis containment operations
and field team deployments matching the Command Center Kanban board.

Covers all 3 status buckets:
- Pending: 3 items (emergency requisitions, pending team allocation)
- In Progress: 4 items (active drone sprays, canal clearance, biocontrol grids)
- Completed: 4 items (resolved emergency water aid, pest biopesticide distributions, intercropping)

Idempotent: Skips insertion if interventions are already present.
"""

from __future__ import annotations
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.intervention import Intervention

logger = logging.getLogger("fasalsetu_seed")

SEEDED_INTERVENTIONS: List[Dict[str, Any]] = [
    # ── PENDING ──
    {
        "intervention_uid": "int-1",
        "district": "Nalgonda",
        "crop": "Rice",
        "issue_type": "Disease",
        "risk_level": "High",
        "title": "Deploy Fungicide Spray Teams",
        "description": "Deploy 16 Rapid Response fungicide squads with Tricyclazole kits across 14 paddy mandals.",
        "status": "Pending",
        "team": None,
        "team_lead": None,
        "team_contact": None,
        "team_avatar": None,
        "progress_percent": 0,
        "due_date": "In 2 days (14 Sept)",
        "started_date": None,
        "completed_date": None,
        "resolved_by": None,
        "mandal": "Miryalaguda, Devarakonda",
        "affected_hectares": 12400.0,
        "farmers_count": 8400,
        "activity_log": [
            {"time": "12 Sept, 10:30 AM", "text": "Automated outbreak alert triggered from Sentinel-2 radar pass.", "author": "AI Surveillance Core"},
            {"time": "12 Sept, 11:15 AM", "text": "District Agricultural Officer initiated emergency spray requisition.", "author": "DAO Nalgonda"}
        ],
    },
    {
        "intervention_uid": "int-2",
        "district": "Suryapet",
        "crop": "Rice",
        "issue_type": "Disease",
        "risk_level": "High",
        "title": "Drone Bactericide Spraying",
        "description": "Emergency agricultural drone dispersion for bacterial leaf streak containment.",
        "status": "Pending",
        "team": None,
        "team_lead": None,
        "team_contact": None,
        "team_avatar": None,
        "progress_percent": 0,
        "due_date": "Tomorrow (13 Sept)",
        "started_date": None,
        "completed_date": None,
        "resolved_by": None,
        "mandal": "Kodad, Mothey",
        "affected_hectares": 1750.0,
        "farmers_count": 1300,
        "activity_log": [
            {"time": "11 Sept, 04:00 PM", "text": "Cluster disease density surpassed 18% weekly threshold.", "author": "AI Risk Engine"},
            {"time": "12 Sept, 08:30 AM", "text": "Requisition sent for 4 custom AG-Drones.", "author": "KVK Suryapet"}
        ],
    },
    {
        "intervention_uid": "int-3",
        "district": "Adilabad",
        "crop": "Soybean",
        "issue_type": "Water Stress",
        "risk_level": "Low",
        "title": "Solar Micro-Sprinkler Dispatch",
        "description": "Deploy 15 mobile solar sprinkler sets and root fungal inoculants in tribal cluster farms.",
        "status": "Pending",
        "team": "Field Team 5",
        "team_lead": "B. Naresh",
        "team_contact": "+91 94401 88321",
        "team_avatar": "FT5",
        "progress_percent": 10,
        "due_date": "In 4 days (16 Sept)",
        "started_date": None,
        "completed_date": None,
        "resolved_by": None,
        "mandal": "Boath, Utnoor",
        "affected_hectares": 1800.0,
        "farmers_count": 1400,
        "activity_log": [
            {"time": "10 Sept, 02:15 PM", "text": "Telemetry confirmed 14-day dry run in red gravel soils.", "author": "Hydro Sensor Network"},
            {"time": "11 Sept, 09:00 AM", "text": "Sprinkler batch allocated at regional cooperative depot.", "author": "Agronomy Desk"}
        ],
    },

    # ── IN PROGRESS ──
    {
        "intervention_uid": "int-4",
        "district": "Warangal",
        "crop": "Cotton",
        "issue_type": "Pest",
        "risk_level": "High",
        "title": "Pink Bollworm Biocontrol Traps",
        "description": "Aero-release 250k Trichogramma parasitoids and install 4,500 gossyplure traps in 45 villages.",
        "status": "In Progress",
        "team": "Field Team 2",
        "team_lead": "Dr. K. Srinivas",
        "team_contact": "+91 98492 11452",
        "team_avatar": "FT2",
        "progress_percent": 65,
        "due_date": "In 3 days (15 Sept)",
        "started_date": "Started 2 days ago",
        "completed_date": None,
        "resolved_by": None,
        "mandal": "Narsampet, Wardhannapet",
        "affected_hectares": 9800.0,
        "farmers_count": 6900,
        "activity_log": [
            {"time": "10 Sept, 08:00 AM", "text": "Field Team 2 deployed to Wardhannapet central depot.", "author": "Command Desk"},
            {"time": "11 Sept, 01:30 PM", "text": "3,000 pheromone traps installed in first 30 villages.", "author": "Dr. K. Srinivas"},
            {"time": "12 Sept, 09:45 AM", "text": "Drone release of Trichogramma egg parasitoids 60% complete.", "author": "Field Team 2"}
        ],
    },
    {
        "intervention_uid": "int-5",
        "district": "Mahabubnagar",
        "crop": "Groundnut",
        "issue_type": "Waterlogging",
        "risk_level": "Medium",
        "title": "Canal Clearance & Dewatering",
        "description": "Commission 12 heavy excavators to clear blocked canal drainage outlets in pod-development fields.",
        "status": "In Progress",
        "team": "Field Team 3",
        "team_lead": "Er. Ramesh V.",
        "team_contact": "+91 97015 62890",
        "team_avatar": "FT3",
        "progress_percent": 40,
        "due_date": "In 2 days (14 Sept)",
        "started_date": "Started 1 day ago",
        "completed_date": None,
        "resolved_by": None,
        "mandal": "Jadcherla, Bhoothpur",
        "affected_hectares": 5600.0,
        "farmers_count": 4300,
        "activity_log": [
            {"time": "11 Sept, 07:30 AM", "text": "Dewatering diesel pump sets dispatched from Jadcherla yard.", "author": "Irrigation Liaison"},
            {"time": "11 Sept, 05:00 PM", "text": "18 km of primary drainage channels dredged and cleared.", "author": "Er. Ramesh V."}
        ],
    },
    {
        "intervention_uid": "int-6",
        "district": "Nizamabad",
        "crop": "Rice",
        "issue_type": "Waterlogging",
        "risk_level": "Medium",
        "title": "Ali Sagar Sluice Gate Drainage",
        "description": "Regulate canal sluice discharge and reinforce 42 km of tributary earthen flood embankments.",
        "status": "In Progress",
        "team": "Field Team 1",
        "team_lead": "M. Anitha",
        "team_contact": "+91 94412 34509",
        "team_avatar": "FT1",
        "progress_percent": 80,
        "due_date": "Today (12 Sept)",
        "started_date": "Started 3 days ago",
        "completed_date": None,
        "resolved_by": None,
        "mandal": "Armoor, Bodhan",
        "affected_hectares": 2900.0,
        "farmers_count": 2200,
        "activity_log": [
            {"time": "09 Sept, 11:00 AM", "text": "Canal sluice gates opened by 35% for discharge.", "author": "M. Anitha"},
            {"time": "10 Sept, 04:00 PM", "text": "Tail-end inundation dropped from 45cm to 12cm.", "author": "Field Inspector"},
            {"time": "12 Sept, 08:00 AM", "text": "Sandbag reinforcement complete along 38 km of bunds.", "author": "Field Team 1"}
        ],
    },
    {
        "intervention_uid": "int-7",
        "district": "Rangareddy",
        "crop": "Vegetables",
        "issue_type": "Pest",
        "risk_level": "Medium",
        "title": "Polyhouse Sticky Trap Grid",
        "description": "Deploy 8,000 yellow and blue sticky traps with predatory ladybird beetles for whitefly control.",
        "status": "In Progress",
        "team": "Field Team 6",
        "team_lead": "S. Venkat",
        "team_contact": "+91 98480 77123",
        "team_avatar": "FT6",
        "progress_percent": 25,
        "due_date": "In 5 days (17 Sept)",
        "started_date": "Started yesterday",
        "completed_date": None,
        "resolved_by": None,
        "mandal": "Chevella, Ibrahimpatnam",
        "affected_hectares": 1600.0,
        "farmers_count": 1200,
        "activity_log": [
            {"time": "11 Sept, 10:00 AM", "text": "Trap distribution inaugurated at Chevella Rythu Vedika.", "author": "Horticulture Dept"},
            {"time": "11 Sept, 03:30 PM", "text": "Initial 2,000 traps set up across 42 polyhouse units.", "author": "S. Venkat"}
        ],
    },

    # ── COMPLETED ──
    {
        "intervention_uid": "int-8",
        "district": "Khammam",
        "crop": "Chilli",
        "issue_type": "Water Stress",
        "risk_level": "Medium",
        "title": "Emergency Tanker Water & Drip Aid",
        "description": "Mobilize 35 water tankers to recharge farm sumps and fast-track 80% drip subsidy rollout.",
        "status": "Completed",
        "team": "Field Team 4",
        "team_lead": "P. Rajesh",
        "team_contact": "+91 99890 44512",
        "team_avatar": "FT4",
        "progress_percent": 100,
        "due_date": "Resolved",
        "started_date": "05 Sept 2026",
        "completed_date": "10 Sept 2026",
        "resolved_by": "Field Team 4",
        "mandal": "Sathupalli, Madhira",
        "affected_hectares": 7200.0,
        "farmers_count": 5100,
        "activity_log": [
            {"time": "05 Sept, 09:00 AM", "text": "Dispatched 35 mobile tankers across 12 critical mandals.", "author": "P. Rajesh"},
            {"time": "08 Sept, 02:00 PM", "text": "All 85 farm ponds filled to required reserve levels.", "author": "Field Team 4"},
            {"time": "10 Sept, 04:30 PM", "text": "Canopy wilting halted. Final audit inspection verified.", "author": "DAO Khammam"}
        ],
    },
    {
        "intervention_uid": "int-9",
        "district": "Karimnagar",
        "crop": "Maize",
        "issue_type": "Pest",
        "risk_level": "Low",
        "title": "Neem Biopesticide Distribution",
        "description": "Distribute cold-pressed Azadirachtin biological spray bottles and bird perches for FAW larvae control.",
        "status": "Completed",
        "team": "Field Team 1",
        "team_lead": "M. Anitha",
        "team_contact": "+91 94412 34509",
        "team_avatar": "FT1",
        "progress_percent": 100,
        "due_date": "Resolved",
        "started_date": "02 Sept 2026",
        "completed_date": "7 Sept 2026",
        "resolved_by": "Field Team 1",
        "mandal": "Huzurabad, Jammikunta",
        "affected_hectares": 3100.0,
        "farmers_count": 2700,
        "activity_log": [
            {"time": "02 Sept, 10:00 AM", "text": "Neem spray bottles delivered to 18 village PACS points.", "author": "M. Anitha"},
            {"time": "07 Sept, 05:00 PM", "text": "Larval incidence declined by 82%. Case closed.", "author": "Field Team 1"}
        ],
    },
    {
        "intervention_uid": "int-10",
        "district": "Medak",
        "crop": "Rice",
        "issue_type": "Crop Concentration",
        "risk_level": "Low",
        "title": "Pulse Intercropping Campaign",
        "description": "Distribute red gram & green gram seeds with soil test cards across 28 gram panchayats.",
        "status": "Completed",
        "team": "Field Team 4",
        "team_lead": "P. Rajesh",
        "team_contact": "+91 99890 44512",
        "team_avatar": "FT4",
        "progress_percent": 100,
        "due_date": "Resolved",
        "started_date": "28 Aug 2026",
        "completed_date": "4 Sept 2026",
        "resolved_by": "Field Team 4",
        "mandal": "Narsapur, Toopran",
        "affected_hectares": 2400.0,
        "farmers_count": 1850,
        "activity_log": [
            {"time": "28 Aug, 09:30 AM", "text": "Soil test health cards issued to 1,850 farmers.", "author": "P. Rajesh"},
            {"time": "04 Sept, 03:00 PM", "text": "Intercropping successfully seeded in 2,400 hectares.", "author": "DAO Medak"}
        ],
    },
    {
        "intervention_uid": "int-11",
        "district": "Jagtial",
        "crop": "Turmeric",
        "issue_type": "Disease",
        "risk_level": "Medium",
        "title": "Trichoderma Viride Root Drenching",
        "description": "Rhizome rot treatment with bio-fungicide drenching solution and raised furrow drainage reshaping.",
        "status": "Completed",
        "team": "Field Team 2",
        "team_lead": "Dr. K. Srinivas",
        "team_contact": "+91 98492 11452",
        "team_avatar": "FT2",
        "progress_percent": 100,
        "due_date": "Resolved",
        "started_date": "25 Aug 2026",
        "completed_date": "1 Sept 2026",
        "resolved_by": "Field Team 2",
        "mandal": "Korutla, Metpally",
        "affected_hectares": 4100.0,
        "farmers_count": 3200,
        "activity_log": [
            {"time": "25 Aug, 11:30 AM", "text": "Rhizome rot confirmed in 14 villages.", "author": "KVK Jagtial"},
            {"time": "27 Aug, 03:00 PM", "text": "Bio-fungicide formulation supplied to 3,200 growers.", "author": "Dr. K. Srinivas"},
            {"time": "01 Sept, 04:00 PM", "text": "Root vigor restored across 4,100 ha.", "author": "Field Team 2"}
        ],
    },
]


def seed_interventions(db: Session) -> int:
    """
    Seeds initial command center interventions if not already present.
    Returns the count of seeded interventions.
    """
    existing_count = db.query(Intervention).count()
    if existing_count >= len(SEEDED_INTERVENTIONS):
        logger.info(f"Interventions already seeded ({existing_count} records present). Skipping.")
        return 0

    seeded_count = 0
    for data in SEEDED_INTERVENTIONS:
        existing = db.query(Intervention).filter(Intervention.intervention_uid == data["intervention_uid"]).first()
        if not existing:
            obj = Intervention(**data)
            db.add(obj)
            seeded_count += 1

    db.commit()
    logger.info(f"Successfully seeded {seeded_count} interventions.")
    return seeded_count
