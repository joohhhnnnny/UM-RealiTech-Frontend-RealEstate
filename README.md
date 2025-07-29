# UM-RealiTech-Frontend-RealEstate

## Overview

This repository contains the frontend code for the UM-RealiTech suite of real estate applications. The goal of UM-RealiTech is to empower both buyers and sellers in the Philippines real estate market through transparency, accountability, and AI-powered assistance. The frontend is built to be modular and reusable across all four core products:

*   **DevTrackr:** A developer transparency platform that provides buyers with visibility into construction progress and protects their payments.
*   **RealtyConnect:** An agent accreditation and commission system that regulates and empowers real estate agents while ensuring fair commissions.
*   **BuySmart PH:** An AI-powered real estate buyer assistant that helps homebuyers navigate the complex buying process with confidence.
*   **PropGuard:** A post-sale homeowner dashboard that empowers buyers after they've paid, ensuring they aren't abandoned after the sale.

## Core Products & Features

### 1. DevTrackr – Developer Transparency Platform

*   **Goal:** Give buyers visibility and protect their payments via transparency and accountability tools.
*   **Core Features (MVP):**
    *   Construction Progress Timeline: Upload milestone photos or descriptions, Timeline UI with percentage completion, Promised vs. Actual Comparison, Upload original plan (PDF/image) vs. current site photo, Flag discrepancies (initially via manual toggle or placeholder AI logic).
    *   Developer Profiles: Rating system based on buyer feedback, Project listings per developer.
    *   Smart Contract-Based Payment Tracker (Mock): Payment schedule tied to milestones, Visual indicator of payment release status.

### 2. RealtyConnect – Agent Accreditation & Commission System

*   **Goal:** Regulate and empower real estate agents while ensuring fair commissions.
*   **Core Features (MVP):**
    *   Agent Sign-up and PRC Validation (Manual for now): Upload PRC license for basic validation.
    *   Agent Reputation System: Verified badge + basic rating from clients.
    *   Marketplace to Connect with Agents: Filter by area or specialization.
    *   Commission Tracker (Mock Smart Contract): Logs sale and milestone payout progress, “Release Commission” button simulation.

### 3. BuySmart PH – AI-Powered Real Estate Buyer Assistant

*   **Goal:** Help homebuyers navigate the complex and confusing buying process confidently.
*   **Core Features (MVP):**
    *   AI Guide or Wizard Flow: Ask questions to determine buyer profile (e.g., OFW? First-time buyer?), Recommend next steps based on responses.
    *   Loan Pre-Qualification Tool: Based on income, estimate how much loan they can afford, Show estimated monthly amortization.
    *   Hidden Cost Calculator: Add transfer taxes, registration fees, notarial costs.
    *   Document Checklist & Reminders: Checkboxes with email reminders (or simulated notifications). AI validates the document submission, and the real estate agent will check the Legitamacy.

### 4. PropGuard – Post-Sale Homeowner Dashboard

*   **Goal:** Empower buyers after they’ve paid — ensure they aren’t abandoned after the sale.
*   **Core Features (MVP):**
    *   Post-Sale Dashboard: Track property title status, payment schedule, turnover stage.
    *   Buyer–Developer Messaging System: Simulate communication inside the app (chat-style or ticket).
    *   Alert System: Notify buyers if delays or missing documents are flagged.
    *   Document Vault: Store signed contracts, ID copies, titles (uploads or dummy docs).

## Technologies Used

*   [List the main technologies used, e.g., React, Vue.js, Angular, etc.]
*   [List any relevant libraries or frameworks]

## Setup Instructions

1.  Clone the repository: `git clone [repository URL]`
2.  Install dependencies: `npm install` or `yarn install`
3.  Configure environment variables: [Explain any necessary environment variables]
4.  Run the application: `npm start` or `yarn start`

## Contributing

[Explain how others can contribute to the project]

## License

[Specify the license, e.g., MIT, Apache 2.0]
