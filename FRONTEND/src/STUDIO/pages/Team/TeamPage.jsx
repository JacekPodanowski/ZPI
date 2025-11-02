import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Avatar, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Add as AddIcon, People as PeopleIcon, Email as EmailIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';

const TeamPage = () => {
    const { siteId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [teamMembers, setTeamMembers] = useState([
        {
            id: 1,
            name: 'Owner',
            email: 'owner@example.com',
            role: 'Owner',
            avatar: null,
            joinedDate: 'Jan 2025'
        }
    ]);

    const handleBack = () => {
        navigate('/studio/sites');
    };

    const handleAddMember = () => {
        // TODO: Implement add member functionality
        console.log('Add member clicked');
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                py: { xs: 4, md: 6 },
                px: { xs: 1, md: 0 }
            }}
        >
            {/* Hero Section */}
            <Box
                sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    position: 'relative',
                    background:
                        'radial-gradient(circle at 10% 20%, rgba(146,0,32,0.36) 0%, rgba(12,12,12,0.92) 55%, rgba(12,12,12,0.88) 100%)',
                    boxShadow: '0 30px 60px rgba(12,12,12,0.45)',
                    color: 'rgb(228,229,218)'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 3, md: 6 },
                        p: { xs: 4, md: 6 },
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.7 }}>
                            ZARZĄDZANIE ZESPOŁEM
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 600 }}>
                            Twój Zespół
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.76, maxWidth: 520 }}>
                            Współpracuj z zespołem nad rozwojem witryny. Zarządzaj rolami, uprawnieniami i monitoruj aktywność członków zespołu.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AddIcon />}
                                onClick={handleAddMember}
                                sx={{ fontWeight: 600 }}
                            >
                                Dodaj członka
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                sx={{ fontWeight: 600, borderColor: 'rgba(228,229,218,0.4)', color: 'rgb(228,229,218)' }}
                            >
                                Wróć do panelu
                            </Button>
                        </Box>
                    </Box>

                    {/* Team Stats Card */}
                    <Box
                        sx={{
                            flex: 1,
                            borderRadius: 4,
                            backdropFilter: 'blur(12px)',
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(228,229,218,0.18)',
                            boxShadow: '0 20px 35px rgba(12,12,12,0.35)',
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, rgba(146,0,32,0.3) 0%, rgba(146,0,32,0.15) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(146,0,32,0.3)'
                                }}
                            >
                                <PeopleIcon sx={{ fontSize: 32, color: 'rgb(228,229,218)' }} />
                            </Box>
                            <Box>
                                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                                    {teamMembers.length}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                    {teamMembers.length === 1 ? 'Członek zespołu' : 'Członków zespołu'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 2,
                                pt: 2,
                                borderTop: '1px solid rgba(228,229,218,0.12)'
                            }}
                        >
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 1 }}>
                                    AKTYWNI
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {teamMembers.length}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.6, letterSpacing: 1 }}>
                                    ROLA ADMIN
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    {teamMembers.filter(m => m.role === 'Owner').length}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 80% 10%, rgba(146,0,32,0.45) 0%, transparent 45%)',
                        pointerEvents: 'none'
                    }}
                />
            </Box>

            {/* Team Members Section */}
            <Box
                sx={{
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(228,229,218,0.85) 100%)',
                    border: '1px solid rgba(146, 0, 32, 0.12)',
                    boxShadow: '0 20px 40px rgba(12,12,12,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Członkowie zespołu
                    </Typography>
                    <Chip
                        label={`${teamMembers.length} ${teamMembers.length === 1 ? 'osoba' : 'osób'}`}
                        sx={{
                            backgroundColor: 'rgba(146, 0, 32, 0.1)',
                            color: 'rgb(146, 0, 32)',
                            fontWeight: 600
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {teamMembers.map((member) => (
                        <Box
                            key={member.id}
                            sx={{
                                borderRadius: 3,
                                p: 3,
                                background: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(146, 0, 32, 0.08)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 24px rgba(12,12,12,0.12)',
                                    background: 'rgba(255,255,255,0.8)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: 'rgb(146, 0, 32)',
                                        fontSize: '1.5rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {member.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                        {member.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {member.email}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Dołączył: {member.joinedDate}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        icon={<AdminIcon />}
                                        label={member.role}
                                        sx={{
                                            backgroundColor: 'rgba(146, 0, 32, 0.15)',
                                            color: 'rgb(146, 0, 32)',
                                            fontWeight: 600,
                                            border: '1px solid rgba(146, 0, 32, 0.2)'
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Empty State */}
                {teamMembers.length === 0 && (
                    <Box
                        sx={{
                            borderRadius: 3,
                            p: 6,
                            background: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(146, 0, 32, 0.08)',
                            textAlign: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, rgba(146,0,32,0.1) 0%, rgba(146,0,32,0.05) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                border: '1px solid rgba(146,0,32,0.15)'
                            }}
                        >
                            <PeopleIcon sx={{ fontSize: 40, color: 'rgb(146, 0, 32)', opacity: 0.7 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                            Nie ma jeszcze członków zespołu
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
                            Dodaj członków zespołu, aby wspólnie pracować nad rozwojem witryny. Zarządzaj uprawnieniami i monitoruj aktywność.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddMember}
                            sx={{
                                bgcolor: 'rgb(146, 0, 32)',
                                '&:hover': {
                                    bgcolor: 'rgb(114, 0, 21)'
                                },
                                fontWeight: 600
                            }}
                        >
                            Dodaj pierwszego członka
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Permissions Section */}
            <Box
                sx={{
                    borderRadius: 4,
                    p: { xs: 3, md: 4 },
                    background: 'linear-gradient(135deg, rgba(12,12,12,0.92) 0%, rgba(30,30,30,0.95) 100%)',
                    border: '1px solid rgba(146, 0, 32, 0.18)',
                    boxShadow: '0 20px 40px rgba(12,12,12,0.35)',
                    color: 'rgb(228,229,218)',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3
                }}
            >
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Uprawnienia i role
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.75, maxWidth: 520 }}>
                        Kontroluj, kto ma dostęp do różnych funkcji witryny. Przypisuj role i zarządzaj uprawnieniami członków zespołu.
                    </Typography>
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        borderRadius: 3,
                        p: 3,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(228,229,218,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Dostępne role
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        • <strong>Owner</strong> – Pełne uprawnienia administratora
                        <br />• <strong>Editor</strong> – Edycja treści i modułów
                        <br />• <strong>Viewer</strong> – Tylko podgląd analityki
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ alignSelf: 'flex-start', mt: 1 }}
                        onClick={handleAddMember}
                    >
                        Zarządzaj uprawnieniami
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default TeamPage;
