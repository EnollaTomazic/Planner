"use client";

import * as React from "react";
import Input from "@/components/ui/primitives/Input";
import EmptyRow from "./EmptyRow";
import TaskRow from "./TaskRow";

type Task = { id: string; text: string; done: boolean; projectId?: string };

type Props = {
  tasks: Task[];
  selectedProjectId: string;
  addTask: (title: string, projectId?: string) => string | undefined;
  renameTask: (id: string, text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setSelectedTaskId: (id: string) => void;
};

export default function TaskList({
  tasks,
  selectedProjectId,
  addTask,
  renameTask,
  toggleTask,
  deleteTask,
  setSelectedTaskId,
}: Props) {
  const [draftTask, setDraftTask] = React.useState("");
  const tasksForSelected = React.useMemo(
    () => tasks.filter((t) => t.projectId === selectedProjectId),
    [tasks, selectedProjectId],
  );

  function addTaskCommit() {
    const v = draftTask.trim();
    if (!v || !selectedProjectId) return;
    const id = addTask(v, selectedProjectId);
    setDraftTask("");
    if (id) setSelectedTaskId(id);
  }

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {selectedProjectId && (
        <Input
          className="w-full"
          placeholder="> add task…"
          value={draftTask}
          onChange={(e) => setDraftTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTaskCommit()}
          aria-label="Add task"
        />
      )}
      <div className="min-h-[120px] max-h-[320px] overflow-y-auto px-2 py-2">
        {!selectedProjectId ? (
          <EmptyRow text="No task selected." />
        ) : tasksForSelected.length === 0 ? (
          <EmptyRow text="No tasks selected." />
        ) : (
          <ul
            className="space-y-2 [&>li:first-child]:mt-2 [&>li:last-child]:mb-2"
            aria-label="Tasks"
          >
            {tasksForSelected.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={() => {
                  toggleTask(t.id);
                  setSelectedTaskId(t.id);
                }}
                onDelete={() => {
                  deleteTask(t.id);
                  setSelectedTaskId("");
                }}
                onEdit={(text) => renameTask(t.id, text)}
                onSelect={() => setSelectedTaskId(t.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
