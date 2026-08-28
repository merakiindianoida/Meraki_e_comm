import "server-only";

// Not announced anywhere in the UI - a customer who never tries to save a
// 5th address never learns this exists. Only surfaced as an error at the
// moment they actually hit it (see app/account/addresses/actions.ts).
export const MAX_SAVED_ADDRESSES = 4;

type AddressLike = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

// Order.shippingAddress is a plain snapshot string (see schema.prisma) -
// this is the one place that formatting happens, shared by the
// saved-address path and the new-address path in POST /api/orders.
export function formatAddress(address: AddressLike): string {
  return [
    address.fullName,
    [address.line1, address.line2].filter(Boolean).join(", "),
    `${address.city}, ${address.state} - ${address.pincode}`,
    `Phone: ${address.phone}`,
  ].join("\n");
}
