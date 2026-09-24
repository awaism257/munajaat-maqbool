# Munajaat Maqbool

A modern, offline Android reader for the seven daily manzil sections of *Munajaat-e-Maqbool* by Shaykh Ashraf Ali Thanvi.

This project recreates the discontinued reference app with a contemporary Material 3 interface while preserving the daily reading structure and adding search, bookmarks, accessibility-friendly text sizing, and dark mode.

The English text is a fresh, independent translation made from the Arabic source and reviewed against the public-domain Urdu edition of the booklet; it does not reuse the English translation or footnotes of the reference app or book. It includes 91 source/instruction footnotes translated from the booklet's printed Urdu notes. See `TRANSLATION.md` for details.

## Features

- Seven daily sections: Saturday through Friday
- 195 numbered supplications with Arabic and English shown together
- Fresh, independent English translation reviewed against the public-domain Urdu edition, with 91 source/instruction footnotes (see `TRANSLATION.md`)
- Full-text search across Arabic and English
- Persistent bookmarks
- Adjustable Arabic and English text sizes
- Optional English display toggle
- System, light, and dark themes
- Fully offline: no ads, analytics, account, tracking, or network permission

## Technology

- Kotlin
- Jetpack Compose Material 3
- Navigation Compose
- DataStore Preferences
- kotlinx.serialization
- minSdk 24, targetSdk 34

## Project layout

- `app/` — Android application source
- `app/src/main/assets/content/munajaat.json` — structured Arabic and English content with footnotes
- `app/src/main/assets/fonts/` — bundled Arabic font and license
- `tools/arabic_content.json` — Arabic source text and day/item structure
- `tools/english_translation.json` — fresh independent English translation
- `tools/build_content.py` — clean merge/build pipeline for the content asset
- `TRANSLATION.md` — translation provenance, review, and caveats
- `tools/verify_content.py` — structural content validator
- `BUILD.md` — SDK, build, test, lint, and signing instructions
- `PUBLISHING.md` — Google Play and F-Droid checklist

## Validate and build

```bash
python3 tools/verify_content.py app/src/main/assets/content/munajaat.json
./gradlew assembleDebug
./gradlew testDebugUnitTest
./gradlew lintDebug
```

The debug APK is written to:

```text
app/build/outputs/apk/debug/app-debug.apk
```

See `BUILD.md` for the complete Android SDK setup and release-signing instructions.

## Content and licensing note

The application source code is licensed under Apache-2.0 (see `LICENSE`). The English translation in this edition is a fresh, independent translation from the Arabic; it has not been copied from the reference app's translation or footnotes. It has not yet been reviewed by a qualified human scholar — obtain a qualified human scholarly review before publication. Before public distribution, also confirm that you have the necessary rights to redistribute bundled fonts and any imagery. Fonts should carry their own license files. See `PUBLISHING.md` for the publishing checklist.
