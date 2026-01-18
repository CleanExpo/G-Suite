'use server';

import prisma from '@/prisma';
import { getAuthUserIdOrDev, getAuthUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';

export async function getKanbanTasks() {
  const userId = await getAuthUserIdOrDev();

  // @ts-ignore - Prisma client regeneration may be needed
  return await prisma.kanbanTask.findMany({
    where: { clerkId: userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createKanbanTask(data: {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
}) {
  const userId = await getAuthUserIdOrDev();

  // @ts-ignore - Prisma client regeneration may be needed
  const task = await prisma.kanbanTask.create({
    data: {
      clerkId: userId,
      title: data.title,
      description: data.description,
      status: data.status || 'OBLIGATION',
      priority: data.priority || 'MEDIUM',
    },
  });

  revalidatePath('/dashboard/schedule');
  return task;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const userId = await getAuthUserIdOrDev();

  // @ts-ignore - Prisma client regeneration may be needed
  await prisma.kanbanTask.update({
    where: { id: taskId, clerkId: userId },
    data: { status },
  });

  revalidatePath('/dashboard/schedule');
}
