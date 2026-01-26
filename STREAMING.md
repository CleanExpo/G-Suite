# G-Pilot Real-Time Intelligence Protocol (Streaming)

## Overview
As of v8.3, G-Pilot supports real-time log streaming from the `MissionOverseer` to the client UI. This allows users to follow the agent's thought process ("The Matrix View") while it executes complex missions.

## Architecture

### 1. The Core Interface (`AgentContext`)
We extended `AgentContext` in `src/agents/base/agent-interface.ts` to include a streaming callback:
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
*Note: Any agent can now stream logs by receiving `context` and calling `context.onStream('...')`.*

### 3. The API Layer (`/api/agents`)
The REST API now returns a `ReadableStream` instead of a static JSON response.
- **Format**: Text/Event Stream (custom protocol)
- **Protocol**:
    - `LOG: <message>` -> Log entry
    - `RESULT: <json>` -> Final result
    - `ERROR: <message>` -> Error

### 4. The Client Layer (`MissionModal.tsx`)
The `MissionModal` component uses `fetch` and `response.body.getReader()` to parse this stream in real-time, updating a `logs` state array that renders into a Terminal UI.

## Usage for New Agents
To enable streaming for a new agent:
1. Ensure the agent accepts `AgentContext`.
2. When performing long-running tasks, call `context.onStream('Starting task X...')`.

## Future Improvements
- [ ] Implement `Vercel AI SDK` standard Protocol for broader compatibility.
- [ ] Add "Typing" indicators for LLM generation steps.
