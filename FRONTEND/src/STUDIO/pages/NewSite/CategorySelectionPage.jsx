import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import SchoolIcon from '@mui/icons-material/School';
import BrushIcon from '@mui/icons-material/Brush';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
    WIZARD_STAGES,
    clearStageAndFollowing,
    completeStage,
    getStageRoute
} from './wizardStageManager';

const categories = [
    {
        id: 'wellness',
        icon: SelfImprovementIcon,
        name: 'Wellness & Ruch',
        accentColor: 'rgba(76, 175, 80, 0.12)',
        glowColor: 'rgba(76, 175, 80, 0.25)',
        baseColor: 'rgba(76, 175, 80, 0.85)'
    },
    {
        id: 'education',
        icon: SchoolIcon,
        name: 'Edukacja',
        accentColor: 'rgba(33, 150, 243, 0.12)',
        glowColor: 'rgba(33, 150, 243, 0.25)',
        baseColor: 'rgba(33, 150, 243, 0.85)'
    },
    {
        id: 'creative',
        icon: BrushIcon,
        name: 'Kreatywność',
        accentColor: 'rgba(156, 39, 176, 0.12)',
        glowColor: 'rgba(156, 39, 176, 0.25)',
        baseColor: 'rgba(156, 39, 176, 0.85)'
    },
    {
        id: 'health',
        icon: FavoriteIcon,
        name: 'Zdrowie',
        accentColor: 'rgba(244, 67, 54, 0.12)',
        glowColor: 'rgba(244, 67, 54, 0.25)',
        baseColor: 'rgba(244, 67, 54, 0.85)'
    }
];

const CategoryCard = ({ category, index, onSelect, isSelected }) => {
    const IconComponent = category.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.06, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
            <Box
                onClick={() => onSelect(category.id)}
                sx={{
                    position: 'relative',
                    height: { xs: 110, sm: 115, md: 120 },
                    minWidth: { xs: 'auto', md: 180 },
                    width: { xs: '100%', md: 180 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: (theme) => 
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid',
                    borderColor: isSelected 
                        ? 'rgba(146, 0, 32, 0.35)' 
                        : 'rgba(146, 0, 32, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    transition: 'all 0.36s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 50% 30%, ${category.accentColor} 0%, transparent 60%)`,
                        opacity: 0,
                        transition: 'opacity 0.36s ease'
                    },
                    '&:hover': {
                        transform: 'translateY(-6px) scale(1.03)',
                        borderColor: category.baseColor,
                        boxShadow: `0 10px 24px ${category.glowColor}`,
                        '&::before': {
                            opacity: 1
                        },
                        '& .category-icon': {
                            transform: 'scale(1.12) rotate(3deg)',
                            color: category.baseColor
                        }
                    },
                    ...(isSelected && {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 8px 20px ${category.glowColor}`,
                        '&::before': {
                            opacity: 1
                        }
                    })
                }}
            >
                <IconComponent
                    className="category-icon"
                    sx={{
                        fontSize: 34,
                        color: 'text.secondary',
                        mb: 1,
                        transition: 'all 0.34s ease'
                    }}
                />
                <Typography 
                    variant="subtitle1" 
                    sx={{ 
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        fontSize: '0.95rem',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    {category.name}
                </Typography>
            </Box>
        </motion.div>
    );
};

const CategorySelectionPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [pageVisible, setPageVisible] = React.useState(false);

    // Clear wizard data when entering this stage (stage 1)
    // This resets the flow from the beginning
    useEffect(() => {
        clearStageAndFollowing(WIZARD_STAGES.CATEGORY);
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => setPageVisible(true), 80);
        return () => clearTimeout(timer);
    }, []);

    const handleSelect = (categoryId) => {
        setSelectedCategory(categoryId);
        
        // Save category selection
        completeStage(WIZARD_STAGES.CATEGORY, { category: categoryId });
        
        setTimeout(() => {
            navigate(getStageRoute(WIZARD_STAGES.PROJECT), { state: { category: categoryId } });
        }, 400);
    };

    const handleSkip = () => {
        // Save default category
        completeStage(WIZARD_STAGES.CATEGORY, { category: 'default' });
        navigate(getStageRoute(WIZARD_STAGES.PROJECT));
    };

    return (
        <Box
                sx={{
                    minHeight: 'calc(100vh - 60px)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.default',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
            {/* Ethereal background blobs */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden'
                }}
            >
                <Box
                    component="span"
                    sx={{
                        position: 'absolute',
                        width: '50vw',
                        height: '50vw',
                        top: '-20vw',
                        right: '-15vw',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(146,0,32,0.06) 0%, rgba(146,0,32,0) 70%)',
                        animation: 'etherealDrift1 25s ease-in-out infinite',
                        '@keyframes etherealDrift1': {
                            '0%': { transform: 'translate3d(0,0,0) scale(1)', opacity: 0.5 },
                            '50%': { transform: 'translate3d(-30px, 40px, 0) scale(1.1)', opacity: 0.3 },
                            '100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: 0.5 }
                        }
                    }}
                />
                <Box
                    component="span"
                    sx={{
                        position: 'absolute',
                        width: '60vw',
                        height: '60vw',
                        bottom: '-25vw',
                        left: '-20vw',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(114,0,21,0.05) 0%, rgba(114,0,21,0) 68%)',
                        animation: 'etherealDrift2 30s ease-in-out infinite',
                        '@keyframes etherealDrift2': {
                            '0%': { transform: 'translate3d(0,0,0) scale(0.95)', opacity: 0.4 },
                            '50%': { transform: 'translate3d(40px,-30px,0) scale(1.05)', opacity: 0.25 },
                            '100%': { transform: 'translate3d(0,0,0) scale(0.95)', opacity: 0.4 }
                        }
                    }}
                />
            </Box>

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Stack 
                    spacing={5}
                    sx={{
                        opacity: pageVisible ? 1 : 0,
                        transform: pageVisible ? 'translateY(0)' : 'translateY(-20px)',
                        transition: 'opacity 0.6s ease, transform 0.6s ease'
                    }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    letterSpacing: 6,
                                    color: 'secondary.main',
                                    fontWeight: 600
                                }}
                            >
                                WYBIERZ KATEGORIĘ
                            </Typography>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.7 }}
                        >
                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    mt: 2,
                                    mb: 2,
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'linear-gradient(135deg, rgba(220,220,220,1) 0%, rgba(146,0,32,0.8) 100%)'
                                            : 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(146,0,32,0.85) 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                Jakiego typu stronę tworzysz?
                            </Typography>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'text.secondary',
                                    maxWidth: 600,
                                    mx: 'auto',
                                    lineHeight: 1.7,
                                    fontWeight: 400
                                }}
                            >
                                Dostosujemy dla Ciebie odpowiednie moduły
                            </Typography>
                        </motion.div>
                    </Box>

                    <Box
                        sx={{
                            display: { xs: 'grid', md: 'flex' },
                            gridTemplateColumns: { 
                                xs: 'repeat(2, 1fr)', 
                                sm: 'repeat(2, 1fr)'
                            },
                            gap: { xs: 2, md: 2.5 },
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'visible',
                            width: '100%'
                        }}
                    >
                        {categories.map((category, index) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                index={index}
                                onSelect={handleSelect}
                                isSelected={selectedCategory === category.id}
                            />
                        ))}
                    </Box>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                    >
                        <Box 
                            sx={{ 
                                textAlign: 'center',
                                mt: 2
                            }}
                        >
                            <Box 
                                onClick={handleSkip}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    cursor: 'pointer',
                                    color: 'text.secondary',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    letterSpacing: 1,
                                    transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    px: 1.5,
                                    py: 0.75,
                                    '&:hover': {
                                        color: 'primary.main',
                                        letterSpacing: 1.5,
                                        transform: 'scale(1.08)',
                                        filter: 'drop-shadow(0 4px 12px rgba(146, 0, 32, 0.3))',
                                        '& .skip-arrow': {
                                            transform: 'translateX(4px)'
                                        }
                                    }
                                }}
                            >
                                Pomiń
                                <ChevronRightIcon 
                                    className="skip-arrow"
                                    sx={{ 
                                        fontSize: 20,
                                        transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} 
                                />
                            </Box>
                        </Box>
                    </motion.div>
                </Stack>
            </Container>
        </Box>
    );
};

export default CategorySelectionPage;
