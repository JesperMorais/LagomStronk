# Android APK Build Guide

This guide explains how to build LagomStronk as a native Android APK using Capacitor.

## Prerequisites

1. **Node.js** (v16 or later)
2. **Android Studio** with:
   - Android SDK
   - Android SDK Build-Tools
   - Android SDK Platform (API 33 or later recommended)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Capacitor (first time only)

```bash
npx cap add android
```

### 3. Sync Web Assets

Run this every time you update the web app:

```bash
npx cap sync
```

## Building the APK

### Option 1: Using Android Studio (Recommended)

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Wait for Gradle to sync

3. Build APK:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - The APK will be in `android/app/build/outputs/apk/debug/`

### Option 2: Command Line Build

```bash
cd android
./gradlew assembleDebug
```

The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

## Installing on Device

### Via USB

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run:
   ```bash
   npx cap run android
   ```

### Via APK File

1. Transfer the APK to your device
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Install and enjoy!

## Production Build

For a signed release APK:

1. Generate a keystore:
   ```bash
   keytool -genkey -v -keystore lagomstronk.keystore -alias lagomstronk -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure signing in `android/app/build.gradle`

3. Build release:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## Troubleshooting

### "SDK location not found"

Create `android/local.properties` with:
```
sdk.dir=/path/to/your/Android/Sdk
```

### Gradle sync fails

Try:
```bash
cd android
./gradlew clean
./gradlew build
```

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npx cap sync` | Sync web files to Android |
| `npx cap open android` | Open in Android Studio |
| `npx cap run android` | Build and run on device |
