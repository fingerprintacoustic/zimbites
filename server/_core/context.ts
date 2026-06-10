import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";

function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(name + '='));
  return cookie ? cookie.substring(name.length + 1) : undefined;
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  sessionRole?: string;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let sessionRole: string | undefined;

  try {
    // Authenticate request using SDK
    user = await sdk.authenticateRequest(opts.req);
    console.log("[tRPC Context] Auth success for user:", user?.openId);
    sessionRole = user?.role;
  } catch (error) {
    // Log error for debugging but don't crash
    console.warn("[tRPC Context] Auth failed:", String(error));
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    sessionRole,
  };
}
