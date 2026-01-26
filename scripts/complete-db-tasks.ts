/**
 * Complete database tasks in Beads-Lite
 */

import { getBeadsLite } from '../src/lib/beads-lite';

async function completeTasks() {
  const beads = getBeadsLite();
  await beads.init();

  console.log('📊 Completing database tasks...\n');

  // Task 9.1.1: Database Schema Migration (Vault Hardening)
  await beads.complete('bd-maskaw.1');
  console.log('✅ bd-maskaw.1 - Task 9.1.1: Database Schema Migration (COMPLETED)');

  // Task 9.2.1: Database Schema Extension (Granular Telemetry)
  await beads.complete('bd-asmgl6.1');
  console.log('✅ bd-asmgl6.1 - Task 9.2.1: Database Schema Extension (COMPLETED)');

  console.log('\n📋 Updated task statuses:\n');

  // Show newly ready tasks
  const ready = beads.getReady();
  console.log(`Ready tasks: ${ready.length}\n`);

  ready.forEach(task => {
    console.log(`  [P${task.priority}] ${task.id}: ${task.title}`);
    if (task.assignee) {
      console.log(`      → Assigned to: ${task.assignee}`);
    }
  });

  // Show stats
  console.log('\n📊 Project Statistics:');
  const stats = beads.getStats();
  console.log(`  Total: ${stats.total}`);
  console.log(`  Ready: ${stats.byStatus.ready}`);
  console.log(`  In Progress: ${stats.byStatus.in_progress}`);
  console.log(`  Blocked: ${stats.byStatus.blocked}`);
  console.log(`  Completed: ${stats.byStatus.completed}`);
  console.log('');
}

completeTasks().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
