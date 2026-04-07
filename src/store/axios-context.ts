import { createContext } from "react";
import type { AxiosInstance } from "axios";
import { apiClient } from "@/lib/apiClient";

export const AxiosContext = createContext<AxiosInstance>(apiClient);
