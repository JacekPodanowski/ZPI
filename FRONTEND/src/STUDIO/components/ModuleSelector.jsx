import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useEditorStore from '../store/editorStore';

const ModuleSelector = () => {
  const {
    currentPage,
    templateConfig,
    toggleModule,
    selectModule,
    selectChild,
    selectedModule,
    selectedChild,
    expertMode,
    addModule,
    removeModule,
    reorderModules,
    updateModuleConfig,
    reorderModuleChildren // Assuming this new function is added to your store
  } = useEditorStore();

  const currentPageData = templateConfig.pages[currentPage];
  const modules = currentPageData?.modules || [];

  const [expandedContainers, setExpandedContainers] = useState({});
  const [showAddMenu, setShowAddMenu] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    if (type === 'module') {
      reorderModules(source.index, destination.index);
    } else if (type === 'child') {
      // The droppableId for children is the moduleId
      const moduleId = source.droppableId;
      reorderModuleChildren(moduleId, source.index, destination.index);
    }
  };


  const toggleContainer = (moduleId) => {
    setExpandedContainers(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const addChildToContainer = (containerModule, childType) => {
    const defaultConfigs = {
      text: { content: 'Nowy tekst', fontSize: '16px', textColor: 'rgb(30, 30, 30)', align: 'left' },
      button: { text: 'Kliknij', link: '#', bgColor: 'rgb(146, 0, 32)', textColor: 'rgb(228, 229, 218)', align: 'center' },
      spacer: { height: '2rem' },
      gallery: { images: [], columns: 3, gap: '1rem', style: 'grid' }
    };

    const newChild = { type: childType, config: defaultConfigs[childType] };
    const children = [...(containerModule.config?.children || []), newChild];
    updateModuleConfig(containerModule.id, { children });

    setExpandedContainers(prev => ({ ...prev, [containerModule.id]: true }));
    setShowAddMenu(null);
  };

  const childModules = [
    { type: 'text', icon: '📝', name: 'Tekst' },
    { type: 'button', icon: '🔘', name: 'Przycisk' },
    { type: 'gallery', icon: '🖼️', name: 'Galeria' },
    { type: 'spacer', icon: '↕️', name: 'Odstęp' },
  ];

  const expertModules = [
    { type: 'text', icon: '📝', name: 'Tekst' },
    { type: 'button', icon: '🔘', name: 'Przycisk' },
    { type: 'gallery', icon: '🖼️', name: 'Galeria' },
    { type: 'spacer', icon: '↕️', name: 'Odstęp' },
    { type: 'container', icon: '📦', name: 'Kontener' },
  ];

  const renderModule = (module, index) => {
    const isContainer = module.type === 'container';
    const hasChildren = isContainer && module.config?.children?.length > 0;
    const isExpanded = expandedContainers[module.id];
    const isShowingAddMenu = showAddMenu === module.id;

    return (
      <Draggable
        key={module.id}
        draggableId={module.id}
        index={index}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.8 : 1,
            }}
          >
            <motion.div
              whileHover={{ scale: snapshot.isDragging ? 1 : 1.02 }}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                selectedModule === module.id && !selectedChild ? 'shadow-md' : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: selectedModule === module.id && !selectedChild ? 'rgb(146, 0, 32)' : 'rgb(228, 229, 218)',
                color: selectedModule === module.id && !selectedChild ? 'rgb(228, 229, 218)' : 'rgb(30, 30, 30)',
              }}
              onClick={() => selectModule(module.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-lg flex-shrink-0">
                    ☰
                  </span>

                  {isContainer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleContainer(module.id);
                      }}
                      className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-xs"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  )}

                  <span className="font-medium truncate">{module.name}</span>

                  {isContainer && hasChildren && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{
                      backgroundColor: selectedModule === module.id && !selectedChild ? 'rgba(228, 229, 218, 0.2)' : 'rgba(146, 0, 32, 0.1)',
                      color: selectedModule === module.id && !selectedChild ? 'rgb(228, 229, 218)' : 'rgb(146, 0, 32)'
                    }}>
                      {module.config.children.length}
                    </span>
                  )}

                  {isContainer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMenu(isShowingAddMenu ? null : module.id);
                      }}
                      className="ml-auto flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:scale-110"
                      style={{
                        backgroundColor: selectedModule === module.id && !selectedChild ? 'rgba(228, 229, 218, 0.3)' : 'rgba(146, 0, 32, 0.2)',
                        color: selectedModule === module.id && !selectedChild ? 'rgb(228, 229, 218)' : 'rgb(146, 0, 32)'
                      }}
                      title="Dodaj element do kontenera"
                    >
                      {isShowingAddMenu ? '−' : '+'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {expertMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Czy na pewno chcesz usunąć ten element?')) {
                          removeModule(module.id);
                        }
                      }}
                      className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded transition-all"
                      title="Usuń"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleModule(module.id);
                    }}
                    className="w-5 h-5 rounded cursor-pointer"
                    style={{ accentColor: 'rgb(146, 0, 32)' }}
                  />
                </div>
              </div>

              {isContainer && isShowingAddMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-2 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(146, 0, 32, 0.05)',
                    borderLeft: '2px solid rgb(146, 0, 32)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs font-medium mb-2 opacity-60">Dodaj element:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {childModules.map((child) => (
                      <button
                        key={child.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          addChildToContainer(module, child.type);
                        }}
                        className="p-2 rounded-lg text-left transition-all hover:bg-white"
                        style={{
                          border: '1px solid rgba(146, 0, 32, 0.2)',
                          color: 'rgb(30, 30, 30)'
                        }}
                      >
                        <div className="text-base mb-0.5">{child.icon}</div>
                        <div className="text-xs">{child.name}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {isContainer && hasChildren && isExpanded && (
              <Droppable droppableId={module.id} type="child">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`mt-1 pl-6 pr-1 pt-1 space-y-1 rounded-b-lg ${snapshot.isDraggingOver ? 'bg-green-50' : ''}`}
                  >
                    {module.config.children.map((child, childIdx) => {
                      const isChildSelected = selectedChild?.moduleId === module.id && selectedChild?.childIndex === childIdx;
                      return (
                        <Draggable
                          key={`${module.id}-child-${childIdx}`}
                          draggableId={`${module.id}-child-${childIdx}`}
                          index={childIdx}
                        >
                          {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                            >
                                <motion.div
                                  whileHover={{ scale: 1.01 }}
                                  className={`p-2 rounded-lg transition-all cursor-pointer ${isChildSelected ? 'shadow-md' : ''}`}
                                  style={{
                                    backgroundColor: isChildSelected ? 'rgb(146, 0, 32)' : 'rgba(228, 229, 218, 0.5)',
                                    color: isChildSelected ? 'rgb(228, 229, 218)' : 'rgb(30, 30, 30)',
                                    borderLeft: '2px solid rgba(146, 0, 32, 0.3)'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectChild(module.id, childIdx);
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2 text-sm">
                                    <div className='flex items-center gap-2 min-w-0'>
                                      <span {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-base">
                                        ☰
                                      </span>
                                      <span className="text-base">
                                        {child.type === 'text' && '📝'}
                                        {child.type === 'button' && '🔘'}
                                        {child.type === 'gallery' && '🖼️'}
                                        {child.type === 'spacer' && '↕️'}
                                      </span>
                                      <span className="capitalize truncate">{child.type}</span>
                                    </div>
                                    <span className="text-xs opacity-60 truncate ml-auto text-right">
                                      {child.type === 'text' && child.config?.content?.substring(0, 15)}
                                      {child.type === 'button' && child.config?.text}
                                      {child.type === 'spacer' && child.config?.height}
                                    </span>
                                  </div>
                                </motion.div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'rgb(30, 30, 30)' }}>
        Sekcje - {currentPageData?.name}
      </h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="modules-list" type="module">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 flex-1 overflow-y-auto mb-4 ${snapshot.isDraggingOver ? 'bg-gray-50 rounded-xl' : ''}`}
            >
              {modules.sort((a, b) => a.order - b.order).map((module, index) => renderModule(module, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {expertMode && (
        <div className="pt-4 border-t" style={{ borderColor: 'rgba(30, 30, 30, 0.1)' }}>
          <h3 className="text-sm font-semibold mb-3 opacity-60">DODAJ SEKCJĘ</h3>
          <div className="grid grid-cols-2 gap-2">
            {expertModules.map((mod) => (
              <motion.button
                key={mod.type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addModule(mod.type)}
                className="p-3 rounded-lg border-2 border-dashed transition-all hover:border-solid"
                style={{
                  borderColor: 'rgb(146, 0, 32)',
                  color: 'rgb(30, 30, 30)'
                }}
              >
                <div className="text-2xl mb-1">{mod.icon}</div>
                <div className="text-xs font-medium">{mod.name}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuleSelector;