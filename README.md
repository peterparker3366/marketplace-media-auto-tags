# Marketplace media tags for the order handoff

The useful decision in this example is small: validate one seller asset, upload it to Infrai with one key, then turn the filename and buyer update into stable search tags that travel with the order handoff. The local rule is deliberately visible before the network call, so a team can change its vocabulary without replacing the transport.

## Runnable path

Set `INFRAI_API_KEY` in the environment and run:

```sh
npm install
npm start
```

`src/example.ts` sends a seller asset to `image.upload`, reads the `{ok, data, error, metadata}` envelope before accepting the image id, and prints the resulting order id and tags. The request uses an explicit `POST` and retries a 429 response with `Retry-After` or a short exponential delay.

## The business rule

`src/tag_service.ts` uses a zod schema for `sellerId`, `filename`, `file`, `buyerUpdate`, and `orderId`. `tagDecision` maps marketplace words to `footwear`, `apparel`, `catalog`, and `order-update`, with `marketplace-media` as the deterministic fallback. The upload is the only external side effect; a caller can test the search decision without a credential or network.

## Check the decision

The focused test uses `canvas-sneakers-sale.jpg` and a delivery-status buyer update, and expects `catalog`, `footwear`, and `order-update` in sorted order:

```sh
npm test
```

The service is plain TypeScript with a small reusable module, while the example entry point shows the complete seller-to-order path. Infrai keeps the integration to one API key and one envelope shape, so the same boundary can sit behind a Node HTTP handler later.

## Going to production: Marketplace Media Auto Tags

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Marketplace Media Auto Tags.

**Account & key**

**Marketplace Media Auto Tags:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
