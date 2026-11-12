---
name: C4 Home
description: A quiet, spacious OLED launcher for sofa-distance use.
colors:
  background: "#080a0c"
  panel: "#171b20"
  ink: "#eef0f2"
  muted: "#a3aab2"
  accent: "#c9e0cf"
  edge: "#737f89"
  hover-panel: "#242c32"
  input-border: "#38424b"
  idle: "#000"
typography:
  display:
    fontFamily: "'LG Smart UI', 'LG Display', Arial, sans-serif"
    fontSize: "58px"
    fontWeight: 400
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'LG Smart UI', 'LG Display', Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 500
  body:
    fontFamily: "'LG Smart UI', 'LG Display', Arial, sans-serif"
    fontSize: "24px"
  label:
    fontFamily: "'LG Smart UI', 'LG Display', Arial, sans-serif"
    fontSize: "20px"
  input-title:
    fontSize: "21px"
    fontWeight: 400
  detail:
    fontSize: "16px"
rounded:
  tile: "14px"
  input: "12px"
  tool: "6px"
spacing:
  grid: "24px"
  wide-grid: "28px"
  focus-offset: "6px"
components:
  app-tile:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.tile}"
    height: "166px"
    width: "100%"
  app-tile-hover:
    backgroundColor: "{colors.hover-panel}"
  hdmi-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "16px 22px"
  tool-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.tool}"
    padding: "10px 4px"
    typography: "{typography.label}"
  notice:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.input}"
    padding: "18px 28px"
---

# Design System: C4 Home

## Overview

**Creative North Star: "The Quiet Screen"**

A descriptive name for the confirmed dark, minimal direction: near-black OLED space, gray text, and a pale sage focus marker. The interface feels calm and restrained, with generous separation for viewing from a sofa. The name records the existing direction rather than introducing a new identity.

Installed app artwork supplies recognition. The surrounding interface stays visually quiet; no decorative imagery is added. D-pad focus and pointer interaction share the same clear visual language.

**Key Characteristics:**

- Spacious ten-foot interface.
- Near-black surfaces and soft gray hierarchy.
- Sage focus, reserved for interaction and feedback.
- Native installed app icons.

## Colors

The palette combines cool neutral surfaces with a soft sage interaction accent.

### Primary

- **Soft Sage** (`accent`): focus outlines, favorite pins, and transient notices.

### Neutral

- **OLED Night** (`background`): the continuous screen field.
- **Charcoal Panel** (`panel`): app tiles and focused HDMI surfaces.
- **Soft White** (`ink`): headings, clock, and primary labels.
- **Cool Gray** (`muted`): supporting labels, instructions, dates, and icons.
- **Slate Edge** (`edge`): scrollbar thumb.
- **Raised Charcoal** (`hover-panel`): focused or hovered app tile fill.
- **Input Stroke** (`input-border`): resting HDMI boundaries.
- **Black** (`idle`): the full-screen idle veil.

**The Focus First Rule.** Keep sage tied to interaction and feedback so the active target remains easy to locate.

## Typography

Use the native LG font stack recorded in the tokens. Its plain sans-serif character and regular-weight heading keep the screen readable without making it loud.

The display role introduces the screen; headline labels divide app and input groups. Body copy explains briefly, label text identifies actions and apps, and detail text carries HDMI identifiers and remote hints. The clock uses tabular numerals, a compact line height (1), and a larger size (40px).

## Layout

The surface is centered with a maximum width (1920px), generous TV padding (58px 84px 34px), and a full-viewport minimum height. Header identity sits left, clock and date right. The introduction precedes the launcher groups; tools and remote guidance sit beneath them.

At the TV size, six favorite columns and four HDMI columns form two clear horizontal bands. App tiles become taller (170px) and grid gaps become uniform (28px) above the wide breakpoint (1600px). At widths up to 1100px, favorites use four columns, HDMI uses two, and padding contracts. At widths up to 600px, favorites use two columns and HDMI one. These smaller layouts support previews; the TV composition remains the primary reference.

## Elevation & Depth

There are no box shadows. Tonal surface changes, thin boundaries, and a sage outline express state. Focused and hovered app tiles keep their position and dimensions; only the surface tone changes.

## Shapes

App tiles have gently rounded corners using the tile radius. HDMI buttons and notices use the input radius; text tools use the smaller tool radius. Square app images fill the button with cover sizing and no inner padding. HDMI controls use a thin resting border (1px). Favorite pins are circular.

## Components

### App tiles

Square, edge-to-edge app artwork with centered labels below. Use actual installed icons and a text fallback if artwork is unavailable. Hover and focus change only the surface tone; tile geometry remains fixed. Focus also changes its label from muted to primary ink. Editing uses an overlaid selection badge; the focused tile keeps the same 3px sage outline.

### HDMI inputs

Outlined horizontal buttons with a small line icon, a device name, and a muted HDMI identifier. The focused or hovered surface fills with panel color. The large focus outline is shared with other buttons.

### Tools

Restrained text buttons for secondary launcher actions. Hover and focus brighten the text. Keep the shared focus outline even though the button has no resting fill.

### Status notice

A fixed, centered notice near the bottom uses sage with dark text. It is an aria-live status region and never intercepts pointer input.

### Interaction and idle states

Every focused button receives a sage outline (3px) separated from its edge by the focus offset. Tile transitions use ease-out (160ms). Reduced-motion preferences remove transitions. The idle veil fades over two seconds, first dimming to 85% opacity and then reaching black.

## Do's and Don'ts

### Do:

- **Do** preserve a visible sage focus outline for D-pad and pointer use.
- **Do** keep native installed app artwork contained within its tile.
- **Do** retain generous spacing and short, sofa-readable labels.
- **Do** respect reduced-motion preferences.

### Don't:

- **Don't** add decorative imagery to the launcher chrome.
- **Don't** add shadows to resting tiles or HDMI controls.
- **Don't** change the focus outline thickness during editing.

### Icon density and stable updates

Use the largest installed artwork, preferring vector assets where available. Center artwork in a fixed tile without entering layout flow. A shared square tile uses a 192-pixel source budget divided by device pixel ratio, capped at 136 CSS pixels; lower-resolution originals scale to the same square. Existing keyed app and HDMI elements persist through refreshes and favorite edits, preserving focus and decoded images.

The launcher omits persistent catalog status, app-count captions, and the introductory subtitle. Loading availability is exposed through the refresh button’s aria-busy state; failures still use the transient status notice.

### Reordering and native settings

Reorder favorites is an explicit mode. OK picks up a favorite; Left/Right changes its visible position; OK places and persists it; Back restores the pre-move order before exiting the mode on a second press. A dashed focus outline identifies the moving tile. Contextual move/place/cancel buttons support the pointer. Status announcements describe the resulting position once per move. Reuse original cells in DOM order, using moveBefore when supported and restoring focus with the insertBefore fallback. Keyboard input retains focus until the pointer physically moves. Settings opens the TV’s own overlay via the public application launch API.

Reorder favorites is nested inside Edit favorites: the reorder action is hidden on the normal launcher and shown only in favorite editing. Finishing or leaving reorder returns to the edit screen.
