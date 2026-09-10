---
description: How to run, build, and deploy the SS Property Guru React Native app
---

# SS Property Guru - Development Workflow

## Prerequisites
- Node.js 22+
- JDK 17+ (download from https://adoptium.net)
- Android Studio (for SDK + emulator)
- Set environment variables: `JAVA_HOME`, `ANDROID_HOME`

## 1. Install Dependencies
// turbo
```bash
npm install --legacy-peer-deps
```

## 2. Start Metro Bundler
```bash
npx react-native start
```

## 3. Run on Android (in a new terminal)
```bash
npx react-native run-android
```

## 4. Build Debug APK Locally
// turbo
```bash
cd android && ./gradlew assembleDebug --no-daemon && cd ..
```
The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## 5. Push to GitHub (triggers CI build)
```bash
git add .
git commit -m "update: <describe changes>"
git push origin main
```
The GitHub Actions workflow will automatically build the APK. Download it from the Actions tab → latest run → Artifacts → `ss-property-guru-debug`.

## 6. Test OTP Login
Use OTP code: `1234`

## 7. API Integration (when backend is ready)
1. Update `BASE_URL` in `src/api/apiClient.js`
2. Uncomment the real API calls (marked with `// TODO`) in `authApi.js` and `propertyApi.js`
3. Remove the dummy `setTimeout` responses
