export {};

// `role` lives in Clerk's publicMetadata, but sessionClaims only sees it
// once the session token is customized in the Clerk Dashboard (Sessions ->
// Customize session token -> add `{ "metadata": "{{user.public_metadata}}" }`).
// This just types what that customization puts on sessionClaims - see
// lib/adminAuth.ts for the actual admin check.
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: "admin";
    };
  }
}
