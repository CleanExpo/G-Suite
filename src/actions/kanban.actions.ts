'use server';

import prisma from "@/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getKanbanTasks() {
    const user = await currentUser();
    if (!user) return [];

    // @ts-ignore - Prisma client regeneration may be needed
    return await prisma.kanbanTask.findMany({
        where: { clerkId: user.id },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function createKanbanTask(data: { title: string, description?: string, status?: string, priority?: string }) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // @ts-ignore - Prisma client regeneration may be needed
    const task = await prisma.kanbanTask.create({
        data: {
            clerkId: user.id,
            title: data.title,
            description: data.description,
            status: data.status || "OBLIGATION",
            priority: data.priority || "MEDIUM",
        }
    });

    revalidatePath('/dashboard/schedule');
    return task;
}

export async function updateTaskStatus(taskId: string, status: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // @ts-ignore - Prisma client regeneration may be needed
    await prisma.kanbanTask.update({
        where: { id: taskId, clerkId: user.id },
        data: { status }
    });

    revalidatePath('/dashboard/schedule');
}
