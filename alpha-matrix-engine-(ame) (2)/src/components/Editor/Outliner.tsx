import { Box, Lightbulb, Camera, Zap, Layers, Eye, EyeOff, Lock, Unlock, Search, GripVertical, Copy, Trash2, Type } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Entity } from '@/types';
import { useState, useCallback } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';

interface SortableEntityProps {
  entity: Entity;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent, id: string) => void;
  getIcon: (type: Entity['type']) => React.ReactNode;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
}

function SortableEntity({ entity, isSelected, onSelect, getIcon, onDuplicate, onDelete, onRename }: SortableEntityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          onClick={(e) => onSelect(e, entity.id)}
          className={cn(
            "group flex items-center gap-2 px-3 py-1 cursor-pointer transition-colors border-l-2 border-transparent",
            isSelected ? "bg-ame-orange/20 border-ame-orange" : "hover:bg-ame-orange/10",
            isDragging && "opacity-50 ring-1 ring-ame-orange/50 bg-matrix-card"
          )}
        >
          <div 
            {...attributes} 
            {...listeners} 
            className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5"
          >
            <GripVertical className="w-3 h-3" />
          </div>
          
          <div className={cn(
            "transition-colors",
            isSelected ? "text-ame-orange" : "text-slate-500 group-hover:text-ame-orange"
          )}>
            {getIcon(entity.type)}
          </div>
          
          <span className={cn(
            "flex-1 text-[11px] font-medium truncate transition-colors",
            isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
          )}>
            {entity.name}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:text-white text-slate-500">
              {entity.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button className="p-1 hover:text-white text-slate-500">
              {entity.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-matrix-card border-matrix-border text-slate-300">
        <ContextMenuItem onClick={() => onRename(entity.id)} className="text-[11px] hover:bg-ame-orange/20 hover:text-white gap-2">
          <Type className="w-3 h-3" />
          Rename
          <span className="ml-auto text-[9px] text-slate-500">F2</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDuplicate(entity.id)} className="text-[11px] hover:bg-ame-orange/20 hover:text-white gap-2">
          <Copy className="w-3 h-3" />
          Duplicate
          <span className="ml-auto text-[9px] text-slate-500">Ctrl+D</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-matrix-border" />
        <ContextMenuItem onClick={() => onDelete(entity.id)} className="text-[11px] hover:bg-red-500/20 text-red-400 hover:text-red-300 gap-2">
          <Trash2 className="w-3 h-3" />
          Delete
          <span className="ml-auto text-[9px] text-slate-500">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function Outliner() {
  const { entities, setEntities, selectedIds, setSelectedIds } = useEditor();
  const [search, setSearch] = useState('');
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey && lastSelectedId) {
      const currentIndex = entities.findIndex(ent => ent.id === id);
      const lastIndex = entities.findIndex(ent => ent.id === lastSelectedId);
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      const rangeIds = entities.slice(start, end + 1).map(ent => ent.id);
      
      setSelectedIds(prev => {
        const newSelection = new Set(prev);
        rangeIds.forEach(rid => newSelection.add(rid));
        return Array.from(newSelection);
      });
    } else if (e.metaKey || e.ctrlKey) {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
    setLastSelectedId(id);
  }, [entities, lastSelectedId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEntities((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDuplicate = (id: string) => {
    const entity = entities.find(e => e.id === id);
    if (entity) {
      const newEntity = {
        ...entity,
        id: `${entity.id}_copy_${Date.now()}`,
        name: `${entity.name} (Copy)`
      };
      setEntities(prev => [...prev, newEntity]);
    }
  };

  const handleDelete = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleRename = (id: string) => {
    const newName = prompt("Enter new name:");
    if (newName) {
      setEntities(prev => prev.map(e => e.id === id ? { ...e, name: newName } : e));
    }
  };

  const getIcon = (type: Entity['type']) => {
    switch (type) {
      case 'Mesh': return <Box className="w-3 h-3" />;
      case 'Light': return <Lightbulb className="w-3 h-3" />;
      case 'Camera': return <Camera className="w-3 h-3" />;
      case 'Particle': return <Zap className="w-3 h-3" />;
      case 'Volume': return <Layers className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-matrix-card border-r border-matrix-border select-none" onClick={() => setSelectedIds([])}>
      <div className="p-3 border-bottom border-matrix-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">World Outliner</h3>
          <span className="text-[10px] font-mono text-slate-600">{entities.length} Entities</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <Input 
            placeholder="Search entities..." 
            className="h-7 pl-7 bg-matrix-bg border-matrix-border text-[11px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
          >
            <SortableContext
              items={filteredEntities.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredEntities.map((entity) => (
                <SortableEntity
                  key={entity.id}
                  entity={entity}
                  isSelected={selectedIds.includes(entity.id)}
                  onSelect={handleSelect}
                  getIcon={getIcon}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onRename={handleRename}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      {selectedIds.length > 0 && (
        <div className="p-2 bg-matrix-bg border-t border-matrix-border flex items-center justify-between">
          <span className="text-[10px] font-mono text-ame-orange">{selectedIds.length} SELECTED</span>
          <div className="flex gap-1">
            <button className="text-[9px] font-bold text-slate-500 hover:text-white uppercase transition-colors px-1 h-4">Hide</button>
            <button className="text-[9px] font-bold text-slate-500 hover:text-white uppercase transition-colors px-1 h-4">Lock</button>
          </div>
        </div>
      )}
    </div>
  );
}

