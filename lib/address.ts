import "server-only";

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

export function formatAddress(address: AddressLike): string {
  return [
    address.fullName,
    [address.line1, address.line2].filter(Boolean).join(", "),
    `${address.city}, ${address.state} - ${address.pincode}`,
    `Phone: ${address.phone}`,
  ].join("\n");
}
