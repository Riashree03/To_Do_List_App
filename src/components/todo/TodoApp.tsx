import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TaskItem, Task, Priority } from "./TaskItem";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Filter, Flag, ListChecks, Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const priorities: Priority[] = ["low", "medium", "high"];

type FilterMode = "all" | "active" | "completed";

export const TodoApp = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>("ff_tasks", []);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "FocusFlow — Modern To‑Do List";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Modern to-do list with priorities, due dates, and filters.");
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter(t => {
      const matchesText = q ? (t.title.toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q)) : true;
      const matchesFilter = filter === "all" ? true : filter === "active" ? !t.completed : t.completed;
      return matchesText && matchesFilter;
    });
  }, [tasks, query, filter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [tasks]);

  function addTask() {
    if (!title.trim()) {
      toast({ title: "Add a title", description: "Task title cannot be empty." });
      return;
    }
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setTitle("");
    setNotes("");
    setPriority("medium");
    setDueDate(undefined);
    toast({ title: "Task added", description: `“${newTask.title}” created` });
  }

  function toggle(id: string) {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function remove(id: string) {
    const t = tasks.find(x => x.id === id);
    setTasks(tasks.filter(t => t.id !== id));
    toast({ title: "Task removed", description: t ? `“${t.title}” deleted` : "Removed" });
  }

  function clearCompleted() {
    const remaining = tasks.filter(t => !t.completed);
    const removed = tasks.length - remaining.length;
    setTasks(remaining);
    toast({ title: "Cleared completed", description: `${removed} task(s) removed` });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addTask();
  }

  function onPointerMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--x", `${x}%`);
    e.currentTarget.style.setProperty("--y", `${y}%`);
  }

  return (
    <main className="container mx-auto max-w-3xl py-10">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Modern To‑Do List</h1>
        <p className="text-muted-foreground">Organize tasks with priorities, due dates, and smart filters.</p>
      </header>

      <Card ref={containerRef} className="pointer-surface glass">
        <CardHeader onMouseMove={onPointerMove}>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" /> FocusFlow
          </CardTitle>
          <CardDescription>Stay on top of what matters today.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New Task */}
          <section aria-label="Add new task">
            <div className="flex flex-wrap items-stretch gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Task title"
                />
              </div>

              <div className="w-[160px] min-w-[140px]">
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger aria-label="Priority">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-[220px] min-w-[200px]">
                <span className="hidden md:inline-flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" />Due</span>
                <Input type="date" className="w-full" value={dueDate ?? ""} onChange={(e) => setDueDate(e.target.value || undefined)} aria-label="Due date" />
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <Button variant="hero" className="w-full sm:w-auto" onClick={addTask}>
                  <Plus /> Add Task
                </Button>
              </div>
            </div>
          </section>

          {/* Controls */}
          <nav className="flex flex-col md:flex-row md:items-center md:justify-between gap-3" aria-label="Filters and search">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 rounded-md border p-1">
                {(["all", "active", "completed"] as FilterMode[]).map(m => (
                  <Button key={m} variant={filter === m ? "secondary" : "ghost"} onClick={() => setFilter(m)}>
                    {m === "all" && "All"}
                    {m === "active" && "Active"}
                    {m === "completed" && "Completed"}
                  </Button>
                ))}
              </div>
              <Button variant="outline" className="w-full sm:w-auto" onClick={clearCompleted}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Clear Completed
              </Button>
            </div>
            <div className="w-full md:flex-1 md:max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search tasks" />
            </div>
          </nav>

          {/* Stats */}
          <section className="flex items-center gap-3 text-sm text-muted-foreground flex-nowrap overflow-x-auto" aria-label="Statistics">
            <Badge variant="secondary" className="gap-1 px-3 py-1 whitespace-nowrap"><ListChecks className="h-3.5 w-3.5" /> {stats.total} total</Badge>
            <Badge className="gap-1 px-3 py-1 whitespace-nowrap"><CheckCircle2 className="h-3.5 w-3.5" /> {stats.completed} done</Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1 whitespace-nowrap"><Flag className="h-3.5 w-3.5" /> {stats.active} active</Badge>
          </section>

          {/* List */}
          <section className="space-y-2" aria-label="Task list">
            {filtered.length === 0 ? (
              <div className="rounded-lg border p-6 text-center text-muted-foreground">
                No tasks match your filters. Add a new task to get started.
              </div>
            ) : (
              filtered.map(t => (
                <TaskItem key={t.id} task={t} onToggle={toggle} onDelete={remove} />
              ))
            )}
          </section>
        </CardContent>
      </Card>
    </main>
  );
};
