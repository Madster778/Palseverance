# Palseverance

By Mohammed Mahdi Alom

## Description

Habit-tracker application with a virtual pet used as an incentive. Users can customise the pet by earning currency by getting longer habit streak. Users can add friends to message and discuss about their goals, and to compare ranks betweem friends.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js** (LTS version recommended)
- **npm** (comes bundled with Node.js)
- **Expo CLI**
- **Android Studio** for the Android emulator (to run the app on an Android virtual device)
- **Android Platform Tools** (for ADB)

Node.js and npm can be downloaded from the [Node.js official website](https://nodejs.org/).

To install Expo CLI, run the following command in your terminal:

```bash
npm install -g expo-cli
```

To install Expo Application Services (EAS), run the following command in your terminal:

```bash
npm install -g eas-cli
```

Make sure Android Studio is installed on your computer. You can download it from [Android Studio's official website](https://developer.android.com/studio).

To install Android Platform Tools:

1. **Download the Android SDK Platform Tools** from the [Android developer website](https://developer.android.com/studio#command-tools).
2. **Extract the downloaded zip file** to a location of your choice.
3. **Add the extracted directory to your system PATH:**

   - **Windows:**

     1. Open the Start Search, type in "env", and select "Edit the system environment variables."
     2. In the System Properties window, click on the "Environment Variables" button.
     3. In the Environment Variables window, under "System variables," find the `Path` variable, select it, and click "Edit."
     4. Click "New" and add the path to the extracted platform-tools directory.
     5. Click OK to save the changes and close all windows.

   - **macOS and Linux:**
     1. Open a terminal window.
     2. Open your shell profile file in a text editor (`~/.bash_profile`, `~/.zshrc`, or `~/.profile`).
     3. Add the following line to the file:
        ```bash
        export PATH=$PATH:/path/to/extracted/platform-tools
        ```
     4. Save the file and run `source ~/.bash_profile` or the equivalent for your shell.

## Installation

Unzip the `Palseverance.zip` file to a local directory on your machine.

Open a terminal in the project's root directory and run the following command to install all the necessary dependencies:

```bash
npm install
```

## Building the Project for the Emulator

1. Open Android Studio and Setup AVD Manager:

- Navigate to the "Tools" menu.
- Select "AVD Manager".
- Click "Create Virtual Device".
- Select a device definition (e.g., Pixel 3).
- Choose a system image (e.g., Android R API 30). If the system image is not installed, click "Download" next to the system image.
- After configuring the hardware profile and system image, click "Finish" to create the virtual device.

2. Start the Android Virtual Device:

- Start the desired Android virtual device from the AVD Manager by clicking on the green triangle next to your virtual device.

Before running the app, ensure your Android emulator is running. To build the project specifically for the emulator, execute the following command in the terminal

```bash
eas build --profile development --platform android
```

Follow the instructions in the terminal to complete the build process.

## Running the Project With an Android Emulator

To run the project on an Android emulator, follow these steps:

- Ensure the terminal is focused on the project directory where you initiated the command.
- Run:

```bash
npx expo start --dev-client
```

- Press 'a' to open the app on the Android emulator.

## Directory Structure

```
Palseverance/
├── .expo/                      # Expo configuration directory
├── %ProgramData%/              # System-specific configuration
├── functions/                  # Firebase cloud functions
│   ├── node_modules/
│   ├── .gitignore
│   ├── index.js                # Firestore cloud functions
│   ├── package-lock.json
│   └── package.json            # Firestore cloud function dependencies and scripts
├── node_modules/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── black-happy-cat.png
│   │   │   ├── black-neutral-cat.png
│   │   │   ├── black-sad-cat.png
│   │   │   ├── ginger-happy-cat.png
│   │   │   ├── ginger-neutral-cat.png
│   │   │   ├── ginger-sad-cat.png
│   │   │   ├── grey-happy-cat.png
│   │   │   ├── grey-neutral-cat.png
│   │   │   ├── grey-sad-cat.png
│   │   │   ├── white-happy-cat.png
│   │   │   ├── white-neutral-cat.png
│   │   │   ├── white-sad-cat.png
│   │   │   ├── glasses-black.png
│   │   │   ├── glasses-pink.png
│   │   │   ├── glasses-red.png
│   │   │   ├── hat-cowboy.png
│   │   │   ├── hat-straw.png
│   │   │   ├── hat-top.png
│   │   │   ├── palseverance-logo.png
│   │   ├── adaptive-icon.png
│   │   ├── favicon.png
│   │   ├── icon.png
│   │   └── splash.png
│   ├── firebase/
│   │   └── firebaseConfig.js   # Firebase configuration
│   ├── screens/
│   │   ├── BadgeScreen.js
│   │   ├── HabitsScreen.js
│   │   ├── HomeScreen.js
│   │   ├── InboxScreen.js
│   │   ├── LoginScreen.js
│   │   ├── MessageScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── RankScreen.js
│   │   ├── SettingsScreen.js
│   │   └── ShopScreen.js
│   └── utils/
│       └── petImages.js        # Pet images and accessories
├── .firebaserc                 # Firebase project configuration
├── .gitignore
├── App.js                      # Entry point for the React Native application
├── app.json                    # Expo configuration file
├── babel.config.js             # Babel configuration file
├── eas.json                    # Expo Application Services configuration
├── firebase.json               # Firebase service configuration
├── firestore.rules             # Firestore security rules
├── google-services.json        # Firebase configuration file
├── metro.config.js             # Metro bundler configuration file
├── package-lock.json
├── package.json                # Main project dependencies and scripts
└── README.md                   # Readme file with instructions and structure
```
