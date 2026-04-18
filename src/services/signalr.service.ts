import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { CONFIG } from "../config/export_configurations";
import { authTokenService } from "./auth-token.service";

type EventCallback = (...args: any[]) => void;

class SignalRService {
  private static instance: SignalRService;
  public connection: HubConnection | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private isConnecting: boolean = false;

  private constructor() {}

  public static getInstance(): SignalRService {
    if (!SignalRService.instance) {
      SignalRService.instance = new SignalRService();
    }
    return SignalRService.instance;
  }

  public async startConnection() {
    if (this.connection && this.connection.state === "Connected") return;
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    try {
      const token = await authTokenService.getToken();
      if (!token) {
        this.isConnecting = false;
        return;
      }

      let baseUrl = CONFIG.API_BASE_URL;
      if (baseUrl.endsWith("/api/v1")) {
        baseUrl = baseUrl.replace("/api/v1", "");
      } else if (baseUrl.endsWith("/api")) {
        baseUrl = baseUrl.replace("/api", "");
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/chat`, {
          accessTokenFactory: async () => (await authTokenService.getToken()) ?? "",
        })
        .configureLogging(LogLevel.Warning)
        .withAutomaticReconnect()
        .build();

      const realtimeEvents = ["NewMessage", "ReceiveMessage", "newMessage", "receiveMessage", "MessageReceived"];
      
      for (const eventName of realtimeEvents) {
        this.connection.on(eventName, (raw: any) => {
          const cbs = this.listeners.get(eventName) || [];
          cbs.forEach(cb => cb(raw));
        });
      }

      this.connection.onreconnected(() => {
        console.log("SignalRService: Reconnected");
      });

      await this.connection.start();
      console.log("SignalRService: Connected");
    } catch (err) {
      console.log("SignalRService: Connection Error", err);
    } finally {
      this.isConnecting = false;
    }
  }

  public addListener(eventName: string, callback: EventCallback) {
    let cbs = this.listeners.get(eventName) || [];
    cbs.push(callback);
    this.listeners.set(eventName, cbs);
  }

  public removeListener(eventName: string, callback: EventCallback) {
    let cbs = this.listeners.get(eventName) || [];
    cbs = cbs.filter(cb => cb !== callback);
    this.listeners.set(eventName, cbs);
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  public async disconnect() {
    this.stopConnection();
    this.listeners.clear();
  }
}

export const signalRService = SignalRService.getInstance();
