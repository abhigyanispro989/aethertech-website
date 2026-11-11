# AetherTech Website

The files at this repository root are the static AetherTech website export, including the home page, visual effects, branch navigation, and floating guide interface.

## Publish with GitHub Pages

In the repository settings, open **Pages** and select **Deploy from a branch**, then choose `main` and `/ (root)`. The `.nojekyll` file is included for static asset publishing.

The floating guide calls the deployed AetherAI guide endpoint. That endpoint remains hosted by AetherTech and must allow requests from the GitHub Pages domain for the guide to work on the Pages copy.
