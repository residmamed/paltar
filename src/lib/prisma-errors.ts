export const DATABASE_UNAVAILABLE_MESSAGE =
  "Verilənlər bazasına qoşulmaq mümkün olmadı. PostgreSQL-i işə salın (`npm run db:up`), sonra `npm run db:migrate` işlədin.";

export function isDatabaseUnavailable(error: unknown): boolean {
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? String(error.name)
      : "";
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "";

  return (
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error.code === "ECONNREFUSED" || error.code === "P1001" || error.code === "P2021")) ||
    (name === "PrismaClientKnownRequestError" &&
      message.includes("Invalid `prisma."))
  );
}

export async function emptyOnDatabaseUnavailable<T>(
  operation: () => Promise<T[]>,
): Promise<T[]> {
  try {
    return await operation();
  } catch (error) {
    if (isDatabaseUnavailable(error)) return [];
    throw error;
  }
}

export async function nullOnDatabaseUnavailable<T>(
  operation: () => Promise<T | null>,
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (isDatabaseUnavailable(error)) return null;
    throw error;
  }
}

export async function formStateOnDatabaseUnavailable<T extends { error?: string }>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { error: DATABASE_UNAVAILABLE_MESSAGE } as T;
    }
    throw error;
  }
}
