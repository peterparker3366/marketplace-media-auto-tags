import { autoTagAsset } from "./tag_service.ts";

const result = await autoTagAsset({
  sellerId: "seller-42",
  filename: "canvas-sneakers-sale.jpg",
  file: "data:image/jpeg;base64,AA==",
  buyerUpdate: "Buyer asked for delivery status",
  orderId: "order-184"
});

console.log(JSON.stringify(result, null, 2));
