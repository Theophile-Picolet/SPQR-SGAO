
# **Product Requirements Document (PRD)**
**SGAO : Système de Gestion Centralisée des Références pour Appels d’Offres**
---
## **1. Le Problème (JTBD)**
**Job To Be Done :**
> *"Quand **je dois répondre à un appel d’offres**, je veux **accéder instantanément à toutes les références pertinentes du cabinet**, pour **gagner du temps, éviter les erreurs et maximiser les chances de remport**."*

**Contexte :**
Les cabinets de conseil en politique et finances publiques répondent à de nombreux appels d'offres. Pour chaque réponse, les consultants doivent chercher parmi des centaines de références passées celles qui sont pertinentes. Cette recherche est actuellement fragmentée (fichiers Excel, emails, différentes sources de stockage) et consomme des heures précieuses.
- **Résumer** :
  - Fichiers Excel locaux (non partagés, non centralisés).
  - Emails, mémoires techniques, ou dossiers physiques.
  - Pas de recherche centralisée → **3-4 heures perdues par AO** à chercher manuellement.
- **Conséquences** :
  - Perte de productivité (tâche à faible valeur ajoutée).
  - Risque de **non-conformité** (oubli de références clés).
  - Frustration des consultants (tâche répétitive et chronophage).

**Preuves (Triangulation) :**
   Source               | Type                     | Extrait clé                                                                                     |
 |----------------------|--------------------------|-------------------------------------------------------------------------------------------------|
 | **SGAO (Cas client)** | Entretien (02/2025)      | *"On cherche dans un tableau Excel global + notre propre suivi, c’est fragmenté et ça prend des heures."* |
 | **Simply’AO**         | Article métier           | *"Les références sont un élément incontournable [...] à présenter sous forme de tableau."* → Reconstitution manuelle systématique. |
 | **Hiscox**            | Avis outils (03/2026)    | *"Bibliothèque centralisée" (Responsive/Loopio) → Gain de temps de **30-40%** grâce à la centralisation. |

---

---
## **2. La Cible (Persona Précise)**

### **Persona Principal : Auguste, Consultant Senior en Finances Publiques**
- **Rôle** : Rédaction des réponses aux AO.
- **Fréquence** : 1-2 AO/semaine.
- **frustration** :
  > *"Je passe 3-4 heures à chercher les bonnes références au lieu de rédiger la réponse. Parfois, j’oublie une référence clé parce qu’elle est dans un fichier Excel sur l’ordinateur d’un collègue."*
- **Gain Attendu** :
  - Retrouver les références pertinentes en **5-10 minutes max**.
  - **Zéro erreur** d’oubli ou de doublon.

### **Utilisateurs Secondaires**
 | Rôle               | Besoins                                                                                     | Fréquence d’utilisation |
 |--------------------|---------------------------------------------------------------------------------------------|-------------------------|
 | **Admin**          | Gestion des utilisateurs/rôles, import initial des références existantes, suppression.      | Ponctuelle              |
 | **Manager**        | Validation des demandes de modification sur ses références affectées, suivi de ses consultants, garantie de la qualité des données. | Quotidienne (traitement de la file d'attente) |
 | **Consultants Juniors** | Recherche/consultation des références, création de nouvelles références, demandes de modification sur leurs références affectées. | Hebdomadaire            |

### **Modèle de responsabilité**

La qualité des données est le point faible identifié d'une base de références partagée. Le modèle retenu répartit les responsabilités ainsi :

- **Création ouverte** : tout utilisateur peut créer une référence. La première insertion massive est réalisée par la personne en charge (script SQL), puis chacun alimente la base. Aucun goulot d'étranglement à la saisie.
- **Modification contrôlée** : seuls l'admin et les managers affectés à la référence la modifient directement. Un consultant affecté soumet une demande de modification ou de suppression ; les modifications sont validées par un manager affecté ou un admin, les suppressions par l'admin seul. Une donnée validée ne peut donc pas être dégradée silencieusement.
- **Affectation explicite** : le créateur est affecté d'office ; l'admin complète l'équipe. L'affectation conditionne l'accès au détail et aux commentaires, ce qui garde les échanges internes dans le cercle des personnes concernées, sans nuire à la recherche transversale (la liste des références reste visible de tous).

**Justification de la cible** :
- **Focus sur les cabinets de conseil en politique/finances publiques** (fort volume d’AO, peu outillés).
- **Exclusion** : Grands groupes (déjà équipés de solutions lourdes comme Salesforce) ou freelances (besoins trop simples).

---

---
## **3. Proposition de Valeur Unique (USP)**
**SGAO est le seul outil conçu spécifiquement pour les cabinets de conseil en politique/finances publiques, qui permet :**

- **Centralisation instantanée** : Toutes les références du cabinet accessibles en **1 clic**, depuis n’importe quel appareil.
- **Recherche ultra-rapide** : Filtres par **pôle, type de mission, année, collectivité, montant, statut (gagné/perdu)**.
- **Intégration légère** : Première intégration en base de données avec un script sql, puis intégration au fur et à mesure des nouvelles références par un jeune consultant du groupe → **pas de migration complexe**.

**Différenciation vs. concurrents (Responsive, Loopio, etc.)** :
 | Critère               | SGAO                          | Outils génériques (Responsive, Loopio)       |
 |-----------------------|------------------------------------|---------------------------------------------|
 | **Cible**             | Cabinets de conseil **spécialisés** | Entreprises tous secteurs                  |
 | **Prix**              | **Abordable** (adapté aux PME)      | Coût élevé (1000$/mois+)                    |
 | **Simplicité**        | **1 fonctionnalité core** (recherche) | Fonctionnalités lourdes (CRM, IA, etc.)    |
 | **Intégration**       | **SQL puis par ajout dans l'application         | Nécessite des connecteurs complexes         |

**Bénéfices clés** :
- **Gain de temps** : Réduction de **150 min → 10-15 min** par AO.
- **Qualité** : **+5-10% de taux de remport** (meilleures références = meilleures réponses).
- **Traçabilité** : Suivi du portefeuille de références (gains/pertes).

---

---
## **4. Fonctionnalité Principale pour la V1 (MVP)**
**Objectif V1** : *Rendre la recherche de références **10x plus rapide** que l’existant (Excel + emails).*

### **Core Feature : Moteur de Recherche Centralisé**
 | Fonctionnalité               | Description                                                                                     | Priorité |
 |------------------------------|-------------------------------------------------------------------------------------------------|----------|
 | **Créer une référence**      | Saisie des infos d’un AO : client, pôle, type de mission, année, montant, description, remport, commentaire. Ouverte à tous, avec auto-affectation du créateur. | ⭐⭐⭐ |
 | **Recherche multi-critères** | Filtres combinables : **pôle, type de mission, année, collectivité, montant, statut (gagné/perdu)**. | ⭐⭐⭐ |
 | **Dashboard**                | Liste de **toutes** les références avec filtres appliqués + vue "Dernières ajoutées".            | ⭐⭐⭐ |
 | **Mes références**           | Vue restreinte aux références affectées : détail complet et commentaires.                        | ⭐⭐⭐ |
 | **Éditer une référence**     | Modification directe réservée à l'admin et aux managers affectés.                                            | ⭐⭐⭐ |
 | **Demande de modification**  | Un consultant affecté soumet des valeurs (ou demande une suppression), un manager affecté ou l'admin valide ou rejette. La référence n'est modifiée qu'après approbation. | ⭐⭐⭐ |
 | **Affectation des références** | L'admin attribue une référence à un ou plusieurs utilisateurs.                               | ⭐⭐⭐ |
 | **Notifications**            | Affectation, demande soumise, décision de validation, nouveau commentaire.                       | ⭐⭐    |
 | **Gestion des utilisateurs** | Création, modification, désactivation/réactivation logique des comptes + attribution de rôles (Consultant/Manager/Admin).                             | ⭐⭐    |
 | **Authentification**         | Login/Logout sécurisé (JWT).                                                                     | ⭐⭐    |

**Exemple d’interface (Wireframe textuel)** :
[Barre de recherche]

→ Filtres : [Pôle ▼] [Type de mission ▼] [Année ▼] [Collectivité ▼] [Montant ▼] [Statut ▼]
[Résultats]
| Client | Pôle | Type de mission | Année | Montant | Statut | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| Mairie de Lyon | Finances | Audit | 2025 | 50k€ | Gagné | [Voir] |
| Région ARA | Politique | Conseil | 2024 | 120k€ | Perdu | [Voir] |

---
### **Out of Scope (Hors Périmètre V1)**
❌ **Tableaux statistiques** (CA, taux de remport) → V2.
❌ **Diagrammes avancés** (graphiques, visualisations) → V2.
❌ **Gestion des AO en cours** (suivi des deadlines, notifications par email ou push) → V2.
   Note : les notifications **in-app** liées aux affectations, demandes de modification et commentaires font partie de la V1 (elles conditionnent le circuit de validation).
❌ **Export PDF** des références → V3.
❌ **IA/Recommandations** (suggestions automatiques de références) → V4.

---

---
## **5. Métriques de Succès (KPIs)**
| Métrique                          | Cible V1               | Méthode de mesure                          | Responsable  |
|-----------------------------------|------------------------|--------------------------------------------|--------------|
| **Adoption**                      | 80% des consultants    | % d’utilisateurs actifs (login/mois).      | Admin         |
| **Temps de recherche**            | ≤ 15 min par AO        | Temps moyen mesuré via analytics.          | Product Team  |
| **Qualité des réponses**          | +5% de taux de remport | Comparaison avant/après (sur 6 mois).      | Business Team |

---
---
## **6. Hypothèses & Risques**

### **Hypothèses Clés**
| Hypothèse                                                                 | Validation prévue                          |
|---------------------------------------------------------------------------|--------------------------------------------|
| Les utilisateurs **acceptent de saisir les données** (nouveaux AO).     | Désigner un consultant junior pour l’import des nouvelles ref. |
| L’outil **simplifie la recherche vs. Excel** (centralisé + filtres).    | Test utilisateur avec 5 consultants (beta). |
| Les cabinets **n’ont pas de solution existante** (Excel = standard).     | Enquête rapide auprès de cabinets cibles. |

### **Risques & Mitigation**
| Risque                          | Impact          | Mitigation                                                                 |
|---------------------------------|-----------------|----------------------------------------------------------------------------|
| **Résistance à l’adoption**     | Faible          | Formation + support dédié (1h/semaine).                                  |
| **Qualité des données**         | Moyen           | Template de saisie obligatoire + circuit de validation manager/admin pour toute modification d'une référence existante. |
| **Friction du circuit de validation** | Moyen     | File d'attente visible avec badge + notifications aux managers ; les managers modifient directement, sans demande. |
| **Performance (1000+ références)** | Élevé       | Base de données optimisée (indexation) + tests de charge.               |
| **Concurrence (outils génériques)** | Moyen      | **USP** : Simplicité + prix adapté aux PME du secteur.                  |

---
---
## **7. Timeline & Prochaines Étapes**
| Phase               | Durée          | Livrables                                  |
|---------------------|----------------|--------------------------------------------|
| **Conception**      | 7 jours        | Maquettes, spécifications techniques.      |
| **Développement V1**| 4-6 semaines   | MVP fonctionnel (recherche + gestion).     |
| **Beta Test**       | 2 semaines     | Feedback de 5 consultants (SGAO + 1 autre cabinet). |
| **Lancement**       | 1 semaine       | Documentation, formation, support.         |

**Budget estimé** : À définir (priorité à la validation du MVP).

---
