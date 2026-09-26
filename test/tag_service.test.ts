import assert from "node:assert/strict";
import { assetSchema, tagDecision } from "../src/tag_service.ts";

const input = assetSchema.parse({
  sellerId: "seller-42",
  filename: "canvas-sneakers-sale.jpg",
  file: "data:image/jpeg;base64,AA==",
  buyerUpdate: "Buyer asked for delivery status",
  orderId: "order-184"
});

assert.deepEqual(tagDecision(input), ["catalog", "footwear", "order-update"]);
console.log("tag decision test passed");
