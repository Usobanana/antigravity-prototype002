# Mobile Build Instructions (Capacitor)

This project uses [Capacitor](https://capacitorjs.com/) to build native iOS and Android apps from the web codebase.

## Prerequisites

- **Node.js** (Installed)
- **Android Studio** (For Android build)
- **Xcode** (For iOS build - Mac only)

## Workflow

The general workflow for updating the mobile apps is:

1.  **Modify Web Code**: Edit files in `src/`.
2.  **Build Web Assets**: Run `npm run build` to generate the `dist` folder.
3.  **Sync to Native**: Run `npx cap sync` to copy `dist` to Android/iOS projects.
4.  **Build/Run Native**: Open the native IDE to build/run.

### Quick Command
Run this after making changes to web code:
```bash
npm run build && npx cap sync
```

## Android Build (Windows/Mac)

1.  **Open Android Studio**:
    ```bash
    npx cap open android
    ```
2.  **Wait for Gradle Sync**: Let Android Studio download dependencies.
3.  **Run/Build**:
    - Connect an Android device or use an Emulator.
    - Click the **Run** (Play) button to debug.
    - Go to **Build > Build Bundle(s) / APK(s)** to create a release file.

## iOS Build (Mac Only)

1.  **Open Xcode**:
    ```bash
    npx cap open ios
    ```
2.  **Setup Signing**:
    - Click on the project root in the left navigator (App).
    - Go to **Signing & Capabilities**.
    - Select your Team.
3.  **Run/Build**:
    - Select a Simulator or connected iPhone.
    - Click **Product > Run**.
    - Go to **Product > Archive** to prepare for App Store submission.

## Configuration

- **App ID**: `com.example.antigravity002` (Change in `capacitor.config.json` if needed)
- **App Name**: `AntigravityPrototype002`
- **Icon/Splash**:
    - Replace generated icons in `android/app/src/main/res` and `ios/App/App/Assets.xcassets`.
    - Or use `capacitor-assets` tool to generate them automatically.
