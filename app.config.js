import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

const apiBaseUrl =
  env === "development"
    ? process.env.API_BASE_URL_TEST || process.env.API_BASE_URL
    : process.env.API_BASE_URL;

export default {
  expo: {
    name: "CAPSTONE_SP26_FE_Mobile",
    slug: "CAPSTONE_SP26_FE_Mobile",
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
    },
  },
};
