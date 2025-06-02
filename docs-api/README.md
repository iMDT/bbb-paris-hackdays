
# Development run

```sh
npm install
./node_modules/.bin/nodemon src/server.ts npx ts-node src/server.ts
```

# Sample requests

## Create a document

```sh
curl -X POST http://localhost:3000/create -H 'Content-type: application/json' -d '{"name": "Teste 17:24"}'
```

## Append content to a document

```sh
curl -X POST http://localhost:3000/append -H 'Content-type: application/json' -d '{"url": "https://docs-hackdays.h.elos.dev/docs/94cc77c6-d529-4a34-b665-597e3e38c057/", "markdownContent": "# Oi\n## Tchau\nTeste\n"}'
```

