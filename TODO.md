# TODO

- [x] Fix immediate logout-after-login by adjusting auth 401/403 handling in `src/lib/api.ts` (avoid clearing token + redirect right after login).

- [ ] Ensure token extraction/storage is consistent between `LoginPage.tsx` and `authApi.login()`.
- [ ] Add lightweight debug logging for first token-expiry event (optional, can be kept behind a flag).
- [ ] Verify by running app and logging in again.

