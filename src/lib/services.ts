import type { ProviderProfile, Service } from "@/types";

export function getProviderDefaultBufferMinutes(
  provider?: Pick<ProviderProfile, "defaultServiceBufferMinutes"> | null
): number {
  const parsed = Number(provider?.defaultServiceBufferMinutes ?? 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

export function getEffectiveServiceBufferMinutes(
  service?: Pick<Service, "bufferMinutes"> | null,
  provider?: Pick<ProviderProfile, "defaultServiceBufferMinutes"> | null
): number {
  const customBuffer = service?.bufferMinutes;
  if (customBuffer !== null && customBuffer !== undefined) {
    const parsedCustom = Number(customBuffer);
    if (Number.isFinite(parsedCustom)) return Math.max(0, parsedCustom);
  }

  return getProviderDefaultBufferMinutes(provider);
}

