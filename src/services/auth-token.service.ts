/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
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

const parseJwtPayload = (token: string): JwtClaims | null => {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length < 2) {
      return null;
    }

    const payloadBase64 = tokenParts[1];
    let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const payloadJson = decodeURIComponent(
      atob_poly(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    ).replace(/\0+$/, '').trim();

    return JSON.parse(payloadJson) as JwtClaims;
  } catch {
    return null;
  }
};

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function atob_poly(input: string) {
  let str = String(input).replace(/=+$/, '');
  let output = '';
  if (str.length % 4 === 1) return '';
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = B64_CHARS.indexOf(buffer);
  }
  return output;
}

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

let memoryToken: string | null = null;
let isMemoryTokenSet: boolean = false;
let isLoggingOutGlobal: boolean = false;

export const authTokenService = {
  setTokenToMemory: (token: string | null) => {
    memoryToken = token;
    isMemoryTokenSet = true;
  },

  getToken: async (): Promise<string | null> => {
    if (isMemoryTokenSet) return memoryToken;
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    memoryToken = token;
    isMemoryTokenSet = true;
    return token;
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

  isTokenExpired: (token: string): boolean => {
    const payload = parseJwtPayload(token);
    if (!payload || !payload.exp || typeof payload.exp !== "number") {
      return false; // If no exp, assume not expired (or let backend handle it)
    }
    // Convert current time to seconds
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  setIsLoggingOut: (value: boolean) => {
    isLoggingOutGlobal = value;
  },

  getIsLoggingOut: () => isLoggingOutGlobal,
};
