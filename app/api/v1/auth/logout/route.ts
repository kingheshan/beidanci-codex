import { createClearAuthCookie } from "@/lib/auth-server";
import { apiJson } from "@/lib/mock-api-route-helpers";

export async function POST(_request: Request) {
  return apiJson(
    { ok: true },
    {
      headers: {
        "Set-Cookie": createClearAuthCookie()
      }
    }
  );
}
