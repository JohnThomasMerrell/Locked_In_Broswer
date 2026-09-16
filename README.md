# Locked In

Locked In is a focused, single-page browser experience designed to keep you on one task and out of distraction loops.

## What it does

- Gives you one web page at a time — no tabs, feeds, or endless browsing surface.
- Locks each focus session to one target domain (and its subdomains) while strict mode is on.
- Blocks common distraction domains while **Strict mode** is enabled.
- Lets you add work sites to a local allowlist.
- Includes a 25-minute focus timer and a small set of intentional quick links.
- Stores settings only in your browser's local storage.

## Run locally

This is a dependency-free web app. Open `index.html` in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

Some sites prevent embedding in an iframe; those sites may not render in this web build.