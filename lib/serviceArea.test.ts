import { describe, expect, it } from "vitest";
import { isServiceablePincode } from "@/lib/serviceArea";

describe("isServiceablePincode", () => {
  it.each(["110001", "110092", "201301", "201310", "201014", "122001", "121001", " 110017 "])(
    "accepts NCR pin %s",
    (pin) => {
      expect(isServiceablePincode(pin)).toBe(true);
    }
  );

  it.each(["400001", "560001", "110100", "201319", "122023", "121014", "201020"])(
    "rejects non-NCR pin %s",
    (pin) => {
      expect(isServiceablePincode(pin)).toBe(false);
    }
  );

  it.each(["", "11001", "1100011", "abcdef", "11000a"])("rejects malformed %s", (pin) => {
    expect(isServiceablePincode(pin)).toBe(false);
  });
});
