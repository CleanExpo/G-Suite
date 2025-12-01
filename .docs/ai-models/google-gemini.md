# Google Gemini API Documentation

## Installation

```bash
# Python
pip install google-generativeai

# TypeScript/JavaScript
npm install @google/generative-ai
```

## Client Setup

### Python

```python
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-1.5-pro")
```

### TypeScript

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
```

## Basic Text Generation

### Python

```python
response = model.generate_content("Explain quantum computing")
print(response.text)
```

### TypeScript

```typescript
const result = await model.generateContent("Explain quantum computing");
const response = await result.response;
console.log(response.text());
```

## Streaming Responses

### Python

```python
response = model.generate_content("Write a story", stream=True)
for chunk in response:
    print(chunk.text, end="", flush=True)
```

### TypeScript

```typescript
const result = await model.generateContentStream("Write a story");

for await (const chunk of result.stream) {
  const text = chunk.text();
  process.stdout.write(text);
}
```

## Multi-turn Chat

### Python

```python
chat = model.start_chat(history=[])

response = chat.send_message("Hello!")
print(response.text)

response = chat.send_message("What did I just say?")
print(response.text)
```

### TypeScript

```typescript
const chat = model.startChat({
  history: [],
});

let result = await chat.sendMessage("Hello!");
console.log(result.response.text());

result = await chat.sendMessage("What did I just say?");
console.log(result.response.text());
```

## System Instructions

```python
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    system_instruction="You are a helpful coding assistant. Always provide code examples."
)

response = model.generate_content("How do I read a file in Python?")
```

## Vision (Image Analysis)

### Python

```python
import PIL.Image

image = PIL.Image.open("image.jpg")

response = model.generate_content([
    "What's in this image?",
    image
])
print(response.text)
```

### From URL

```python
import requests
from io import BytesIO
from PIL import Image

image_url = "https://example.com/image.jpg"
image = Image.open(BytesIO(requests.get(image_url).content))

response = model.generate_content([
    "Describe this image in detail",
    image
])
```

### TypeScript

```typescript
import * as fs from "fs";

const imageData = fs.readFileSync("image.jpg");
const base64Image = imageData.toString("base64");

const result = await model.generateContent([
  "What's in this image?",
  {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image,
    },
  },
]);
```

## Function Calling

### Define Functions

```python
def get_weather(location: str, unit: str = "celsius") -> dict:
    """Get current weather for a location."""
    # Implementation
    return {"temperature": 22, "condition": "sunny"}

tools = [
    {
        "function_declarations": [
            {
                "name": "get_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
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
            }
        ]
    }
]

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    tools=tools
)
```

### Handle Function Calls

```python
response = model.generate_content("What's the weather in Tokyo?")

# Check for function call
for part in response.parts:
    if hasattr(part, 'function_call'):
        function_call = part.function_call
        function_name = function_call.name
        function_args = dict(function_call.args)

        # Execute the function
        result = get_weather(**function_args)

        # Send result back
        response = model.generate_content([
            {"role": "user", "parts": ["What's the weather in Tokyo?"]},
            {"role": "model", "parts": [part]},
            {"role": "user", "parts": [
                {"function_response": {
                    "name": function_name,
                    "response": result
                }}
            ]}
        ])
```

## JSON Mode

```python
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config={
        "response_mime_type": "application/json"
    }
)

response = model.generate_content(
    "List 3 popular programming languages with their use cases. Return as JSON."
)
print(response.text)  # Returns valid JSON
```

## Safety Settings

```python
from google.generativeai.types import HarmCategory, HarmBlockThreshold

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    safety_settings={
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }
)
```

## Generation Configuration

```python
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
    "stop_sequences": ["END"],
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config
)
```

## Embedding Generation

```python
result = genai.embed_content(
    model="models/text-embedding-004",
    content="What is machine learning?",
    task_type="retrieval_document"
)

embedding = result['embedding']
print(f"Embedding dimension: {len(embedding)}")
```

## File Upload (Large Files)

```python
# Upload a file
uploaded_file = genai.upload_file("large_document.pdf")

# Use in generation
response = model.generate_content([
    "Summarize this document",
    uploaded_file
])

# Delete when done
genai.delete_file(uploaded_file.name)
```

## Video Analysis

```python
video_file = genai.upload_file("video.mp4")

# Wait for processing
import time
while video_file.state.name == "PROCESSING":
    time.sleep(10)
    video_file = genai.get_file(video_file.name)

response = model.generate_content([
    "Describe what happens in this video",
    video_file
])
```

## Audio Processing

```python
audio_file = genai.upload_file("audio.mp3")

response = model.generate_content([
    "Transcribe this audio",
    audio_file
])
```

## Available Models

| Model | Description |
|-------|-------------|
| `gemini-1.5-pro` | Most capable, 1M token context |
| `gemini-1.5-flash` | Fast, efficient, 1M context |
| `gemini-1.5-flash-8b` | Fastest, cost-effective |
| `gemini-2.0-flash-exp` | Experimental next-gen model |
| `text-embedding-004` | Text embeddings |

## Error Handling

```python
from google.api_core import exceptions

try:
    response = model.generate_content("Hello")
except exceptions.ResourceExhausted:
    print("Rate limit exceeded, implementing backoff...")
except exceptions.InvalidArgument as e:
    print(f"Invalid argument: {e}")
except exceptions.PermissionDenied:
    print("API key invalid or lacks permissions")
```

## TypeScript Error Handling

```typescript
try {
  const result = await model.generateContent("Hello");
} catch (error) {
  if (error.status === 429) {
    console.log("Rate limited");
  } else if (error.status === 400) {
    console.log("Bad request:", error.message);
  }
}
```

## Environment Variables

```bash
GOOGLE_API_KEY=AIza...
```

## Context Caching (Cost Optimization)

```python
from google.generativeai import caching

# Cache large context
cache = caching.CachedContent.create(
    model="gemini-1.5-pro",
    contents=[large_document],
    ttl_seconds=3600
)

# Use cached context
model = genai.GenerativeModel.from_cached_content(cache)
response = model.generate_content("Summarize the document")
```

## Best Practices

1. **Use appropriate model** - Flash for speed, Pro for capability
2. **Implement streaming** for better UX
3. **Use context caching** for repeated large contexts
4. **Handle safety filters** appropriately
5. **Set generation config** for consistent outputs
6. **Use JSON mode** for structured responses
