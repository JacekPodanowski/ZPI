import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Card,
    CardContent,
    IconButton,
    Rating,
    TextField,
    MenuItem,
    Divider,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
    fetchTestimonials,
    deleteTestimonial,
    getTestimonialSummary,
    getTestimonialStats,
} from '../../../services/testimonialService';

const TestimonialsManager = ({ siteId }) => {
    const [testimonials, setTestimonials] = useState([]);
    const [summary, setSummary] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('-created_at');
    const [filterRating, setFilterRating] = useState('');
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'

    useEffect(() => {
        loadData();
    }, [siteId, sortBy, filterRating]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [testimonialsData, summaryData, statsData] = await Promise.all([
                fetchTestimonials(siteId, { sort: sortBy, rating: filterRating }),
                getTestimonialSummary(siteId).catch(() => null),
                getTestimonialStats(siteId).catch(() => null),
            ]);
            setTestimonials(testimonialsData.results || testimonialsData);
            setSummary(summaryData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (testimonialId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę opinię?')) {
            return;
        }
        try {
            await deleteTestimonial(testimonialId);
            loadData();
        } catch (error) {
            console.error('Failed to delete testimonial:', error);
            alert('Nie udało się usunąć opinii');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Prepare chart data
    const frequencyData = viewMode === 'daily'
        ? (stats?.daily_frequency || []).map(item => ({
            date: new Date(item.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }),
            count: item.count
        }))
        : (stats?.monthly_frequency || []).map(item => ({
            date: new Date(item.month).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short' }),
            count: item.count
        }));

    const ratingDistData = (stats?.rating_distribution || []).map(item => ({
        rating: `${item.rating}★`,
        count: item.count
    }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* AI Summary Section */}
            {summary && (
                <Card
                    sx={{
                        background: 'linear-gradient(135deg, rgba(146,0,32,0.08) 0%, rgba(12,12,12,0.05) 100%)',
                        border: '1px solid rgba(146, 0, 32, 0.18)',
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Podsumowanie AI
                            </Typography>
                            <Chip
                                label={`${summary.total_count} opinii • Średnia: ${summary.average_rating}/5`}
                                color="primary"
                                size="small"
                            />
                        </Box>
                        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                            {summary.detailed_summary}
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={loadData}
                        >
                            Odśwież
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Statistics Charts */}
            {stats && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    {/* Rating Distribution */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Rozkład ocen
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={ratingDistData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="rating" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="rgb(146, 0, 32)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Frequency Chart */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Częstotliwość opinii
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        variant={viewMode === 'daily' ? 'contained' : 'outlined'}
                                        onClick={() => setViewMode('daily')}
                                    >
                                        Dzienne
                                    </Button>
                                    <Button
                                        size="small"
                                        variant={viewMode === 'monthly' ? 'contained' : 'outlined'}
                                        onClick={() => setViewMode('monthly')}
                                    >
                                        Miesięczne
                                    </Button>
                                </Box>
                            </Box>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={frequencyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="rgb(146, 0, 32)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Filters and Sort */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    select
                    label="Sortuj"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="-created_at">Najnowsze</MenuItem>
                    <MenuItem value="created_at">Najstarsze</MenuItem>
                    <MenuItem value="-rating">Najwyższa ocena</MenuItem>
                    <MenuItem value="rating">Najniższa ocena</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Filtruj po ocenie"
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">Wszystkie</MenuItem>
                    <MenuItem value="5">5 gwiazdek</MenuItem>
                    <MenuItem value="4">4 gwiazdki</MenuItem>
                    <MenuItem value="3">3 gwiazdki</MenuItem>
                    <MenuItem value="2">2 gwiazdki</MenuItem>
                    <MenuItem value="1">1 gwiazdka</MenuItem>
                </TextField>
            </Box>

            {/* Testimonials List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Wszystkie opinie ({testimonials.length})
                </Typography>
                {testimonials.length === 0 ? (
                    <Alert severity="info">Brak opinii do wyświetlenia</Alert>
                ) : (
                    testimonials.map((testimonial) => (
                        <Card key={testimonial.id} variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {testimonial.author_name}
                                            </Typography>
                                            <Rating value={testimonial.rating} readOnly size="small" />
                                            {!testimonial.is_approved && (
                                                <Chip label="Oczekuje" size="small" color="warning" />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                            {new Date(testimonial.created_at).toLocaleDateString('pl-PL', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                                            {testimonial.content}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(testimonial.id)}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default TestimonialsManager;
