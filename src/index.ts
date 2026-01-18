import 'dotenv/config';
import { app as workflow } from './graph/workflow';
import * as readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('🚀 SuitePilot CLI v1.0 (Dev Mode)');
console.log('-----------------------------------');

rl.question("Describe your task (e.g., 'Create a 5-slide pitch for Duncan'): ", async (input) => {
  // Hardcoded 'Boss' ID for testing
  const userId = 'user_boss_123';

  console.log('\n🔄 Starting Agent Workflow...\n');

  try {
    const finalState = await workflow.invoke({
      userRequest: input,
      userId: userId,
      status: 'starting',
    });

    console.log('\n-----------------------------------');
    if (finalState.error) {
      console.log('🛑 Workflow Terminated:', finalState.error);
    } else {
      console.log('🏁 Final Output:', JSON.stringify(finalState.results, null, 2));
    }
  } catch (err: any) {
    console.error('❌ Fatal CLI Error:', err.message);
  } finally {
    rl.close();
    process.exit(0);
  }
});
