import { z } from "zod";
import { email, services } from "../../content";

const enquiry = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().regex(/^[+0-9 .()\-]{7,24}$/).refine((value) => value.replace(/\D/g, "").length >= 7),
  service: z.enum([...services.map(({ name }) => name), "Other enquiry"]),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(200).optional(),
});
const maxBody = 16_384;
const windowMs = 60_000;
const limits = new Map<string, { count: number; expires: number }>();

function reply(message: string, status: number) {
  return Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const host = request.headers.get("host") || requestUrl.host;
  const allowedOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : `${requestUrl.protocol}//${host}`;
  if (origin && origin !== allowedOrigin) return reply("This request came from an unsupported origin.", 403);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return reply("Send a JSON enquiry.", 415);

  const now = Date.now();
  const address = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "local";
  for (const [key, limit] of limits) if (limit.expires <= now) limits.delete(key);
  const limit = limits.get(address) ?? { count: 0, expires: now + windowMs };
  if (limit.count >= 5 || limits.size >= 4096) return reply("Too many attempts. Please try again in a minute.", 429);
  limit.count++;
  limits.set(address, limit);

  const reader = request.body?.getReader();
  if (!reader) return reply("Please check the fields and try again.", 400);
  let data;
  try {
    const decoder = new TextDecoder();
    let body = "";
    let length = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBody) {
        await reader.cancel();
        return reply("Your enquiry is too long.", 413);
      }
      body += decoder.decode(value, { stream: true });
    }
    data = JSON.parse(body + decoder.decode());
  } catch {
    return reply("Please check the fields and try again.", 400);
  }
  const parsed = enquiry.safeParse(data);
  if (!parsed.success) return reply("Please check the fields and try again.", 400);
  if (parsed.data.website) return reply("Enquiry received.", 200);

  const key = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM;
  if (!key || !from) return reply(`Online enquiries are temporarily unavailable. Please email ${email}.`, 503);

  const { name, email: replyTo, phone, service, message } = parsed.data;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [process.env.ENQUIRY_TO || email],
        reply_to: replyTo,
        subject: `TEAM website enquiry: ${service}`,
        text: `Name: ${name}\nEmail: ${replyTo}\nPhone: ${phone}\nService: ${service}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) return reply("Enquiry received.", 200);
    console.error("Enquiry provider returned HTTP %d", response.status);
  } catch {
    console.error("Enquiry provider request failed");
  }
  return reply(`Your enquiry could not be sent. Please try again or email ${email}.`, 502);
}
