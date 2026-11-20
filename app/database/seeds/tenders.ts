// Invented tenders for development only (never loaded in production): the shape and the ranges
// (prices, dates, results) come from the real tracking sheet, none of the values do.
// Rules respected, because the database refuses anything else:
//   Remportée: winner is SPQR, no competitor price (RG16), return date required (RG19)
//   Perdue: return date required; winner name and competitor price are optional
//   En cours, En suspens: no return date, no winner, no competitor price

export type Role = "manager" | "consultant" | "admin";

export type SeedTender = {
	division: string | null;
	community: string;
	subject: string | null;
	consultation: string;
	consultationDetail?: string;
	sendDate: string;
	returnDate?: string;
	quotePrice: number | null;
	result: "Remportée" | "Perdue" | "En cours" | "En suspens";
	pricePosition?: string;
	techPosition?: string;
	note?: string;
	winPrice?: number;
	winnerName?: string;
	discount?: number;
	// The admin creates every tender and is always assigned (RG3); these roles are assigned too
	assignedTo: Role[];
};

export const seedTenders: SeedTender[] = [
	{
		division: "Finances",
		community: "Commune de Brumelin",
		subject: "Analyse financière rétrospective et prospective",
		consultation: "Doubletrade",
		sendDate: "2025-02-10",
		returnDate: "2025-03-21",
		quotePrice: 18500,
		result: "Remportée",
		pricePosition: "Offre dans la moyenne basse des candidats",
		techPosition: "Méthodologie jugée claire et complète",
		note: "Exemple fictif de référence remportée",
		discount: 5,
		assignedTo: ["consultant", "manager"],
	},
	{
		division: "Finances",
		community: "Communauté de communes des Trois Combes",
		subject: "Pacte financier et fiscal",
		consultation: "Direct",
		sendDate: "2025-03-04",
		returnDate: "2025-04-15",
		quotePrice: 32000,
		result: "Remportée",
		pricePosition: "Prix proche de l'enveloppe annoncée",
		techPosition: "Bonne note sur l'accompagnement des élus",
		assignedTo: ["manager"],
	},
	{
		division: "Finances",
		community: "Département de l'Estrelanque",
		subject: "Assistance financière, fiscale et comptable",
		consultation: "Doubletrade",
		sendDate: "2025-05-19",
		returnDate: "2025-07-02",
		quotePrice: 74000,
		result: "Remportée",
		techPosition: "Équipe jugée adaptée à la taille du Département",
		discount: 10,
		assignedTo: ["consultant"],
	},
	{
		division: "Restauration",
		community: "Syndicat intercommunal des Écoles de Fontarreau",
		subject: "Restauration scolaire",
		consultation: "Autre",
		consultationDetail: "Consultation via une plateforme d'achats groupés",
		sendDate: "2025-09-08",
		returnDate: "2025-10-20",
		quotePrice: 9800,
		result: "Remportée",
		assignedTo: ["consultant"],
	},
	{
		division: "Finances",
		community: "Commune de Sarvalen",
		subject: "Contrôle de gestion",
		consultation: "Doubletrade",
		sendDate: "2025-01-27",
		returnDate: "2025-03-10",
		quotePrice: 21500,
		result: "Perdue",
		pricePosition: "Offre plus chère que celle du cabinet retenu",
		techPosition: "Méthodologie jugée correcte mais peu différenciante",
		winPrice: 16900,
		winnerName: "Cabinet Alpha Conseil",
		assignedTo: ["consultant"],
	},
	{
		division: "Culture",
		community: "Communauté d'agglomération du Val de Sarmance",
		subject: "Équipements culturels et sportifs",
		consultation: "Direct",
		sendDate: "2025-04-14",
		returnDate: "2025-06-03",
		quotePrice: 45000,
		result: "Perdue",
		techPosition: "Références jugées insuffisantes sur le sujet",
		note: "Retour détaillé non communiqué",
		winnerName: "Atelier Finances Publiques",
		assignedTo: ["manager"],
	},
	{
		division: "Transition écologique",
		community: "Région Aurelande",
		subject: "Projet de territoire et prospective",
		consultation: "Doubletrade",
		sendDate: "2025-06-23",
		returnDate: "2025-08-04",
		quotePrice: 118000,
		result: "Perdue",
		pricePosition: "Écart de prix important avec le premier",
		winPrice: 96500,
		winnerName: "Groupement Delta Territoires",
		assignedTo: ["consultant", "manager"],
	},
	{
		division: "Finances",
		community: "Commune de Fontarreau",
		subject: "Direction par intérim",
		consultation: "Direct",
		sendDate: "2025-08-18",
		returnDate: "2025-09-05",
		quotePrice: 27500,
		result: "Perdue",
		note: "Poste pourvu en interne",
		assignedTo: [],
	},
	{
		division: "Finances",
		community: "Communauté de communes du Plateau d'Ervigne",
		subject: "Tarification des services publics",
		consultation: "Doubletrade",
		sendDate: "2025-10-06",
		returnDate: "2025-11-17",
		quotePrice: 12400,
		result: "Perdue",
		winPrice: 9800,
		winnerName: "Cabinet Alpha Conseil",
		assignedTo: ["consultant"],
	},
	{
		division: "Finances",
		community: "Métropole de Castelvaire",
		subject: "Délégation de service public et concessions",
		consultation: "Doubletrade",
		sendDate: "2026-03-09",
		quotePrice: 58000,
		result: "En cours",
		note: "Réponse attendue au printemps",
		assignedTo: ["manager"],
	},
	{
		division: "Finances",
		community: "Commune de Lauzenac",
		subject: "Assistance financière, fiscale et comptable",
		consultation: "Direct",
		sendDate: "2026-04-21",
		quotePrice: 15200,
		result: "En cours",
		assignedTo: ["consultant"],
	},
	{
		division: "Culture",
		community: "Commune de Montclarel",
		subject: "Équipements culturels et sportifs",
		consultation: "Doubletrade",
		sendDate: "2026-06-02",
		quotePrice: 23800,
		result: "En cours",
		discount: 5,
		assignedTo: ["consultant", "manager"],
	},
	{
		division: "Transition écologique",
		community: "Syndicat mixte de l'Eau de la Brume",
		subject: "Audit organisationnel et financier",
		consultation: "Doubletrade",
		sendDate: "2026-09-14",
		quotePrice: 39000,
		result: "En cours",
		assignedTo: [],
	},
	{
		division: "Finances",
		community: "Communauté d'agglomération Rives de Tarvelle",
		subject: "Transfert de compétences",
		consultation: "Doubletrade",
		sendDate: "2026-02-16",
		quotePrice: 41000,
		result: "En suspens",
		note: "Procédure suspendue par la collectivité",
		assignedTo: ["manager"],
	},
	{
		division: "Finances",
		community: "Département des Hautes-Corbières d'Ouest",
		subject: "Montage de dossiers de financement",
		consultation: "Direct",
		sendDate: "2026-05-11",
		quotePrice: 17300,
		result: "En suspens",
		assignedTo: ["consultant"],
	},
	{
		division: "Restauration",
		community: "Commune de Vaudrimont",
		subject: "Restauration scolaire",
		consultation: "Doubletrade",
		sendDate: "2026-07-06",
		quotePrice: 8600,
		result: "En suspens",
		note: "Recrutement en cours côté collectivité",
		assignedTo: [],
	},
	{
		division: "Finances",
		community: "CCAS de Brumelin",
		subject: "Formation des élus et des agents",
		consultation: "Autre",
		consultationDetail: "Appel à candidatures sur le site de l'association",
		sendDate: "2026-08-24",
		quotePrice: 4200,
		result: "En cours",
		assignedTo: ["consultant"],
	},
	{
		division: null,
		community: "Office de tourisme intercommunal de Lorvenne",
		subject: null,
		consultation: "Direct",
		sendDate: "2026-10-12",
		quotePrice: null,
		result: "En cours",
		note: "Fiche en cours de saisie, division et sujet à préciser",
		assignedTo: ["manager"],
	},
];
