Hallo zusammen, ich bin euer Software-Entwickler-Guide für das Projekt "ver.-20-realitysim-ai"! Lasst uns gemeinsam in diese faszinierende Simulationswelt eintauchen. Wir werden nicht nur die einzelnen Code-Bausteine betrachten, sondern auch verstehen, wie alles zusammenspielt. Schnallt euch an, es wird eine spannende Reise!

## 1. Der erste Kontakt (Die Benutzeroberfläche)

Stellt euch vor, ihr startet die Anwendung. Das erste, was euch ins Auge sticht, ist die übersichtliche Benutzeroberfläche. Der Großteil des Screens ist in ein *Haupt-Panel* aufgeteilt, in dem sich die eigentliche Simulation abspielt. Links seht ihr ein *Control Panel* und rechts ein *Log Panel*. Oben befindet sich die *Header Leiste* mit einigen weiteren Elementen, die wir uns gleich genauer ansehen.

### Header Leiste

In der *Header Leiste* findet ihr:

*   Ein *Logo* mit dem Namen der Anwendung.
*   Einen *Sprachwechsler* (`LanguageSwitcher`), mit dem ihr die Sprache der Benutzeroberfläche zwischen Deutsch und Englisch umschalten könnt.
*   Eine *View Toggle Panel* (`ViewTogglePanel`), mit der ihr verschiedene Panels (z.B. das Agenten-Panel links und das Admin-Panel rechts) ein- und ausblenden könnt.
*   Knöpfe, um die *Einstellungen* (`SettingsModal`) und die *Analytics* (`AnalyticsDashboard`) zu öffnen.

### Control Panel

Hier findet ihr die Steuerelemente für die Simulation. Ihr könnt damit:

*   Die Simulation "Schritt für Schritt" vorantreiben (`onStep`).
*   Die Simulation für eine bestimmte Anzahl von Schritten laufen lassen (`onRunSteps`).
*   Die Simulation zurücksetzen (`onReset`).
*   Die Welterzeugung starten (`onGenerateWorld`).
*   Dem Spiel neue Agenten und Objekte hinzufügen (`onGenerateContent`).

### Log Panel

Im `LogPanel` (`LogPanel.tsx`) werden alle Ereignisse und Aktionen der Simulation protokolliert. Das ist extrem nützlich, um zu verfolgen, was in der simulierten Welt vor sich geht.

## 2. Installation & Konfiguration

Zuerst müssen wir sicherstellen, dass die Simulation richtig eingerichtet ist.

1.  **Abhängigkeiten installieren:** Mit `npm install` (oder Yarn, oder pnpm) werden alle notwendigen Pakete heruntergeladen, die in der `package.json`-Datei aufgelistet sind.
2.  **API-Schlüssel:** In der Datei `.env.local` (im Root-Verzeichnis) muss eine Umgebungsvariable namens `GEMINI_API_KEY` mit eurem Google AI API-Schlüssel gesetzt werden. Ohne diesen Schlüssel kann die Simulation die KI-Funktionen (Generierung von Agenten, Inhalten usw.) nicht nutzen.
3.  **Ausführen:** Mit `npm run dev` (oder dem entsprechenden Befehl für euer Paketverwaltungssystem) startet ihr die Entwicklungsumgebung. Euer Browser öffnet die Anwendung automatisch unter `http://localhost:5173/`.

## 3. Die Simulationswelt

### Umgebung

Die `EnvironmentState` (definiert in `types.ts`) beschreibt die grundlegenden Parameter der Simulationswelt, z.B. die Größe des Gitters (`width`, `height`), die aktuelle Zeit (`time`) und eventuell das Wetter.

### Entitäten

Die `Entity`-Objekte (definiert in `types.ts`) repräsentieren die Objekte in der Welt. Jede Entität hat eine eindeutige ID, einen Namen, eine Beschreibung und eine Position (x, y). Sie können auch als Ressourcen (z.B. "food", "water", "wood") markiert sein.

## 4. Die Anatomie eines Agenten

Die Agenten sind das Herzstück der Simulation.

### Grundlagen & Überleben

Agenten haben grundlegende Werte:

*   `id`: Eindeutige Identifikationsnummer.
*   `name`: Der Name des Agenten.
*   `description`: Eine kurze Beschreibung.
*   `x, y`: Die Position auf dem Gitter.
*   `health`: Die Gesundheit des Agenten (0-100). Sinkt durch Hunger, Durst, Krankheit und Alter.
*   `isAlive`: Ein boolescher Wert, der angibt, ob der Agent noch lebt.
*   `sickness`: Eine optionale Zeichenkette, die eine Krankheit beschreibt.
*   `hunger, thirst, fatigue`: Hunger, Durst und Müdigkeit des Agenten (0-100).
*   `inventory`: Ein Inventar, das Ressourcen und Gegenstände speichert.

### Geist & Psyche

*   `Beliefs`: Das `beliefNetwork` ist ein Schlüssel-Wert-Paar, das die Weltanschauung des Agenten repräsentiert.
*   `Emotions`: Die `emotions` repräsentieren die Gefühle des Agenten (z.B. Freude, Trauer, Wut).
*   `Psyche`: Hier findet ihr psychologische Eigenschaften, wie z.B. Empathie oder Todesangst.
*   `Personality`: Die `personality` bestimmt die Charaktereigenschaften des Agenten (z.B. Offenheit, Gewissenhaftigkeit).
*   `Skills`: Die `skills` geben an, wie gut ein Agent eine bestimmte Fähigkeit beherrscht.
*   `Goals`: Agenten haben Ziele, die ihr Verhalten steuern.

### Gefängnistagebuch: Die innere Welt der Inhaftierten

Ein Agent, der inhaftiert ist, erhält das Attribut `jailJournal`. Dieses Attribut enthält eine Liste von `JailJournalEntry`-Objekten. Diese werden in `services/geminiService.ts` durch einen Aufruf an die Gemini KI generiert.

### Soziales Gefüge

*   `Relationships`: Das `relationships`-Objekt speichert die Beziehungen des Agenten zu anderen Agenten. Jede Beziehung hat einen Typ (`stranger`, `friend`, `rival` usw.) und einen Wert, der die Stärke der Beziehung repräsentiert.

## 5. Langzeitgedächtnis: Die Vektor-Datenbank

Das Langzeitgedächtnis ist das Geheimnis, das die Agenten wirklich intelligent macht.

### Das Konzept des "Echten" Gedächtnisses

Anstatt einfach nur Ereignisse in chronologischer Reihenfolge zu speichern, speichert die Simulation semantisch verwandte Informationen.

### Der Prozess: Von der Handlung zur Erinnerung

1.  **Aktion & Ergebnis:** Ein Agent führt eine Aktion aus.
2.  **Embedding-Erstellung:** Der Beschreibungstext der Aktion wird mithilfe der Gemini API in einen numerischen Vektor umgewandelt.
3.  **Speicherung:** Der Text, der Zeitstempel und das Embedding werden in der `VectorDB` des Agenten gespeichert.

### Intelligenter Abruf durch Ähnlichkeitssuche

Wenn ein Agent Informationen benötigt, geht er wie folgt vor:

1.  **Anfrage-Vektor:** Der Befehl wird in einen Anfrage-Vektor umgewandelt.
2.  **Ähnlichkeitssuche:** Die Vektor-Datenbank des Agenten wird durchsucht, und es werden die Erinnerungen gefunden, deren Vektoren dem Anfrage-Vektor am ähnlichsten sind.
3.  **Relevanz-Ranking:** Erinnerungen werden nach Ähnlichkeit sortiert und als Kontext dem Haupt-KI-Modell bereitgestellt.

### Auswirkungen auf das Agentenverhalten

Dieser Ansatz ermöglicht es den Agenten, aus ihren Erfahrungen zu lernen und sich kontextbezogen zu verhalten.

## 6. Der Simulationszyklus & KI-Entscheidungsfindung

Der `useSimulation`-Hook (`hooks/useSimulation.ts`) steuert den Kern der Simulation.

Jeder Schritt der Simulation durchläuft einen festen Zyklus in der `step` Funktion (`services/simulation.ts`):

1.  **Globale Updates:** Die Zeit wird erhöht, und eventuelle Wahlen finden statt.
2.  **Agenten-Zyklus (für jeden Agenten):**
    a.  **Passive Updates:** Bedürfnisse steigen, Gesundheit verändert sich.
    b.  **Aktionsauswahl:** Hier wählt der Agent mithilfe der `chooseAction` Funktion (`services/simulation.ts`) eine Aktion aus. Die Logik ist komplex und berücksichtigt:
        *   Überlebensbedürfnisse (Hunger, Durst, Gesundheit).
        *   Psychologische Triebe.
        *   Ziele.
        *   Q-Learning, um aus vergangenen Erfolgen und Misserfolgen zu lernen.
    c.  **Aktionsausführung:** Die ausgewählte Aktion wird ausgeführt.
    d.  **Gedächtnisbildung:** Das Ergebnis der Aktion wird im Langzeitgedächtnis gespeichert.

## 7. Benutzerinteraktion

### Steuerungspanel

Mit dem `ControlPanel` (`components/ControlPanel.tsx`) können Benutzer die Simulation steuern.

### Agentensteuerung & KI-Interaktion

Die Interaktion mit den Agenten erfolgt über die `AgentCard` (`components/AgentCard.tsx`).

### Welterschaffung & Psychoanalyse

*   **`GenerateWorldModal`**:  Ermöglicht die Erstellung einer neuen Welt.
*   **`GenerateContentModal`**: Ermöglicht das Hinzufügen von Agenten und Entitäten.
*   **Psychoanalyse:** Mithilfe der `PsychoanalysisModal` können Sie einen detaillierten psychologischen Bericht von einem Agenten erstellen lassen. Dieser Bericht wird mithilfe der Gemini API generiert und analysiert die Persönlichkeit, Emotionen und Beziehungen des Agenten.

### Zustand, Gespräche & Statistiken verwalten

Über das Menü (`ExporterPanel`) kann der aktuelle Zustand der Simulation gespeichert und geladen werden, um den Fortschritt zu erhalten. Sie können auch Konversationen als Markdown-Dateien exportieren und Statistiken über Ereignisse wie Eheschließungen und Kämpfe anzeigen.

### Manuelle Erstellung (Create New Panel)

Das `CreateObjectPanel` (`components/CreateObjectPanel.tsx`) ermöglicht die manuelle Erstellung von Agenten, Entitäten und Aktionen.

### Das Admin-Panel (Gott-Modus)

Das `AdminPanel` (`components/AdminPanel.tsx`) bietet administrative Funktionen:

*   Politische Verwaltung: Anführer festlegen, Gesetze erlassen/aufheben.
*   Technologie-Management: Forschungspunkte vergeben, Technologien freischalten.
*   Agenten-Management: Gesundheit, Position, Währung ändern, Krankheiten zufügen, wiederbeleben.

## 8. Analyse & Beobachtung: Das Analytics Dashboard

Das `AnalyticsDashboard` (`components/AnalyticsDashboard.tsx`) bietet verschiedene Visualisierungen, um das Verhalten der Simulation zu analysieren.

### Soziales Netzwerk

Das soziale Netzwerk visualisiert Beziehungen zwischen Agenten.

### Wirtschaftsflüsse

Ein Sankey-Diagramm visualisiert den Fluss von Währung.

### Kulturelle Ausbreitung

Eine Heatmap zeigt die kulturelle Verteilung in der Welt an.

### Technologie

Ein Diagramm zeigt den Forschungsfortschritt jeder Kultur.

## 9. Erweiterbarkeit

### 9.1 Neue Aktionen hinzufügen

1.  Definiert die Action in `services/actions.ts`
2.  Fügen Sie die neue Aktion zur `availableActions`-Liste hinzu.
3.  Sie können eine neue Aktion auch über das `CreateObjectPanel` erstellen.

### 9.2 Neue Agenten-Attribute (Psyche, Bedürfnisse etc)

1.  Fügen Sie das neue Attribut zur `Agent`-Schnittstelle in `types.ts` hinzu.
2.  Initialisieren Sie das Attribut in `constants.ts`.
3.  Implementieren Sie die Logik in `services/simulation.ts`, um das Attribut zu aktualisieren.
4.  Aktualisieren Sie die Prompts in `services/geminiService.ts`, um die KI über das neue Attribut zu informieren.

### 9.3 Neue Technologien oder Rezepte

1.  Fügen Sie einen neuen Eintrag zum `TECH_TREE` in `constants.ts` hinzu.
2.  Fügen Sie einen neuen Eintrag zur `RECIPES`-Liste in `constants.ts` hinzu.

### 9.4 Erweiterung der Benutzeroberfläche

Neue Informationen können durch das Erstellen neuer Komponenten oder durch das Ändern bestehender Komponenten in `components/` visualisiert werden.

## 10. Kerntechnologien & Architektur

*   **Frontend:** React, TypeScript, TailwindCSS
*   **KI:** Google Gemini API (Chat-Modell und Embeddings)
*   **Gedächtnis:** Benutzerdefinierte, im Arbeitsspeicher laufende Vektor-Datenbank.
*   **Zustandsverwaltung:** React Hooks.
*   **Modul-System:** Natives ES-Modul.
*   **Datenpersistenz:** `localStorage` (Einstellungen), File API (Zustand speichern/laden).

Das Projekt ist modular aufgebaut und ermöglicht so eine einfache Erweiterung und Anpassung. Viel Spaß beim Experimentieren!
