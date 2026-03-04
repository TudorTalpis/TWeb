export type MockServiceMode = "ok" | "failed" | "throw";

export type MockServiceResult<T> =
  | { status: "ok"; data: T }
  | { status: "failed"; message: string };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runMockService(mode: MockServiceMode): Promise<MockServiceResult<{ checkedAt: string }>> {
  await delay(250);

  if (mode === "throw") {
    throw new Error("Mock service crashed unexpectedly");
  }

  if (mode === "failed") {
    return { status: "failed", message: "Mock service returned status failed" };
  }

  return { status: "ok", data: { checkedAt: new Date().toISOString() } };
}
