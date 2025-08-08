import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Flag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // ISO date string
  priority: Priority;
  completed: boolean;
  createdAt: string; // ISO
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  const priorityBadge = () => {
    const base = "px-2 py-0.5";
    if (task.priority === "high") return <Badge className={cn(base, "bg-destructive text-destructive-foreground")}>High</Badge>;
    if (task.priority === "medium") return <Badge className={cn(base, "bg-secondary text-secondary-foreground")}>Medium</Badge>;
    return <Badge variant="outline" className={cn(base)}>Low</Badge>;
  };

  return (
    <div className={cn(
      "group grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-lg border bg-card/90 text-card-foreground p-3 transition-all",
      "hover:shadow-elevated hover:border-primary/30"
    )}>
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={task.completed ? "Mark as not completed" : "Mark as completed"}
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
          {priorityBadge()}
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        {task.notes && <p className="text-xs text-muted-foreground">{task.notes}</p>}
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" aria-label="Delete task" onClick={() => onDelete(task.id)}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
};
