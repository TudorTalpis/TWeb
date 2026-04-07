import { useContext } from "react";
import type { AxiosInstance } from "axios";
import { AxiosContext } from "./AxiosContext";

export function useAxios(): AxiosInstance {
  return useContext(AxiosContext);
}
