export type ISODate = string;

export type Project = {
  id: string;
  name: string;
  done: boolean;
  createdAt: number;
  disabled?: boolean;
  loading?: boolean;
};

export type TaskReminder = {
  enabled: boolean;
  reminderId?: string;
  time?: string;
  leadMinutes?: number;
};

export type DayTask = {
  id: string;
  title: string;
  done: boolean;
  projectId?: string;
  createdAt: number;
  images: string[];
  reminder?: TaskReminder;
};

export type DayRecord = {
  projects: Project[];
  tasks: DayTask[];
  tasksById: Record<string, DayTask>;
  tasksByProject: Record<string, string[]>;
  doneCount: number;
  totalCount: number;
  focus?: string;
  notes?: string;
};

export type Selection = {
  projectId?: string;
  taskId?: string;
};
