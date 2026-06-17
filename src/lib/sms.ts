/**
 * SMS sender abstraction. In development (SMS_PROVIDER=stub) codes are logged to
 * the server console. Swap in a real Azerbaijani SMS gateway in production by
 * implementing another branch here — the rest of the app is provider-agnostic.
 */
export async function sendSms(to: string, message: string): Promise<void> {
  const provider = process.env.SMS_PROVIDER ?? "stub";

  if (provider === "stub") {
    // eslint-disable-next-line no-console
    console.log(`\n[SMS:stub] to=${to}\n[SMS:stub] ${message}\n`);
    return;
  }

  // TODO(Phase 1 prod): integrate the chosen AZ SMS gateway using SMS_API_KEY.
  throw new Error(`SMS provider "${provider}" is not implemented yet`);
}
