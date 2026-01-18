import { Annotation } from "@langchain/langgraph";

/**
 * Refined state for the SuitePilot project workflow.
 */
export const ProjectState = Annotation.Root({
    // The original user prompt (aliased to satisfy user snippet)
    userRequest: Annotation<string>(),
    // The clerk user ID (internal)
    userId: Annotation<string>(),
    // The generated JSON specification for the task
    spec: Annotation<any>(),
    // Status of the workflow
    status: Annotation<string>(),
    // Final output or results array
    results: Annotation<any[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    // Error message if any
    error: Annotation<string | null>(),
    // Budget/Cost info
    budget: Annotation<number>(),
});

export type ProjectStateType = typeof ProjectState.State;
