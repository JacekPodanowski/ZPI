import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class EditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[EditorErrorBoundary] Caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null 
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgb(228, 229, 218)',
            padding: 4
          }}
        >
          <Paper
            elevation={8}
            sx={{
              maxWidth: '600px',
              padding: 4,
              textAlign: 'center',
              borderRadius: '16px'
            }}
          >
            <ErrorOutline 
              sx={{ 
                fontSize: 80, 
                color: 'rgb(146, 0, 32)',
                mb: 2 
              }} 
            />
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: 'rgb(30, 30, 30)',
                mb: 2
              }}
            >
              Oops! Something went wrong
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(30, 30, 30, 0.7)',
                mb: 3
              }}
            >
              The editor encountered an unexpected error. Don't worry, your work is saved.
            </Typography>
            
            {this.state.error && (
              <Paper
                variant="outlined"
                sx={{
                  padding: 2,
                  bgcolor: 'rgba(146, 0, 32, 0.05)',
                  borderColor: 'rgb(146, 0, 32)',
                  mb: 3,
                  textAlign: 'left',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                <Typography 
                  variant="caption" 
                  component="pre"
                  sx={{ 
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: 'rgb(146, 0, 32)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo && '\n\n' + this.state.errorInfo.componentStack}
                </Typography>
              </Paper>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<Refresh />}
              onClick={this.handleReset}
              sx={{
                bgcolor: 'rgb(146, 0, 32)',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '16px',
                '&:hover': {
                  bgcolor: 'rgb(114, 0, 21)'
                }
              }}
            >
              Reload Editor
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;
