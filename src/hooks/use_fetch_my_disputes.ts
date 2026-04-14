/**
 * AI CONTEXT:
 * Action: Custom hook to fetch and manage worker's dispute report history.
 * Inputs: None (Uses authenticated worker token via disputeService).
 * Outputs: Loading state, error message, and array of DisputeReportDTO.
 * Dependencies: disputeService, useEffect, useState. */

import { useState, useEffect, useCallback } from "react";
import { disputeService } from "../services/dispute.service";
import { DisputeReportDTO } from "../types/export_type_definitions";

export function useFetchMyDisputes() {
  const [disputes, setDisputes] = useState<DisputeReportDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await disputeService.getMyDisputes();
      // Sort by latest created date
      const sorted = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setDisputes(sorted);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách khiếu nại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    disputes, 
    isLoading, 
    error, 
    refetch: fetchData 
  };
}
