import React, { useEffect, type ReactNode } from "react";
import { apiClient, registerApiInterceptors } from "@/lib/apiClient";
import { AxiosContext } from "./axios-context";

export function AxiosProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    registerApiInterceptors();
  }, []);

  return <AxiosContext.Provider value={apiClient}>{children}</AxiosContext.Provider>;
}
