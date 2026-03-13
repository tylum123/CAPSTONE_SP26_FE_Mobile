// Expo SDK 54 automatically loads .env.{NODE_ENV} — no manual dotenv needed.
const env = process.env.NODE_ENV || "development";

const apiBaseUrl =
  env === "development"
    ? process.env.API_BASE_URL_TEST || process.env.API_BASE_URL
    : process.env.API_BASE_URL;

module.exports = {
  expo: {
    name: "ArgoTemp",
    slug: "CAPSTONE_SP26_FE_Mobile",
    owner: "manh3101",
    scheme: "agrotemp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.tylum123.agrotemp",
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      API_BASE_URL: apiBaseUrl,
      API_BASE_URL_TEST: process.env.API_BASE_URL_TEST,
      API_TIMEOUT: process.env.API_TIMEOUT,
      NODE_ENV: env,
      GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
      eas: {
        projectId: "e583aaae-9c6d-4cbb-bfd6-15dba57c716c",
      },
    },
  },
};
