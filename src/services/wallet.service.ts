/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { 
  ApiResponse, 
  WalletDTO, 
  WalletTransactionDTO, 
  WithdrawalResponse, 
  WithdrawalAccountBalanceResponse 
} from "../types/export_type_definitions";

export const walletService = {
  getWallet: async (): Promise<WalletDTO> => {
    const response = await api.get<ApiResponse<WalletDTO>>(
      API_ENDPOINTS.WALLET.ME
    );
    return response.data.data;
  },

  getTransactions: async (walletId: string): Promise<WalletTransactionDTO[]> => {
    const response = await api.get<ApiResponse<WalletTransactionDTO[]>>(
      API_ENDPOINTS.WALLET.TRANSACTIONS(walletId)
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  createWithdrawal: async (data: {
    amount: number;
    bankName: string;
    accountHolderName: string;
    bankAccountNumber: string;
    description?: string;
  }): Promise<WithdrawalResponse> => {
    const response = await api.post<ApiResponse<WithdrawalResponse>>(
      API_ENDPOINTS.WALLET.WITHDRAW,
      data
    );
    return response.data.data;
  },

  getAccountBalance: async (): Promise<WithdrawalAccountBalanceResponse> => {
    const response = await api.get<ApiResponse<WithdrawalAccountBalanceResponse>>(
      API_ENDPOINTS.WALLET.ACCOUNT_BALANCE
    );
    return response.data.data;
  },
};
