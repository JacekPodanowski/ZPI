import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Paper, Link, Divider } from '@mui/material';
import { MonetizationOn as PriceIcon, Assignment as TaskIcon, Email as EmailIcon, Phone as PhoneIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import styles from './InfoPage.module.css';

function InfoPage() {
    return (
        <Container maxWidth="md" className={`${styles.infoPageContainer} page-enter`}>
            {/* Wstęp */}
            <Paper elevation={0} sx={{ backgroundColor: 'transparent', textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Hej !
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '750px', margin: 'auto' }}>
                    Od lat z pasją łączę świat technologii z edukacją, pomagając innym zrozumieć złożone zagadnienia w prosty i kreatywny sposób. Moje doświadczenie jako instruktor robotyki i nauczyciel kreatywnej matematyki nauczyło mnie, że kluczem jest indywidualne podejście i budowanie pewności siebie u ucznia. Stawiam na luźną atmosferę i praktyczne umiejętności, które realnie przydadzą się w Twoich projektach lub na studiach.
                </Typography>
            </Paper>

            <Divider sx={{ my: 4 }} />

            <Divider sx={{ my: 4 }} />

            {/* Kontakt i Zasady */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h2" className={styles.sectionHeader}>Kontakt i elastyczność</Typography>
                <Typography paragraph color="text.secondary" sx={{ maxWidth: '600px', margin: 'auto' }}>
                    Jestem elastyczny i bez problemu dopasuję się do Twojego grafiku. Przełożenie lub odwołanie spotkania to nie problem – wystarczy, że dasz mi znać odpowiednio wcześniej. W razie pytań, śmiało pisz lub dzwoń.
                </Typography>
                <Box className={styles.contactBox}>
                    <Box className={styles.contactItem}>
                        <EmailIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
                        <Link href="mailto:777seeit@gmail.com" color="inherit" underline="hover">777seeit@gmail.com</Link>
                    </Box>
                    <Box className={styles.contactItem}>
                        <PhoneIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
                        <Link href="tel:532553112" color="inherit" underline="hover">532 553 112</Link>
                    </Box>
                    <Box className={styles.contactItem}>
                        <GitHubIcon sx={{ mr: 1.5, color: 'secondary.main' }} />
                        <Link href="https://github.com/JacekPodanowski" target="_blank" rel="noopener" color="inherit" underline="hover">github.com/JacekPodanowski</Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}

export default InfoPage;