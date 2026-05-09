import React, { createContext, useContext, useState } from 'react';
import { INITIAL_ENTITIES } from '@/lib/constants';
import { Entity } from '@/types';

interface EditorContextType {
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <EditorContext.Provider value={{ entities, setEntities, selectedIds, setSelectedIds }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
