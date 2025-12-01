# Google Gemini API Documentation

## Installation

### Python (New Google GenAI SDK)

```bash
pip install google-genai
```

### TypeScript/JavaScript (New SDK)

```bash
npm install @google/genai
```

### Legacy SDK (Still Supported)

```bash
# Python
pip install google-generativeai

# JavaScript
npm install @google/generative-ai
```

## Client Setup

### Python (New SDK - Recommended)

```python
from google import genai

# API key from environment or explicit
client = genai.Client(api_key="YOUR_API_KEY")
# Or set GEMINI_API_KEY environment variable
client = genai.Client()
```

### TypeScript (New SDK - Recommended)

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

### Legacy Python SDK

```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-2.5-flash")
```

## Available Models (Latest 2025)

| Model | Description | Context Window |
|-------|-------------|----------------|
| `gemini-2.5-pro` | Most powerful, adaptive thinking | 1M tokens |
| `gemini-2.5-flash` | Fast, balanced performance | 1M tokens |
| `gemini-2.5-flash-lite` | Cost-effective, high performance | 1M tokens |
| `gemini-2.0-flash-001` | GA model, fast responses | 1M tokens |
| `gemini-2.0-flash-lite` | Optimized for speed & cost | 1M tokens |
| `gemini-embedding-001` | Text embeddings | N/A |

### Experimental/Preview Models

```python
# Latest preview models
model = "gemini-2.5-pro-preview-06-05"      # Latest Pro preview
model = "gemini-2.5-flash-preview-05-20"    # Flash with adaptive thinking
model = "gemini-2.0-flash-thinking-exp"     # Thinking mode
```

## Basic Text Generation

### Python (New SDK)

```python
from google import genai

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain quantum computing in simple terms"
)
print(response.text)
```

### TypeScript (New SDK)

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain quantum computing in simple terms"
});
console.log(response.text);
```

## Streaming Responses

### Python

```python
from google import genai

client = genai.Client()

for chunk in client.models.generate_content_stream(
    model="gemini-2.5-flash",
    contents="Write a story about a robot"
):
    print(chunk.text, end="", flush=True)
```

### TypeScript

```typescript
const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: "Write a story about a robot"
});

for await (const chunk of stream) {
    process.stdout.write(chunk.text);
}
```

## Multi-turn Chat

### Python

```python
from google import genai

client = genai.Client()

# Create a chat session
chat = client.chats.create(model="gemini-2.5-flash")

# Send messages
response = chat.send_message("Hello! What's your name?")
print(response.text)

response = chat.send_message("Can you help me with Python?")
print(response.text)

# Get chat history
history = chat.get_history()
```

### TypeScript

```typescript
const chat = ai.chats.create({ model: "gemini-2.5-flash" });

const response1 = await chat.sendMessage("Hello!");
console.log(response1.text);

const response2 = await chat.sendMessage("Tell me more");
console.log(response2.text);
```

## System Instructions

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Good morning! How are you?",
    config=types.GenerateContentConfig(
        system_instruction="You are a friendly pirate. Speak like one."
    )
)
print(response.text)
```

## Thinking Mode (Gemini 2.5)

Gemini 2.5 models support adaptive thinking for complex reasoning:

### Python

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Solve this step by step: What is 15% of 340?",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=8192,  # Token budget for thinking
            include_thoughts=True   # Include reasoning in response
        )
    )
)

# Access thinking and response
print("Thinking:", response.candidates[0].thinking)
print("Response:", response.text)
```

### TypeScript (AI SDK)

```typescript
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const { text, reasoning } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: "What is the sum of the first 10 prime numbers?",
    providerOptions: {
        google: {
            thinkingConfig: {
                thinkingBudget: 8192,
                includeThoughts: true,
            },
        },
    },
});

console.log("Response:", text);
console.log("Reasoning:", reasoning);
```

## JSON Mode (Structured Output)

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Give me information for the United States.",
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema={
            "type": "OBJECT",
            "required": ["name", "population", "capital", "continent"],
            "properties": {
                "name": {"type": "STRING"},
                "population": {"type": "INTEGER"},
                "capital": {"type": "STRING"},
                "continent": {"type": "STRING"},
                "gdp": {"type": "INTEGER"},
                "official_language": {"type": "STRING"},
            },
        },
    ),
)
print(response.text)  # Returns valid JSON
```

## Function Calling (Tools)

### Define and Use Tools

```python
from google import genai
from google.genai import types

def get_weather(location: str, unit: str = "celsius") -> dict:
    """Get current weather for a location."""
    return {"temperature": 22, "condition": "sunny", "location": location}

# Define the tool
weather_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_weather",
            description="Get the current weather in a given location",
            parameters={
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        )
    ]
)

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What's the weather in Tokyo?",
    config=types.GenerateContentConfig(tools=[weather_tool])
)

# Handle function call
if response.function_calls:
    function_call = response.function_calls[0]
    result = get_weather(**function_call.args)

    # Send result back
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Content(role="user", parts=[types.Part(text="What's the weather in Tokyo?")]),
            response.candidates[0].content,
            types.Content(role="tool", parts=[
                types.Part.from_function_response(
                    name=function_call.name,
                    response={"result": result}
                )
            ])
        ],
        config=types.GenerateContentConfig(tools=[weather_tool])
    )
    print(response.text)
```

## Grounding with Google Search

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What was the score of the latest Champions League final?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())]
    )
)

print(response.text)

# Access search metadata
grounding = response.candidates[0].grounding_metadata
print("Search queries:", grounding.web_search_queries)
print("Sources:", [chunk.web.title for chunk in grounding.grounding_chunks])
```

## Code Execution

```python
from google import genai
from google.genai import types

client = genai.Client()

code_tool = types.Tool(code_execution=types.ToolCodeExecution())

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Calculate the sum of the first 50 prime numbers",
    config=types.GenerateContentConfig(tools=[code_tool])
)

print(response.text)
```

## Vision (Image Analysis)

### From File

```python
from google import genai
from google.genai import types
import base64

client = genai.Client()

# Read and encode image
with open("image.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Content(parts=[
            types.Part(text="What's in this image?"),
            types.Part(inline_data=types.Blob(
                mime_type="image/jpeg",
                data=image_data
            ))
        ])
    ]
)
print(response.text)
```

### Using File API (Large Files)

```python
from google import genai

client = genai.Client()

# Upload file
uploaded_file = client.files.upload(
    file="large_image.jpg",
    config={"mime_type": "image/jpeg"}
)

# Use in generation
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Part.from_uri(uploaded_file.uri, uploaded_file.mime_type),
        "Describe this image in detail"
    ]
)

# Delete when done
client.files.delete(uploaded_file.name)
```

## Audio Processing

```python
from google import genai
from google.genai import types, createPartFromUri, createUserContent

client = genai.Client()

# Upload audio file
audio_file = client.files.upload(
    file="audio.mp3",
    config={"mime_type": "audio/mp3"}
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=createUserContent([
        createPartFromUri(audio_file.uri, audio_file.mime_type),
        "Transcribe and summarize this audio"
    ])
)
print(response.text)
```

## Video Understanding

```python
from google import genai
import time

client = genai.Client()

# Upload video
video_file = client.files.upload(file="video.mp4")

# Wait for processing
while video_file.state.name == "PROCESSING":
    time.sleep(10)
    video_file = client.files.get(video_file.name)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Part.from_uri(video_file.uri, video_file.mime_type),
        "Describe what happens in this video"
    ]
)
print(response.text)
```

## PDF Document Processing

```python
from google import genai

client = genai.Client()

# Upload PDF
pdf_file = client.files.upload(
    file="document.pdf",
    config={"mime_type": "application/pdf"}
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Part.from_uri(pdf_file.uri, pdf_file.mime_type),
        "Summarize this document"
    ]
)
print(response.text)
```

## Image Generation (Gemini 2.0+)

```python
from google import genai

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.0-flash-preview-image-generation",
    contents="Generate an image of a sunset over mountains"
)

# Access generated image
for part in response.candidates[0].content.parts:
    if part.inline_data:
        # Save image
        with open("generated.png", "wb") as f:
            f.write(part.inline_data.data)
```

## Live API (Real-time Bidirectional Streaming)

```python
from google import genai

client = genai.Client()

# Create live session
async with client.live.connect(model="gemini-2.0-flash-live-001") as session:
    # Send audio/video in real-time
    await session.send(audio_chunk)

    # Receive responses
    async for response in session.receive():
        print(response.text)
```

## Batch API (Cost-Effective)

```python
from google import genai

client = genai.Client()

# Create batch request
batch = client.batches.create(
    model="gemini-2.5-flash",
    requests=[
        {"contents": "Summarize article 1"},
        {"contents": "Summarize article 2"},
        {"contents": "Summarize article 3"},
    ]
)

# Check status
status = client.batches.get(batch.name)
print(f"Status: {status.state}")

# Get results when complete
if status.state == "SUCCEEDED":
    results = client.batches.list_results(batch.name)
    for result in results:
        print(result.response.text)
```

## Context Caching (Cost Optimization)

```python
from google import genai
from google.genai import caching

client = genai.Client()

# Cache large context (e.g., a long document)
cache = client.caches.create(
    model="gemini-2.5-flash",
    contents=[large_document_content],
    ttl="3600s"  # 1 hour
)

# Use cached context for multiple queries
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What are the key findings?",
    config={"cached_content": cache.name}
)
```

## Embeddings

```python
from google import genai

client = genai.Client()

result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="What is machine learning?",
    config={"task_type": "RETRIEVAL_DOCUMENT"}
)

embedding = result.embedding
print(f"Embedding dimension: {len(embedding)}")
```

## Token Counting

```python
from google import genai

client = genai.Client()

# Count tokens before sending
token_count = client.models.count_tokens(
    model="gemini-2.5-flash",
    contents="Your long prompt here..."
)
print(f"Token count: {token_count.total_tokens}")
```

## Safety Settings

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Your prompt",
    config=types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_MEDIUM_AND_ABOVE"
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_ONLY_HIGH"
            )
        ]
    )
)
```

## Generation Configuration

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Write a creative story",
    config=types.GenerateContentConfig(
        temperature=0.9,
        top_p=0.95,
        top_k=40,
        max_output_tokens=2048,
        stop_sequences=["THE END"],
        candidate_count=1
    )
)
```

## Error Handling

```python
from google import genai
from google.api_core import exceptions

client = genai.Client()

try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Hello"
    )
except exceptions.ResourceExhausted:
    print("Rate limit exceeded - implement backoff")
except exceptions.InvalidArgument as e:
    print(f"Invalid argument: {e}")
except exceptions.PermissionDenied:
    print("API key invalid or lacks permissions")
except Exception as e:
    print(f"Error: {e}")
```

## OpenAI Compatibility

Gemini API supports OpenAI-compatible endpoints:

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_GEMINI_API_KEY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

response = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)
```

## Environment Variables

```bash
GEMINI_API_KEY=AIza...
GOOGLE_API_KEY=AIza...  # Alternative
```

## Best Practices

1. **Choose the right model**: Use Flash for speed, Pro for complex reasoning
2. **Use thinking mode** for math, logic, and multi-step problems
3. **Leverage caching** for repeated large contexts
4. **Use batch API** for non-time-sensitive bulk processing (50% cost savings)
5. **Implement streaming** for better UX on long responses
6. **Ground with Search** for up-to-date information
7. **Use JSON mode** for structured, parseable outputs
8. **Handle rate limits** with exponential backoff
