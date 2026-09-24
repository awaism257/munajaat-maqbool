# BUILD — Munajaat Maqbool

Native Android app: Kotlin + Jetpack Compose Material 3, single activity.
Package: `org.munajaat.maqbool` · minSdk 24 · target/compileSdk 36.

> **IMPORTANT — Google Play target API requirement:** Google Play requires new
> releases to target the latest API level (currently 36 as of Aug 2026; the
> requirement bumps ~every August). Before each release, check
> https://developer.android.com/google/play/requirements/target-sdk and bump
> `compileSdk`/`targetSdk` in `app/build.gradle.kts` accordingly (and install
> the matching `platforms;android-XX` / `build-tools;XX.0.0`).

## Prerequisites

- **JDK 17** (verified with OpenJDK 17.0.20).
- **Android SDK** with `platforms;android-36` and `build-tools;36.0.0`.
- **Gradle 8.7** — the checked-in Gradle wrapper (`./gradlew`) downloads it automatically.

### SDK setup (command line, Linux)

```bash
export ANDROID_HOME=$HOME/android-sdk
mkdir -p $ANDROID_HOME/cmdline-tools
curl -sSL -o /tmp/cmdtools.zip \
  https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q /tmp/cmdtools.zip -d $ANDROID_HOME/cmdline-tools
mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
  "platforms;android-36" "build-tools;36.0.0" "platform-tools"
```

Tell Gradle where the SDK is (either is sufficient):

```bash
echo "sdk.dir=$HOME/android-sdk" > local.properties   # repo-local, git-ignored
# or: export ANDROID_HOME=$HOME/android-sdk
```

> Low-memory environments: `gradle.properties` already caps the Gradle and Kotlin
> daemons at 1 GiB and runs the Kotlin compiler in-process. If the Gradle daemon
> still disappears (OOM), close other processes and retry.

## Content asset

The app reads the committed asset `app/src/main/assets/content/munajaat.json`
(data contract in `/mnt/agents/output/SPEC.md`). The asset is checked by
`tools/verify_content.py`, and the committed JSON is all the Android build
needs.

To regenerate the asset, run the clean merge pipeline, which combines
`tools/arabic_content.json` (Arabic text and structure) with
`tools/english_translation.json` (fresh independent English translation, with
each item's footnote list) and carries the footnotes through:

```bash
python3 tools/build_content.py
python3 tools/verify_content.py app/src/main/assets/content/munajaat.json
```

No external artifacts are required. `app/src/main/assets/content/munajaat.sample.json`
documents the expected format for tests and future content edits. If the real
asset is missing, the app still builds and shows a clear "Content unavailable"
error screen with a retry action.

## Build

```bash
./gradlew assembleDebug          # debug APK
./gradlew testDebugUnitTest      # JVM unit tests (content contract parsing)
./gradlew lintDebug              # Android lint
```

Debug APK output:

```
app/build/outputs/apk/debug/app-debug.apk
```

## Release APK / signing

Release builds require a keystore (not committed):

```bash
keytool -genkeypair -v -keystore release.keystore -alias munajaat \
  -keyalg RSA -keysize 2048 -validity 10000
./gradlew assembleRelease
$ANDROID_HOME/build-tools/36.0.0/apksigner sign --ks release.keystore \
  app/build/outputs/apk/release/app-release-unsigned.apk
```

In this environment only the debug APK is delivered, signed with the default
debug keystore.
