# G-Pilot Real-Time Intelligence Protocol (Streaming)

## Overview
G-Pilot supports real-time log streaming from the `MissionOverseer` to the client UI via the **Vercel AI SDK UIMessageStream** protocol. This allows users to follow the agent's thought process ("The Matrix View") while it executes complex missions.

## Architecture

### 1. The Core Interface (`AgentContext`)
`AgentContext` in `src/agents/base/agent-interface.ts` includes a streaming callback:
```typescript
export interface AgentContext {
    // ...
    onStream?: (chunk: string) => void;
}
```

### 2. The Agent Implementation (`MissionOverseer`)
The `MissionOverseer` checks for this callback in its `addLog` method:
```typescript
private addLog(message: string): void {
    if (this.missionState.context.onStream) {
        this.missionState.context.onStream(message);
    }
}
```
*Note: Any agent can stream logs by receiving `context` and calling `context.onStream('...')`.*

### 3. The API Layer (`/api/agents`)
The REST API uses `createUIMessageStream` and `createUIMessageStreamResponse` from the Vercel AI SDK (`ai` v6) to produce a standard UIMessageStream response.

- **Protocol**: Vercel AI SDK UIMessageStream (SSE-based)
- **Stream Parts**:
    - `start` → Message begins
    - `text-start` → Text content part begins
    - `text-delta` → Log entry (each line is a delta with `\n`)
    - `text-end` → Text content part ends
    - `finish` → Message complete

```typescript
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';

const stream = createUIMessageStream({
    execute: async ({ writer }) => {
        writer.write({ type: 'start' });
        writer.write({ type: 'text-start', id: 'mission-log' });

        const sendLog = (msg: string) => {
            writer.write({ type: 'text-delta', delta: msg + '\n', id: 'mission-log' });
        };

        // ... agent execution with onStream: sendLog ...

        writer.write({ type: 'text-end', id: 'mission-log' });
        writer.write({ type: 'finish', finishReason: 'stop' });
    }
});

return createUIMessageStreamResponse({ stream });
```

### 4. The Client Layer (`MissionModal.tsx`)
The `MissionModal` component uses the `useChat` hook from `@ai-sdk/react` to consume the stream. Log lines are derived from the assistant message's text parts.

```typescript
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
        api: '/api/agents',
        body: { agentName: 'mission-overseer' },
    }),
});

// Send a mission
sendMessage({ text: missionInput });

// Derive logs from assistant message text
const logs = lastAssistantMessage.parts
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('')
    .split('\n')
    .filter(Boolean);
```

## API Format
The server accepts two request formats:

**useChat format** (primary):
```json
{ "messages": [{ "role": "user", "parts": [{ "type": "text", "text": "mission..." }] }], "agentName": "mission-overseer" }
```

**Legacy format** (backward compatible):
```json
{ "agentName": "mission-overseer", "mission": "mission...", "userId": "..." }
```

## Usage for New Agents
To enable streaming for a new agent:
1. Ensure the agent accepts `AgentContext`.
2. When performing long-running tasks, call `context.onStream('Starting task X...')`.

## Dependencies
- `ai` v6+ — Core streaming utilities (`createUIMessageStream`, `createUIMessageStreamResponse`, `DefaultChatTransport`)
- `@ai-sdk/react` — React hooks (`useChat`)
- `@ai-sdk/google` — Google AI provider (for future `streamText` integration with Gemini)
