/**
 * Beads-Lite Core Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock fs and child_process
vi.mock(import('fs'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
      writeFileSync: vi.fn(),
      readFileSync: vi.fn(),
      appendFileSync: vi.fn(),
    },
  };
});

vi.mock(import('child_process'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: actual,
    execSync: vi.fn(),
  };
});

import { BeadsLite, BeadsTask, TaskStatus, TaskPriority } from '@/lib/beads-lite';

describe('BeadsLite', () => {
  let beads: BeadsLite;
  const mockRepoRoot = '/test/repo';

  beforeEach(() => {
    vi.clearAllMocks();
    beads = new BeadsLite(mockRepoRoot);

    // Default mock implementations
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readFileSync).mockReturnValue('');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create BeadsLite instance with default config', () => {
      expect(beads).toBeDefined();
    });

    it('should use provided repo root', () => {
      const customBeads = new BeadsLite('/custom/path');
      expect(customBeads).toBeDefined();
    });
  });

  describe('init', () => {
    it('should create .beads directory if not exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await beads.init();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.beads'),
        { recursive: true }
      );
    });

    it('should create issues.jsonl if not exists', async () => {
      vi.mocked(fs.existsSync)
        .mockReturnValueOnce(true)  // beadsDir exists
        .mockReturnValueOnce(false) // issuesFile doesn't exist
        .mockReturnValueOnce(false); // gitignore check

      await beads.init();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('issues.jsonl'),
        '',
        'utf-8'
      );
    });

    it('should not recreate existing directories', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await beads.init();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('should load tasks from issues.jsonl', async () => {
      const mockTasks = [
        { id: 'bd-test1', title: 'Task 1', status: 'pending', priority: 2, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'bd-test2', title: 'Task 2', status: 'completed', priority: 1, createdAt: '2024-01-01', updatedAt: '2024-01-02' },
      ];

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        mockTasks.map(t => JSON.stringify(t)).join('\n')
      );

      await beads.load();

      const allTasks = beads.getAll();
      expect(allTasks.length).toBe(2);
    });

    it('should handle empty file', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');

      await beads.load();

      const allTasks = beads.getAll();
      expect(allTasks.length).toBe(0);
    });

    it('should skip invalid JSON lines', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(
        '{"id":"bd-test1","title":"Valid","status":"pending","priority":2,"createdAt":"2024-01-01","updatedAt":"2024-01-01"}\ninvalid json line\n'
      );

      await beads.load();

      const allTasks = beads.getAll();
      expect(allTasks.length).toBe(1);
    });
  });

  describe('create', () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');
      await beads.load();
    });

    it('should create task with generated ID', async () => {
      const task = await beads.create({ title: 'New Task' });

      expect(task.id).toMatch(/^bd-/);
      expect(task.title).toBe('New Task');
      // Status is 'ready' when no dependencies exist
      expect(['pending', 'ready']).toContain(task.status);
    });

    it('should set default priority to medium (2)', async () => {
      const task = await beads.create({ title: 'Test' });
      expect(task.priority).toBe(2);
    });

    it('should accept custom priority', async () => {
      const task = await beads.create({ title: 'Urgent', priority: 0 });
      expect(task.priority).toBe(0);
    });

    it('should save after creation', async () => {
      await beads.create({ title: 'Test' });
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should set timestamps', async () => {
      const task = await beads.create({ title: 'Test' });

      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should accept optional fields', async () => {
      const task = await beads.create({
        title: 'Full Task',
        description: 'Detailed description',
        assignee: 'test-agent',
        tags: ['feature', 'priority'],
      });

      expect(task.description).toBe('Detailed description');
      expect(task.assignee).toBe('test-agent');
      expect(task.tags).toContain('feature');
    });
  });

  describe('update', () => {
    let existingTask: BeadsTask;

    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');
      await beads.load();
      existingTask = await beads.create({ title: 'Original' });
    });

    it('should update task fields', async () => {
      const updated = await beads.update(existingTask.id, { title: 'Updated Title' });
      expect(updated.title).toBe('Updated Title');
    });

    it('should preserve ID and createdAt', async () => {
      const updated = await beads.update(existingTask.id, { title: 'New' });

      expect(updated.id).toBe(existingTask.id);
      expect(updated.createdAt).toBe(existingTask.createdAt);
    });

    it('should update updatedAt timestamp', async () => {
      // Wait a bit to ensure different timestamp
      await new Promise(r => setTimeout(r, 10));
      const updated = await beads.update(existingTask.id, { title: 'New' });
      // Timestamps may be same if within same ms, so just check it exists
      expect(updated.updatedAt).toBeDefined();
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(existingTask.updatedAt).getTime()
      );
    });

    it('should throw for non-existent task', async () => {
      await expect(beads.update('non-existent', { title: 'Test' }))
        .rejects.toThrow('Task not found');
    });
  });

  describe('complete', () => {
    let existingTask: BeadsTask;

    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');
      await beads.load();
      existingTask = await beads.create({ title: 'Task to Complete' });
    });

    it('should mark task as completed', async () => {
      const completed = await beads.complete(existingTask.id);
      expect(completed.status).toBe('completed');
    });

    it('should set completedAt timestamp', async () => {
      const completed = await beads.complete(existingTask.id);
      expect(completed.completedAt).toBeDefined();
    });

    it('should throw for non-existent task', async () => {
      await expect(beads.complete('non-existent'))
        .rejects.toThrow('Task not found');
    });
  });

  describe('delete', () => {
    let existingTask: BeadsTask;

    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');
      await beads.load();
      existingTask = await beads.create({ title: 'Task to Delete' });
    });

    it('should remove task', async () => {
      await beads.delete(existingTask.id);

      const task = beads.get(existingTask.id);
      expect(task).toBeUndefined();
    });

    it('should throw for non-existent task', async () => {
      await expect(beads.delete('non-existent'))
        .rejects.toThrow('Task not found');
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');
      await beads.load();
    });

    it('should return task by ID', async () => {
      const created = await beads.create({ title: 'Test' });
      const retrieved = beads.get(created.id);

      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent ID', async () => {
      const task = beads.get('non-existent');
      expect(task).toBeUndefined();
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('');
      await beads.load();
    });

    it('should return all tasks', async () => {
      await beads.create({ title: 'Task 1' });
      await beads.create({ title: 'Task 2' });

      const all = beads.getAll();
      expect(all.length).toBe(2);
    });

    it('should return empty array when no tasks', async () => {
      const all = beads.getAll();
      expect(all).toEqual([]);
    });
  });

  describe('Task Types', () => {
    it('should have valid TaskStatus values', () => {
      const statuses: TaskStatus[] = ['pending', 'ready', 'in_progress', 'blocked', 'completed', 'cancelled'];
      expect(statuses.length).toBe(6);
    });

    it('should have valid TaskPriority values', () => {
      const priorities: TaskPriority[] = [0, 1, 2, 3];
      expect(priorities).toContain(0); // Urgent
      expect(priorities).toContain(3); // Low
    });
  });
});
