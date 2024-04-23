# Palseverance

By Mohammed Mahdi Alom

## Description

Habit-tracker application with a virtual pet used as an incentive. Users can customise the pet by earning currency by getting longer habit streak. Users can add friends to message and discuss about their goals, and to compare ranks betweem friends.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (LTS version recommended)
- npm (comes bundled with Node.js)
- Expo CLI
- Android Studio for the Android emulator (to run the app on an Android virtual device)

Node.js and npm can be downloaded from the [Node.js official website](https://nodejs.org/).

To install Expo CLI, run the following command in your terminal:

```bash
npm install -g expo-cli
```

Make sure Android Studio is installed on your computer. You can download it from [Android Studio's official website](https://developer.android.com/studio).

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
