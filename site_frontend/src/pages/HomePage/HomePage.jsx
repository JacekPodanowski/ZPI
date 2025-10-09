import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getTimeSlotsForDate, getDailySummaries } from '../../services/timeSlotService.js';
import moment from 'moment';
import 'moment/locale/pl';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Ikony
import SchoolIcon from '@mui/icons-material/School';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

// Ustawienie polskiego języka dla moment.js
moment.locale('pl');

const heroImageUrl = 'https://images.unsplash.com/photo-1531482615713-2c65a449abc1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80';
const aboutMeImageUrl = `https://i.pravatar.cc/300?u=${process.env.REACT_APP_ADMIN_EMAIL || 'jacek.podanowski'}`;

function HomePage() {
    const [upcomingBlocks, setUpcomingBlocks] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotError, setSlotError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const findThreeUniqueHourBlocks = async () => {
            setLoadingSlots(true);
            setSlotError('');
            const foundBlocks = [];
            const checkedDates = new Set();
            const today = moment().startOf('day');
            const endDate = moment().add(2, 'months').endOf('month');

            try {
                const summariesResponse = await getDailySummaries(today.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
                const availableSummaries = (summariesResponse.data.results || summariesResponse.data || [])
                    .filter(s => s.has_available_slots)
                    .sort((a, b) => moment(a.date).diff(moment(b.date)));

                for (const summary of availableSummaries) {
                    if (foundBlocks.length >= 3) break;
                    
                    const dateStr = summary.date;
                    if (checkedDates.has(dateStr)) continue;
                    checkedDates.add(dateStr);

                    const slotsResponse = await getTimeSlotsForDate(dateStr);
                    const availableSlots = (slotsResponse.data.results || slotsResponse.data || [])
                        .filter(s => s.is_available && moment(s.start_time).isAfter(moment().add(20, 'minutes')))
                        .sort((a, b) => moment(a.start_time).diff(moment(b.start_time)));

                    let consecutiveSlots = [];
                    for (const slot of availableSlots) {
                        if (consecutiveSlots.length === 0) {
                            consecutiveSlots.push(slot);
                        } else {
                            const lastSlot = consecutiveSlots[consecutiveSlots.length - 1];
                            if (moment(lastSlot.end_time).isSame(moment(slot.start_time))) {
                                consecutiveSlots.push(slot);
                            } else {
                                consecutiveSlots = [slot];
                            }
                        }

                        const blockStartTime = moment(consecutiveSlots[0].start_time);
                        const blockEndTime = moment(consecutiveSlots[consecutiveSlots.length - 1].end_time);
                        
                        if (blockEndTime.diff(blockStartTime, 'minutes') >= 60) {
                            foundBlocks.push({
                                id: consecutiveSlots[0].id,
                                startTime: blockStartTime,
                                endTime: blockStartTime.clone().add(1, 'hour'),
                                dateForLink: dateStr,
                            });
                            break;
                        }
                    }
                }
                setUpcomingBlocks(foundBlocks);
            } catch (err) {
                console.error("Failed to fetch upcoming slots on HomePage:", err);
                setSlotError("Wystąpił problem z załadowaniem najbliższych terminów.");
            } finally {
                setLoadingSlots(false);
            }
        };

        findThreeUniqueHourBlocks();
    }, []);

    const handleReserveClick = (date) => {
        navigate(`/calendar?date=${date}`);
    };

    return (
        <Box className="page-content">
            {/* Sekcja Hero */}
            <Box
                sx={{
                    pt: { xs: 8, sm: 12 }, pb: { xs: 6, sm: 10 }, color: 'common.white',
                    textAlign: 'center', position: 'relative', overflow: 'hidden',
                    minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    '&::before': {
                        content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'linear-gradient(rgba(18, 18, 18, 0.6), rgba(18, 18, 18, 0.8))', zIndex: 1,
                    }
                }}
            >
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
                    <Typography component="h1" variant="h2" gutterBottom sx={{ fontWeight: 700, textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                        Profesjonalne Korepetycje z Informatyki
                    </Typography>
                    <Typography variant="h5" component="p" paragraph sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        Rozwiń swoje umiejętności programistyczne i zdobądź wymarzoną wiedzę z pomocą doświadczonego korepetytora.
                    </Typography>
                    <Button
                        component={RouterLink} to="/calendar" variant="contained" color="primary" size="large"
                        sx={{ 
                            padding: '12px 30px', fontSize: '1.1rem',
                            boxShadow: '0px 8px 15px rgba(255, 140, 0, 0.3)',
                            '&:hover': {transform: 'translateY(-2px)', boxShadow: '0px 12px 20px rgba(255, 140, 0, 0.4)'}
                        }}
                    >
                        Znajdź Termin
                    </Button>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                {/* Sekcja "O Mnie" */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 6, backgroundColor: 'background.paper', borderRadius: '12px' }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                            <Box
                                component="img" sx={{
                                    height: 250, width: 250, borderRadius: '50%', objectFit: 'cover',
                                    border: '4px solid', borderColor: 'primary.main',
                                    boxShadow: '0 4px 20px rgba(255,140,0,0.3)',
                                }}
                                alt="Jacek Podanowski" src={aboutMeImageUrl}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main' }}>
                                O Mnie - Jacek Podanowski
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Jestem pasjonatem rozwiązywania problemów z wieloletnim doświadczeniem w tej branży. 
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Specjalizuję się w Pythonie (Django, Flask), JavaScript (React, Node.js)... (Twój opis)
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Sekcja "Co Oferuję?" */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'secondary.main' }}>
                        Zakres Usług
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {[
                            { title: "Indywidualne Lekcje Online", desc: "Sesje 1-na-1 w pełni dostosowane do Twoich potrzeb.", icon: <LaptopChromebookIcon fontSize="large" color="primary"/> },
                            { title: "Przygotowanie do Egzaminów", desc: "Kompleksowe wsparcie w przygotowaniach do matury i innych egzaminów.", icon: <SchoolIcon fontSize="large" color="primary"/> },
                            { title: "Konsultacje Projektowe", desc: "Pomoc i doradztwo przy realizacji Twoich własnych projektów.", icon: <AssignmentIcon fontSize="large" color="primary"/> }
                        ].map((service) => (
                            <Grid item xs={12} sm={6} md={4} key={service.title}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': {transform: 'translateY(-5px)', boxShadow: 6} }}>
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        <Box sx={{ mb: 2, color: 'primary.main' }}>{service.icon}</Box>
                                        <Typography gutterBottom variant="h6" component="h3">
                                            {service.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {service.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                
                {/* ### POCZĄTEK ZMIANY: Przebudowana sekcja najbliższych terminów ### */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 6, backgroundColor: 'background.paper', borderRadius: '12px' }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', color: 'primary.light', mb: 4 }}>
                       <EventAvailableIcon sx={{verticalAlign: 'middle', mr: 1, fontSize: '2.2rem'}}/> Najbliższe Dostępne Terminy
                    </Typography>

                    {loadingSlots && <Box sx={{display: 'flex', justifyContent: 'center', my: 3}}><CircularProgress color="primary" size={50}/></Box>}
                    
                    {slotError && <Alert severity="warning" sx={{textAlign: 'center', my:2}}>{slotError}</Alert>}

                    {!loadingSlots && !slotError && upcomingBlocks.length > 0 && (
                        // Używamy justifyContent="center", aby karty były zawsze na środku
                        <Grid container spacing={4} justifyContent="center">
                            {upcomingBlocks.map(block => (
                                // Zmieniamy md={4} na md={6} i dodajemy lg={4}, aby karty były szersze
                                <Grid item xs={12} sm={8} md={6} lg={4} key={block.id}>
                                    <Card 
                                        variant="outlined" 
                                        sx={{
                                            borderColor: 'primary.dark', 
                                            textAlign: 'center',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.03)', 
                                                boxShadow: '0 8px 30px rgba(255,140,0,0.25)',
                                                borderColor: 'primary.main'
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ pb: 1, px: 1 }}>
                                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                                {block.startTime.format('dddd')}
                                            </Typography>
                                            <Typography variant="h5" component="div" sx={{ color: 'primary.main', my: 1 }}>
                                                {block.startTime.format('D MMMM')}
                                            </Typography>
                                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                                {`${block.startTime.format('HH:mm')} - ${block.endTime.format('HH:mm')}`}
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{justifyContent: 'center', p: 2, pt: 1}}>
                                            <Button onClick={() => handleReserveClick(block.dateForLink)} size="large" color="secondary" variant="contained">
                                                Zarezerwuj
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {!loadingSlots && !slotError && upcomingBlocks.length === 0 && (
                        <Typography sx={{textAlign: 'center', my:2, color: 'text.secondary', fontStyle: 'italic'}}>
                            Brak wolnych terminów w najbliższym czasie. Sprawdź pełny kalendarz.
                        </Typography>
                    )}

                     <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Button component={RouterLink} to="/calendar" variant="outlined" color="primary" size="large">
                            Zobacz Pełny Kalendarz
                        </Button>
                    </Box>
                </Paper>
                {/* ### KONIEC ZMIANY ### */}
            </Container>
        </Box>
    );
}
export default HomePage;