# EcoLoop - Carbon Footprint Awareness Platform

EcoLoop is a production-ready, client-side gamified **Carbon Footprint Awareness Platform** built for the 2026 Climate Hackathon Challenge. It helps individual users calculate, track, and cut down their annual greenhouse gas emissions through step-by-step onboarding, dynamic Recharts data visualization, daily action tracking, and a contextual AI Sustainability Coach.

---

## 🚀 Key Features

1. **Step-by-Step Carbon Wizard**: Onboarding workflow collecting Transport, Household Energy, and Diet/Lifestyle inputs with form validations.
2. **Interactive Visual Dashboard**: A donut chart representing your footprint's category-wise breakdown alongside a bar chart comparing your projected footprint against global and national averages.
3. **Gamified Habit Checklist**: Complete daily eco-actions (e.g., using reusable containers, taking public transit, shutting standby appliances) to earn Eco Points, level up, unlock achievement badges, and dynamically drop your carbon score.
4. **Contextual AI Coach**: An embedded chatbot preloaded with your emission stats to provide highly personalized lifestyle recommendations, answer sustainability queries, and give quick-reply chips.

---

## 🧮 Carbon Calculation Logic & Factors

Calculations estimate annual greenhouse gas emissions in **kilograms of carbon dioxide equivalent (kg CO2e)**. 

### 1. Transportation
Estimates annual travel emissions using distance (km/year) and frequency.
*   **Petrol/Diesel Car**: `0.17 kg CO2e / km`
*   **Electric Vehicle (EV)**: `0.05 kg CO2e / km` (Accounting for electric grid recharging)
*   **Public Transit (Bus/Train)**: `0.03 kg CO2e / km`
*   **Short-haul Flights (< 3 hrs)**: `150 kg CO2e / flight` (regional flights have higher per-passenger-km takeoff burns)
*   **Long-haul Flights (> 3 hrs)**: `1000 kg CO2e / flight`

$$\text{Transport Annual Emission} = (\text{Petrol km} \times 0.17) + (\text{EV km} \times 0.05) + (\text{Public Transit km} \times 0.03) + (\text{Short flights} \times 150) + (\text{Long flights} \times 1000)$$

### 2. Household Energy
Estimates home power and heating emissions.
*   **Grid Electricity**: `0.40 kg CO2e / kWh`. If **Solar Panels** are equipped, the grid factor is offset to `0.05 kg CO2e / kWh`.
*   **Heating Source factors**:
    *   *Natural Gas*: `0.18 kg CO2e / kWh`
    *   *Heating Oil*: `2.68 kg CO2e / Litre`
    *   *Electric Heat / Heat Pump*: `0.40 kg CO2e / kWh`
    *   *Biomass / Wood*: `0.02 kg CO2e / kWh`

$$\text{Energy Annual Emission} = (\text{Monthly Electricity kWh} \times 12 \times \text{Factor}) + (\text{Monthly Heating} \times 12 \times \text{Heating Factor})$$

### 3. Diet & Lifestyle
Precalculated annual values representing the lifestyle footprints:
*   **Dietary Styles**:
    *   *Meat-Heavy* (red meat/dairy heavy): `2,800 kg CO2e / year`
    *   *Average / Mixed*: `2,000 kg CO2e / year`
    *   *Vegetarian*: `1,300 kg CO2e / year`
    *   *Vegan*: `900 kg CO2e / year`
*   **Waste & Recycling**:
    *   *Recycling packaging*: Reduces annual waste footprint from `500 kg CO2e` to `150 kg CO2e`.
    *   *Food Waste (Methane emissions in landfills)*: Low (`+100 kg`), Medium (`+250 kg`), High (`+400 kg` CO2e / year).

---

## 📋 Assumptions Made

1. **Annual Scaling**: Monthly energy bills are scaled to a 12-month calendar average, ignoring seasonal spikes for onboarding simplicity.
2. **Habit Impact**: Habit completions represent a *daily* reduction. When visualizing their long-term impact, the tracker projects daily savings to an annual scale ($\text{Savings} \times 365$) to demonstrate the macro impact of small, daily micro-actions.
3. **Local Sovereignty**: All state variables and inputs are persisted strictly in browser `localStorage` for privacy, compliance, and zero database setup requirements.

---

## 🛠️ Project Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)

### Installation
1. Clone this repository (or navigate to the workspace folder):
   ```bash
   cd "Prompt War 3"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## ♿ Accessibility (WCAG 2.1 Compliant)
*   **Interactive Tabbing**: All form fields, buttons, checkboxes, and suggested prompt chips support full keyboard navigation (`Tab`, `Space`, `Enter`).
*   **ARIA attributes**: Elements utilize proper semantic roles (`role="checkbox"`, `aria-checked`, `aria-label`) to ensure accessibility for screen readers.
*   **Contrast styling**: Compliant text color contrast combinations across light and dark theme modes.
