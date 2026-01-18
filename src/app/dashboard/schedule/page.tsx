"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import {
    Calendar,
    Plus,
    MoreVertical,
    Clock,
    CheckCircle2,
    Zap,
    Target,
    Activity,
    ArrowRight,
    Search,
    Filter,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { getKanbanTasks, updateTaskStatus, createKanbanTask } from "@/actions/kanban.actions";
import { format } from "date-fns";

type TaskStatus = "OBLIGATION" | "EXECUTION" | "VALIDATION" | "ARCHIVE";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    updatedAt: Date;
}

const COLUMNS: { id: TaskStatus; label: string; icon: any }[] = [
    { id: "OBLIGATION", label: "Obligation", icon: Target },
    { id: "EXECUTION", label: "Execution", icon: Zap },
    { id: "VALIDATION", label: "Validation", icon: Activity },
    { id: "ARCHIVE", label: "Archive", icon: CheckCircle2 },
];

export default function SchedulePage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    async function fetchTasks() {
        setIsLoading(true);
        try {
            const data = await getKanbanTasks();
            setTasks(data as any);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (err) {
            console.error(err);
            fetchTasks(); // Rollback
        }
    }

    async function handleCreateTask() {
        if (!newTaskTitle) return;
        setIsCreating(true);
        try {
            await createKanbanTask({ title: newTaskTitle });
            setNewTaskTitle("");
            fetchTasks();
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0b0e14] flex flex-col items-center justify-center gap-8">
                <div className="w-16 h-16 rounded-3xl border-4 border-blue-600 border-t-transparent animate-spin shadow-2xl shadow-blue-600/20" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Syncing Kanban Ledger</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0e14] transition-colors overflow-x-hidden font-sans">
            <Navbar />

            <main className="pt-32 px-6 pb-24 max-w-[1600px] mx-auto">
                <header className="mb-20 space-y-8 flex flex-col lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 shadow-sm">
                                <Calendar className="w-4 h-4" /> Mission Scheduler v2.1
                            </div>
                            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sector Sync: Active
                            </div>
                        </div>
                        <h1 className="text-6xl lg:text-[10rem] font-black italic tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.75]">
                            The Kanban <br />
                            <span className="text-blue-600 dark:text-blue-500">Board.</span>
                        </h1>
                    </div>

                    <div className="flex flex-col items-end gap-6">
                        {/* Mini Calendar Visual */}
                        <div className="hidden lg:flex gap-2">
                            {[18, 19, 20, 21].map((day) => (
                                <div key={day} className={`w-14 h-16 rounded-2xl flex flex-col items-center justify-center border transition-all ${day === 18 ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20' : 'bg-white dark:bg-[#161b22] border-gray-100 dark:border-white/10 text-gray-400 opacity-40'}`}>
                                    <span className="text-[8px] font-black uppercase">Jan</span>
                                    <span className="text-xl font-black">{day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search missions..."
                                    className="h-14 px-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-blue-600 transition-colors w-64"
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-white/10">
                                <input
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                                    placeholder="Fast Task..."
                                    className="h-12 px-6 bg-transparent border-none focus:outline-none text-sm font-bold w-40"
                                />
                                <button
                                    onClick={handleCreateTask}
                                    disabled={isCreating || !newTaskTitle}
                                    className="h-12 px-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-50"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {COLUMNS.map((col) => {
                        const colTasks = tasks.filter(t => t.status === col.id);
                        return (
                            <div key={col.id} className="space-y-8">
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/5">
                                            <col.icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="font-black italic uppercase tracking-tighter text-2xl text-gray-900 dark:text-white">{col.label}</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full uppercase">
                                        {colTasks.length}
                                    </span>
                                </div>

                                <div className="space-y-6 min-h-[500px] p-2 rounded-[3.5rem] bg-gray-50/30 dark:bg-white/[0.01] border border-transparent hover:border-blue-600/10 transition-colors">
                                    <AnimatePresence mode="popLayout">
                                        {colTasks.map((task) => (
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                className="p-8 rounded-[2.5rem] bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/5 shadow-sm group cursor-pointer hover:shadow-2xl transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${task.priority === "KINETIC" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" :
                                                        task.priority === "HIGH" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" :
                                                            "bg-gray-100 dark:bg-white/10 text-gray-500"
                                                        }`}>
                                                        {task.priority}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {COLUMNS.filter(c => c.id !== col.id).map(c => (
                                                            <button
                                                                key={c.id}
                                                                onClick={() => handleStatusChange(task.id, c.id)}
                                                                className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-gray-400"
                                                                title={`Move to ${c.label}`}
                                                            >
                                                                <c.icon className="w-3 h-3" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2 mb-6">{task.description || "Initialize mission parameters to begin execution."}</p>

                                                <div className="pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                                                        <Clock className="w-3 h-3 text-blue-600" /> {format(new Date(task.updatedAt), "HH:mm · MMM d")}
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                                                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-white" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {col.id === "OBLIGATION" && (
                                        <button
                                            onClick={() => setNewTaskTitle("New Mission Node")}
                                            className="w-full py-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-600/30 hover:text-blue-600 transition-all opacity-50 hover:opacity-100 group"
                                        >
                                            <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Append Node</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
