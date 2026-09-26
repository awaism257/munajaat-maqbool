# Publishing Checklist — Munajaat Maqbool

## 1. Rights and licensing

Before publishing:

- The English translation shipped in this edition is a fresh, independent translation from the Arabic source, reviewed against the public-domain Urdu edition (see `TRANSLATION.md`); it does not reuse the reference app's translation or footnotes. The 91 shipped footnotes are English translations of the booklet's own printed source/instruction notes.
- Confirm the license for every bundled font. Prefer OFL-licensed fonts and keep their license files in the repository.
- Add or confirm an open-source license for the application code (Apache-2.0 is a good fit for F-Droid).
- If text, font, artwork, or code have different licenses, state that clearly in the README.

Do not upload the app to a store until the content rights are resolved. In addition, obtain a review of the translation by a qualified human scholar before publication.

## 2. Release identity

- Application ID: `org.munajaat.maqbool`
- Version code: increase by 1 for every public release.
- Version name: semantic version such as `1.0.0`, `1.1.0`.
- Create a release keystore and keep it private. Never commit it to Git.

```bash
keytool -genkeypair -v \
  -keystore release.keystore \
  -alias munajaat \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Configure signing locally with environment variables or a private `keystore.properties` file; do not commit passwords.

## 3. Google Play

Google Play requires an Android App Bundle (AAB):

```bash
./gradlew bundleRelease
```

Output:

```text
app/build/outputs/bundle/release/app-release.aab
```

Prepare:

- Signed release AAB
- App icon and feature graphic
- At least two phone screenshots
- Short description (maximum 80 characters)
- Full description
- Privacy policy URL, even if the policy states that no data is collected
- Data safety form: no data collected, no data shared, no ads, no analytics
- Content rating questionnaire
- Target API level compliance

## 4. F-Droid

F-Droid builds from public source. The project is intended to remain free of proprietary SDKs, analytics, trackers, and closed-source dependencies.

Recommended additions before submission:

- Public Git repository URL
- OSI-approved code license file
- Fastlane metadata under `fastlane/metadata/android/en-US/`
- App icon and screenshots in Fastlane format
- Reproducible release APK or clear F-Droid build recipe
- Documentation for any content/font licenses

A typical F-Droid metadata file will specify:

- Categories: `Reading`, `Religion & Spirituality`
- License: selected code license
- SourceCode: public repository URL
- Builds: Gradle release build from a tagged commit
- `AllowedAPKSigningKeys` or reproducible-build settings as requested by F-Droid maintainers

Submit through the F-Droid Data repository merge-request process. Tag the exact release commit in Git.

## 5. Store text draft

### Short description

Offline Arabic-English reader for the seven daily sections of Munajaat-e-Maqbool.

### Full description

Munajaat Maqbool is a clean, modern, offline reader for the seven daily manzil sections of Munajaat-e-Maqbool. It presents each numbered Arabic supplication together with a fresh, independent English translation made from the Arabic source and reviewed against the public-domain Urdu edition, with 91 source and instruction footnotes.

Features include full-text search, bookmarks, adjustable Arabic and English text sizes, dark mode, and simple day-by-day navigation. The app contains no ads, analytics, accounts, tracking, or internet requirement.

## 6. Final pre-release checks

- **Target API level:** Google Play requires new releases to target the latest
  API level (currently 36 as of Aug 2026; the requirement bumps ~every August).
  Check https://developer.android.com/google/play/requirements/target-sdk
  before every release and bump `compileSdk`/`targetSdk` in
  `app/build.gradle.kts` (and the matching SDK platform/build-tools)
  accordingly. The v1.0.7 release was initially rejected for targeting API 35;
  this check would have caught it.
- **Version codes:** Version codes are consumed even by rejected/discarded
  draft releases — if Play says a version code is already used, bump
  versionCode by 1 and rebuild.

```bash
python3 tools/verify_content.py app/src/main/assets/content/munajaat.json
./gradlew clean assembleDebug testDebugUnitTest lintDebug
./gradlew assembleRelease bundleRelease
```

Then manually verify on a physical Android device:

- Arabic text direction and shaping
- Arabic/English ordering for every day
- Search results open the correct item
- Bookmarks persist after restarting
- Text-size and theme settings persist
- App works with airplane mode enabled
