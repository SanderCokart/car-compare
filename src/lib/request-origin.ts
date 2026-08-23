import { headers } from "next/headers";

/** Origin of the incoming request, used to call `/api/cars` from Server Components. */
export async function resolveRequestOrigin(): Promise<string | undefined> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return undefined;
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
