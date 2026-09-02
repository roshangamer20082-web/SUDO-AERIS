# SUDO AERIS — Design Direction

## Three stylistic approaches

### Theme Name: Orbital Command
Very Brief Intro: A dark, high-density geospatial workstation with cartographic precision, crisp data labeling, and a restrained amber signal color. It should feel like a mission-control instrument rather than a marketing page.
Probability: 0.06

### Theme Name: Field Atlas
Very Brief Intro: A light, mineral-toned remote-sensing atlas with paper-like surfaces, red survey marks, and large quiet image fields. It would feel editorial, tactile, and research-led.
Probability: 0.03

### Theme Name: Night Meridian
Very Brief Intro: A near-black satellite operations console with midnight blue surfaces, cool cyan readouts, and subtle scanline motion. It emphasizes technical drama without turning into cyberpunk spectacle.
Probability: 0.08

## Selected Approach: Orbital Command

### Design Movement
Contemporary cartographic modernism: the clarity of Swiss information design applied to a satellite ground-station interface, with disciplined instrument labeling and a strong sense of physical control surfaces.

### Core Principles
1. **The map is the instrument.** The geographic canvas and before/after imagery receive the largest visual weight; every other element supports orientation, selection, or interpretation.
2. **Signals over decoration.** Amber is reserved for active selection, run actions, and live system state. Surfaces stay charcoal and blue-black so hierarchy comes from contrast and spacing, not ornament.
3. **Dense but legible.** Compact metadata, monospaced values, and deliberate alignment create information density while generous section gaps prevent clutter.
4. **Honest computation.** The interface distinguishes live inference from cached demonstration and shows em dashes whenever scientific values are not supplied by the backend.

### Color Philosophy
The base is a blue-black field inspired by low-light satellite operations rooms: quiet, cool, and low-reflectance. Desaturated steel-blue supports structure and geography without becoming generic navy. A single ownable amber, **Solar Flare #F4B942**, functions like an instrument lamp: it indicates what is selected, active, or ready to execute. Muted sage green is reserved for system-online confirmation, and red is used only for real errors. No gradient is needed to create depth; depth comes from surface steps, hairline rules, shadowed wells, and a faint topographic grid texture.

### Layout Paradigm
Use a split workstation rather than a centered dashboard. A narrow vertical rail on the left establishes the product mark and operating mode. The main workspace is a wide, asymmetric two-column stage: the map occupies the visual center-left, while the control stack is a tall right-side instrument panel. Results extend below as a broad comparison bay, followed by a compact metrics/analysis strip. On mobile, preserve the order of operations—header, map, coordinates, run control, pipeline, comparison, metrics—while converting the rail into a slim top bar.

### Signature Elements
1. **Coordinate reticle:** a fine crosshair and amber marker lock on the map, echoed by small corner brackets around selected outputs.
2. **Telemetry ticks:** tiny horizontal rules, section indices, and monospaced micro-labels that make panels feel calibrated.
3. **Signal seam:** a thin amber line used as a controlled separator for active states, never as a decorative border on every card.

### Interaction Philosophy
Interactions should feel like operating an instrument: direct, reversible, and explicit. Clicking the map moves the lock; dragging the marker updates the coordinates; editing values immediately validates the lock state. Run is a deliberate action that opens a staged pipeline rather than hiding work behind a spinner. Demo results are clearly labeled and never presented as live GPU inference. Hover states brighten the control surface slightly, while active states use the Solar Flare seam and a compact press response.

### Animation
Use short, precise transitions under 240ms with an ease-out curve. The marker crosshair eases to a new position and the comparison divider tracks the pointer or touch without inertia. Pipeline steps advance with a soft amber pulse on the active node and a quick fade/translate for the status line. A single low-amplitude scan movement may appear in the map well during processing; it must stop when complete and respect prefers-reduced-motion. Never use bouncing loaders, glowing neon loops, or large entrance choreography.

### Typography System
Use **Space Grotesk** for display labels, headings, and primary controls: technical but warmer and more authored than a default system font. Use **IBM Plex Mono** for coordinates, metrics, timestamps, status codes, and section indices. Body copy uses Space Grotesk at 13–15px with a high line-height; titles use tight tracking and a compact uppercase eyebrow. Never use Inter.

### Brand Essence
SUDO AERIS is a judge-ready satellite super-resolution workstation for technical teams who need a transparent path from location lock to S2DR3 output, without pretending the GPU work happens in the browser. Personality: **precise, restrained, credible**.

### Brand Voice
Headlines are compact and operational. CTAs sound like instrument commands, not marketing promises. Microcopy states what is known, what is pending, and what is unavailable without overclaiming.

Example lines:
- “Resolve the scene. Keep the evidence.”
- “GPU inference is staged behind the interface.”

### Wordmark & Logo
The mark is a compact orbital-chevron glyph: three offset amber/steel bars form an abstract “S” wrapped around a small negative-space coordinate point. The wordmark uses a custom spaced uppercase treatment for SUDO AERIS, with the “O” cut by a thin horizontal latitude line. Use the standalone glyph at a visible size in the rail and mobile header; do not substitute a generic icon or typeset logo.

### Signature Brand Color
**Solar Flare — #F4B942.** A warm satellite-sun amber used only for the active lock, run command, progress signal, and selected comparison edge.

## Implementation Reminders

- Frontend only; do not add backend or server behavior.
- Keep `INFERENCE_API_URL` as a documented future configuration point in the API abstraction, but use local demo mode for this prototype.
- Never fabricate PSNR, SSIM, processing time, detected objects, change regions, or confidence values.
- Use the provided map primitive from `client/src/components/Map.tsx`; do not request or hard-code a Google Maps API key.
- Keep all media outside the project directory and reference uploaded assets by stable storage URL when used.
- Every edited CSS/component/page file should begin with a short comment reminding the author of the Orbital Command style system.
