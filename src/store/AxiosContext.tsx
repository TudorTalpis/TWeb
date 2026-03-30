import React, { createContext, useContext, useEffect, type ReactNode } from "react";
import type { AxiosInstance } from "axios";
import { apiClient, registerApiInterceptors } from "@/lib/apiClient";

const AxiosContext = createContext<AxiosInstance>(apiClient);

export function AxiosProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    registerApiInterceptors();
  }, []);

  return <AxiosContext.Provider value={apiClient}>{children}</AxiosContext.Provider>;
}

export function useAxios() {
  return useContext(AxiosContext);
}
