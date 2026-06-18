export type Priority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assignees: string[];
  workstream: string;
  priority: Priority;
  startDate?: string | null;
  completionDate?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workstream {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  color: string;
}
