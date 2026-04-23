# PromptLab ⚡

Compare and optimise prompts across 5 free LLMs simultaneously.

## Quick start

```bash
npm install
npm run dev
# → http://localhost:3000
```

Works immediately with built-in mock responses — no API key needed.

## Add real LLM responses

1. Get a free key at https://openrouter.ai/keys
2. Copy `.env.example` to `.env.local`
3. Add your key: `OPENROUTER_API_KEY=sk-or-...`
4. Restart the dev server

## Free models included

| Model | Provider | OpenRouter ID |
|-------|----------|---------------|
| Llama 3 | Meta | `meta-llama/llama-3-8b-instruct:free` |
| Mistral 7B | Mistral AI | `mistralai/mistral-7b-instruct:free` |
| Gemma 7B | Google | `google/gemma-7b-it:free` |
| Mixtral 8x7B | Mistral AI | `mistralai/mixtral-8x7b-instruct:free` |
| Phi-3 Mini | Microsoft | `microsoft/phi-3-mini-128k-instruct:free` |

## Deploy to Vercel

```bash
npx vercel --prod
# Add OPENROUTER_API_KEY in Vercel dashboard → Settings → Environment Variables
```
