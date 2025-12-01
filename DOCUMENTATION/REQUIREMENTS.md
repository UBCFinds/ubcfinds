# Project Requirements

## Overview

This document records the functional requirements for UBC Finds. Each requirement is identified with a numeric ID and a short description. References to sketches (Sketch 0 - 8) indicate the UI state or flow where the requirement applies. Acceptance criteria are provided where useful.

---

### 1.0 Initial Application State (Ref: Sketch 0)
- **R1.1:** The system must display an interactive map of the UBC campus upon initial load.  
  - Acceptance: Map tiles and controls render and are interactive.
- **R1.2:** The map must be centered on the user's location by default.  
  - Acceptance: Initial center coordinates point to the campus center.
- **R1.3:** The system must display a 3-grid-line menu icon in the top-left corner of the screen.  
  - Acceptance: Icon is visible and clickable on load.
- **R1.4:** The system must display the user's current location as a blue dot on the map, if location permissions are granted.  
  - Acceptance: Blue location dot appears only after permission is granted.
- **R1.5:** The system must display a 'Locate Me' ("where am I?") button in the bottom-right corner of the screen.  
  - Acceptance: Button is visible and tappable on load.
- **R1.6:** The "Locate Me" button (R1.5) must remain visible on the map at all times  
  - Acceptance: UI elements persist through map interactions.
- **R1.7:** The user’s current location, represented by a blue dot (R1.4), must never disappear. It can only be temporarily out of view if the user zooms away from their specific location on the map.

---

### 2.0 Sidebar Menu - Empty State (Ref: Sketch 1)
- **R2.1:** Clicking the 3-grid-line menu icon (R1.3) must open a sidebar menu.  
- **R2.2:** The sidebar menu must contain a 'Utility' section with a list of filterable utility categories
- **R2.3:** The "Utility" section in the sidebar menu must have checkboxes as user input. 
- **R2.4:** The sidebar menu must contain a 'Nearby Utilities' section.  
- **R2.5:** On initial load, no utility categories must be checked by default.  
- **R2.6:** While no categories are checked, no utility waypoints must be displayed on the map.  
- **R2.7:** While no categories are checked, the 'Nearby Utilities' list must be empty or display an empty-state message.  

Acceptance criteria: sidebar opens/closes, filter list renders, default state is empty.

---

### 3.0 Sidebar Menu - Active State (Ref: Sketch 2)
- **R3.1:** Checking a utility category checkbox must cause all waypoints for that category to be displayed on the map.  
- **R3.2:** Unchecking a utility category checkbox must cause all waypoints for that category to be hidden from the map.  
- **R3.3:** All displayed waypoints must be color-coded to represent their working status.
  - **R3.4:** A GREEN highlight must indicate the utility is 'fully working'.  
  - **R3.5:** A YELLOW highlight must indicate 'some issues have been reported'.  
  - **R3.6:** A RED highlight must indicate the utility is 'out of service'.  
- **R3.7:** The 'Nearby Utilities' list must automatically update to show waypoints from checked categories only.  
- **R3.8:** The 'Nearby Utilities' list must be scrollable.

Acceptance criteria: toggling categories updates map markers and the nearby list; color coding matches status legend.

---

### 4.0 Closed Menu - Active State (Ref: Sketch 3)
- **R4.1:** The sidebar menu must be closable (e.g., by clicking the menu icon again).  
- **R4.2:** Waypoints for selected categories (R3.1) must remain visible on the map when the sidebar menu is closed.

Acceptance criteria: closing sidebar preserves map state and shown markers.

---

### 5.0 'Find Nearest' Function (Ref: Sketch 4)
- **R5.1:** Tapping on any empty coordinate on the map must trigger the 'Find Nearest' function.  
- **R5.2:** The 'Find Nearest' function must identify the two (2) closest utility waypoints for each currently checked utility category by computing the distance between the user inputted location and all of the currently visible waypoints.  
- **R5.3:** The identified nearest waypoints for every category must be highlighted with a red box overlay.

Acceptance criteria: tapping empty map returns nearest two per checked category and visually highlights them.

---

### 6.0 Waypoint Information Menu (Ref: Sketch 5)
- **R6.1:** Clicking a waypoint icon on the map must open an information menu.  
- **R6.2:** Clicking a utility name in the 'Nearby Utilities' list must open the same information menu as R6.1.  
- **R6.3:** The information menu must display waypoint-specific information (e.g., address, landmarks).  
- **R6.4:** The information menu must display the working status of the utility (e.g., "Not Working").  
- **R6.5:** The information menu must contain a 'Navigate' button.  
- **R6.6:** Clicking the 'Navigate' button must redirect the user to Google Maps navigation for that waypoint's location.  
- **R6.7:** The information menu must contain a 'Report Issue' button.
- **R6.8:** Clicking the “Report Issue” must open a reporting menu where users can submit a menu.
- **R6.9:** Each waypoint must be represented by its corresponding icon in the utility checklist menu.

Acceptance criteria: info menu shows full details and includes Navigate + Report Issue actions.

---

### 7.0 Report Issue Modal (Ref: Sketch 6)
- **R7.1:** Clicking the 'Report Issue' button (R6.7) must open a modal pop-up menu.  
- **R7.2:** The modal must contain a selectable list of 'Issue Type' categories.  
- **R7.3:** The modal must contain a text field for 'Additional Comments'.  
- **R7.4:** The modal must contain a 'Submit' button.  
- **R7.5:** The modal must contain a 'Cancel' button.  
- **R7.6:** Clicking the 'Cancel' button must close the modal without submitting a report.

Acceptance criteria: modal UX allows choosing issue type, entering comments, or cancelling.

---

### 8.0 Report Submission Confirmation (Ref: Sketch 7)
- **R8.1:** Clicking the 'Submit' button (R7.4) must submit the issue report to the server.  
- **R8.2:** Upon successful submission, the report modal (Section 7.0) must be replaced with a 'Thank You' message.  
- **R8.3:** The 'Thank You' message modal must contain an 'x' icon to close it.

Acceptance criteria: submissions reach server (or show error); success displays thank-you UI.

---

### 9.0 'Locate Me' Function (Ref: Sketch 8)
- **R9.1:** Clicking the 'Locate Me' button (R1.5) must trigger the locate function.  
- **R9.2:** The locate function must close any open sidebar (Section 2.0) or information (Section 6.0) menus.  
- **R9.3:** The map view must re-center and zoom in on the user's blue dot location.  
- **R9.4:** A small pop-up menu stating "You are here" must appear, pointing to the blue dot.

Acceptance criteria: locate centers and shows "You are here" popup; sidebars/menus close.

---

### 10.0 Error Handling
- **R10.1:** If the user's location (R1.4) cannot be determined, the system must hide the blue dot and disable the 'Locate Me' button.  
- **R10.2:** If the system cannot fetch utility data from the server on initial load, it must display an error message such as "Could not load utilities. Please try again later."

Acceptance criteria: graceful UI for location/data failures and clear messages to user.

