// Business + support details shown in the footer, contact page and policy pages - edit here, not per page.
export const BUSINESS = {
  name: "Meraki Fine Silver",
  location: "Noida, Uttar Pradesh, India",
  email: "merakiindianoida@gmail.com",
  phoneDisplay: "+91 95991 33900",
  phoneHref: "tel:+919599133900",
  whatsappHref: "https://wa.me/919599133900",
  supportHours: "Monday to Saturday, 10 AM – 7 PM IST",
  website: "merakifinesilver.com",
} as const;

// Shared by every policy page so the numbers can't drift between them.
export const POLICY = {
  lastUpdated: "27 September 2026",
  shippingArea: "Delhi NCR",
  deliveryDays: "3–10 business days",
  returnWindowDays: 7,
  refundDays: "5–7 business days",
} as const;

export const POLICY_PAGES = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/refund-policy", label: "Refund & Returns" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
] as const;
