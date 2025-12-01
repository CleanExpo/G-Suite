# OpenRouter API Documentation

## Overview

OpenRouter provides a unified API to access 200+ AI models from various providers including OpenAI, Anthropic, Google, Meta, Mistral, and more.

## Installation

```bash
# Use OpenAI SDK (compatible)
pip install openai

# Or use requests
pip install requests
```

## Client Setup

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="sk-or-v1-...",
)
```

### TypeScript

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

### Using Fetch

```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://your-site.com",
    "X-Title": "Your App Name",
  },
  body: JSON.stringify({
    model: "anthropic/claude-sonnet-4",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});
```

## Basic Chat Completion

### Python

```python
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)
```

### TypeScript

```typescript
const completion = await client.chat.completions.create({
  model: "anthropic/claude-sonnet-4",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(completion.choices[0].message.content);
```

## Streaming Responses

### Python

```python
stream = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "Write a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### TypeScript

```typescript
const stream = await client.chat.completions.create({
  model: "anthropic/claude-sonnet-4",
  messages: [{ role: "user", content: "Write a story" }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

## Model Selection

### Popular Models

```python
# Anthropic
model = "anthropic/claude-sonnet-4"
model = "anthropic/claude-opus-4"
model = "anthropic/claude-3.5-haiku"

# OpenAI
model = "openai/gpt-4o"
model = "openai/gpt-4o-mini"
model = "openai/o1-preview"

# Google
model = "google/gemini-pro-1.5"
model = "google/gemini-flash-1.5"

# Meta
model = "meta-llama/llama-3.1-405b-instruct"
model = "meta-llama/llama-3.1-70b-instruct"

# Mistral
model = "mistralai/mistral-large"
model = "mistralai/mixtral-8x22b-instruct"

# Open Source
model = "deepseek/deepseek-chat"
model = "qwen/qwen-2.5-72b-instruct"
```

### Auto Router (Best Model Selection)

```python
response = client.chat.completions.create(
    model="openrouter/auto",  # Automatically selects best model
    messages=[{"role": "user", "content": "Complex question..."}]
)
```

## Provider Routing

### Specify Provider Preferences

```python
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "provider": {
            "order": ["Anthropic", "AWS Bedrock"],
            "allow_fallbacks": True
        }
    }
)
```

### Require Specific Provider

```python
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "Hello"}],
    extra_body={
        "provider": {
            "require": ["Anthropic"]
        }
    }
)
```

## Tool/Function Calling

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"}
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools,
    tool_choice="auto"
)

# Handle tool calls
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    # Execute function and continue conversation
```

## Vision (Multimodal)

```python
import base64

with open("image.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_data}"
                    }
                }
            ]
        }
    ]
)
```

## JSON Mode

```python
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[
        {"role": "user", "content": "List 3 colors as JSON array"}
    ],
    response_format={"type": "json_object"}
)
```

## Cost Management

### Get Model Pricing

```python
import requests

response = requests.get("https://openrouter.ai/api/v1/models")
models = response.json()["data"]

for model in models:
    print(f"{model['id']}: ${model['pricing']['prompt']}/1K input tokens")
```

### Track Usage

```python
# Response includes usage info
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "Hello"}]
)

# Access usage
print(f"Prompt tokens: {response.usage.prompt_tokens}")
print(f"Completion tokens: {response.usage.completion_tokens}")
```

### Set Spending Limits

Configure in OpenRouter dashboard or use request headers:

```python
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "Hello"}],
    extra_headers={
        "X-Max-Cost": "0.01"  # Max $0.01 for this request
    }
)
```

## Rate Limiting

```python
import time
from openai import RateLimitError

def make_request_with_retry(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="anthropic/claude-sonnet-4",
                messages=messages
            )
        except RateLimitError:
            wait_time = 2 ** attempt
            time.sleep(wait_time)
    raise Exception("Max retries exceeded")
```

## Request Headers

```python
# Important headers for attribution
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4",
    messages=[{"role": "user", "content": "Hello"}],
    extra_headers={
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Your App Name"
    }
)
```

## Model Fallbacks

```python
models_to_try = [
    "anthropic/claude-sonnet-4",
    "openai/gpt-4o",
    "google/gemini-pro-1.5"
]

for model in models_to_try:
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Hello"}]
        )
        break
    except Exception as e:
        print(f"{model} failed: {e}")
        continue
```

## List Available Models

```python
import requests

response = requests.get(
    "https://openrouter.ai/api/v1/models",
    headers={"Authorization": f"Bearer {api_key}"}
)

models = response.json()["data"]
for model in models[:10]:
    print(f"{model['id']}: {model['name']}")
```

## Check API Credits

```python
import requests

response = requests.get(
    "https://openrouter.ai/api/v1/auth/key",
    headers={"Authorization": f"Bearer {api_key}"}
)

data = response.json()["data"]
print(f"Credits remaining: ${data['limit'] - data['usage']}")
```

## Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

## FastAPI Integration

```python
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI()
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

class ChatRequest(BaseModel):
    message: str
    model: str = "anthropic/claude-sonnet-4"

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = client.chat.completions.create(
            model=request.model,
            messages=[{"role": "user", "content": request.message}]
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Best Practices

1. **Use model fallbacks** for reliability
2. **Track costs** with usage monitoring
3. **Set spending limits** to avoid surprise bills
4. **Use provider routing** for latency/cost optimization
5. **Include HTTP-Referer** for better rate limits
6. **Cache responses** when appropriate
7. **Use streaming** for better UX
8. **Handle rate limits** with exponential backoff
