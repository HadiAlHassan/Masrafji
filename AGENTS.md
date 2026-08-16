# Masrafji Agent Instructions

## Expo Documentation

Before writing code, read the exact Expo SDK docs at:

https://docs.expo.dev/versions/v56.0.0/

This repo currently uses Expo SDK 55 packages for Expo Go compatibility, but code changes should still be checked against the SDK 56 documentation because Expo APIs and Router behavior are changing during the SDK 56 transition.

## Project Rules

- Do not commit `.env` or local secrets.
- Keep files inside `src/app` limited to Expo Router route files and `_layout.tsx`.
- Do not place helper files, styles, hooks, or components in `src/app`; Expo Router treats files there as routes.
- Put route-specific styles under `src/screens/<screen-name>/`.
- Put reusable components under `src/components/<component-name>/` with a colocated `*.styles.ts` file.
- Use TypeScript and existing path aliases such as `@/components/...`.
- Validate meaningful changes with `npx tsc --noEmit`, `npm run lint`, and `npx expo install --check` when practical.
