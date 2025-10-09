import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import './App.css'; 
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Box, Typography, CircularProgress } from '@mui/material';

// --- Importy stron (lazy loading) ---
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage.jsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage/LoginPage.jsx'));
const SignupPage = React.lazy(() => import('./pages/SignupPage/SignupPage.jsx'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage/CalendarPage.jsx'));
const StudentPage = React.lazy(() => import('./pages/StudentPage/StudentPage.jsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage/AdminPage.jsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage/NotFoundPage.jsx'));
const InfoPage = React.lazy(() => import('./pages/InfoPage/InfoPage.jsx'));

const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, height: 'calc(100vh - 128px)' }}>
        <CircularProgress />
    </Box>
);

const particlesOptions = {
    autoPlay: true,
    background: { color: { value: "transparent" } },
    fullScreen: { enable: true, zIndex: -10 },
    fpsLimit: 30,
    interactivity: {
        events: {
            onClick: { enable: true, mode: "push" },
            onHover: { enable: true, mode: "grab", parallax: { enable: true, force: 100, smooth: 30 } },
            resize: { enable: true }
        },
        modes: {
            push: { quantity: 1 },
            grab: { distance: 120, links: { opacity: 0.8, color: "#ff8c00" } }
        }
    },
    particles: {
        color: { value: ["#921eccff", "#8A2BE2","#4B0082"] },
        links: { color: { value: "#404040" }, distance: 100, enable: true, opacity: 0.3, width: 1 },
        collisions: { enable: true, mode: "bounce" },
        move: { 
            direction: "none", enable: true, outModes: { default: "out" }, 
            random: true, speed: 0.4, straight: false, 
            attract: { enable: true, distance: 200, rotateX: 800, rotateY: 800 } 
        },
        number: { density: { enable: true, area: 1500 }, value: 25, limit: 30 },
        opacity: { value: { min: 0.25, max: 0.55 }, animation: { enable: true, speed: 0.5, minimumValue: 0.15, sync: false } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 2.5 }, animation: { enable: true, speed: 0.5, minimumValue: 0.5, sync: false } },
        life: { duration: { sync: true, value: 45 }, count: 1, delay: { random: { enable: true, minimumValue: 0.1 }, value: 0.2 } }
    },
    detectRetina: true
};

function App() {
    const [particlesInit, setParticlesInit] = useState(false);
    useEffect(() => { initParticlesEngine(async (engine) => { await loadSlim(engine); }).then(() => { setParticlesInit(true); }); }, []);

    return (
        <> 
            {particlesInit && <Particles id="tsparticles" options={particlesOptions} />}
            <Box className="app-container" sx={{ bgcolor: 'transparent' }}> 
                <ErrorBoundary><Navigation /></ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                    <Box component="main" className="page-content" sx={{ bgcolor: 'transparent' }}>
                        <Routes>
                            {/* Ścieżki publiczne */}
                            <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                            <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                            <Route path="/signup" element={<ErrorBoundary><SignupPage /></ErrorBoundary>} />
                            <Route path="/calendar" element={<ErrorBoundary><CalendarPage /></ErrorBoundary>} />
                            <Route path="/info" element={<ErrorBoundary><InfoPage /></ErrorBoundary>} />

                            {/* Ścieżki chronione */}
                            <Route path="/student-dashboard" element={<ProtectedRoute allowedUserTypes={['student', 'vip', 'admin']}><ErrorBoundary><StudentPage /></ErrorBoundary></ProtectedRoute>} />
                            <Route path="/admin" element={<ProtectedRoute allowedUserTypes={['admin']}><ErrorBoundary><AdminPage /></ErrorBoundary></ProtectedRoute>} />
                            
                            {/* Strona 404 zawsze na końcu */}
                            <Route path="*" element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
                        </Routes>
                    </Box>
                </Suspense>
                <ErrorBoundary><Footer /></ErrorBoundary>
            </Box>
        </>
    );
}
export default App;