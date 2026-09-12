# FasalSetu — Frontend Product Requirements Document (PRD)
### AI-Powered Agricultural Decision Support & Marketplace Platform
**Platform:** FasalSetu Web Application  
**Tech Stack:** React 18, Vite, TypeScript, TailwindCSS, Lucide Icons, React Router v7  
**Version:** 2.0.0 | **Status:** In Active Production & Live Integration  

---

## 1. Executive Summary & Product Vision

### 1.1 The Agricultural Reality in India
Smallholder Indian farmers navigate high-volatility agronomic, climatic, and market conditions with limited real-time advisory or bargaining power:
- **Agronomic Knowledge Gap:** Pests, fungal diseases, and soil deficiencies are often diagnosed late or mismanaged through broad-spectrum chemical over-application.
- **Intermediary Rent-Seeking:** Without localized mandi intelligence or direct buyer access, farmers accept below-market farmgate prices from local middlemen.
- **State Surveillance Latency:** Agricultural officers track regional outbreaks and waterlogging through delayed bureaucratic channels rather than proactive real-time hotspots.

### 1.2 The FasalSetu Solution
**FasalSetu** bridges the gap between Indian farmers, wholesale crop buyers, and state agricultural command centers through an integrated, multi-role decision and commerce platform:
1. **Multilingual Regional AI Advisory:** Voice-first and text Q&A powered by Groq Llama 3.1, coupled with visual leaf disease diagnosis powered by vision inference (`qwen/qwen3.6-27b`).
2. **Deterministic Agronomic Engines:** Physics- and meteorology-grounded water irrigation advisory (combining Open-Meteo rainfall telemetry and soil retention coefficients) and ICAR-benchmarked yield projections.
3. **Transparent Direct Marketplace:** Real JWT-authenticated negotiations where farmers post crop lots, buyers counter-offer, an AI negotiation coach provides mandi-grounded tactics, and deals transition into a 5-stage verified lifecycle.
4. **State Agricultural Command Center:** Real-time risk maps with 17 tracked hotspots, downloadable executive reports (PDF, Excel, CSV), and a dynamic Kanban-based field intervention management system.

---

## 2. User Roles & Core Workflows

### 2.1 Role 1: Indian Farmer (`farmer`)
- **Profile:** Ramesh Ji, 4.5-acre paddy and cotton farmer in Telangana.
- **Language Preference:** Telugu, Hindi, or regional English. Prefers voice input and high-contrast mobile touch targets.
- **Key Workflows:**
  - **Voice & Text Q&A:** Speaks question in regional language -> receives immediate voice-ready response with safety disclaimers.
  - **Crop Health Diagnosis:** Takes a photograph of diseased leaf -> receives condition identification, confidence tier, and step-by-step organic/chemical treatment plan.
  - **Water Irrigation & Yield:** Enters sowing date -> views remaining days to harvest, projected quintals, and soil moisture status.
  - **Marketplace Lot Creation:** Creates crop lot with photos, quantity, and asking price -> reviews offers from verified buyers.
  - **Deal Negotiation & Lifecycle:** Reviews buyer counter-offers, uses AI advisor for price negotiation, accepts offers, and tracks pickup -> payment -> delivery.

### 2.2 Role 2: Agricultural Wholesale Buyer (`buyer`)
- **Profile:** Amit Sharma, procurement manager at Telangana Agro Mills.
- **Key Workflows:**
  - **Marketplace Browse:** Discovers active farmer listings filtered by crop, quantity, and region.
  - **Offer Threading:** Submits bids, negotiates price per quintal in transparent threads.
  - **Buyer Company Profile:** Manages procurement credibility, operational tags (`Verified Buyer`, `Fast Payer`, `Bulk Purchaser`), and delivery preferences.
  - **Deal Tracking:** Tracks accepted transactions through pickup and payment completion.

### 2.3 Role 3: Government Agricultural Officer (`government`)
- **Profile:** Officer T. Rao, District Agricultural Officer (DAO).
- **Key Workflows:**
  - **Command Center Risk Map:** Monitors 17 district hotspots categorized by Pest, Disease, Water Stress, Waterlogging, and Crop Concentration.
  - **Interventions Kanban Board:** Manages rapid response teams (`Field Team 1–6`), updates status from `Pending` -> `In Progress` -> `Completed`, logs field actions, and tracks affected acreage.
  - **Surveillance Reports:** Generates official reports (Risk Summary, Crop Health, Yield Forecast, Intervention Log) in PDF, Excel, and CSV with digital stamps.

---

## 3. Screen Architecture & Navigation Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                              / (Landing)                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                  /auth (Login)         /auth (Signup)
                         │                     │
                         └──────────┬──────────┘
                                    │ Role Router
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
  [ FARMER HUB ]              [ BUYER HUB ]             [ COMMAND CENTER ]
  /farmer/dashboard           /buyer/dashboard          /command-center
  ├─ Onboarding               ├─ Browse Lots            ├─ Hotspot Map
  ├─ Crop Health Check        ├─ My Offers              ├─ Interventions Board
  ├─ Q&A Advisor              ├─ Price Insights         ├─ Surveillance Reports
  ├─ Water Irrigation         ├─ Company Profile        └─ System Settings
  ├─ Yield Estimates          └─ Transaction Tracker
  ├─ Create Crop Lot
  ├─ Negotiation Thread
  └─ Transaction Lifecycle
```

---

## 4. Design System & Aesthetic Principles

- **Primary Colors:** Forest Green (`#166534`), Agricultural Emerald (`#10B981`), Harvest Amber (`#F59E0B`), Alert Red (`#EF4444`).
- **Typography:** Modern, clean sans-serif typography with generous line-heights and high-legibility numerals for prices and weights.
- **Glassmorphism & Elevation:** Subtle backdrop blurs (`backdrop-blur-md`), layered cards with soft borders (`border-slate-200/80`), and distinct interactive states.
- **Accessibility & Mobile Touch Targets:** Minimum 48px touch targets, clear bilingual labels, voice indicators, and optimistic UI transitions.

---

## 5. Frontend API Integration Layer (`frontend/src/services/api.ts`)

The frontend interacts with the FastAPI backend through a unified service module with automatic token injection from `localStorage`:
- `authApi`: Signup, Login, and `/me` session validation.
- `advisoryApi`: Crop Recommendation, Mandi Prices, Text/Voice Q&A, Leaf Diagnosis, and Feedback.
- `farmProfileApi`: Farm operations profile and valid crops lookup.
- `buyerProfileApi`: Buyer business profile and public reputation views.
- `marketplaceApi`: Crop listings, offer threads, AI negotiation chat, and transaction stage advancement.
- `governmentApi`: Hotspot risk maps, filters, and report generation/downloads.
- `governmentInterventionsApi`: Interventions listing, stats, Kanban status drag-and-drop, and field action logging.
