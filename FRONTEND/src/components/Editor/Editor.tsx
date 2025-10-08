import React, { useState } from 'react';
import EditorToolbar from './EditorToolbar';
import AIAgent from './AIAgent';
import './Editor.css';

interface PageElement {
    id: string;
    type: string;
    content: string;
    styles: React.CSSProperties;
    position: { x: number; y: number };
}

const Editor: React.FC = () => {
    const [elements, setElements] = useState<PageElement[]>([]);
    const [selectedElements, setSelectedElements] = useState<string[]>([]);
    const [draggedElement, setDraggedElement] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDraggingElement, setIsDraggingElement] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
    const [editingElement, setEditingElement] = useState<PageElement | null>(null);

    const elementTypes = [
        { type: 'heading', label: 'Heading', icon: '📝', defaultContent: 'Your Heading Here' },
        { type: 'paragraph', label: 'Text', icon: '📄', defaultContent: 'Your text content here...' },
        { type: 'button', label: 'Button', icon: '🔘', defaultContent: 'Click Me' },
        { type: 'image', label: 'Image', icon: '🖼️', defaultContent: 'Image placeholder' },
        { type: 'textfield', label: 'Input Field', icon: '📝', defaultContent: 'Enter text...' },
        { type: 'textarea', label: 'Text Area', icon: '📋', defaultContent: 'Enter description...' },
        { type: 'link', label: 'Link', icon: '🔗', defaultContent: 'Click here' },
        { type: 'divider', label: 'Divider', icon: '➖', defaultContent: '' },
        { type: 'card', label: 'Card', icon: '🗂️', defaultContent: 'Card content' },
        { type: 'form', label: 'Form', icon: '📋', defaultContent: 'Contact Form' },
        { type: 'testimonial', label: 'Testimonial', icon: '💬', defaultContent: 'Customer review...' },
        { type: 'pricing', label: 'Pricing Box', icon: '💰', defaultContent: '$99/month' },
        { type: 'gallery', label: 'Gallery', icon: '🎨', defaultContent: 'Image Gallery' },
        { type: 'video', label: 'Video', icon: '🎥', defaultContent: 'Video placeholder' },
        { type: 'map', label: 'Map', icon: '🗺️', defaultContent: 'Location map' },
        { type: 'social', label: 'Social Icons', icon: '🌐', defaultContent: 'Social media' },
        { type: 'contact', label: 'Contact Info', icon: '📞', defaultContent: 'Contact details' },
        { type: 'logo', label: 'Logo', icon: '✨', defaultContent: 'Your Logo' },
    ];

    const handleDragStart = (e: React.DragEvent, elementType: string) => {
        e.dataTransfer.setData('elementType', elementType);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const elementType = e.dataTransfer.getData('elementType');
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        
        // Account for scroll position
        const x = e.clientX - rect.left + canvas.scrollLeft;
        const y = e.clientY - rect.top + canvas.scrollTop;

        const elementConfig = elementTypes.find(et => et.type === elementType);
        if (!elementConfig) return;

        const newElement: PageElement = {
            id: `element-${Date.now()}`,
            type: elementType,
            content: elementConfig.defaultContent,
            styles: getDefaultStyles(elementType),
            position: { x, y },
        };

        setElements([...elements, newElement]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const getDefaultStyles = (type: string): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            position: 'absolute',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '8px',
        };

        switch (type) {
            case 'heading':
                return { ...baseStyles, fontSize: '32px', fontWeight: 'bold', color: '#333' };
            case 'paragraph':
                return { ...baseStyles, fontSize: '16px', lineHeight: '1.6', color: '#666' };
            case 'button':
                return { ...baseStyles, backgroundColor: '#007bff', color: 'white', border: 'none', padding: '12px 24px', cursor: 'pointer' };
            case 'textfield':
                return { ...baseStyles, border: '1px solid #ccc', padding: '8px 12px', width: '200px' };
            case 'textarea':
                return { ...baseStyles, border: '1px solid #ccc', padding: '8px 12px', width: '300px', height: '100px' };
            case 'link':
                return { ...baseStyles, color: '#007bff', textDecoration: 'underline' };
            case 'divider':
                return { ...baseStyles, width: '100%', height: '2px', backgroundColor: '#e0e0e0', padding: '0' };
            case 'card':
                return { ...baseStyles, border: '1px solid #e0e0e0', backgroundColor: 'white', width: '300px', padding: '20px' };
            case 'image':
                return { ...baseStyles, width: '200px', height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' };
            case 'pricing':
                return { ...baseStyles, border: '2px solid #007bff', backgroundColor: 'white', width: '250px', padding: '30px', textAlign: 'center' };
            case 'logo':
                return { ...baseStyles, fontSize: '24px', fontWeight: 'bold', color: '#333' };
            default:
                return baseStyles;
        }
    };

    const handleElementClick = (e: React.MouseEvent, elementId: string) => {
        e.stopPropagation();
        
        if (e.shiftKey || e.ctrlKey) {
            // Multi-select
            if (selectedElements.includes(elementId)) {
                setSelectedElements(selectedElements.filter(id => id !== elementId));
            } else {
                setSelectedElements([...selectedElements, elementId]);
            }
        } else {
            // Single select
            setSelectedElements([elementId]);
        }
    };

    const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
        e.stopPropagation();
        
        if (!selectedElements.includes(elementId)) {
            setSelectedElements([elementId]);
        }
        
        const element = elements.find(el => el.id === elementId);
        if (!element) return;
        
        const target = e.currentTarget;
        const canvas = target.parentElement;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        
        setIsDraggingElement(true);
        setDraggedElement(elementId);
        setDragOffset({
            x: e.clientX - rect.left + canvas.scrollLeft - element.position.x,
            y: e.clientY - rect.top + canvas.scrollTop - element.position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingElement || !draggedElement) return;
        
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        
        // Account for scroll position
        const newX = e.clientX - rect.left + canvas.scrollLeft - dragOffset.x;
        const newY = e.clientY - rect.top + canvas.scrollTop - dragOffset.y;
        
        setElements(elements.map(el => {
            if (el.id === draggedElement) {
                return {
                    ...el,
                    position: { x: newX, y: newY }
                };
            }
            return el;
        }));
    };

    const handleMouseUp = () => {
        setIsDraggingElement(false);
        setDraggedElement(null);
    };

    const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            elementId
        });
        setSelectedElements([elementId]);
    };

    const handleEditElement = () => {
        if (!contextMenu) return;
        const element = elements.find(el => el.id === contextMenu.elementId);
        if (element) {
            setEditingElement({ ...element });
        }
        setContextMenu(null);
    };

    const handleDeleteElement = () => {
        if (!contextMenu) return;
        setElements(elements.filter(el => el.id !== contextMenu.elementId));
        setSelectedElements([]);
        setContextMenu(null);
    };

    const handleDuplicateElement = () => {
        if (!contextMenu) return;
        const element = elements.find(el => el.id === contextMenu.elementId);
        if (element) {
            const newElement = {
                ...element,
                id: `element-${Date.now()}`,
                position: { x: element.position.x + 20, y: element.position.y + 20 }
            };
            setElements([...elements, newElement]);
        }
        setContextMenu(null);
    };

    const handleSaveEdit = () => {
        if (!editingElement) return;
        setElements(elements.map(el => 
            el.id === editingElement.id ? editingElement : el
        ));
        setEditingElement(null);
    };

    const handleUpdateStyle = (property: string, value: string | number) => {
        if (!editingElement) return;
        setEditingElement({
            ...editingElement,
            styles: {
                ...editingElement.styles,
                [property]: value
            }
        });
    };

    const renderElement = (element: PageElement) => {
        const isSelected = selectedElements.includes(element.id);
        const selectedStyle: React.CSSProperties = isSelected ? {
            outline: '2px solid #007bff',
            outlineOffset: '2px',
        } : {};

        const combinedStyles = {
            ...element.styles,
            ...selectedStyle,
            left: element.position.x,
            top: element.position.y,
        };

        switch (element.type) {
            case 'heading':
                return <h1 style={combinedStyles}>{element.content}</h1>;
            case 'paragraph':
                return <p style={combinedStyles}>{element.content}</p>;
            case 'button':
                return <button style={combinedStyles}>{element.content}</button>;
            case 'textfield':
                return <input type="text" placeholder={element.content} style={combinedStyles} />;
            case 'textarea':
                return <textarea placeholder={element.content} style={combinedStyles} />;
            case 'link':
                return <a href="#" style={combinedStyles}>{element.content}</a>;
            case 'divider':
                return <hr style={combinedStyles} />;
            case 'image':
                return <div style={combinedStyles}>{element.content}</div>;
            case 'card':
                return <div style={combinedStyles}><h3>Card Title</h3><p>{element.content}</p></div>;
            case 'pricing':
                return <div style={combinedStyles}><h2>{element.content}</h2><p>Full features included</p></div>;
            case 'logo':
                return <div style={combinedStyles}>{element.content}</div>;
            default:
                return <div style={combinedStyles}>{element.content}</div>;
        }
    };

    return (
        <div className="editor" style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            <EditorToolbar />
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Elements Palette */}
                <div className="elements-palette" style={{
                    width: '200px',
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    overflowY: 'auto',
                    borderRight: '1px solid #e0e0e0'
                }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>Elements</h3>
                    {elementTypes.map((element) => (
                        <div
                            key={element.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, element.type)}
                            style={{
                                padding: '12px',
                                marginBottom: '8px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                cursor: 'grab',
                                border: '1px solid #e0e0e0',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f0f0';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ marginRight: '8px' }}>{element.icon}</span>
                            <span style={{ fontSize: '13px' }}>{element.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Editor Canvas */}
                <div
                    className="editor-canvas"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onClick={() => { setSelectedElements([]); setContextMenu(null); }}
                    style={{
                        flex: 1,
                        backgroundColor: 'white',
                        position: 'relative',
                        overflow: 'auto',
                        minHeight: '600px',
                        cursor: isDraggingElement ? 'grabbing' : 'default',
                    }}
                >
                    {elements.map((element) => (
                        <div
                            key={element.id}
                            onClick={(e) => handleElementClick(e, element.id)}
                            onMouseDown={(e) => handleMouseDown(e, element.id)}
                            onContextMenu={(e) => handleContextMenu(e, element.id)}
                            style={{
                                cursor: selectedElements.includes(element.id) ? 'move' : 'pointer',
                            }}
                        >
                            {renderElement(element)}
                        </div>
                    ))}
                    
                    {elements.length === 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            color: '#999',
                        }}>
                            <p style={{ fontSize: '18px', marginBottom: '10px' }}>Drag elements here to start building</p>
                            <p style={{ fontSize: '14px' }}>Select elements with Click, Shift+Click, or Ctrl+Click</p>
                        </div>
                    )}
                </div>

                {/* AI Agent Sidebar */}
                <div style={{ width: '300px', borderLeft: '1px solid #e0e0e0' }}>
                    <AIAgent selectedElements={selectedElements} elements={elements} />
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        minWidth: '150px',
                    }}
                >
                    <div
                        onClick={handleEditElement}
                        style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        ✏️ Edit Properties
                    </div>
                    <div
                        onClick={handleDuplicateElement}
                        style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        📋 Duplicate
                    </div>
                    <div
                        onClick={handleDeleteElement}
                        style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            color: '#d9534f',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        🗑️ Delete
                    </div>
                </div>
            )}

            {/* Edit Panel */}
            {editingElement && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        zIndex: 1001,
                        width: '400px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        padding: '20px',
                    }}
                >
                    <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Element Properties</h3>
                    
                    {/* Content */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content:</label>
                        <input
                            type="text"
                            value={editingElement.content}
                            onChange={(e) => setEditingElement({ ...editingElement, content: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {/* Font Size */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Font Size:</label>
                        <input
                            type="number"
                            value={parseInt(String(editingElement.styles.fontSize || '16')) || 16}
                            onChange={(e) => handleUpdateStyle('fontSize', e.target.value + 'px')}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {/* Text Color */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Text Color:</label>
                        <input
                            type="color"
                            value={String(editingElement.styles.color || '#000000')}
                            onChange={(e) => handleUpdateStyle('color', e.target.value)}
                            style={{
                                width: '100%',
                                height: '40px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {/* Background Color */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Background Color:</label>
                        <input
                            type="color"
                            value={String(editingElement.styles.backgroundColor || '#ffffff')}
                            onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)}
                            style={{
                                width: '100%',
                                height: '40px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {/* Font Weight */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Font Weight:</label>
                        <select
                            value={String(editingElement.styles.fontWeight || 'normal')}
                            onChange={(e) => handleUpdateStyle('fontWeight', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Lighter</option>
                            <option value="600">Semi-bold</option>
                        </select>
                    </div>

                    {/* Padding */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Padding:</label>
                        <input
                            type="number"
                            value={parseInt(String(editingElement.styles.padding || '10')) || 10}
                            onChange={(e) => handleUpdateStyle('padding', e.target.value + 'px')}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {/* Border Radius */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Border Radius:</label>
                        <input
                            type="number"
                            value={parseInt(String(editingElement.styles.borderRadius || '0')) || 0}
                            onChange={(e) => handleUpdateStyle('borderRadius', e.target.value + 'px')}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                            }}
                        />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            onClick={handleSaveEdit}
                            style={{
                                flex: 1,
                                padding: '10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => setEditingElement(null)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop for Edit Panel */}
            {editingElement && (
                <div
                    onClick={() => setEditingElement(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                    }}
                />
            )}
        </div>
    );
};

export default Editor;