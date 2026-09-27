export type BuyerAddress = {
  id: string;
  address: string;
};

export type BuyerProfile = {
  buyerId: string;
  buyerPhone: string;
  addresses: BuyerAddress[];
  defaultAddressId: string;
};

function asAddressList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function uniqueAddresses(items: BuyerAddress[]): BuyerAddress[] {
  const seen = new Set<string>();
  return items.map((item, index) => {
    let id = item.id.trim() || `addr-${index}`;
    if (seen.has(id)) id = `addr-${index}`;
    seen.add(id);
    return { id, address: item.address };
  });
}

export function parseBuyerAddresses(data: Record<string, unknown>): BuyerAddress[] {
  const fromList = asAddressList(data.addresses).flatMap((item, index) => {
    if (typeof item === 'string') {
      const address = item.trim();
      return address ? [{ id: `addr-${index}`, address }] : [];
    }
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    const address = String(row.address ?? '').trim();
    if (!address) return [];
    return [{ id: String(row.id ?? `addr-${index}`), address }];
  });

  if (fromList.length > 0) return uniqueAddresses(fromList);

  const legacy = String(data.buyerAddress ?? '').trim();
  return legacy ? [{ id: 'addr-0', address: legacy }] : [];
}

export function resolveDefaultAddressId(addresses: BuyerAddress[], preferred?: string | null): string {
  if (preferred && addresses.some((item) => item.id === preferred)) return preferred;
  return addresses[0]?.id ?? '';
}

export function defaultBuyerAddress(profile: BuyerProfile | null | undefined): BuyerAddress | null {
  if (!profile?.addresses.length) return null;
  return profile.addresses.find((item) => item.id === profile.defaultAddressId) ?? profile.addresses[0] ?? null;
}

export function toBuyerProfile(id: string, data: Record<string, unknown>): BuyerProfile {
  const addresses = parseBuyerAddresses(data);
  return {
    buyerId: id,
    buyerPhone: String(data.buyerPhone ?? ''),
    addresses,
    defaultAddressId: resolveDefaultAddressId(addresses, String(data.defaultAddressId ?? '')),
  };
}

export function createBuyerAddress(address = ''): BuyerAddress {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return { id, address };
}

export function hasBuyerProfile(profile: BuyerProfile | null | undefined): profile is BuyerProfile {
  return Boolean(profile?.buyerPhone.trim() && profile.addresses.some((item) => item.address.trim()));
}
