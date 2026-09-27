// Delhi NCR PIN ranges we deliver to - enforced when an order is placed (app/api/orders/route.ts).
const SERVICEABLE_PIN_RANGES: ReadonlyArray<readonly [number, number]> = [
  [110001, 110099], // Delhi
  [201301, 201318], // Noida & Greater Noida
  [201001, 201019], // Ghaziabad
  [122001, 122022], // Gurugram
  [121001, 121013], // Faridabad
];

export const SERVICE_AREA_LABEL = "Delhi, Noida, Greater Noida, Ghaziabad, Gurugram and Faridabad";

export function isServiceablePincode(pincode: string): boolean {
  if (!/^\d{6}$/.test(pincode.trim())) return false;
  const pin = Number(pincode.trim());
  return SERVICEABLE_PIN_RANGES.some(([from, to]) => pin >= from && pin <= to);
}
