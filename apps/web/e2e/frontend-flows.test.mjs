import assert from "node:assert/strict";
import { test } from "node:test";

const webBaseUrl = process.env.WEB_BASE_URL ?? "http://localhost:5173";
const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";

test("frontend search route returns the SPA shell", async () => {
  const response = await fetch(`${webBaseUrl}/documents`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /id="root"/);
});

test("frontend detail route returns the SPA shell for a real document", async () => {
  const documentsResponse = await fetch(`${apiBaseUrl}/api/documents?limit=1`);
  const documentsPayload = await documentsResponse.json();
  const documentId = documentsPayload.items?.[0]?.id;

  assert.equal(documentsResponse.status, 200);
  assert.equal(typeof documentId, "string");

  const detailResponse = await fetch(`${webBaseUrl}/documents/${encodeURIComponent(documentId)}`);
  const html = await detailResponse.text();

  assert.equal(detailResponse.status, 200);
  assert.match(html, /id="root"/);
});

test("frontend upload and review routes return the SPA shell", async () => {
  for (const path of ["/upload", "/review"]) {
    const response = await fetch(`${webBaseUrl}${path}`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /id="root"/);
  }
});
