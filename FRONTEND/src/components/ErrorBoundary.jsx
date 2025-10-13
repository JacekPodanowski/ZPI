import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        if (typeof window !== 'undefined' && window.console) {
            console.error('Unhandled application error:', error, errorInfo);
        }
    }

    handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        px: 3,
                        textAlign: 'center',
                        backgroundColor: (theme) => theme.palette.background.default,
                        color: (theme) => theme.palette.text.primary
                    }}
                >
                    <Typography variant="h4" component="h1" fontWeight={600}>
                        Coś poszło nie tak
                    </Typography>
                    <Typography variant="body1" maxWidth={420}>
                        Wystąpił nieoczekiwany błąd. Odśwież stronę, aby spróbować ponownie.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={this.handleReload}>
                        Odśwież stronę
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
