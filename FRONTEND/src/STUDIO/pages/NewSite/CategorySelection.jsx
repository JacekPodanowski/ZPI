import React from 'react';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import SchoolIcon from '@mui/icons-material/School';
import BrushIcon from '@mui/icons-material/Brush';
import FavoriteIcon from '@mui/icons-material/Favorite';

const categories = [
    {
        id: 'wellness',
        icon: SelfImprovementIcon,
        name: 'Wellness & Ruch',
        description: 'Dla instruktorów jogi, pilatesu, treningu personalnego i praktyk uważności'
    },
    {
        id: 'education',
        icon: SchoolIcon,
        name: 'Edukacja & Korepetycje',
        description: 'Dla nauczycieli, korepetytorów, trenerów języków i instruktorów muzycznych'
    },
    {
        id: 'creative',
        icon: BrushIcon,
        name: 'Kreatywność & Profesja',
        description: 'Dla fotografów, designerów, konsultantów i freelancerów kreatywnych'
    },
    {
        id: 'health',
        icon: FavoriteIcon,
        name: 'Zdrowie & Terapia',
        description: 'Dla terapeutów, psychologów, dietetyków i coachów zdrowotnych'
    }
];

const CategoryCard = ({ category, index, onSelect, isSelected }) => {
    const IconComponent = category.icon;

    return (
        <Grid item xs={12} md={6}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <Box
                    onClick={() => onSelect(category.id)}
                    sx={{
                        position: 'relative',
                        height: '100%',
                        minHeight: 280,
                        borderRadius: 4,
                        border: isSelected
                            ? '2px solid rgba(160, 0, 22, 0.45)'
                            : '1px solid rgba(160, 0, 22, 0.12)',
                        backgroundColor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        p: 4,
                        '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 8px 24px rgba(160, 0, 22, 0.15)',
                            border: '2px solid rgba(160, 0, 22, 0.3)'
                        }
                    }}
                >
                    <IconComponent
                        sx={{
                            fontSize: 64,
                            color: 'secondary.main',
                            mb: 3
                        }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        {category.name}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6
                        }}
                    >
                        {category.description}
                    </Typography>
                </Box>
            </motion.div>
        </Grid>
    );
};

const CategorySelection = ({ onSelectCategory, onSkip }) => {
    const [selectedCategory, setSelectedCategory] = React.useState(null);

    const handleSelect = (categoryId) => {
        setSelectedCategory(categoryId);
        setTimeout(() => {
            onSelectCategory(categoryId);
        }, 300);
    };

    return (
        <Container maxWidth="lg">
            <Stack spacing={6}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            letterSpacing: 2,
                            color: 'secondary.main',
                            fontWeight: 600
                        }}
                    >
                        TWORZENIE STRONY
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mt: 1,
                            mb: 2
                        }}
                    >
                        Jakiego typu stronę chcesz stworzyć?
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 700,
                            mx: 'auto',
                            lineHeight: 1.7
                        }}
                    >
                        Wybierz kategorię, która najlepiej opisuje Twoją działalność. Dostosujemy za Ciebie
                        odpowiednie moduły.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {categories.map((category, index) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            index={index}
                            onSelect={handleSelect}
                            isSelected={selectedCategory === category.id}
                        />
                    ))}
                </Grid>

                <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Button
                        onClick={onSkip}
                        sx={{
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline',
                                textDecorationColor: 'secondary.main'
                            }
                        }}
                    >
                        Pomiń ten krok
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
};

export default CategorySelection;
