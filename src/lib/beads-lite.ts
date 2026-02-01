/**
 * Beads-Lite: Lightweight task management inspired by Beads methodology
 *
 * Provides core Beads concepts without external dependencies:
 * - Git-backed JSONL task storage in .beads/ directory
 * - Dependency-aware task graphs
 * - Hierarchical task IDs (epic.task.subtask)
 * - JSON-first interface for agent consumption
 * - Auto-sync with Git
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ============================================================================
// TYPES
// ============================================================================

export type TaskStatus =
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled';
export type TaskPriority = 0 | 1 | 2 | 3; // 0=Urgent, 1=High, 2=Medium, 3=Low

export interface BeadsTask {
  id: string; // Unique ID (e.g., "bd-a1b2c3" or hierarchical "phase-9.0.1")
  title: string; // Short description
  status: TaskStatus; // Current status
  priority: TaskPriority; // Priority level
  description?: string; // Detailed description
  parent?: string; // Parent task ID (for hierarchy)
  dependencies?: string[]; // IDs of tasks that must complete first
  assignee?: string; // Agent or user assigned
  tags?: string[]; // Tags for filtering
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
  metadata?: Record<string, any>; // Additional data
}

export interface BeadsConfig {
  repoRoot: string; // Git repository root
  beadsDir: string; // .beads directory path
  issuesFile: string; // issues.jsonl path
  autoSync: boolean; // Auto-sync with Git
  syncDebounceMs: number; // Debounce window for auto-sync
}

// ============================================================================
// BEADS LITE CLIENT
// ============================================================================

export class BeadsLite {
  private config: BeadsConfig;
  private tasks: Map<string, BeadsTask>;
  private syncTimer: NodeJS.Timeout | null = null;

  constructor(repoRoot: string = process.cwd()) {
    this.config = {
      repoRoot,
      beadsDir: path.join(repoRoot, '.beads'),
      issuesFile: path.join(repoRoot, '.beads', 'issues.jsonl'),
      autoSync: true,
      syncDebounceMs: 30000, // 30 seconds
    };
    this.tasks = new Map();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Initialize Beads in the repository
   * Creates .beads directory and empty issues.jsonl
   */
  async init(): Promise<void> {
    if (!fs.existsSync(this.config.beadsDir)) {
      fs.mkdirSync(this.config.beadsDir, { recursive: true });
      console.log(`✅ Created ${this.config.beadsDir}`);
    }

    if (!fs.existsSync(this.config.issuesFile)) {
      fs.writeFileSync(this.config.issuesFile, '', 'utf-8');
      console.log(`✅ Created ${this.config.issuesFile}`);
    }

    // Add to .gitignore if needed
    const gitignorePath = path.join(this.config.repoRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignore.includes('.beads/')) {
        fs.appendFileSync(gitignorePath, '\n# Beads task tracking\n.beads/\n');
        console.log('✅ Added .beads/ to .gitignore');
      }
    }

    await this.load();
  }

  /**
   * Load tasks from issues.jsonl
   */
  async load(): Promise<void> {
    this.tasks.clear();

    if (!fs.existsSync(this.config.issuesFile)) {
      return;
    }

    const content = fs.readFileSync(this.config.issuesFile, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());

    for (const line of lines) {
      try {
        const task: BeadsTask = JSON.parse(line);
        this.tasks.set(task.id, task);
      } catch (error) {
        console.error(`Failed to parse task line: ${line}`, error);
      }
    }

    console.log(`✅ Loaded ${this.tasks.size} tasks from ${this.config.issuesFile}`);
  }

  /**
   * Save all tasks to issues.jsonl
   */
  async save(): Promise<void> {
    const lines = Array.from(this.tasks.values())
      .map((task) => JSON.stringify(task))
      .join('\n');

    fs.writeFileSync(this.config.issuesFile, lines + '\n', 'utf-8');

    // Schedule auto-sync if enabled
    if (this.config.autoSync) {
      this.scheduleSyncToGit();
    }
  }

  // --------------------------------------------------------------------------
  // TASK CRUD OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Create a new task
   */
  async create(params: {
    title: string;
    priority?: TaskPriority;
    description?: string;
    parent?: string;
    dependencies?: string[];
    assignee?: string;
    tags?: string[];
  }): Promise<BeadsTask> {
    // Generate ID
    let id: string;
    if (params.parent) {
      // Hierarchical ID
      const parentTask = this.tasks.get(params.parent);
      if (!parentTask) {
        throw new Error(`Parent task not found: ${params.parent}`);
      }
      const siblingCount = Array.from(this.tasks.values()).filter(
        (t) => t.parent === params.parent,
      ).length;
      id = `${params.parent}.${siblingCount + 1}`;
    } else {
      // Hash-based ID (simplified)
      id = `bd-${this.generateHash()}`;
    }

    const now = new Date().toISOString();
    const task: BeadsTask = {
      id,
      title: params.title,
      status: 'pending',
      priority: params.priority ?? 2,
      description: params.description,
      parent: params.parent,
      dependencies: params.dependencies || [],
      assignee: params.assignee,
      tags: params.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    // Update status based on dependencies
    this.updateTaskStatus(task);

    this.tasks.set(id, task);
    await this.save();

    console.log(`✅ Created task: ${id} - ${task.title}`);
    return task;
  }

  /**
   * Update an existing task
   */
  async update(id: string, updates: Partial<BeadsTask>): Promise<BeadsTask> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }

    const updatedTask: BeadsTask = {
      ...task,
      ...updates,
      id: task.id, // Prevent ID changes
      createdAt: task.createdAt, // Preserve creation time
      updatedAt: new Date().toISOString(),
    };

    // Update status if dependencies changed
    if (updates.dependencies) {
      this.updateTaskStatus(updatedTask);
    }

    this.tasks.set(id, updatedTask);
    await this.save();

    console.log(`✅ Updated task: ${id}`);
    return updatedTask;
  }

  /**
   * Complete a task
   */
  async complete(id: string): Promise<BeadsTask> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }

    const now = new Date().toISOString();
    const completedTask: BeadsTask = {
      ...task,
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, completedTask);

    // Update dependent tasks (may become ready)
    this.updateDependentTasks(id);

    await this.save();

    console.log(`✅ Completed task: ${id}`);
    return completedTask;
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    if (!this.tasks.has(id)) {
      throw new Error(`Task not found: ${id}`);
    }

    this.tasks.delete(id);
    await this.save();

    console.log(`✅ Deleted task: ${id}`);
  }

  // --------------------------------------------------------------------------
  // QUERY OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Get all tasks
   */
  getAll(): BeadsTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  get(id: string): BeadsTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * Get ready tasks (no blockers)
   */
  getReady(): BeadsTask[] {
    return this.getAll()
      .filter((t) => t.status === 'ready')
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get tasks by status
   */
  getByStatus(status: TaskStatus): BeadsTask[] {
    return this.getAll().filter((t) => t.status === status);
  }

  /**
   * Get tasks by assignee
   */
  getByAssignee(assignee: string): BeadsTask[] {
    return this.getAll().filter((t) => t.assignee === assignee);
  }

  /**
   * Get tasks by tag
   */
  getByTag(tag: string): BeadsTask[] {
    return this.getAll().filter((t) => t.tags?.includes(tag));
  }

  /**
   * Get child tasks
   */
  getChildren(parentId: string): BeadsTask[] {
    return this.getAll().filter((t) => t.parent === parentId);
  }

  /**
   * Get task hierarchy (task + all descendants)
   */
  getHierarchy(rootId: string): BeadsTask[] {
    const hierarchy: BeadsTask[] = [];
    const root = this.tasks.get(rootId);
    if (!root) return hierarchy;

    hierarchy.push(root);
    const queue = [rootId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = this.getChildren(currentId);
      hierarchy.push(...children);
      queue.push(...children.map((c) => c.id));
    }

    return hierarchy;
  }

  // --------------------------------------------------------------------------
  // DEPENDENCY MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Update task status based on dependencies
   */
  private updateTaskStatus(task: BeadsTask): void {
    if (task.status === 'completed' || task.status === 'cancelled') {
      return; // Don't change terminal states
    }

    if (!task.dependencies || task.dependencies.length === 0) {
      task.status = 'ready';
      return;
    }

    const allDepsCompleted = task.dependencies.every((depId) => {
      const dep = this.tasks.get(depId);
      return dep?.status === 'completed';
    });

    task.status = allDepsCompleted ? 'ready' : 'blocked';
  }

  /**
   * Update tasks that depend on a completed task
   */
  private updateDependentTasks(completedId: string): void {
    for (const task of this.tasks.values()) {
      if (task.dependencies?.includes(completedId)) {
        this.updateTaskStatus(task);
      }
    }
  }

  /**
   * Check for circular dependencies
   */
  hasCircularDependency(taskId: string, visited = new Set<string>()): boolean {
    if (visited.has(taskId)) {
      return true; // Cycle detected
    }

    const task = this.tasks.get(taskId);
    if (!task || !task.dependencies) {
      return false;
    }

    visited.add(taskId);

    for (const depId of task.dependencies) {
      if (this.hasCircularDependency(depId, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  // --------------------------------------------------------------------------
  // GIT SYNC
  // --------------------------------------------------------------------------

  /**
   * Schedule auto-sync with debouncing
   */
  private scheduleSyncToGit(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(() => {
      this.syncToGit();
    }, this.config.syncDebounceMs);
  }

  /**
   * Sync .beads directory to Git
   */
  syncToGit(): void {
    try {
      // Check if there are changes
      const status = execSync('git status --porcelain .beads/', {
        cwd: this.config.repoRoot,
        encoding: 'utf-8',
      });

      if (!status.trim()) {
        console.log('✅ No changes to sync');
        return;
      }

      // Add .beads directory
      execSync('git add .beads/', {
        cwd: this.config.repoRoot,
        stdio: 'inherit',
      });

      // Commit
      execSync('git commit -m "chore: update task tracking (beads-lite auto-sync)"', {
        cwd: this.config.repoRoot,
        stdio: 'inherit',
      });

      console.log('✅ Synced tasks to Git');
    } catch (error: any) {
      // Ignore errors (e.g., nothing to commit)
      if (!error.message.includes('nothing to commit')) {
        console.error('Failed to sync to Git:', error.message);
      }
    }
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  /**
   * Generate simple hash for task IDs
   */
  private generateHash(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  /**
   * Export tasks as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Get project statistics
   */
  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      byStatus: {
        pending: all.filter((t) => t.status === 'pending').length,
        ready: all.filter((t) => t.status === 'ready').length,
        in_progress: all.filter((t) => t.status === 'in_progress').length,
        blocked: all.filter((t) => t.status === 'blocked').length,
        completed: all.filter((t) => t.status === 'completed').length,
        cancelled: all.filter((t) => t.status === 'cancelled').length,
      },
      byPriority: {
        urgent: all.filter((t) => t.priority === 0).length,
        high: all.filter((t) => t.priority === 1).length,
        medium: all.filter((t) => t.priority === 2).length,
        low: all.filter((t) => t.priority === 3).length,
      },
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Singleton instance
let beadsInstance: BeadsLite | null = null;

/**
 * Get or create BeadsLite instance
 */
export function getBeadsLite(repoRoot?: string): BeadsLite {
  if (!beadsInstance) {
    beadsInstance = new BeadsLite(repoRoot);
  }
  return beadsInstance;
}

/**
 * Initialize Beads in the repository
 */
export async function initBeads(repoRoot?: string): Promise<BeadsLite> {
  const beads = getBeadsLite(repoRoot);
  await beads.init();
  return beads;
}
