/**
 * G-Pilot Demo: Marketing Campaign Generation for CARSI Australia
 */
import { AgentRegistry, initializeAgents } from '../src/agents';

async function generateCampaign() {
  console.log('🚀 G-PILOT MARKETING CAMPAIGN GENERATOR');
  console.log('========================================\n');

  console.log('📦 Initializing Agent Fleet...');
  await initializeAgents();

  const strategist = AgentRegistry.get('marketing-strategist');
  if (!strategist) {
    console.error('❌ Marketing Strategist agent not found');
    process.exit(1);
  }

  console.log('✅ Agent Loaded:', strategist.name);
  console.log('📋 Capabilities:', strategist.capabilities.join(', '));

  const context = {
    userId: 'carsi-demo',
    mission: `Create a comprehensive digital marketing campaign for CARSI Australia (www.carsi.com.au).

BUSINESS OVERVIEW:
- Industry: Online Education / Professional Training
- Specialization: Restoration courses and certifications
- Delivery: 100% online, accessible anywhere in Australia
- Value Prop: Professional restoration training without geographical barriers

TARGET AUDIENCE:
1. Restoration professionals seeking upskilling/certifications
2. Conservation students looking for practical training
3. Career changers entering the restoration industry
4. Building/construction professionals expanding into restoration

CAMPAIGN GOALS:
- Increase course enrollments by 40%
- Build brand awareness in the restoration education space
- Establish CARSI as the leading online restoration training provider
- Generate qualified leads through content marketing

Generate:
1. Campaign strategy with 3 key pillars
2. Content calendar ideas for 1 month
3. 5 social media post examples (LinkedIn, Facebook, Instagram)
4. 3 email subject lines for nurture sequences
5. Key messaging and value propositions`,
    locale: 'en-AU',
    config: {
      businessName: 'CARSI Australia',
      website: 'https://www.carsi.com.au',
      industry: 'Online Education / Restoration Training',
    }
  };

  console.log('\n📊 PHASE 1: STRATEGIC PLANNING');
  console.log('-------------------------------');

  const startPlan = Date.now();
  const plan = await strategist.plan(context);
  console.log(`⏱️  Planning completed in ${Date.now() - startPlan}ms`);
  console.log('\n📋 CAMPAIGN PLAN:');
  console.log(JSON.stringify(plan, null, 2));

  console.log('\n🎯 PHASE 2: CAMPAIGN EXECUTION');
  console.log('-------------------------------');

  const startExec = Date.now();
  const result = await strategist.execute(plan, context);
  console.log(`⏱️  Execution completed in ${Date.now() - startExec}ms`);

  console.log('\n📈 CAMPAIGN RESULT:');
  console.log('Success:', result.success);
  console.log('Cost:', result.cost, 'credits');
  console.log('Duration:', result.duration, 'ms');
  console.log('Confidence:', result.confidence);

  if (result.data) {
    console.log('\n🎨 GENERATED CAMPAIGN CONTENT:');
    console.log('==============================');
    console.log(JSON.stringify(result.data, null, 2));
  }

  if (result.artifacts && result.artifacts.length > 0) {
    console.log('\n📎 ARTIFACTS:');
    for (const artifact of result.artifacts) {
      console.log(`  - ${artifact.name} (${artifact.type})`);
    }
  }

  console.log('\n✅ G-PILOT CAMPAIGN GENERATION COMPLETE');
}

generateCampaign().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
