import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: 4 }}>
                    404
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 600, mt: 2 }}>
                    Nie znaleźliśmy tej strony
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
                    Być może została przeniesiona lub usunięta. Wróć na stronę główną i spróbuj ponownie.
                </Typography>
                <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate('/')}>Powrót do strony głównej</Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;
