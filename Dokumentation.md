# RealitySim AI Dokumentation

## Inhaltsverzeichnis
1. [Einleitung](#1-einleitung)
2. [Installation & Konfiguration](#2-installation--konfiguration)
3. [Die Simulationswelt](#3-die-simulationswelt)
    - [Umgebung](#umgebung)
    - [Entitäten](#entitäten)
4. [Die Anatomie eines Agenten](#4-die-anatomie-eines-agenten)
    - [Grundlagen & Überleben](#grundlagen--überleben)
    - [Geist & Psyche](#geist--psyche)
    - [Gefängnistagebuch: Die innere Welt der Inhaftierten](#gefängnistagebuch-die-innere-welt-der-inhaftierten)
    - [Soziales Gefüge](#soziales-gefüge)
5. [Langzeitgedächtnis: Die Vektor-Datenbank](#5-langzeitgedächtnis-die-vektor-datenbank)
    - [Das Konzept des "Echten" Gedächtnisses](#das-konzept-des-echten-gedächtnisses)
    - [Der Prozess: Von der Handlung zur Erinnerung](#der-prozess-von-der-handlung-zur-erinnerung)
    - [Intelligenter Abruf durch Ähnlichkeitssuche](#intelligenter-abruf-durch-ähnlichkeitssuche)
    - [Auswirkungen auf das Agentenverhalten](#auswirkungen-auf-das-agentenverhalten)
6. [Die Wirtschaftssimulation: Von Rohstoffen zu Produkten](#6-die-wirtschaftssimulation-von-rohstoffen-zu-produkten)
    - [Erweiterte Rohstoffe und Waren](#erweiterte-rohstoffe-und-waren)
    - [Fabriken und Produktionsketten](#fabriken-und-produktionsketten)
7. [Der Simulationszyklus & KI-Entscheidungsfindung](#7-der-simulationszyklus--ki-entscheidungsfindung)
    - [Jensen-Shannon-Divergenz: Das Maß der ideologischen Distanz](#jensen-shannon-divergenz-das-maß-der-ideologischen-distanz)
    - [Politische Autonomie: Wie Gesetze entstehen](#politische-autonomie-wie-gesetze-entstehen)
8. [Benutzerinteraktion](#8-benutzerinteraktion)
    - [Steuerungspanel](#steuerungspanel)
    - [Agentensteuerung & KI-Interaktion](#agentensteuerung--ki-interaktion)
    - [Welterschaffung & Psychoanalyse](#welterschaffung--psychoanalyse)
    - [Zustand, Gespräche & Statistiken verwalten](#zustand-gespräche--statistiken-verwalten)
    - [Manuelle Erstellung (Create New Panel)](#manuelle-erstellung-create-new-panel)
    - [Das Admin-Panel (Gott-Modus)](#das-admin-panel-gott-modus)
9. [Analyse & Beobachtung: Das Analytics Dashboard](#9-analyse--beobachtung-das-analytics-dashboard)
    - [Soziales Netzwerk](#soziales-netzwerk)
    - [Wirtschaftsflüsse](#wirtschaftsflüsse)
    - [Kulturelle Ausbreitung](#kulturelle-ausbreitung)
    - [Technologie](#technologie)
10. [Erweiterbarkeit](#10-erweiterbarkeit)
    - [Neue Aktionen hinzufügen](#101-neue-aktionen-hinzufügen)
    - [Neue Agenten-Attribute (Psyche, Bedürfnisse etc)](#102-neue-agenten-attribute-psyche-bedürfnisse-etc)
    - [Neue Technologien oder Rezepte](#103-neue-technologien-oder-rezepte)
    - [Erweiterung der Benutzeroberfläche](#104-erweiterung-der-benutzeroberfläche)
    - [Agenten-erfundene Technologien & Religionen](#105-agenten-erfundene-technologien--religionen)
11. [Kerntechnologien & Architektur](#11-kerntechnologien--architektur)

---

## 1. Einleitung

**RealitySim AI** ist eine interaktive, webbasierte Simulationsumgebung, die das Leben einer kleinen Gesellschaft von KI-gesteuerten Agenten darstellt. Jeder Agent ist eine einzigartige Entität mit eigenen Überzeugungen, einer komplexen Persönlichkeit, psychologischen Trieben und einem dynamischen Gedächtnis.

Das Kernziel der Simulation ist nicht, ein Spiel zu gewinnen, sondern emergentes Verhalten zu beobachten: Wie entwickeln sich Kulturen? Wie bilden sich soziale und wirtschaftliche Strukturen? Wie beeinflussen individuelle Traumata und Ziele das Schicksal einer Gemeinschaft? Als Benutzer können Sie die Simulation beobachten, sie Schritt für Schritt vorantreiben, direkt mit den Agenten über natürliche Sprache interagieren, um deren Verhalten zu beeinflussen, oder sogar in die Gedanken inhaftierter Agenten durch ihre KI-generierten Tagebücher eintauchen.

## 2. Installation & Konfiguration

Die Anwendung ist vollständig browserbasiert und erfordert keine serverseitige Installation. Öffnen Sie einfach die `index.html`-Datei in einem modernen Webbrowser.

Die Intelligenz der Agenten wird durch einen KI-Anbieter im Hintergrund angetrieben. Sie können dies über das **Einstellungsmenü** (Zahnrad-Icon) konfigurieren:

- **Google Gemini (Empfohlen):**
  - **Funktionalität:** Bietet die fortschrittlichsten Funktionen, einschließlich der Erstellung von Vektor-Embeddings für das Langzeitgedächtnis.
  - **Konfiguration:** Erfordert einen Google AI API-Schlüssel. Dieser Schlüssel darf **NICHT** in der UI eingegeben werden. Er muss als Umgebungsvariable `API_KEY` in der Umgebung, in der die Anwendung läuft, verfügbar sein. Die App liest diesen Schlüssel automatisch aus.

- **LM Studio:**
  - **Funktionalität:** Eine Alternative für Benutzer, die Modelle lokal ausführen möchten.
  - **Konfiguration:**
    1. Starten Sie einen lokalen Server in Ihrer LM Studio-Anwendung.
    2. Geben Sie die angezeigte Server-URL (z.B. `http://localhost:1234`) in den App-Einstellungen ein.
    3. Geben Sie den Identifier des geladenen **Chat-Modells** an.
    4. Geben Sie optional den Identifier für ein separates **Embedding-Modell** an. Damit das Langzeitgedächtnis (Vektor-DB) lokal funktioniert, muss in LM Studio ein entsprechendes Modell geladen und für den Embedding-Endpunkt konfiguriert sein (z.B. `text-embedding-granite-embedding-278m-multilingual`). Wenn das Feld in den App-Einstellungen leer gelassen wird, wird versucht, das Chat-Modell für Embeddings zu verwenden.
    5. **WICHTIG:** Aktivieren Sie die **CORS**-Option in den Servereinstellungen von LM Studio, da der Browser sonst die Verbindung blockiert.

## 3. Die Simulationswelt

### Umgebung
Die Welt ist ein 2D-Gitter definierter Größe (`width` x `height`). Sie hat globale Eigenschaften wie die `Zeit` (gemessen in Schritten) und kann dynamische Ereignisse wie Wahlen umfassen.

### Entitäten
Dies sind die statischen oder semi-statischen Objekte in der Welt:
- **Ressourcen:** Nahrungsquellen, Wasserquellen, Wälder, Erzvorkommen sowie Vorkommen von **Stein, Kohle, Sand und Lehm**. Sie haben eine begrenzte Menge und können von Agenten abgebaut werden.
- **Gebäude:** Von Agenten gebaute Unterkünfte oder spezielle Gebäude wie der **Marktplatz** (für Handel), das **Gefängnis** (für Gesetzesbrecher) und **Fabriken** (für die Produktion von Waren).
- **Eigentum:** Entitäten können einem Agenten gehören, was andere daran hindert, sie frei zu nutzen.

## 4. Die Anatomie eines Agenten

Jeder Agent ist weit mehr als nur eine Figur auf der Karte. Sein Verhalten wird durch ein vielschichtiges internes Zustandsmodell bestimmt.

### Grundlagen & Überleben
- **Attribute:** Jeder Agent hat grundlegende Werte wie `Position (x, y)`, `Alter`, `Gesundheit`, `Inventar` und `jailJournal` (eine Liste von Tagebucheinträgen, falls inhaftiert).
- **Bedürfnisse:** Die primären Überlebenstriebe sind `Hunger`, `Durst` und `Müdigkeit`. Diese Werte steigen kontinuierlich an. Wenn sie einen kritischen Schwellenwert überschreiten, verursachen sie `Stress` und `Gesundheitsschaden`. Unbehandelt führen sie zum Tod des Agenten.
- **Zustand:** Agenten können `inhaftiert` sein, was ihre Handlungsfähigkeit stark einschränkt. Ihr `imprisonedUntil`-Wert gibt an, wann sie wieder freikommen. Sie können auch einen `Job` in einer Fabrik haben.
- **Genom:** Agenten besitzen genetische Merkmale (z.B. `G-AGILE` für schnellere Bewegung, `G-INTELLIGENT` für schnelleres Lernen), die ihre Fähigkeiten und ihr Überleben beeinflussen.

### Geist & Psyche
- **Persönlichkeit (Big Five):** Jeder Agent wird durch fünf stabile Persönlichkeitsmerkmale definiert (`Offenheit`, `Gewissenhaftigkeit`, `Extraversion`, `Verträglichkeit`, `Neurotizismus`). Ein Agent mit hoher Extraversion wird eher soziale Interaktionen suchen, während ein Agent mit hohem Neurotizismus risikoreiche Aktionen meidet.
- **Psyche & Triebe:** Dies sind tiefere, langsam veränderliche psychologische Antriebe, die das Verhalten stark färben. Dazu gehören:
  - `Eifersucht`: Kann zu konfrontativen Handlungen führen.
  - `Rachsucht`: Priorisiert aggressive Aktionen gegen Rivalen.
  - `Sinnsuche` & `Spirituelles Bedürfnis`: Führt zu meditativen oder introspektiven Handlungen.
  - `Langeweile`: Fördert neuartiges oder zufälliges Verhalten.
  - `Todesangst`: Steigt bei niedriger Gesundheit und priorisiert sichere, heilende Aktionen.
- **Emotionen:** Kurzfristige Gefühle wie `Freude`, `Trauer`, `Wut`, die als direkte Reaktion auf Ereignisse entstehen und mit der Zeit abklingen. Hohe `Trauer` kann z.B. die Aktion "Trauern" auslösen.
- **Überzeugungen:** Ein Netzwerk von Überzeugungen (`beliefNetwork`), das die Weltsicht des Agenten darstellt (z.B. `natur_ist_gut: 0.8`). Erfolgreiche oder fehlgeschlagene Aktionen können diese Überzeugungen stärken oder schwächen.
- **Kognitive Dissonanz:** Wenn ein Agent eine Handlung ausführt, die stark gegen seine Kernüberzeugungen verstößt (z.B. ein pazifistischer Agent kämpft), erleidet er psychologischen Stress.
- **Ziele:** Agenten können dynamisch Ziele entwickeln (z.B. "Anführer werden", "Rache am Rivalen nehmen"). Diese Ziele geben ihrem Handeln eine langfristige Richtung und werden bei der Aktionsauswahl stark gewichtet.

### Gefängnistagebuch: Die innere Welt der Inhaftierten
Ein einzigartiges Feature, das die psychologische Tiefe der Simulation erweitert, ist das Gefängnistagebuch. Wenn ein Agent inhaftiert wird, beginnt er, ein Tagebuch zu führen.
- **Automatische Generierung:** Für jeden Simulationsschritt (der einer Woche im Gefängnis entspricht), generiert die KI einen detaillierten, persönlichen Tagebucheintrag aus der Perspektive des Agenten.
- **Kontextbezogene Inhalte:** Diese Einträge sind nicht zufällig. Sie spiegeln die `Persönlichkeit`, die `Psyche`, die aktuellen `Emotionen` und die `Erinnerungen` des Agenten an die Tat wider, die zu seiner Verhaftung führte. Ein optimistischer Agent schreibt vielleicht hoffnungsvoll, während ein zynischer Agent verbittert oder wütend klingen wird.
- **Beobachtung & Export:** Das Tagebuch kann direkt auf der **Agentenkarte** eingesehen werden. Es bleibt auch nach der Freilassung des Agenten als permanenter Teil seiner Geschichte erhalten und kann jederzeit als formatierte Markdown-Datei **heruntergeladen** werden, um die vollständige Geschichte zu bewahren.

### Soziales Gefüge
- **Beziehungen:** Agenten bauen Beziehungen zu anderen auf, die von `Fremder` über `Freund` bis hin zu `Rivale` oder `Ehepartner` reichen. Jede Beziehung hat einen numerischen Wert, der durch Interaktionen und Nähe beeinflusst wird.
- **Kultur & Religion:** Die Zugehörigkeit zu einer Kultur oder Religion stattet Agenten mit einem gemeinsamen Satz von Grundüberzeugungen aus und ermöglicht ihnen, an kollektiven Zielen wie der Erforschung neuer Technologien teilzuhaben.

## 5. Langzeitgedächtnis: Die Vektor-Datenbank

Dies ist eines der fortschrittlichsten Features der Simulation und der Schlüssel zu wirklich intelligentem, kontextbewusstem Verhalten. Es ersetzt ein einfaches, chronologisches Protokoll durch ein semantisches, assoziatives Gedächtnis.

### Das Konzept des "Echten" Gedächtnisses
Ein menschliches Gedächtnis funktioniert nicht wie eine Liste. Wir erinnern uns an Ereignisse basierend auf ihrer Relevanz für die aktuelle Situation. Wenn wir über "Urlaub" nachdenken, kommen uns Erinnerungen an Strände, Berge oder bestimmte Reisen in den Sinn – nicht die Erinnerung an das Zähneputzen von letzter Woche. Dieses System ahmt dieses Prinzip nach.

### Der Prozess: Von der Handlung zur Erinnerung
1.  **Aktion & Ergebnis:** Ein Agent führt eine Aktion aus, z.B. "Sammle 5 Nahrung von Beerenbusch". Das Ergebnis wird als Textprotokoll erfasst.
2.  **Embedding-Erstellung:** Dieser Text wird an die Gemini API (`text-embedding-004` Modell) gesendet. Die API wandelt den semantischen Inhalt des Textes in einen numerischen Vektor (ein "Embedding") um. Dieses Embedding ist eine mathematische Repräsentation der Bedeutung der Erinnerung.
3.  **Speicherung:** Jede Erinnerung – bestehend aus dem Textinhalt, dem Vektor-Embedding und einem Zeitstempel – wird in der persönlichen **Vektor-Datenbank** des Agenten gespeichert (`VectorDB`-Klasse in `memoryService.ts`). Diese Datenbank ist das Langzeitgedächtnis des Agenten.

### Intelligenter Abruf durch Ähnlichkeitssuche
Wenn der Benutzer dem Agenten einen komplexen Befehl gibt (z.B. "Was hältst du von Bob?"), passiert Folgendes:
1.  **Anfrage-Vektor:** Der Befehl des Benutzers wird ebenfalls in einen Anfrage-Vektor umgewandelt.
2.  **Ähnlichkeitssuche:** Das System durchsucht die Vektor-Datenbank des Agenten und vergleicht den Anfrage-Vektor mit den Vektoren aller gespeicherten Erinnerungen mithilfe der **Kosinus-Ähnlichkeit**.
3.  **Relevanz-Ranking:** Erinnerungen, deren Vektoren dem Anfrage-Vektor am ähnlichsten sind, werden als am relevantesten eingestuft. Dies bedeutet, dass Erinnerungen an vergangene Interaktionen mit "Bob" (sowohl positive als auch negative) eine hohe Ähnlichkeit aufweisen werden, während irrelevante Erinnerungen (wie das Sammeln von Holz) eine niedrige Ähnlichkeit haben.

### Auswirkungen auf das Agentenverhalten
Die Top 3-5 relevantesten Erinnerungen werden dem Haupt-KI-Modell (Gemini) als zusätzlicher Kontext für seine Entscheidung bereitgestellt. Statt nur zu fragen: "Was soll der Agent tun?", fragt das System nun:

> "Basierend auf dem Zustand des Agenten, der aktuellen Welt UND diesen spezifischen, relevanten Erinnerungen aus seiner Vergangenheit – was ist die logischste Aktion oder Antwort?"

Dies ermöglicht ein unglaublich nuanciertes Verhalten:
- Ein Agent wird sich an einen vergangenen, unfairen Handel erinnern, wenn er erneut mit demselben Partner interagiert.
- Ein Agent kann seine Meinung über einen Ort bilden, basierend auf wiederholten positiven oder negativen Erfahrungen dort.
- Ein Agent kann auf Fragen zu vergangenen Ereignissen antworten, die hunderte von Schritten zurückliegen, solange sie für die Frage relevant sind.
- Die KI nutzt diesen Kontext auch, um **neue Gesetze oder Technologien zu erfinden**, die auf den "Erfahrungen" der Gesellschaft basieren.

Das Vektor-Gedächtnis verwandelt die Agenten von rein reaktiven Wesen zu Wesen, die aus ihrer gesamten Lebenserfahrung lernen und reflektieren können.

## 6. Die Wirtschaftssimulation: Von Rohstoffen zu Produkten

Die Simulation verfügt über ein tiefgreifendes Wirtschaftssystem, das über einfaches Überleben hinausgeht. Es modelliert Produktionsketten, Unternehmertum und die Erfindung neuer Güter.

### Erweiterte Rohstoffe und Waren
Die Welt ist reich an Ressourcen. Neben den Grundbedürfnissen wie **Nahrung** und **Holz** gibt es eine Vielzahl von Rohstoffen, die die Grundlage für eine komplexe Wirtschaft bilden:
- **Grundrohstoffe:** `Holz`, `Stein`, `Kohle`, `Eisen`, `Sand`, `Lehm`.
- **Zwischenprodukte:** Durch Verarbeitung entstehen Waren wie `Holzkohle`, `Ziegel`, `Glas` oder `Stahlbarren`.
- **Endprodukte:** Diese Zwischenprodukte werden zu wertvollen Endprodukten wie `Werkzeugen`, `Möbeln` oder `Schwertern` weiterverarbeitet.

### Fabriken und Produktionsketten
- **Gründung:** Agenten mit der Rolle `Entrepreneur` können eine **Fabrik** gründen (`Found Factory`). Dies ist eine teure Investition, die Kapital und Baumaterialien erfordert. Bei der Gründung wird festgelegt, welches spezifische Produkt diese Fabrik herstellen soll (z.B. eine Werkzeugschmiede).
- **Produktion:** Fabriken produzieren nicht von alleine. Ein Agent muss dort arbeiten (`Work in Factory`). Diese Aktion verbraucht Rohstoffe aus dem Inventar des Fabrikbesitzers und legt das fertige Produkt ebenfalls in dessen Inventar ab.
- **Arbeitsmarkt:** Andere Agenten können in einer Fabrik arbeiten, um einen Lohn vom Besitzer zu erhalten. Dies schafft einen dynamischen Arbeitsmarkt, bei dem Unternehmer Arbeiter einstellen, um ihre Produktion zu steigern.

## 7. Der Simulationszyklus & KI-Entscheidungsfindung

Jeder "Schritt" der Simulation durchläuft einen festen Zyklus:
1.  **Globale Updates:** Die Zeit schreitet voran, politische Ereignisse wie Wahlen werden geprüft.
2.  **Agenten-Zyklus (für jeden Agenten):**
    a. **Passive Updates:** Bedürfnisse steigen, Gesundheit verändert sich, Emotionen klingen ab. Wenn ein Agent inhaftiert ist, wird geprüft, ob ein Tagebucheintrag generiert werden muss.
    b. **Aktionsauswahl (`chooseAction`):** Dies ist das "Gehirn" des Agenten. Ein ausgeklügeltes Bewertungssystem wägt verschiedene Faktoren ab, um die beste Aktion auszuwählen (siehe unten).
    c. **Aktionsausführung:** Die gewählte Aktion wird ausgeführt.
    d. **Gedächtnisbildung:** Das Ergebnis wird, wie oben beschrieben, in eine Erinnerung umgewandelt und im Vektor-Gedächtnis gespeichert.

### Jensen-Shannon-Divergenz: Das Maß der ideologischen Distanz
Ein neues, mathematisch fundiertes Konzept, die **Jensen-Shannon-Divergenz (JSD)**, wurde integriert, um das Verhalten der Agenten noch realistischer zu gestalten. JSD misst die Ähnlichkeit zwischen zwei Wahrscheinlichkeitsverteilungen – in diesem Fall den `beliefNetworks` der Agenten. Ein niedriger JSD-Wert bedeutet hohe ideologische Ähnlichkeit, ein hoher Wert große Unterschiede. Dies wird an mehreren Stellen genutzt:
- **Soziale Cliquenbildung:** Bei der Wahl, mit wem sie sprechen (`Talk`), bevorzugen Agenten nun andere Agenten mit einem **niedrigen JSD-Wert**. Dies führt zur natürlichen Entstehung von ideologischen Gruppen und Fraktionen.
- **Ideologie-basiertes Wahlverhalten:** Agenten stimmen nicht mehr nur für den Kandidaten mit dem höchsten Status. Stattdessen berechnen sie den JSD zwischen ihren eigenen Überzeugungen und denen jedes Kandidaten und wählen mit hoher Wahrscheinlichkeit denjenigen, dessen Ideologie ihrer eigenen am nächsten ist.
- **Kognitive Dissonanz:** Wenn ein Agent eine Handlung ausführt, die seinen Überzeugungen widerspricht (z.B. "Stehlen" bei hoher Gewissenhaftigkeit), wird der JSD zwischen seinen Überzeugungen und den "moralischen Implikationen" der Tat berechnet. Ein hoher JSD-Wert führt direkt zu einem Anstieg von `Stress`.

### Politische Autonomie: Wie Gesetze entstehen

Ein Schlüsselelement des emergenten Verhaltens ist die Fähigkeit des Systems, seine eigenen Regeln zu schaffen. Anstatt dass Gesetze nur vom Benutzer vordefiniert werden, kann der Anführer der Gemeinschaft autonom neue Gesetze vorschlagen.

1.  **Der Auslöser:** Ein Anführer mit der Technologie "Regierungsführung" (`governance`) kann die Aktion **`Propose New Law`** (Neues Gesetz vorschlagen) in Betracht ziehen. Dies geschieht oft, wenn seine Psyche einen hohen `Entscheidungsdruck` anzeigt oder seine Erinnerungen auf wiederkehrende Probleme in der Gesellschaft hindeuten.

2.  **KI als Gesetzgeber:** Anstatt eines festen Gesetzes ruft diese Aktion die Gemini-KI auf. Die KI analysiert den Zustand der Welt:
    - **Jüngste Ereignisse:** Gibt es viele Kämpfe, Diebstähle oder soziale Unruhen (aus den Erinnerungen des Anführers)?
    - **Kulturelle Werte:** Welche Überzeugungen hat die Kultur des Anführers? Eine naturverbundene Kultur könnte Gesetze zum Ressourcenschutz vorschlagen, eine fortschrittsorientierte Kultur Gesetze zur Forschungsförderung.
    - **Bestehende Gesetze:** Die KI stellt sicher, dass sie kein bereits existierendes Gesetz vorschlägt.
    Basierend auf dieser Analyse generiert die KI ein **völlig neues, kontextuell passendes Gesetz** als JSON-Objekt, komplett mit Beschreibung, der zu bestrafenden Aktion (`violatingAction`) und einer angemessenen Strafe.

3.  **Kulturelle Beratung (Die Abstimmung):** Ein Anführer regiert nicht allein. Nachdem die KI ein Gesetz vorgeschlagen hat, wird eine **Abstimmung innerhalb des "Clans" (der Kultur des Anführers)** simuliert.
    - Jedes Mitglied der Kultur stimmt ab. Die Wahrscheinlichkeit, dass ein Mitglied zustimmt, hängt von seiner **Beziehung zum Anführer** und seiner **Persönlichkeit** (insbesondere `Verträglichkeit`) ab.
    - **Mehrheitsentscheid:** Nur wenn die Mehrheit der Kulturmitglieder zustimmt, wird das Gesetz offiziell erlassen und in der Simulation durchgesetzt.

Dieser Prozess schafft eine dynamische und plausible politische Landschaft, in der die Regeln der Gesellschaft eine direkte Reaktion auf die internen Probleme und Werte dieser Gesellschaft sind.

## 8. Benutzerinteraktion

### Steuerungspanel
- **Step / Run:** Führt die Simulation für einen oder mehrere Schritte aus.
- **Reset:** Setzt die Welt auf ihren ursprünglichen Zustand zurück.
- **New World / Add...:** Nutzt die generative Kraft der KI, um die Welt mit einzigartigen Agenten und Entitäten zu bevölkern oder zur bestehenden Welt hinzuzufügen.

### Agentensteuerung & KI-Interaktion
Über die **Agentenkarte** können Sie direkt mit einem Agenten interagieren:
- **Direkter Befehl:** Deaktivieren Sie "KI verwenden", um exakte Aktionsnamen einzugeben (z.B. "Move North").
- **Natürliche Sprache (Use AI):** Geben Sie einen Befehl in natürlicher Sprache ein (z.B. "Geh etwas essen" oder "Räche dich an deinem Rivalen"). Dies aktiviert den intelligenten Entscheidungsprozess, einschließlich des Abrufs von Erinnerungen aus der Vektor-Datenbank.

### Welterschaffung & Psychoanalyse
- **Generate World:** Erstellt eine komplett neue Weltbevölkerung basierend auf Ihren Vorgaben (Anzahl der Agenten/Entitäten). Die KI sorgt für einzigartige **vollständige Namen**, Persönlichkeiten und Hintergrundgeschichten. Wichtig hierbei ist, dass Vor- und Nachname als eine einzige Zeichenkette im `name`-Feld des Agenten gespeichert werden. Die KI ist angewiesen, diesen vollständigen Namen in einem Feld zu liefern und keine separaten Felder für Vor- und Nachname zu erstellen.
- **Psychoanalyse:** Sie können eine tiefenpsychologische Analyse eines Agenten anfordern. Die KI analysiert den gesamten Zustand des Agenten (Persönlichkeit, Traumata, Beziehungen, Überzeugungen) und erstellt einen detaillierten Bericht, der sogar unbewusste Konflikte und therapeutische Empfehlungen enthält. Diese Ergebnisse können dann direkt in die Psyche des Agenten integriert werden, um z.B. neue Ziele zu schaffen.

### Zustand, Gespräche & Statistiken verwalten
In der rechten Seitenleiste befindet sich das Panel zum Verwalten des Simulationszustands und zum Exportieren von Daten:
- **Zustand Speichern/Laden:** Ermöglicht das Exportieren der gesamten Simulation in eine JSON-Datei und das spätere erneute Laden.
- **Gespräche exportieren:** Erstellt eine Markdown-Datei mit allen bisherigen Konversationen der Agenten.
- **Statistiken exportieren:** Generiert einen zusammenfassenden Bericht im Markdown-Format über wichtige Ereignisse wie Eheschließungen (wer mit wem), Geburten (Eltern und Kind), Inhaftierungen (wer wie oft) und Kämpfe. Dies bietet eine hervorragende statistische Übersicht über die soziale Dynamik der Welt.

### Manuelle Erstellung (Create New Panel)
Dieses Panel, sichtbar in der Standardansicht des rechten Bereichs (wenn kein Admin ausgewählt ist), erlaubt es Ihnen, manuell neue Elemente in die Simulation einzufügen, ohne KI-Generierung zu verwenden. Sie können erstellen:
- **Agenten:** Definieren Sie einen neuen Agenten von Grund auf, einschließlich Name, Beschreibung, Überzeugungen und Persönlichkeitsmerkmale.
- **Entitäten:** Fügen Sie neue Objekte oder Landmarken zur Welt hinzu.
- **Aktionen:** Entwerfen Sie eine neue, benutzerdefinierte Aktion mit spezifischen mechanischen Effekten (Kosten, Statusänderungen, Fähigkeitsgewinne). Dies ist ein mächtiges Werkzeug zum Testen neuer Spielmechaniken.

### Das Admin-Panel (Gott-Modus)
Wenn ein Agent mit dem Attribut `adminAgent: true` ausgewählt ist, wechselt die rechte Ansicht zum Admin-Panel. Dieses Panel bietet direkte "gottgleiche" Kontrolle über die Kernparameter der Simulation:
- **Politische Verwaltung:** Starten Sie Wahlen, setzen Sie einen Anführer manuell ein, erlassen oder widerrufen Sie Gesetze.
- **Technologie-Management:** Beobachten Sie den Forschungsfortschritt jeder Kultur und schalten Sie Technologien bei Bedarf manuell frei.
- **Agenten-Management:** Passen Sie die Attribute jedes Agenten an – setzen Sie Gesundheit, Währung, Position oder infizieren Sie ihn mit einer Krankheit. Tote Agenten können wiederbelebt und Agenten für eine bestimmte Dauer inhaftiert werden.

## 9. Analyse & Beobachtung: Das Analytics Dashboard

Das Analytics Dashboard (erreichbar über das Balkendiagramm-Icon) bietet einen Makro-Blick auf die Simulation und hilft, emergente Muster zu erkennen, die im normalen Ereignisprotokoll untergehen würden.

### Soziales Netzwerk
Dieser Tab visualisiert das Beziehungsgeflecht der Gesellschaft als interaktiven Graphen. Agenten sind Knoten, und Linien zwischen ihnen stellen Beziehungen dar.
- **Interaktivität:** Die Visualisierung kann als **interaktive HTML-Datei heruntergeladen** werden, in der Sie zoomen, Knoten verschieben und Details zu Agenten und Beziehungen anzeigen können.
- **Farbe & Art:** Die Farbe der Linie zeigt die Art der Beziehung an (z.B. pink für Partner, grün für Freunde, rot für Rivalen).
- **Gruppen:** Agenten werden nach ihrer Kultur farblich gruppiert, was die Erkennung von kulturellen Clustern erleichtert.

### Wirtschaftsflüsse
Dieses Diagramm zeigt den Fluss von Währung (`currency`) zwischen den Agenten und der Welt (z.B. durch Arbeit).
- **Sankey-ähnliche Darstellung:** Pfeile zeigen die Richtung des Geldflusses an, ihre Länge und ein Label repräsentieren das transferierte Volumen.
- **Zeitfenster-Regler:** Sie können den Analysezeitraum anpassen, um kurzfristige Handelsmuster oder langfristige Wirtschaftsbeziehungen zu untersuchen.

### Kulturelle Ausbreitung
Diese Ansicht zeigt eine Heatmap der Weltkarte.
- **Farbkodierung:** Jede Kultur hat eine eigene Farbe.
- **Dichte:** Die Farbintensität in einem Gitterbereich zeigt die Konzentration von Mitgliedern einer bestimmten Kultur an. So lässt sich die Bildung von kulturellen Enklaven oder die Vermischung von Kulturen visuell nachvollziehen.

### Technologie
Hier wird der technologische Fortschritt jeder Kultur visualisiert.
- **Fortschrittsbalken:** Für jede Technologie im Technologiebaum (`techTree`) wird der Forschungsfortschritt jeder Kultur als Prozentbalken dargestellt.
- **Abhängigkeiten:** Technologien, deren Voraussetzungen noch nicht erfüllt sind, werden ausgegraut dargestellt, was die Entwicklungswege der Kulturen verdeutlicht.

## 10. Erweiterbarkeit

Die Simulation ist modular aufgebaut, um leicht erweitert werden zu können. Hier sind die wichtigsten Ansatzpunkte für Erweiterungen:

### 10.1 Neue Aktionen hinzufügen
Dies ist die häufigste Art der Erweiterung. Wie bereits erwähnt, können neue Aktionen in `services/actions.ts` definiert und zur `availableActions`-Liste hinzugefügt werden. Dies ermöglicht neue Verhaltensweisen, die sofort in das KI-Entscheidungssystem integriert werden. Alternativ können Aktionen auch zur Laufzeit über das "Create New"-Panel hinzugefügt werden.

### 10.2 Neue Agenten-Attribute (Psyche, Bedürfnisse etc.)
Die Simulation kann durch neue interne Zustände für Agenten erweitert werden.
1.  **Typdefinition:** Fügen Sie das neue Attribut zur `Agent`-Schnittstelle in `types.ts` hinzu (z.B. ein neuer Psyche-Wert wie `courage` oder ein Bedürfnis wie `social`).
2.  **Initialisierung:** Geben Sie einen Standardwert in `constants.ts` (z.B. in `defaultPsyche`) und in den Generierungsfunktionen (`sanitizeAndCreateAgents` in `hooks/useSimulation.ts`) an.
3.  **Simulation-Engine:** Integrieren Sie die Logik für das neue Attribut in `services/simulation.ts`. Wie verändert es sich pro Schritt (`applyPerStepMechanisms`)?
4.  **KI-Integration (entscheidend):** Damit die KI das neue Attribut versteht und berücksichtigt, müssen die Prompts in `services/geminiService.ts` aktualisiert werden. Fügen Sie das Attribut zur Agenten-Zustandsbeschreibung hinzu und erklären Sie in der `instructions`-Sektion, wie es die Aktionsauswahl beeinflussen soll (z.B. "Hoher `courage` erhöht die Wahrscheinlichkeit für die Aktion 'Fight'").

### 10.3 Neue Technologien oder Rezepte
1.  **Technologien:** Fügen Sie einen neuen Eintrag zum `TECH_TREE` in `constants.ts` hinzu. Definieren Sie die Kosten, Voraussetzungen und was die Technologie freischaltet (neue Aktionen, Rezepte).
2.  **Rezepte:** Fügen Sie einen neuen Eintrag zur `RECIPES`-Liste in `constants.ts` hinzu. Definieren Sie das Ergebnis, die Zutaten und eventuelle Fähigkeits- oder Technologieanforderungen. Das System erstellt daraus automatisch eine `Craft...`-Aktion.

### 10.4 Erweiterung der Benutzeroberfläche
Neue Informationen können in den Komponenten in `components/` visualisiert werden, z.B. durch Hinzufügen eines neuen Diagramms in `AgentCard.tsx` oder einer neuen Visualisierung im `AnalyticsDashboard.tsx`.

### 10.5 Agenten-erfundene Technologien & Religionen
Dies ist ein zentrales Feature für emergentes Gameplay. Die Simulation ist nicht mehr auf den vordefinierten Technologie- oder Religionsbaum beschränkt.
- **Die Aktionen "Technologie erfinden" & "Religion gründen":** Agenten (insbesondere Wissenschaftler mit hoher Inspiration oder charismatische Figuren) können versuchen, neue Konzepte zu schaffen.
- **KI als Erfinder:** Wenn diese Aktion ausgelöst wird, wird die Gemini-API aufgerufen. Sie erhält den Kontext der aktuellen Welt, der bereits bekannten Technologien/Religionen und der Fähigkeiten des Agenten. Basierend darauf generiert die KI eine plausible neue Technologie oder eine neue Religion mit eigenem Dogma.
- **Dynamische Entwicklung:** Diese neue Erfindung wird dem globalen Zustand der Simulation hinzugefügt. Dies führt zu einzigartigen und unvorhersehbaren technologischen, wirtschaftlichen und spirituellen Entwicklungen in jeder Simulation.

## 11. Kerntechnologien & Architektur

- **Frontend-Framework:** **React & TypeScript** werden für den Aufbau einer robusten, typsicheren und komponentenbasierten Benutzeroberfläche verwendet.

- **Styling:** **TailwindCSS** ermöglicht ein schnelles, "Utility-First"-Styling direkt im HTML, was die Entwicklung beschleunigt und für ein konsistentes Design sorgt.

- **Künstliche Intelligenz (KI):** Die **Google Gemini API** dient als kognitiver Kern der Simulation.
  - `gemini-2.5-flash`: Wird für komplexe Entscheidungsfindung, Dialoggenerierung, Psychoanalyse und die prozedurale Erstellung von Welten und Agenten genutzt.
  - `text-embedding-004`: Erstellt die Vektor-Embeddings, die das Fundament des semantischen Langzeitgedächtnisses bilden.

- **Gedächtnissystem:** Eine **benutzerdefinierte, im Arbeitsspeicher laufende Vektor-Datenbank** (`VectorDB`). Sie verwendet Kosinus-Ähnlichkeit, um semantisch relevante Erinnerungen abzurufen, was ein kontextbezogenes Verhalten der Agenten ermöglicht.

- **Zustandsverwaltung (State Management):** Die gesamte Anwendung nutzt **React Hooks** für die Zustandsverwaltung. Es gibt keine externen State-Management-Bibliotheken. Der zentrale `useSimulation`-Hook fungiert als Haupt-Controller, der die Simulations-Engine (`RealityEngine.ts`) mit der React-UI verbindet. `useContext` wird verwendet, um globale Zustände wie Einstellungen und Sprache bereitzustellen.

- **Datenvisualisierung:**
  - **Recharts:** Eine leichtgewichtige Diagrammbibliothek, die für die Visualisierung von Agenten-Attributen (Persönlichkeit, Fähigkeiten) und in Teilen des Analytics Dashboards verwendet wird.
  - **Custom SVG:** Die Weltkarte (`WorldGraph.tsx`) ist eine vollständig benutzerdefinierte SVG-Komponente. Dies bietet maximale Kontrolle und Performance bei der Darstellung von Agenten, Entitäten und ihren Beziehungen auf dem Gitter.

- **Modul-System & Build-Prozess:** Die Anwendung verfolgt einen modernen, **build-freien Ansatz** unter Verwendung von **nativen ES-Modulen mit Import Maps** (definiert in `index.html`). Alle Abhängigkeiten (wie React, Recharts) werden zur Laufzeit direkt aus einem CDN (`esm.sh`) geladen. Dies vereinfacht die Entwicklungsumgebung erheblich, da keine komplexen Tools wie Webpack oder Vite erforderlich sind.

- **Datenpersistenz:**
  - **`localStorage`:** Die Browser-API `localStorage` wird verwendet, um benutzerspezifische Einstellungen (wie den KI-Anbieter) dauerhaft zu speichern.
  - **File API:** Die Funktionalität zum Speichern und Laden des gesamten Simulationszustands wird über die browserbasierte File API realisiert, die es dem Benutzer ermöglicht, JSON-Dateien zu exportieren und zu importieren.