export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export interface Person {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

export interface FollowUp {
  id: string;
  taskId: string;
  scheduledAt: Date;
  note?: string | null;
  done: boolean;
  completedAt?: Date | null;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  rawInput?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  completedAt?: Date | null;
  notes?: string | null;
  personId?: string | null;
  person?: Person | null;
  tags: Tag[];
  followUps: FollowUp[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedTask {
  title: string;
  dueDate?: Date;
  followUpDate?: Date;
  priority?: Priority;
  personName?: string;
  tags?: string[];
  confidence: number;
}

export type ViewMode = "today" | "weekly" | "monthly" | "team" | "followups";

export interface TaskFilters {
  personId?: string;
  priority?: Priority;
  status?: TaskStatus;
  tags?: string[];
  search?: string;
}
