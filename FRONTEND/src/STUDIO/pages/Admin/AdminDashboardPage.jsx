import React, { useState, useEffect } from 'react';
import {
	Box,
	Card,
	CardContent,
	Chip,
	Divider,
	Grid,
	Stack,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Alert,
	Tabs,
	Tab
} from '@mui/material';
import { People as PeopleIcon, Web as WebIcon } from '@mui/icons-material';
import apiClient from '../../../services/apiClient';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';

const AdminDashboardPage = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [users, setUsers] = useState([]);
	const [sites, setSites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		setError('');
		
		try {
			const [usersResponse, sitesResponse] = await Promise.all([
				apiClient.get('/admin/users/'),
				apiClient.get('/admin/sites/')
			]);
			
			setUsers(usersResponse.data);
			setSites(sitesResponse.data);
		} catch (err) {
			console.error('Error loading admin data:', err);
			setError('Nie udało się załadować danych administracyjnych');
		} finally {
			setLoading(false);
		}
	};

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('pl-PL', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	if (loading) {
		return (
			<REAL_DefaultLayout
				title="Admin Dashboard"
				subtitle="Zarządzaj platformą YourEasySite"
			>
				<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
					<CircularProgress />
				</Box>
			</REAL_DefaultLayout>
		);
	}

	return (
		<REAL_DefaultLayout
			title="Admin Dashboard"
			subtitle="Pełny podgląd wszystkich użytkowników i stron w systemie"
		>
			{error && (
				<Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
					{error}
				</Alert>
			)}

			{/* Summary Cards */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid item xs={12} md={6}>
						<Card elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(160, 0, 22, 0.18)' }}>
							<CardContent>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Box
										sx={{
											width: 56,
											height: 56,
											borderRadius: 2,
											backgroundColor: 'rgba(160, 0, 22, 0.1)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center'
										}}
									>
										<PeopleIcon sx={{ fontSize: 28, color: 'primary.main' }} />
									</Box>
									<Box>
										<Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
											Zarejestrowani użytkownicy
										</Typography>
										<Typography variant="h4" sx={{ fontWeight: 600, mt: 0.5 }}>
											{users.length}
										</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
					<Grid item xs={12} md={6}>
						<Card elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(160, 0, 22, 0.18)' }}>
							<CardContent>
								<Stack direction="row" alignItems="center" spacing={2}>
									<Box
										sx={{
											width: 56,
											height: 56,
											borderRadius: 2,
											backgroundColor: 'rgba(160, 0, 22, 0.1)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center'
										}}
									>
										<WebIcon sx={{ fontSize: 28, color: 'primary.main' }} />
									</Box>
									<Box>
										<Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
											Utworzone strony
										</Typography>
										<Typography variant="h4" sx={{ fontWeight: 600, mt: 0.5 }}>
											{sites.length}
										</Typography>
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				{/* Tabs */}
				<Card elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(160, 0, 22, 0.14)' }}>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tabs value={activeTab} onChange={handleTabChange} sx={{ px: 3 }}>
							<Tab label={`Użytkownicy (${users.length})`} />
							<Tab label={`Strony (${sites.length})`} />
						</Tabs>
					</Box>

					<CardContent sx={{ p: 0 }}>
						{/* Users Table */}
						{activeTab === 0 && (
							<Box sx={{ overflowX: 'auto', width: '100%' }}>
								<TableContainer>
									<Table>
									<TableHead>
										<TableRow>
											<TableCell><strong>ID</strong></TableCell>
											<TableCell><strong>Email</strong></TableCell>
											<TableCell><strong>Imię i nazwisko</strong></TableCell>
											<TableCell><strong>Status</strong></TableCell>
											<TableCell><strong>Admin</strong></TableCell>
											<TableCell><strong>Data rejestracji</strong></TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{users.map((user) => (
											<TableRow key={user.id} hover>
												<TableCell>{user.id}</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell>
													{user.first_name || user.last_name
														? `${user.first_name || ''} ${user.last_name || ''}`.trim()
														: '—'}
												</TableCell>
												<TableCell>
													{user.email_verified ? (
														<Chip label="Zweryfikowany" color="success" size="small" />
													) : (
														<Chip label="Niezweryfikowany" color="warning" size="small" />
													)}
												</TableCell>
												<TableCell>
													{user.is_staff ? (
														<Chip label="Admin" color="error" size="small" />
													) : (
														'—'
													)}
												</TableCell>
												<TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
													{formatDate(user.created_at)}
												</TableCell>
											</TableRow>
										))}
										{users.length === 0 && (
											<TableRow>
												<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
													<Typography variant="body2" color="text.secondary">
														Brak użytkowników w systemie
													</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
							</Box>
						)}

						{/* Sites Table */}
						{activeTab === 1 && (
							<Box sx={{ overflowX: 'auto', width: '100%' }}>
								<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell><strong>ID</strong></TableCell>
											<TableCell><strong>Nazwa</strong></TableCell>
											<TableCell><strong>Identifier</strong></TableCell>
											<TableCell><strong>Właściciel</strong></TableCell>
											<TableCell><strong>Szablon</strong></TableCell>
											<TableCell><strong>Data utworzenia</strong></TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{sites.map((site) => (
											<TableRow key={site.id} hover>
												<TableCell>{site.id}</TableCell>
												<TableCell>
													<Typography variant="body2" sx={{ fontWeight: 600 }}>
														{site.name}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography 
														variant="body2" 
														sx={{ 
															fontFamily: 'monospace', 
															fontSize: '0.8rem',
															color: 'text.secondary' 
														}}
													>
														{site.identifier}
													</Typography>
												</TableCell>
												<TableCell>
													{site.owner_email || '—'}
												</TableCell>
												<TableCell>
													<Chip 
														label={site.template_name || 'Brak'} 
														size="small" 
														variant="outlined"
													/>
												</TableCell>
												<TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
													{formatDate(site.created_at)}
												</TableCell>
											</TableRow>
										))}
										{sites.length === 0 && (
											<TableRow>
												<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
													<Typography variant="body2" color="text.secondary">
														Brak stron w systemie
													</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
							</Box>
						)}
					</CardContent>
				</Card>
		</REAL_DefaultLayout>
	);
};

export default AdminDashboardPage;
