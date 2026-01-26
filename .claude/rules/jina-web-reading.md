# Jina AI Web Reading Rule

> **Priority**: Use Jina AI Reader API for all web content fetching and scraping tasks.

## Directive

When you need to read, scrape, or extract content from a web page, **always use the Jina AI Reader API** instead of internal scraping methods, browser automation, or direct fetch calls.

## Jina Reader API

**Endpoint**: `https://r.jina.ai/{url}`

**Authentication**: Bearer token via `JINA_API_KEY` environment variable.

### Usage Pattern

```bash
curl -s -H "Authorization: Bearer ${JINA_API_KEY}" \
     -H "Accept: text/markdown" \
     "https://r.jina.ai/https://example.com/page"
```

### What It Does

- Converts any web page to clean Markdown
- Strips ads, navigation, footers, and boilerplate
- Preserves code blocks, tables, and structured content
- Handles JavaScript-rendered pages (SPA content)
- Bypasses common bot detection (Cloudflare, etc.)

### When to Use

| Scenario                                | Use Jina? |
| --------------------------------------- | --------- |
| Reading documentation pages             | Yes       |
| Scraping npm/PyPI package info          | Yes       |
| Extracting article content              | Yes       |
| Fetching API reference docs             | Yes       |
| Reading GitHub READMEs                  | Yes       |
| Downloading binary files                | No        |
| Interacting with web apps (forms, auth) | No        |

### Response Format

Jina returns clean Markdown by default. The response includes:

- Page title
- Main content as Markdown
- Code blocks preserved with language hints
- Tables converted to Markdown tables
- Links preserved as Markdown links

### Fallback

If Jina returns a 403 or empty response (some sites block even Jina):

1. Try the GitHub mirror of the content if available
2. Try an alternative documentation source
3. Report the limitation to the user

### Windows SSL Note

On Windows, if you encounter `CRYPT_E_NO_REVOCATION_CHECK` errors, add `--ssl-no-revoke` to curl commands:

```bash
curl -s --ssl-no-revoke -H "Authorization: Bearer ${JINA_API_KEY}" \
     "https://r.jina.ai/https://example.com/page"
```

## Environment Variable

```bash
# .env
JINA_API_KEY=your-jina-api-key
```

The key is stored in the project `.env` file and must never be committed to version control.
