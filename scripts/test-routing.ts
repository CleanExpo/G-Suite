
import { ProjectState } from '../src/graph/state';
import { architectNode, executorNode } from '../src/graph/nodes';

async function testGeoRouting() {
    console.log('Testing GEO Routing...');

    const initialState = {
        userRequest: 'Check my local SEO for "Billings Accountant" at 123 Main St, Billings MT, 406-555-0199',
        userId: 'test_user_123',
        status: 'START',
        results: [],
        error: null,
        budget: 100
    };

    // 1. Architect Node
    console.log('--- Architect Pass ---');
    const architectResult = await architectNode(initialState as any);
    console.log('Spec:', JSON.stringify(architectResult.spec, null, 2));

    // 2. Executor Node
    console.log('--- Executor Pass ---');
    const executorResult = await executorNode({ ...initialState, ...architectResult } as any);
    console.log('Results Count:', executorResult.results.length);
    console.log('Last Result Sample:', JSON.stringify(executorResult.results[0], null, 2).substring(0, 500));
}

testGeoRouting().catch(console.error);
