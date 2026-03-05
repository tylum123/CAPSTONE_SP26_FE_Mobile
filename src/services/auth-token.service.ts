import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/api";

export interface JwtClaims {
  [key: string]: unknown;
}

const USER_ID_CLAIM_KEYS = [
  "userId",
  "UserId",
  "sub",
  "nameid",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
] as const;

const WORKER_PROFILE_ID_CLAIM_KEYS = [
  "workerProfileId",
  "WorkerProfileId",
  "worker_profile_id",
] as const;

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }

  throw new Error("Base64 decoding is not available in this runtime.");
};

const parseJwtPayload = (token: string): JwtClaims | null => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length < 2) {
      return null;
    }

    const payloadJson = decodeBase64Url(tokenParts[1]);
    return JSON.parse(payloadJson) as JwtClaims;
  } catch {
    return null;
  }
};

const extractStringClaim = (
  payload: JwtClaims | null,
  keys: readonly string[],
): string | null => {
  if (!payload) {
    return null;
  }

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
};

export const authTokenService = {
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getTokenPayload: async (): Promise<JwtClaims | null> => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      return null;
    }

    return parseJwtPayload(token);
  },

  getCurrentUserId: async (): Promise<string | null> => {
    const payload = await authTokenService.getTokenPayload();
    return extractStringClaim(payload, USER_ID_CLAIM_KEYS);
  },

  getCurrentWorkerProfileId: async (): Promise<string | null> => {
    const payload = await authTokenService.getTokenPayload();
    return extractStringClaim(payload, WORKER_PROFILE_ID_CLAIM_KEYS);
  },
};
