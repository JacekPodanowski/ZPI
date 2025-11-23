import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import useTheme from '../../theme/useTheme';
import getEditorColorTokens from '../../theme/editorColorTokens';

/**
 * EditableText - Komponent umożliwiający edycję tekstu inline w edytorze
 * 
 * Po kliknięciu w tekst pojawia się ramka i pole input, które pozwala na edycję.
 * Zmiany są zapisywane przez callback onSave, który integruje się z systemem undo/redo.
 */
const EditableText = ({ 
  value, 
  onSave, 
  as: Component = 'p',
  className = '',
  style = {},
  placeholder = 'Click to edit...',
  multiline = false,
  isModuleSelected = false,
  ...otherProps 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const theme = useTheme();
  const editorColors = getEditorColorTokens(theme);

  // Synchronizuj wartość gdy zmieni się z zewnątrz (np. undo/redo)
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input gdy włączy się tryb edycji
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Clear any text selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = (e) => {
    // Don't close if clicking inside the box itself
    if (boxRef.current && boxRef.current.contains(e.relatedTarget)) {
      return;
    }
    handleSave();
  };

  if (isEditing) {
    return (
      <Box
        ref={boxRef}
        className={className}
        sx={{
          position: 'relative',
          display: 'block',
          width: '100%',
          border: `2px solid ${editorColors.interactive.main}`,
          borderRadius: '4px',
          padding: '4px',
          backgroundColor: 'rgba(146, 0, 32, 0.05)',
          textAlign: 'center'
        }}
      >
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          multiline={multiline}
          fullWidth
          variant="standard"
          placeholder={placeholder}
          InputProps={{
            disableUnderline: true,
            style: {
              textAlign: 'center',
              ...style
            }
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit',
              textAlign: 'center'
            },
            '& .MuiInputBase-input': {
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit',
              padding: 0,
              textAlign: 'center'
            }
          }}
        />
      </Box>
    );
  }

  return (
    <Component
      className={className}
      data-editable-text="true"
      style={{
        ...style,
        cursor: 'text',
        position: 'relative',
        zIndex: 100
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.outline = `2px dashed ${editorColors.interactive.main}40`;
        e.currentTarget.style.outlineOffset = '4px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.outlineOffset = '0px';
      }}
      {...otherProps}
    >
      {value || placeholder}
    </Component>
  );
};

export default EditableText;
