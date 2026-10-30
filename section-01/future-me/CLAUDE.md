# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"Future Me" is a dependency-free, single-page time-capsule app: users write a letter that stays sealed until a chosen date. It is plain HTML/CSS/JS with no build step, package manager, tests, or linter. To run it, open `index.html` in a browser (or serve the directory, e.g. `python3 -m http.server`).

## Architecture

- `index.html`: static markup. `script.js` finds elements by ID (`$('capsuleForm')`, `$('list')`, etc.), so renaming an ID or `data-for`/`data-days` attribute breaks the script.
- `script.js`: one IIFE with all logic, in sections (storage, theme, quotes, form, rendering, effects).
- `style.css`: theming through CSS variables under `[data-theme="dark"|"light"]`. The `data-theme` attribute on `<html>` is set by `applyTheme()`.

### State and persistence
- The `capsules` array (`{id, name, message, unlockAt, createdAt}`, times in epoch ms) is the only state. It is persisted to `localStorage` under `futureMe.capsules.v1`. The theme is stored under `futureMe.theme`. If the capsule shape changes, bump the key's version.
- A `storage` event listener reloads and re-renders so multiple tabs stay in sync.
- Locked messages are not hidden or encrypted. They sit in plain text in localStorage and are only withheld from the DOM until unlock.

### Rendering model
- `render()` reconciles the DOM with `capsules`. It keeps existing card nodes keyed by `data-id`, reorders them (locked soonest-first, then opened most-recent-first), and removes stale ones. It does not rebuild the list.
- `tick()` runs every second via `setInterval`. It calls `updateCard()` for each card, which switches the card between locked and open using `card.dataset.state`. It updates the countdown and progress bar in place.
- The `opened` set and the `state` check separate cards that unlock live, which get the reveal animation and confetti, from cards that were already open on page load, which do not.
- DOM is built with the `el(tag, cls, text)` helper and `textContent`. Keep using it, because user text (`name`, `message`) must never go through `innerHTML`.
