import { loadAdminSellListing } from '@/lib/admin-listings-data';
import { BUYER_DETAIL_LABEL } from '@/lib/profile-labels';
import { formatCount, isListingClosed, isRemainingShort, joinAvailable, quantityAmount, replaceQuantityNumber } from '@/lib/sell-display';
import {
  getAuthUser,
  getDocument,
  hasFirebaseAdminConfig,
  queryDocuments,
  setDocument,
  updateDocument,
} from '@/lib/firebase-rest-admin';
import { defaultBuyerAddress, hasBuyerProfile, toBuyerProfile } from '@/types/buyer';
import { isJoinPaid, isJoinShipped, openJoinTotal, type SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

const COLLECTION = 'sellJoins';

function toJoin(id: string, data: Record<string, unknown>): SellJoin | null {
  if (!data.listingId || !data.buyerId || !data.quantity) return null;
  return {
    id,
    listingId: String(data.listingId),
    sellerId: String(data.sellerId ?? ''),
    buyerId: String(data.buyerId),
    buyerEmail: String(data.buyerEmail ?? ''),
    buyerName: String(data.buyerName ?? ''),
    buyerAddress: String(data.buyerAddress ?? ''),
    quantity: Number(data.quantity) || 0,
    status: data.status === 'confirmed' ? 'confirmed' : 'open',
    createdAt: String(data.createdAt ?? ''),
    confirmedAt: data.confirmedAt ? String(data.confirmedAt) : undefined,
    paymentStatus: data.paymentStatus === 'paid' ? 'paid' : data.paymentStatus === 'pending' ? 'pending' : undefined,
    paidAt: data.paidAt ? String(data.paidAt) : undefined,
    shippingStatus: data.shippingStatus === 'shipped' ? 'shipped' : data.shippingStatus === 'pending' ? 'pending' : undefined,
    shippedAt: data.shippedAt ? String(data.shippedAt) : undefined,
    trackingNumber: data.trackingNumber ? String(data.trackingNumber) : undefined,
  };
}

async function loadListing(listingId: string): Promise<SellListing | null> {
  if (!hasFirebaseAdminConfig()) return null;
  return loadAdminSellListing(listingId);
}

async function loadJoin(joinId: string): Promise<SellJoin | null> {
  const data = await getDocument(COLLECTION, joinId);
  if (!data) return null;
  return toJoin(joinId, data);
}

function assertSellerJoin(join: SellJoin, sellerId: string) {
  if (join.sellerId !== sellerId) throw new Error('본인 상품의 구매 신청만 관리할 수 있습니다.');
  if (join.status !== 'confirmed') throw new Error('판매 확정된 구매 신청만 관리할 수 있습니다.');
}

async function loadJoins(whereField: string, value: string): Promise<SellJoin[]> {
  const docs = await queryDocuments(COLLECTION, whereField, value);
  return docs
    .map((entry) => toJoin(entry.id, entry.data))
    .filter((item): item is SellJoin => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function loadJoinsForListing(listingId: string): Promise<SellJoin[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadJoins('listingId', listingId);
}

export async function loadJoinsForBuyer(buyerId: string): Promise<SellJoin[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadJoins('buyerId', buyerId);
}

export async function loadJoinsForSeller(sellerId: string): Promise<SellJoin[]> {
  if (!hasFirebaseAdminConfig()) return [];
  return loadJoins('sellerId', sellerId);
}

export async function loadJoinsForListings(listingIds: string[]): Promise<Record<string, SellJoin[]>> {
  const unique = [...new Set(listingIds.filter(Boolean))];
  const entries = await Promise.all(unique.map(async (id) => [id, await loadJoinsForListing(id)] as const));
  return Object.fromEntries(entries);
}

function listingLimits(item: SellListing) {
  const min = quantityAmount(item.minPurchaseLabel) ?? 0;
  const remaining = quantityAmount(item.remainingLabel) ?? 0;
  const limit = quantityAmount(item.limitLabel || item.quantityLabel || item.remainingLabel) ?? remaining;
  const openJoins = (joins: SellJoin[]) => joins.filter((join) => join.status === 'open');
  const gathered = (joins: SellJoin[]) => openJoinTotal(openJoins(joins));
  const available = (joins: SellJoin[]) => joinAvailable(limit, remaining, gathered(joins));
  return { min, remaining, limit, openJoins, gathered, available };
}

export async function createSellJoinForBuyer(
  buyerId: string,
  listingId: string,
  quantity: number,
): Promise<SellJoin> {
  if (!hasFirebaseAdminConfig()) {
    throw new Error('저장소를 연결하지 못했습니다.');
  }

  const listing = await loadListing(listingId);
  if (!listing) throw new Error('없는 상품입니다.');
  if (listing.sellerId === buyerId) throw new Error('본인이 올린 상품에는 구매 신청할 수 없습니다.');
  if (isRemainingShort(listing.minPurchaseLabel, listing.remainingLabel)) {
    throw new Error('잔여 수량이 부족해 구매 신청할 수 없습니다.');
  }
  if (isListingClosed(listing)) throw new Error('마감된 상품입니다.');

  const buyerData = await getDocument('buyerProfiles', buyerId);
  const buyerProfile = buyerData ? toBuyerProfile(buyerId, buyerData) : null;
  if (!hasBuyerProfile(buyerProfile)) {
    throw new Error(`${BUYER_DETAIL_LABEL}이 필요합니다.`);
  }
  const delivery = defaultBuyerAddress(buyerProfile);
  if (!delivery?.address) throw new Error('주문에 쓸 배송 주소를 골라 주세요.');

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('구매 수량은 1 이상 숫자로 입력해 주세요.');
  }

  const joins = await loadJoinsForListing(listingId);
  const limits = listingLimits(listing);
  const available = limits.available(joins);
  if (quantity > available) {
    throw new Error(
      `지금 더 받을 수 있는 수량은 ${formatCount(available)}입니다. 한계 ${formatCount(limits.limit)} 중 이미 ${formatCount(limits.gathered(joins))}가 신청했습니다.`,
    );
  }

  const authUser = await getAuthUser(buyerId);
  const join: SellJoin = {
    id: `j-${crypto.randomUUID()}`,
    listingId,
    sellerId: listing.sellerId,
    buyerId,
    buyerEmail: authUser?.email ?? '',
    buyerName: authUser?.displayName?.trim() || '',
    buyerAddress: delivery.address,
    quantity,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  await setDocument(COLLECTION, join.id, join);
  return join;
}

export async function confirmSellJoinsForSeller(
  sellerId: string,
  listingId: string,
): Promise<{ joins: SellJoin[]; remainingLabel: string }> {
  if (!hasFirebaseAdminConfig()) {
    throw new Error('저장소를 연결하지 못했습니다.');
  }

  const listing = await loadListing(listingId);
  if (!listing) throw new Error('없는 상품입니다.');
  if (listing.sellerId !== sellerId) throw new Error('본인 상품만 판매 확정할 수 있습니다.');

  const limits = listingLimits(listing);
  const joins = await loadJoinsForListing(listingId);
  const openJoins = limits.openJoins(joins);
  const gathered = limits.gathered(joins);
  const canMoreTrade = limits.remaining >= limits.min && limits.min > 0 && !isListingClosed(listing);
  const canConfirm = gathered >= limits.min && limits.min > 0 && canMoreTrade;

  if (!canConfirm) {
    throw new Error('판매 확정 조건을 충족하지 못했습니다.');
  }

  const confirmedAt = new Date().toISOString();
  const confirmedAmount = Math.min(openJoinTotal(openJoins), limits.remaining);
  const nextRemaining = Math.max(0, limits.remaining - confirmedAmount);
  const remainingLabel = replaceQuantityNumber(listing.remainingLabel, nextRemaining);

  const confirmed = await Promise.all(
    openJoins.map(async (item) => {
      const next: SellJoin = {
        ...item,
        status: 'confirmed',
        confirmedAt,
        paymentStatus: 'pending',
      };
      await setDocument(COLLECTION, item.id, next);
      return next;
    }),
  );

  await setDocument('sellListings', listingId, { remainingLabel });

  return { joins: confirmed, remainingLabel };
}

export async function markSellJoinPaidForSeller(sellerId: string, joinId: string): Promise<SellJoin> {
  if (!hasFirebaseAdminConfig()) throw new Error('저장소를 연결하지 못했습니다.');

  const join = await loadJoin(joinId);
  if (!join) throw new Error('없는 구매 신청입니다.');
  assertSellerJoin(join, sellerId);
  if (isJoinPaid(join)) throw new Error('이미 결제 완료로 표시된 신청입니다.');

  const paidAt = new Date().toISOString();
  await updateDocument(COLLECTION, joinId, { paymentStatus: 'paid', paidAt, shippingStatus: 'pending' });
  return { ...join, paymentStatus: 'paid', paidAt, shippingStatus: 'pending' };
}

export async function markSellJoinPendingForSeller(sellerId: string, joinId: string): Promise<SellJoin> {
  if (!hasFirebaseAdminConfig()) throw new Error('저장소를 연결하지 못했습니다.');

  const join = await loadJoin(joinId);
  if (!join) throw new Error('없는 구매 신청입니다.');
  assertSellerJoin(join, sellerId);
  if (!isJoinPaid(join)) throw new Error('결제 완료 상태가 아닙니다.');

  await updateDocument(COLLECTION, joinId, { paymentStatus: 'pending' }, [
    'paidAt',
    'shippingStatus',
    'shippedAt',
    'trackingNumber',
  ]);
  const next: SellJoin = { ...join, paymentStatus: 'pending' };
  delete next.paidAt;
  delete next.shippedAt;
  delete next.shippingStatus;
  delete next.trackingNumber;
  return next;
}

export async function markSellJoinShippedForSeller(
  sellerId: string,
  joinId: string,
  trackingNumber?: string,
): Promise<SellJoin> {
  if (!hasFirebaseAdminConfig()) throw new Error('저장소를 연결하지 못했습니다.');

  const join = await loadJoin(joinId);
  if (!join) throw new Error('없는 구매 신청입니다.');
  assertSellerJoin(join, sellerId);
  if (!isJoinPaid(join)) throw new Error('결제 완료 후에만 배송 완료를 표시할 수 있습니다.');
  if (isJoinShipped(join)) throw new Error('이미 배송 완료로 표시된 신청입니다.');

  const shippedAt = new Date().toISOString();
  const tracking = trackingNumber?.trim() || undefined;
  await updateDocument(
    COLLECTION,
    joinId,
    {
      shippingStatus: 'shipped',
      shippedAt,
      ...(tracking ? { trackingNumber: tracking } : {}),
    },
  );
  return { ...join, shippingStatus: 'shipped', shippedAt, trackingNumber: tracking };
}

export async function markSellJoinShippingPendingForSeller(sellerId: string, joinId: string): Promise<SellJoin> {
  if (!hasFirebaseAdminConfig()) throw new Error('저장소를 연결하지 못했습니다.');

  const join = await loadJoin(joinId);
  if (!join) throw new Error('없는 구매 신청입니다.');
  assertSellerJoin(join, sellerId);
  if (!isJoinPaid(join) || !isJoinShipped(join)) throw new Error('배송 완료 상태가 아닙니다.');

  await updateDocument(COLLECTION, joinId, { shippingStatus: 'pending' }, ['shippedAt', 'trackingNumber']);
  const next: SellJoin = { ...join, shippingStatus: 'pending' };
  delete next.shippedAt;
  delete next.trackingNumber;
  return next;
}
