import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, Typography, Stack, TextField, Button } from '@mui/material';

const RESPONSES = [
  'Let’s keep it airy—this looks aligned with the vibe.',
  'Love the flow; a tiny spacing tweak could go a long way.',
  'Ship it. The story feels cohesive and calm.',
  'Looks polished; maybe soften the contrast just a touch.',
  'Great clarity. I’d spotlight the hero copy slightly more.',
  'Everything resonates. Keep the momentum steady.',
  'This is singing. Perhaps layer in one subtle accent.',
  'Feels grounded and ethereal—full steam ahead.',
  'Nice balance. If anything, bring the CTA forward a notch.',
  'We’re solid. Let’s preserve this sense of space.'
];

const pickResponse = () => RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

const MockAIChatPanel = () => {
  const [messages, setMessages] = useState([
    {
      id: 'intro',
      sender: 'ai',
      text: 'Hey there! I’m in mock mode—ask for feedback and I’ll riff with you.'
    }
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: 'user', text: trimmed },
      { id: `ai-${Date.now()}`, sender: 'ai', text: pickResponse() }
    ]);
    setInput('');
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const groupedMessages = useMemo(() => messages, [messages]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(12, 12, 12, 0.85)',
        color: 'rgb(220, 220, 220)',
        borderLeft: '1px solid rgba(220, 220, 220, 0.12)'
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid rgba(220, 220, 220, 0.12)'
        }}
      >
        <Typography sx={{ fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.6 }}>
          Studio Copilot
        </Typography>
        <Typography sx={{ fontSize: '20px', fontWeight: 500, mt: 0.5 }}>
          Mock AI Assistant
        </Typography>
      </Box>

      <Box
        ref={listRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {groupedMessages.map((message) => (
          <Stack
            key={message.id}
            alignItems={message.sender === 'user' ? 'flex-end' : 'flex-start'}
          >
            <Box
              sx={{
                maxWidth: '92%',
                px: 2,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: 1.5,
                bgcolor: message.sender === 'user'
                  ? 'rgba(146, 0, 32, 0.85)'
                  : 'rgba(255, 255, 255, 0.08)'
              }}
            >
              {message.text}
            </Box>
          </Stack>
        ))}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid rgba(220, 220, 220, 0.12)',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          placeholder="Ask the studio assistant..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(220, 220, 220, 0.12)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(220, 220, 220, 0.24)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgb(146, 0, 32)'
              },
              input: {
                color: 'rgb(220, 220, 220)'
              }
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: 'rgb(146, 0, 32)',
            '&:hover': {
              bgcolor: 'rgb(114, 0, 21)'
            },
            whiteSpace: 'nowrap'
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default MockAIChatPanel;
