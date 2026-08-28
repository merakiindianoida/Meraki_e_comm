// Shared slim-box field markup for an address - used by AddressForm (the
// account/addresses page) and CheckoutClient's "use a new address" section,
// so both stay visually and structurally identical.
export type AddressFieldDefaults = {
  label?: string | null;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
};

export default function AddressFields({
  defaults,
  showLabel = true,
}: {
  defaults?: AddressFieldDefaults;
  showLabel?: boolean;
}) {
  return (
    <>
      {showLabel && (
        <div>
          <label htmlFor="label" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Label (optional)
          </label>
          <input
            id="label"
            name="label"
            placeholder="Home, Office, ..."
            defaultValue={defaults?.label ?? ""}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            defaultValue={defaults?.fullName}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={defaults?.phone}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="line1" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Address line 1
        </label>
        <input
          id="line1"
          name="line1"
          required
          defaultValue={defaults?.line1}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label htmlFor="line2" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Address line 2 (optional)
        </label>
        <input
          id="line2"
          name="line2"
          defaultValue={defaults?.line2 ?? ""}
          className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            City
          </label>
          <input
            id="city"
            name="city"
            required
            defaultValue={defaults?.city}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="state" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            State
          </label>
          <input
            id="state"
            name="state"
            required
            defaultValue={defaults?.state}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="pincode" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            PIN code
          </label>
          <input
            id="pincode"
            name="pincode"
            inputMode="numeric"
            required
            defaultValue={defaults?.pincode}
            className="mt-1 w-full border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
          />
        </div>
      </div>
    </>
  );
}
