# Anthropic Claude API Documentation

## Installation

```bash
# Python
pip install anthropic

# TypeScript/JavaScript
npm install @anthropic-ai/sdk
```

## Client Setup

### Python

```python
import anthropic

client = anthropic.Anthropic(
    api_key="your-api-key",  # or set ANTHROPIC_API_KEY env var
)
```

### TypeScript

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

## Basic Messages API

### Python

```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"}
    ]
)
print(message.content)
```

### TypeScript

```typescript
const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Hello, Claude" }
  ],
});
console.log(message.content);
```

## Streaming Responses

### Python

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a story"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### TypeScript

```typescript
const stream = await client.messages.stream({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a story" }],
});

for await (const event of stream) {
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    process.stdout.write(event.delta.text);
  }
}
```

## System Prompts

```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a helpful assistant that speaks like a pirate.",
    messages=[
        {"role": "user", "content": "Tell me about the weather"}
    ]
)
```

## Multi-turn Conversations

```python
messages = [
    {"role": "user", "content": "What is 2+2?"},
    {"role": "assistant", "content": "2+2 equals 4."},
    {"role": "user", "content": "And what is that times 3?"}
]

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=messages
)
```

## Tool Use (Function Calling)

### Define Tools

```python
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather in a given location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city and state, e.g. San Francisco, CA"
                },
                "unit": {
                    "type": "string",
                    "enum": ["celsius", "fahrenheit"],
                    "description": "Temperature unit"
                }
            },
            "required": ["location"]
        }
    }
]
```

### Using Tools

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather in NYC?"}]
)

# Check if tool use is requested
for block in response.content:
    if block.type == "tool_use":
        tool_name = block.name
        tool_input = block.input
        tool_use_id = block.id

        # Execute the tool and return result
        tool_result = execute_tool(tool_name, tool_input)

        # Continue conversation with tool result
        messages = [
            {"role": "user", "content": "What's the weather in NYC?"},
            {"role": "assistant", "content": response.content},
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": tool_result
                    }
                ]
            }
        ]

        final_response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            tools=tools,
            messages=messages
        )
```

## Vision (Image Analysis)

### Base64 Image

```python
import base64

with open("image.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": "Describe this image."
                }
            ],
        }
    ],
)
```

### URL Image

```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": "https://example.com/image.png",
                    },
                },
                {
                    "type": "text",
                    "text": "What's in this image?"
                }
            ],
        }
    ],
)
```

## PDF Document Support

```python
import base64

with open("document.pdf", "rb") as f:
    pdf_data = base64.standard_b64encode(f.read()).decode("utf-8")

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": pdf_data,
                    },
                },
                {
                    "type": "text",
                    "text": "Summarize this document."
                }
            ],
        }
    ],
)
```

## Extended Thinking

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000
    },
    messages=[{"role": "user", "content": "Solve this complex problem..."}]
)

# Access thinking and response
for block in response.content:
    if block.type == "thinking":
        print("Thinking:", block.thinking)
    elif block.type == "text":
        print("Response:", block.text)
```

## Batch Processing

```python
# Create batch request
batch = client.batches.create(
    requests=[
        {
            "custom_id": "request-1",
            "params": {
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Hello!"}]
            }
        },
        {
            "custom_id": "request-2",
            "params": {
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "How are you?"}]
            }
        }
    ]
)

# Check batch status
batch_status = client.batches.retrieve(batch.id)

# Get results when complete
if batch_status.status == "ended":
    results = client.batches.results(batch.id)
```

## Error Handling

```python
from anthropic import APIError, RateLimitError, APIConnectionError

try:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except RateLimitError as e:
    print(f"Rate limited: {e}")
    # Implement exponential backoff
except APIConnectionError as e:
    print(f"Connection error: {e}")
except APIError as e:
    print(f"API error: {e}")
```

## Available Models

| Model | Description |
|-------|-------------|
| `claude-sonnet-4-20250514` | Latest Sonnet model, balanced performance |
| `claude-opus-4-20250514` | Most capable model |
| `claude-3-5-haiku-20241022` | Fast, cost-effective model |
| `claude-3-5-sonnet-20241022` | Previous Sonnet version |

## Rate Limits and Pricing

- Rate limits vary by tier and model
- Implement exponential backoff for rate limit errors
- Use batch API for high-volume processing (50% cost reduction)
- Monitor usage via the Anthropic Console

## Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

## Best Practices

1. **Use system prompts** for consistent behavior
2. **Implement retry logic** with exponential backoff
3. **Stream responses** for better UX on long outputs
4. **Use tools** for structured outputs and external integrations
5. **Batch requests** for high-volume, non-time-sensitive tasks
6. **Cache responses** when appropriate to reduce costs
