# Masrafji

Masrafji is a React Native expense tracker built with Expo Router and Supabase. It tracks deposits and expenses in USD and LBP, shows monthly cashflow summaries, keeps transaction history, and provides basic analytics by category.

## Tech Stack

- Expo SDK 55 runtime packages
- Expo Router with `src/app` routes
- React Native and TypeScript
- Supabase Auth and Postgres
- EAS Build for Android preview APKs
- GitHub Actions for manual APK build triggers

## Project Structure

```text
src/app/                 Expo Router route files only
src/components/          Reusable UI components
src/hooks/               Shared React hooks
src/lib/                 Supabase client, types, helpers
src/screens/             Route-specific styles
supabase/                SQL setup and migration scripts
.github/workflows/       GitHub Actions workflows
```

Do not add non-route files to `src/app`. Expo Router treats files in that directory as routes.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```bash
cp .env.example .env
```

Fill in:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Start Expo:

```bash
npx expo start
```

For Expo Go on Android, scan the QR code from the Expo CLI output.

## Supabase Setup

Run the schema in the Supabase SQL Editor:

```text
supabase/schema.sql
```

If upgrading an older prototype database, run:

```text
supabase/auth-migration.sql
```

The app expects Supabase Auth to be enabled and the `public.expenses` table to use row-level security policies scoped to the signed-in user.

## Password Recovery

The app uses the custom URL scheme from `app.json`:

```text
masrafji://reset-password
```

Add this redirect URL in Supabase:

```text
Authentication -> URL Configuration -> Redirect URLs
```

For local development, Expo may also generate development URLs with `Linking.createURL("reset-password")`; add the relevant URL if testing recovery links locally.

## Validation

Run these before committing meaningful changes:

```bash
npx tsc --noEmit
npm run lint
npx expo install --check
```

## Android APK Builds

The EAS `preview` profile builds an installable Android APK:

```bash
npx eas-cli@latest build -p android --profile preview
```

When the build finishes, EAS prints a build URL. Open that URL on your Android phone to download and install the APK.

## EAS Environment Variables

Add the public Supabase values to the Expo/EAS `preview` environment, not to GitHub Secrets:

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_SUPABASE_URL --value "your-supabase-url" --environment preview --visibility plaintext
npx eas-cli@latest env:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "your-supabase-publishable-key" --environment preview --visibility plaintext
```

These are `EXPO_PUBLIC_*` values, so they are bundled into the app and should not contain service-role or private Supabase keys.

## GitHub Action APK Build

The workflow `.github/workflows/android-preview-apk.yml` manually triggers an EAS Android preview APK build.

To configure it:

1. Create an Expo access token from your Expo account settings.
2. In GitHub, open `Settings -> Secrets and variables -> Actions`.
3. Add a repository secret named `EXPO_TOKEN`.
4. Open `Actions -> Android Preview APK`.
5. Click `Run workflow`.
6. Open the workflow logs and follow the EAS build URL.

The workflow uses `--no-wait`, so GitHub Actions exits after triggering the EAS build. The APK download link is available from the EAS build page.

## Current EAS Metadata

- Expo owner: `hadi_hsn`
- Android package: `com.hadialhassan.masrafji`
- EAS project ID is stored in `app.json`

## Git Notes

- `.env` is ignored and must not be committed.
- Keep commits logically separated.
- Commit generated EAS project metadata when `eas init` updates `app.json`.
