
*** Security Audit Plan ***

1.  **Check for XSS sinks**: `dangerouslySetInnerHTML` usage.
2.  **Check for dangerous JS execution**: `eval()`, `new Function()`.
3.  **Check for client-side storage of sensitive data**: `localStorage`, `sessionStorage`, `cookies`.
4.  **Review Admin/Role logic**: Ensure `isAdmin` checks aren't just cosmetic UI hides but actually protected.
5.  **Review Uploads**: Check for proper type/size validation (already seen in upload.service.ts, but double check usage).
6.  **Review API calls**: Ensure no sensitive actions are purely client-side without RLS/Safety.

*** Findings so far ***
- Admin credentials were hardcoded (Fixed).
- Secrets moved to .env (Fixed).
- `dangerouslySetInnerHTML` scan in progress.
