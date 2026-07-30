// Build identity — one source for every surface that shows it.
//
// The footer and the "How to use" page both display the version, commit and
// build time. Two copies of a version string is exactly the kind of thing that
// drifts: the footer says v0.3, the help page says something else, and a state
// team reporting a bug quotes whichever one they happened to read.
//
// `__BUILD_SHA__` / `__BUILD_TIME__` are injected by Vite at build time
// (vite.config.ts) and declared in src/vite-env.d.ts.

/**
 * Displayed app version.
 *
 * Deliberately a literal, not `package.json`'s `version` — that field still
 * reads 0.0.0 from the project scaffold, so reading it would put "v0.0.0" on
 * screen. Tracked in known_debt.md; bump package.json and wire a Vite define
 * to make it the real source.
 */
export const APP_VERSION = "0.3";

/** Short commit SHA, or "dev" when built outside a git checkout. */
export const BUILD_SHA = __BUILD_SHA__;

/** Build timestamp as "YYYY-MM-DD HH:MM UTC" — always UTC, never localised. */
export const BUILD_TIME = `${__BUILD_TIME__.slice(0, 16).replace("T", " ")} UTC`;

/** Who to credit on-screen. */
export const BUILT_BY = "Dr. Raunaq Pradhan (Artpark)";
