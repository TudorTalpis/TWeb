import { apiClient } from "@/lib/apiClient";

export type MockServiceMode = "ok" | "failed" | "throw";

export type MockServiceResult<T> = { status: "ok"; data: T } | { status: "failed"; message: string };

export async function runMockService(mode: MockServiceMode): Promise<MockServiceResult<{ checkedAt: string }>> {
  const response = await apiClient.get<{ status: "ok" | "failed"; data?: { checkedAt: string }; message?: string }>(
    "/simulate/service",
    { params: { mode } },
  );

  if (response.data.status === "failed") {
    return { status: "failed", message: response.data.message || "Service returned failed status" };
  }

  return {
    status: "ok",
    data: {
      checkedAt: response.data.data?.checkedAt || new Date().toISOString(),
    },
  };
}
