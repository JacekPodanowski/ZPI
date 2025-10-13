import React from 'react';
import {
	Box,
	Card,
	CardContent,
	Chip,
	Container,
	Divider,
	Grid,
	List,
	ListItem,
	ListItemText,
	Stack,
	Typography
} from '@mui/material';

const summaryCards = [
	{
		label: 'Aktywne strony',
		value: '—',
		description: 'Docelowo pobierzemy liczbę wszystkich witryn w systemie.'
	},
	{
		label: 'Zarejestrowani twórcy',
		value: '—',
		description: 'Widok planowany do podpięcia pod API platformy.'
	},
	{
		label: 'Zarejestrowani klienci',
		value: '—',
		description: 'Metryka obejmie zarówno użytkowników OAuth, jak i konta lokalne.'
	}
];

const roadmapItems = [
	{
		title: 'Panel zarządzania stronami',
		points: [
			'Lista wszystkich witryn z informacją o właścicielu, statusie publikacji i dacie ostatniej edycji.',
			'Akcje administracyjne: blokada witryny, reset konfiguracji, podgląd jako właściciel.',
			'Filtrowanie po statusie abonamentu i aktywności.'
		]
	},
	{
		title: 'Panel użytkowników',
		points: [
			'Podział na twórców (PlatformUser) i klientów (Client).',
			'Możliwość zmiany ról, resetu MFA, ręcznego wysyłania zaproszeń.',
			'Log audytowy ostatnich logowań i akcji administracyjnych.'
		]
	},
	{
		title: 'Moduł statystyk',
		points: [
			'Śledzenie liczby publikacji, aktywnych abonamentów oraz zużycia zasobów.',
			'Wykres aktywności kalendarza (wydarzenia publiczne vs. prywatne).',
			'Eksport danych do CSV/BigQuery dla zespołu analitycznego.'
		]
	}
];

const AdminDashboardPage = () => (
	<Container maxWidth="lg">
		<Stack spacing={5}>
			<Stack spacing={1.5}>
				<Typography variant="overline" sx={{ letterSpacing: 3, color: 'secondary.main' }}>
					PANEL ADMINISTRACYJNY
				</Typography>
				<Typography variant="h3" sx={{ fontWeight: 600 }}>
					Zarządzaj platformą Mindful Sites
				</Typography>
				<Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720 }}>
					Ten widok jest przeznaczony dla zespołu developerskiego. Na razie stanowi mapę funkcji, które musimy
					dostarczyć, aby kompleksowo zarządzać wszystkimi witrynami i użytkownikami platformy SaaS.
				</Typography>
			</Stack>

			<Grid container spacing={3}>
				{summaryCards.map((card) => (
					<Grid item xs={12} md={4} key={card.label}>
						<Card elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(160, 0, 22, 0.18)' }}>
							<CardContent>
								<Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
									{card.label}
								</Typography>
								<Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
									{card.value}
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
									{card.description}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			<Card elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(160, 0, 22, 0.14)' }}>
				<CardContent>
					<Stack spacing={3}>
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 600 }}>
								Planowane moduły administracyjne
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Poniższa lista zbiera kluczowe obszary, które musimy wdrożyć, aby w pełni wspierać utrzymanie
								platformy. Każdy punkt opisuje zakres funkcjonalny i oczekiwane integracje.
							</Typography>
						</Box>

						<Divider light>
							<Chip label="Roadmap" color="secondary" variant="outlined" />
						</Divider>

						<Stack spacing={3}>
							{roadmapItems.map((section) => (
								<Box key={section.title}>
									<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
										{section.title}
									</Typography>
									<List dense sx={{ listStyleType: 'disc', pl: 3 }}>
										{section.points.map((point) => (
											<ListItem key={point} sx={{ display: 'list-item', py: 0 }}>
												<ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={point} />
											</ListItem>
										))}
									</List>
								</Box>
							))}
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			<Card elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(160, 0, 22, 0.14)' }}>
				<CardContent>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>
						Następne kroki zespołu
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
						• Przygotować endpointy API do pobierania pełnych list `Site`, `PlatformUser` i `Client` wraz z paginacją.
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
						• Zaprojektować moduł uprawnień admina (podgląd jako użytkownik, blokowanie, reset haseł).
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
						• Dodać telemetry i zbieranie metryk publikacji, aby zasilić sekcję statystyk.
					</Typography>
				</CardContent>
			</Card>
		</Stack>
	</Container>
);

export default AdminDashboardPage;
