import { StateGraph, START, END } from '@langchain/langgraph';
import { ProjectState } from './state';
import { architectNode, billingNode, executorNode } from './nodes';

/**
 * Wires the nodes together into a LangGraph workflow.
 */
const workflow = new StateGraph(ProjectState)
  .addNode('architect', architectNode)
  .addNode('billing', billingNode)
  .addNode('executor', executorNode)

  // 1. Start at Architect
  .addEdge(START, 'architect')

  // 2. Architect -> Billing (if planned)
  .addConditionalEdges(
    'architect',
    (state: typeof ProjectState.State) => (state.status === 'PLANNED' ? 'continue' : 'end'),
    {
      continue: 'billing',
      end: END,
    },
  )

  // 3. Billing Decision: If failed, END. Else, Executor.
  .addConditionalEdges(
    'billing',
    (state: typeof ProjectState.State) => (state.status === 'REJECTED' ? 'fail' : 'success'),
    {
      fail: END,
      success: 'executor',
    },
  )

  // 4. Executor -> END
  .addEdge('executor', END);

export const app = workflow.compile();
