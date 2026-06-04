import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import TaskItem from './TaskItem';

function EmptyState({ filter, search }) {
  const messages = {
    search: {
      icon: '🔍',
      title: 'No results found',
      sub: `No tasks match "${search}". Try a different search.`,
    },
    completed: {
      icon: '🏁',
      title: 'No completed tasks yet',
      sub: "Complete a task and it'll show up here.",
    },
    active: {
      icon: '☀️',
      title: 'All done!',
      sub: "No active tasks. Add a new one or mark completed tasks as active.",
    },
    all: {
      icon: '📋',
      title: 'No tasks yet',
      sub: 'Add your first task above to get started.',
    },
  };

  const key = search ? 'search' : filter;
  const { icon, title, sub } = messages[key] || messages.all;

  return (
    <div className="empty-state" role="status">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-sub">{sub}</p>
    </div>
  );
}

export default function TaskList({ tasks, onToggle, onUpdate, onDelete, onReorder, filter, search }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = tasks.findIndex((t) => t.id === active.id);
    const newIdx = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIdx, newIdx);
    onReorder(reordered);
  };

  if (!tasks.length) {
    return <EmptyState filter={filter} search={search} />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="task-list" aria-label="Task list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
