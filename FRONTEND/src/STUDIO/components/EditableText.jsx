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
  const displayRef = useRef(null);
  const [capturedStyles, setCapturedStyles] = useState({});
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

  useEffect(() => {
    if (!isEditing && displayRef.current) {
      const computed = window.getComputedStyle(displayRef.current);
      setCapturedStyles({
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        textTransform: computed.textTransform,
        textAlign: computed.textAlign,
        color: computed.color
      });
    }
  }, [isEditing, style, value]);

  const typographyStyles = {
    fontFamily: capturedStyles.fontFamily || style.fontFamily,
    fontSize: capturedStyles.fontSize || style.fontSize,
    fontWeight: capturedStyles.fontWeight || style.fontWeight,
    lineHeight: capturedStyles.lineHeight || style.lineHeight,
    letterSpacing: capturedStyles.letterSpacing || style.letterSpacing,
    textTransform: capturedStyles.textTransform || style.textTransform,
    textAlign: capturedStyles.textAlign || style.textAlign || 'inherit',
    color: capturedStyles.color || style.color || 'inherit'
  };

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
          textAlign: typographyStyles.textAlign,
          ...typographyStyles
        }}
        style={style}
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
              ...typographyStyles,
              ...style
            }
          }}
          sx={{
            '& .MuiInputBase-root': {
              ...typographyStyles,
              color: typographyStyles.color,
              textAlign: typographyStyles.textAlign
            },
            '& .MuiInputBase-input': {
              ...typographyStyles,
              color: typographyStyles.color,
              padding: 0,
              textAlign: typographyStyles.textAlign
            }
          }}
        />
      </Box>
    );
  }

  return (
    <Component
      ref={displayRef}
      className={className}
      data-editable-text="true"
      style={{
        ...style,
        cursor: 'text',
        position: 'relative',
        zIndex: 100
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
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
