import { requestPhoneLoginCode } from "@/lib/auth-server";
import { parsePhoneCodePayload, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function POST(request: Request) {
  const input = await parsePhoneCodePayload(request);
  if (input instanceof Response) return input;

  return withApiErrors(() => requestPhoneLoginCode(input));
}
