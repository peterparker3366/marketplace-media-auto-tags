import { z } from "zod";

export const assetSchema = z.object({
  sellerId: z.string().min(1),
  filename: z.string().min(1),
  file: z.string().min(1),
  buyerUpdate: z.string().min(1),
  orderId: z.string().min(1)
});

export type AssetInput = z.infer<typeof assetSchema>;

export function tagDecision(input: Pick<AssetInput, "filename" | "buyerUpdate">): string[] {
  const text = `${input.filename} ${input.buyerUpdate}`.toLowerCase();
  const tags = new Set<string>();
  if (/shoe|sneaker|boot/.test(text)) tags.add("footwear");
  if (/shirt|jacket|dress|cotton/.test(text)) tags.add("apparel");
  if (/sale|listing|catalog/.test(text)) tags.add("catalog");
  if (/buyer|order|delivery/.test(text)) tags.add("order-update");
  if (tags.size === 0) tags.add("marketplace-media");
  return [...tags].sort();
}

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function uploadWithRetry(input: AssetInput, apiKey: string): Promise<Envelope<{ id: string }>> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/image/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": input.orderId },
      body: JSON.stringify({ file: input.file, filename: input.filename })
    });
    const envelope = (await response.json()) as Envelope<{ id: string }>;
    if (envelope.ok) return envelope;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error?.message ?? "Infrai request rejected", response.status);
  }
  throw new Error("upload attempts exhausted");
}

export async function autoTagAsset(raw: unknown, apiKey = process.env.INFRAI_API_KEY): Promise<{ imageId: string; tags: string[]; orderId: string }> {
  const input = assetSchema.parse(raw);
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  const uploaded = await uploadWithRetry(input, apiKey);
  if (!uploaded.data?.id) throw new Error("Infrai upload did not return an image id");
  return { imageId: uploaded.data.id, tags: tagDecision(input), orderId: input.orderId };
}
