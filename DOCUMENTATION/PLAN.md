# PROJECT PLAN: UBC Finds (Team Polaris)

This document details the project management methodology, communication structure, component ownership, timeline, and verification strategy for the UBC Finds Minimum Viable Product (MVP).

---

## 1.0 Work Coordination

### 1.1 Who Will Coordinate the Work?

The primary coordination will be led by **Adam (Project Manager)** and supported by **Ahnaf**.

* **Rationale:** The PM is responsible for scheduling, resources, and overall progress, while the Designer (Ahnaf) has been instrumental in planning and providing feature prioritization guidance.

### 1.2 Project Management Practices

Our management practices include **sprint planning** and **basic task division**.

* **Sprint Planning:** We hold meetings to review goals, create a simple high-level framework, and decide on deadlines for low-level tasks.
* **Task Division:** Tasks are divided to achieve an even workload while adhering to individual skills and interests. We implement a **standby system** where a member with expertise (e.g., Viren) is on standby to assist a member learning a new skill (e.g., Anant with GUI editing).
* **Resilience (Disaster Contingency):** The task assignments are acknowledged as subject to change. This flexibility, combined with the standby system, allows us to mitigate risks from illness, injury, or complex bugs by transferring ownership easily.

### 1.3 Meetings and Agendas

We hold **weekly working sessions** where all members collaborate in a computer lab.

* **Frequency/Timing:** This happens on **Monday afternoon or Tuesday morning**.
* **Agendas:** Agendas are mainly **pre-decided** via the project milestones. The goal is to work on **bulk tasks** and **collaborate**.
* **Rationale:** Weekly in-person collaboration facilitates rapid debugging and knowledge transfer, which is essential for our complex client-server architecture.

---

## 2.0 Communication Tools

| Tool | Purpose | Rationale and Alternative Justification |
| :--- | :--- | :--- |
| **Discord Server** | **Main communication tool** for discussion, updates, and announcements. Includes channels for passwords and API keys. | **Alternatives (Slack, Email):** Discord is chosen for its **real-time chat** and labeled channels, which efficiently organize project aspects and facilitate quick, informal communication. |
| **GitHub** | **Main tool for code changes and updates.** Used for branching, pulling, and pushing changes to the development branch. | **Alternatives (GitLab):** GitHub is the required submission platform and the industry standard for tracking progress and enforcing the workflow. |
| **Git Workflow** | We push changes to a **`dev` branch** and only merge to `main` once the changes are **looked over by at least two others**. | **Rationale:** This decentralized review process minimizes the risk of introducing critical bugs into the main branch and ensures code quality. |

---

## 3.0 Component Ownership

Ownership means being responsible for implementing, ensuring functionality, and correcting the component.

| Component (Architecture) | Owner | Responsibility |
| :--- | :--- | :--- |
| **Model - Utility** | **Anant** | Core data structure for utilities. |
| **Model - Report** | **Anant** | Structure for user-submitted issue reports. |
| **Server - Supabase** | **Ahnaf** | Backend database setup and connection. |
| **Utilities - UtilityList** | **Ahnaf** | Logic for filtering and sorting utility lists. |
| **View - CampusMap** | **Adam** | Main map rendering and display. |
| **View - Utility Detail** | **Adam** | Pop-up information menu (Ref: Sketch 6). |
| **View - ReportModal** | **Max** | Interface for the issue reporting pop-up. |
| **View - Sidebar/Filters** | **Max** | Interactive menu on the left. |
| **Controller - CampusMap Logic** | **Viren** | Geospatial logic (map clicks, centering, routing calls). |
| **Controller - ReportModal Logic** | **Viren** | Validating and sending reports to the server. |

---

## 4.0 Working Timeline and Milestones

The timeline focuses on polishing an early prototype and adding features over the next three weeks.

| Task / Milestone | Owner(s) | Deadline | Status |
| :--- | :--- | :--- | :--- |
| **Milestone 1 & 2** (Setup, Requirements & Specs) | Whole Team | Oct 27 - Oct 31 | Complete |
| **Finish Section 4** ("Plan" Deliverable & Timeline Table) | Ahnaf | Nov 6 | In progress |
| **Finish Section 5** ("Plan" Deliverable & Verification) | Ahnaf + Adam | Nov 7 | In progress |
| **Convert Google Doc to .md** & Submit | Adam | Nov 7 | Not started |
| **Implement R1.5, R1.6, R9** ('Locate Me' Button & Logic) | Ahnaf | Nov 10 | Not started |
| **Fix R2.5** (Initial Unchecked State) | Anant | Nov 10 | Completed |
| **Fix R3.3** (Waypoint Color Highlighting) | Anant | Nov 12 | In progress |
| **Fix R6.9** (Waypoint Icon Matching) | Adam | Nov 18 | Not started |
| **Implement R5** ('Find Nearest' Function) | Ahnaf | Nov 20 | Not started |
| **Implement R10** (Error Handling) | Adam | Nov 21 | Not started |
| **Milestone: Test Release** (Run all test suites) | Whole Team | Nov 21–24 | Not started |
| **Milestone: Beta Submission** | Whole Team | Nov 24–28 | Not started |

---

## 5.0 Requirement Verification Plan

Our verification process is integrated with our development workflow and combines automated testing with manual inspection. The overall goal is to verify all requirements.

### Verification Integration

* **Continuous Testing:** We will run automated tests after every build to ensure continuous integration.
* **Reviews/Inspections:** Conducted during the Pull Request (PR) process when merging from `dev` to `main`.
* **Rationale:** The comprehensive verification plan ensures adequate detail in testing methods and suites.

### Verification Details by Requirement Group

| Requirement Group | Verification Method | Justification / Testing Rationale |
| :--- | :--- | :--- |
| **1.0 Initial State (R1.1-R1.7)** | Manual UI Inspection + Automated Cypress Testing | **Rationale:** Visual correctness and geolocation accuracy can only be confirmed through UI testing. **Verification:** Load app, confirm map renders, and all UI elements appear. |
| **2.0 Empty State (R2.1-R2.7)** | Unit test React components using Jest | **Rationale:** State-based logic (e.g., unchecked checkboxes, empty lists) is efficiently verified with component tests. |
| **3.0 Active Menu (R3.1-R3.8)** | Automated UI tests + Manual Color Check | **Rationale:** Combines visual verification and programmatic logic (e.g., toggling checkboxes → asserting correct waypoint rendering). |
| **5.0 Find Nearest (R5.1-R5.3)** | Algorithmic Unit Testing | **Rationale:** This is a pure logic function, ideal for algorithmic testing. **Verification:** Mock coordinates → confirm function returns 2 nearest points per category. |
| **6.0 Waypoint Info (R6.1-R6.9)** | Integration and UI testing | **Rationale:** Verifies both data (menu content) and UI linkage (successful Google Maps redirect). **Verification:** Click pins → check information, buttons, and matching icons. |
| **7.0 Report Modal (R7.1-R7.6)** | UI Unit Testing + Mock Server Submission | **Rationale:** Tests the integrity of the user flow. **Verification:** Input text, attempt to cancel/submit → confirm correct behavior. |
| **10.0 Error Handling (R10.1-R10.2)** | Fault Injection Testing | **Rationale:** Confirms resilience to failures. **Verification:** Mock failure in location or data fetch → verify UI hides the blue dot and shows the error message. |

---
