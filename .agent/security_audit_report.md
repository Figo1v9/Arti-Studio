
*** Security Audit - Critical Vulnerability Found ***

**Vulnerability**: Unauthenticated File Upload and Delete via Cloudflare Worker.
**Severity**: High (DoS, Cost, Data Loss).
**Location**: `cloudflare-worker/src/index.ts` and `src/services/upload.service.ts`.

**Description**:
The Cloudflare Worker exposes `/upload` and `/delete/:filename` endpoints publicly. It relies on `ALLOWED_ORIGINS` for CORS, but CORS is a browser-side restriction and can be easily bypassed by non-browser clients (e.g., cURL, Postman, Scripts).
Anyone who knows the Worker URL (exposed in frontend code) can:
1.  Upload any number of images up to 10MB each (Storage Cost + Bandwidth Cost DoS).
2.  Delete ANY image if they guess or know the filename (Data Loss).

**Recommendation**:
1.  **Frontend**: Send the Supabase User Access Token (JWT) in the `Authorization` header.
2.  **Worker**: Verify the JWT signature using Supabase's JWKS or a shared `SUPABASE_JWT_SECRET`.
    - If verifying JWT in Worker is complex without extra libraries, a simpler approach for *this specific session* is to use a shared "Upload Secret" (API Key) that only the server knows... but this is a Client-Side App, so we can't hide a secret key there.
    - Therefore, the ONLY way is proper JWT verification.
    - OR: Use Supabase Storage (which handles RLS natively) instead of custom R2 Worker. However, user is using R2 for cost/performance presumably.
    - **Proposed Fix (Intermediate)**: Add a simple secret header check. BUT we can't hide the secret in the React App.
    - **Better Fix**: The Worker should validate the JWT.

**Action Plan (User Confirmation Needed)**:
- I will explain this to the user.
- Since I cannot easily add "JWT Verification" library to the `cloudflare-worker` (it might break their build if not handled carefully), I will emphasize the risk.
- **Alternative**: If the user sends `Admin Secret` or `User Token`, the worker checks it.
- **Immediate Mitigation**: At least require *some* check, or move to Supabase Storage.

**Other Findings**:
- `EditImageModal` (Update/Delete): Uses client-side Supabase calls. If RLS is not set up on `gallery_images` table, anyone can edit/delete. I cannot check RLS, but I should warn the user to verify "Row Level Security" policies on `gallery_images` table.

**Next Step**: Inform user of the Worker Vulnerability and the RLS warning.
