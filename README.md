# Locked In

Locked In is a focused, single-page browser experience designed to keep you on one task and out of distraction loops.

## What it does

- Gives you one web page at a time — no tabs, feeds, or endless browsing surface.
- Locks each focus session to one target domain (and its subdomains) while strict mode is on.
- Blocks common distraction domains while **Strict mode** is enabled.
- Lets you add work sites to a local allowlist.
- Includes a 25-minute focus timer and a small set of intentional quick links.
- Includes a cozy, local to-do list for keeping the next few steps visible.
- Stores settings only in your browser's local storage.

## Run locally

This is a dependency-free web app. Open `index.html` in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

The desktop app uses Electron's embedded browser view, so sites that refuse iframe embedding can still load in the downloadable app. The plain `python3 -m http.server` preview remains useful for checking the layout and search UI, but it cannot provide the full desktop browser surface.

## Desktop executable

The project includes an Electron desktop shell and build targets for macOS, Windows, and Linux. Install Node.js, then run:

```bash
npm install
npm run dist
```

Installers and portable archives are written to `dist/`. To run the desktop shell during development:

```bash
npm start
```

To pull the latest app code, install any dependency updates, validate the code, and rebuild the installers in one step:

```bash
npm run update
```

Run it from the project folder. It uses a fast-forward-only Git pull, so it will stop safely instead of overwriting local changes.

If npm reports that Electron's install script is not approved, run:

```bash
npm run approve-electron
npm install
npm start
```

Electron downloads its platform runtime during installation. Without that runtime, `npm start` will either open the latest packaged app (if `dist/` exists) or print the repair command above.