# Play Store Release Guide - SS Property Guru

## Step 1: Generate Release Keystore (One-time setup)

Open Command Prompt/Terminal and run:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save the password you enter! You'll need it later.

This will create `my-release-key.keystore` file in `android/app/` folder.

---

## Step 2: Configure Gradle for Signing

### 2.1: Create `android/gradle.properties` file (if not exists) and add:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

**Replace YOUR_KEYSTORE_PASSWORD and YOUR_KEY_PASSWORD with actual passwords**

### 2.2: Update `android/app/build.gradle`

Add this inside `android { }` block, before `buildTypes`:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
```

Then update `buildTypes` -> `release`:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

---

## Step 3: Build AAB (Android App Bundle) for Play Store

Run this command from project root:

```bash
cd android
./gradlew bundleRelease
```

**On Windows:**
```bash
cd android
gradlew bundleRelease
```

---

## Step 4: Find Your AAB File

After successful build, AAB file will be at:

```
android/app/build/outputs/bundle/release/app-release.aab
```

This is the file you upload to Play Store!

---

## Step 5: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Go to "Release" → "Production" → "Create new release"
4. Upload `app-release.aab` file
5. Fill in release notes
6. Submit for review

---

## Alternative: Build APK (For testing, not Play Store)

If you want APK for testing:

```bash
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Important Notes:

1. **Keep keystore file safe!** If you lose it, you can't update your app on Play Store
2. **Backup keystore** to secure location (Google Drive, etc.)
3. **Never commit keystore** to Git (already in .gitignore)
4. **Version Code:** Increment `versionCode` in `android/app/build.gradle` for each release
5. **Version Name:** Update `versionName` for user-visible version (e.g., "1.0.1")

---

## Current App Info:

- Package Name: `com.project.sspropertyguru`
- App Name: SS Property Guru
- Build location: `android/app/build/outputs/`

---

## Troubleshooting:

### Build fails with "Execution failed for task ':app:bundleReleaseJsAndAssets'"
- Run: `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle`
- Then try build again

### "Could not find or load main class org.gradle.wrapper.GradleWrapperMain"
- Delete `android/.gradle` folder
- Run build again

### Memory issues during build
- Add to `android/gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

---

## Quick Commands Summary:

```bash
# Generate keystore (one-time)
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Build AAB for Play Store
cd android && ./gradlew bundleRelease

# Build APK for testing
cd android && ./gradlew assembleRelease

# Clean build (if issues)
cd android && ./gradlew clean
```

---

Good luck with your Play Store release! 🚀
