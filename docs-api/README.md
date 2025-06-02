# Requirement

```
sudo npx playwright install
sudo npx playwright install-deps
```


# Development Setup

To start the project locally:

```bash
npm install
npm start
```

---

# Sample Requests

## 1. Create a Document

### Request

```bash
curl -X POST http://localhost:3099/create \
  -H 'Content-Type: application/json' \
  -d '{"name": "Teste 17:24"}'
```

### Response

```json
{
  "message": "Resource created successfully",
  "url": "https://server/docs/75586e8d-23ed-4545-b183-0a1485891df7/"
}
```

---

## 2. Append Content to a Document

### Request

```bash
curl -X POST http://localhost:3099/append \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://server/docs/75586e8d-23ed-4545-b183-0a1485891df7/",
    "markdownContent": "# Hello\n## Paris\nHello Paris!\n"
  }'
```

### Response

```json
{
  "message": "Content appended successfully",
  "markdownContent": "# Hello\n## Paris\nHello Paris!\n"
}
```
