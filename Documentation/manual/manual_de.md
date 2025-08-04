# Benutzerhandbuch: RealitySim KI

_Willkommen bei **RealitySim KI**, einer interaktiven, webbasierten Simulationsumgebung, die das komplexe Leben einer Gesellschaft von KI-gesteuerten Agenten darstellt. Jeder Agent ist eine einzigartige Entität mit eigenen Überzeugungen, einer komplexen Persönlichkeit, psychologischen Trieben und einem dynamischen Gedächtnis.

Diese Software löst das Problem, wie emergentes Verhalten in einer simulierten Gesellschaft beobachtet und beeinflusst werden kann. Sie können die Entwicklung von Kulturen, die Bildung sozialer Strukturen und den Einfluss individueller Traumata und Ziele auf das Schicksal einer Gemeinschaft verfolgen. Als Benutzer können Sie die Simulation beobachten, sie Schritt für Schritt vorantreiben, direkt mit den Agenten über natürliche Sprache interagieren, um deren Verhalten zu beeinflussen, oder sogar in die Gedanken inhaftierter Agenten durch ihre KI-generierten Tagebücher eintauchen. Es ist kein Spiel zum Gewinnen, sondern ein Werkzeug zum Beobachten und Experimentieren mit komplexen Systemen._

## 1. Erste Schritte

Die RealitySim KI-Anwendung ist vollständig browserbasiert und erfordert keine serverseitige Installation. Sie können sie direkt in einem modernen Webbrowser öffnen.

### 1.1 Installation (Lokaler Betrieb)

Falls Sie die Anwendung lokal ausführen möchten, folgen Sie diesen Schritten:

1.  **Node.js installieren:** Stellen Sie sicher, dass Node.js auf Ihrem System installiert ist.
2.  **Abhängigkeiten installieren:** Öffnen Sie ein Terminal im Projektverzeichnis und führen Sie `npm install` aus.
3.  **API-Schlüssel konfigurieren:**
    *   Erstellen Sie eine Datei namens `.env.local` im Hauptverzeichnis des Projekts.
    *   Fügen Sie in dieser Datei Ihren Google Gemini API-Schlüssel hinzu: `GEMINI_API_KEY="IHR_API_SCHLÜSSEL_HIER"`.
4.  **Anwendung starten:** Führen Sie im Terminal `npm run dev` aus. Die Anwendung wird in Ihrem Standardbrowser geöffnet.

### 1.2 KI-Anbieter konfigurieren

Die Intelligenz der Agenten wird durch einen KI-Anbieter im Hintergrund angetrieben. Sie können dies über das **Einstellungsmenü** (Zahnrad-Icon in der oberen rechten Ecke) konfigurieren:

*   **Google Gemini (Empfohlen):**
    *   Wählen Sie 'Google Gemini' als Anbieter.
    *   Wählen Sie das gewünschte Gemini-Modell (z.B. `gemini-2.5-flash`).
    *   **Wichtig:** Ihr Google AI API-Schlüssel muss als Umgebungsvariable `API_KEY` oder `GEMINI_API_KEY` in der Umgebung, in der die Anwendung läuft, verfügbar sein. Er wird nicht direkt in der Benutzeroberfläche eingegeben.

*   **LM Studio:**
    *   Wählen Sie 'LM Studio' als Anbieter.
    *   **LM Studio API-Endpunkt:** Geben Sie die Basis-URL Ihres lokalen LM Studio Servers ein (z.B. `http://localhost:1234`).
    *   **Modellname:** Geben Sie den API-Identifier des in LM Studio geladenen Chat-Modells ein (z.B. `google/gemma-2b-it`).
    *   **Embedding-Modellname (optional):** Geben Sie den Identifier für ein separates Embedding-Modell ein (z.B. `text-embedding-granite-embedding-278m-multilingual`). Wenn leer, wird versucht, das Chat-Modell für Embeddings zu verwenden.
    *   **Wichtig:** Aktivieren Sie die **CORS**-Option in den Servereinstellungen von LM Studio, da der Browser sonst die Verbindung blockiert.

## 2. Die Benutzeroberfläche (GUI) im Überblick

Die RealitySim KI-Benutzeroberfläche ist in mehrere Bereiche unterteilt, die Ihnen einen umfassenden Überblick und Kontrolle über die Simulation ermöglichen:

*   **Kopfzeile (Oben):** Enthält den Titel der Anwendung, einen Sprachumschalter (Deutsch/Englisch) und das Haupt-Kontrollpanel mit Simulationssteuerung und globalen Einstellungen.
*   **Linkes Panel:** Zeigt eine Liste aller Agenten und Entitäten in der Welt. Sie können Agenten auswählen, um deren Details in der Agentenkarte anzuzeigen, oder Agenten/Entitäten löschen.
*   **Mittlerer Bereich:** Dieser dynamische Bereich kann entweder die **Agentenkarte** (detaillierte Informationen zum ausgewählten Agenten) oder die **Weltkarte** (visuelle Darstellung der Agenten und Entitäten im Gitter) anzeigen. Sie können zwischen diesen Ansichten wechseln oder beide gleichzeitig anzeigen.
*   **Rechtes Panel:** Zeigt je nach ausgewähltem Agenten entweder das **Erstellungs-Panel** (zum manuellen Hinzufügen von Agenten, Entitäten, Aktionen) und das **Ereignisprotokoll** oder das **Admin-Kontrollpanel** (wenn ein Admin-Agent ausgewählt ist) an. Es enthält auch das **Speichern & Laden**-Panel.

## 3. Simulationssteuerung

Das **Kontrollpanel** in der Kopfzeile bietet die Hauptfunktionen zur Steuerung des Simulationsflusses:

*   **Schritt (Play-Icon):** Führt die Simulation um einen einzelnen Schritt voran. Jeder Schritt repräsentiert eine Zeiteinheit, in der Agenten ihre Aktionen ausführen und sich die Welt entwickelt.
*   **Laufen (Fast-Forward-Icon):** Führt die Simulation für eine vordefinierte Anzahl von Schritten (Standard: 10) automatisch aus. Sie können die Anzahl der Schritte im Eingabefeld daneben anpassen.
*   **Zurücksetzen (Pfeil-Icon):** Setzt die gesamte Simulation auf ihren ursprünglichen Startzustand zurück. Alle Agenten, Entitäten und Ereignisse werden gelöscht und durch die Standard-Initialisierung ersetzt.
*   **Welt generieren (Globus-Icon):** Öffnet ein Modal, in dem Sie eine komplett neue Welt mit einer bestimmten Anzahl von KI-generierten Agenten und Entitäten erstellen können. Dies löscht die aktuelle Welt.
*   **Mit KI hinzufügen (Plus-Quadrat-Icon):** Öffnet ein Modal, in dem Sie zusätzliche KI-generierte Agenten oder Entitäten zur *bestehenden* Welt hinzufügen können, ohne den aktuellen Zustand zu löschen.

### 3.1 Ansichten umschalten

Neben dem Kontrollpanel finden Sie ein Panel mit vier Schaltflächen (Pfeile nach links/rechts, Benutzer, Karte). Diese ermöglichen es Ihnen, die Sichtbarkeit der Hauptbereiche der Benutzeroberfläche zu steuern:

*   **Linkes Panel umschalten:** Blendet das Panel mit der Agenten- und Entitätenliste ein oder aus.
*   **Agentenkarte umschalten:** Blendet die Agentenkarte im mittleren Bereich ein oder aus.
*   **Weltkarte umschalten:** Blendet die Weltkarte im mittleren Bereich ein oder aus.
*   **Rechtes Panel umschalten:** Blendet das rechte Panel (Erstellung/Admin/Protokoll) ein oder aus.

## 4. Agenten verwalten und interagieren

### 4.1 Agentenliste (Linkes Panel)

Im linken Panel sehen Sie eine Liste aller Agenten in der Simulation. Jeder Eintrag zeigt den Namen des Agenten an. Wenn ein Agent verstorben ist, wird dies ebenfalls angezeigt.

*   **Agenten auswählen:** Klicken Sie auf den Namen eines Agenten, um dessen detaillierte Informationen in der **Agentenkarte** im mittleren Bereich anzuzeigen.
*   **Agenten löschen:** Klicken Sie auf das **Mülleimer-Icon** neben einem Agenten, um ihn aus der Simulation zu entfernen. Eine Bestätigung wird angefordert.

### 4.2 Die Agentenkarte (Mittlerer Bereich)

Die Agentenkarte bietet einen tiefen Einblick in den internen Zustand eines ausgewählten Agenten. Sie ist in mehrere Abschnitte unterteilt:

*   **Kopfzeile:** Zeigt den Namen, die Beschreibung und ein Icon des Agenten (Benutzer für lebendig, Totenkopf für verstorben) an. Hier finden Sie auch die Schaltfläche **'Psychologisches Profil ansehen'**.
*   **Status & Bedürfnisse:** Grundlegende Informationen wie Lebensphase, Alter, Gesundheit, Hunger, Durst, Müdigkeit, Stress, Sozialstatus, Währung und eventuelle Krankheiten oder Inhaftierungen. Farben zeigen den Zustand der Bedürfnisse an (Rot für kritisch, Gelb für erhöht).
*   **Genom & Merkmale:** Zeigt die genetischen Merkmale des Agenten an, die seine Fähigkeiten und sein Überleben beeinflussen können (z.B. `Agil` für schnellere Bewegung).
*   **Persönlichkeit & Psyche:** Visualisiert die fünf Persönlichkeitsmerkmale (Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus) und die tieferen psychologischen Triebe (Empathie, Rachsucht, Sinnsuche etc.) als Balkendiagramme. Diese Werte beeinflussen die Entscheidungen des Agenten stark.
*   **Fähigkeiten:** Zeigt die verschiedenen Fähigkeiten des Agenten (z.B. Heilung, Holzfällen, Kampf) und deren Level an.
*   **Inventar:** Listet die Gegenstände und Ressourcen auf, die der Agent besitzt.
*   **Beziehungen:** Zeigt die Beziehungen des Agenten zu anderen Agenten an (z.B. Freund, Rivale, Ehepartner) und deren Stärke. Die Farbe der Beziehung zeigt den Typ an.
*   **Aktive Ziele:** Zeigt die aktuellen Ziele des Agenten an (z.B. 'Anführer werden', 'Ein Haus bauen') und deren Fortschritt.
*   **Langzeitgedächtnis:** Eine Liste der jüngsten und relevantesten Erinnerungen des Agenten, die sein Verhalten beeinflussen.
*   **Gefängnistagebuch:** Wenn der Agent inhaftiert ist, werden hier seine KI-generierten Tagebucheinträge angezeigt, die Einblicke in seine Gedanken und Gefühle während der Haft geben.

### 4.3 Interaktion mit Agenten

Am unteren Rand der Agentenkarte befindet sich das **Interaktionspanel**:

1.  **Befehl eingeben:** Geben Sie einen Befehl in das Textfeld ein.
2.  **'KI verwenden' (Checkbox):**
    *   **Aktiviert (Standard):** Die KI interpretiert Ihren Befehl in natürlicher Sprache (z.B. "Geh etwas essen") und wählt die am besten geeignete Aktion für den Agenten aus, wobei sie auch relevante Erinnerungen aus dem Langzeitgedächtnis des Agenten abruft.
    *   **Deaktiviert:** Sie müssen den exakten Namen einer verfügbaren Aktion eingeben (z.B. "Eat Food"). Die KI führt dann diese spezifische Aktion aus, ohne Interpretation.
3.  **Senden (Pfeil- oder Glitzer-Icon):** Klicken Sie auf diese Schaltfläche, um den Befehl an den Agenten zu senden. Die Simulation wird einen Schritt vorrücken, und die Aktion des Agenten wird im Ereignisprotokoll angezeigt.

### 4.4 Psychologisches Profil ansehen

Klicken Sie auf die Schaltfläche **'Psychologisches Profil ansehen'** in der Kopfzeile der Agentenkarte. Dies öffnet ein Modal, in dem die KI eine tiefenpsychologische Analyse des ausgewählten Agenten generiert. Der Bericht enthält Abschnitte wie Psychodynamik, Persönlichkeitsbild, Beziehungsdynamik und therapeutische Empfehlungen. Die Ergebnisse können auch direkt in die Psyche des Agenten integriert werden, um neue Ziele zu schaffen.

## 5. Die Weltkarte

Die **Weltkarte** (im mittleren Bereich) bietet eine visuelle Darstellung der Agenten und Entitäten in der Simulationswelt:

*   **Gitter:** Die Welt ist ein 2D-Gitter. Agenten und Entitäten sind an ihren `(x, y)`-Koordinaten platziert.
*   **Agenten:** Werden als **Benutzer-Icons** (lebendig) oder **Totenkopf-Icons** (verstorben) dargestellt. Ihre Farbe kann ihre Kulturzugehörigkeit anzeigen. Rollen-Icons (z.B. Krone für Anführer, Herzschlag für Heiler) können ebenfalls angezeigt werden.
*   **Entitäten:** Werden durch entsprechende Icons dargestellt (z.B. Haus für Gebäude, Apfel für Nahrung, Hammer für Eisen). Marktplätze und Gefängnisse haben spezifische Icons.
*   **Beziehungen:** Linien zwischen Agenten zeigen ihre Beziehungen an. Die Farbe der Linie (z.B. Pink für Ehepartner, Grün für Freunde, Rot für Rivalen) und ihre Deckkraft (Stärke der Beziehung) visualisieren das soziale Gefüge.
*   **Kulturen:** Kulturen werden durch farbige Kreise um Agenten oder farbige Rahmen um Gebäude visualisiert, was die kulturelle Zugehörigkeit und Ausbreitung verdeutlicht.

## 6. Manuelle Erstellung und Verwaltung

Das **'Neu erstellen'**-Panel (im rechten Bereich, wenn kein Admin-Agent ausgewählt ist) ermöglicht es Ihnen, manuell neue Elemente zur Simulation hinzuzufügen:

### 6.1 Agenten erstellen

1.  Wählen Sie 'Agent' aus dem Dropdown-Menü.
2.  Geben Sie einen **Namen** und eine **Beschreibung** ein.
3.  Optional können Sie:
    *   **Überzeugungen (Beliefs):** Als JSON-Objekt eingeben (z.B. `{"progress_good": 0.8}`). Nutzen Sie die Schaltfläche mit dem Glitzer-Icon, um zufällige Überzeugungen zu generieren.
    *   **Gene (Genome):** Als kommaseparierte Liste eingeben (z.B. `G-AGILE, G-SOCIAL`). Nutzen Sie das DNA-Icon, um zufällige Gene zu generieren.
    *   **Rolle:** Eine Rolle aus der Liste auswählen (z.B. 'Worker', 'Scientist').
    *   **Persönlichkeit:** Die Schieberegler anpassen oder die Schaltfläche 'Zufällige Persönlichkeit' verwenden.
4.  Klicken Sie auf **'Erstellen'**.

### 6.2 Entitäten erstellen

1.  Wählen Sie 'Entität' aus dem Dropdown-Menü.
2.  Geben Sie einen **Namen** und eine **Beschreibung** ein.
3.  Klicken Sie auf **'Erstellen'**.

### 6.3 Aktionen erstellen

1.  Wählen Sie 'Aktion' aus dem Dropdown-Menü.
2.  Geben Sie einen **Namen** und eine **Beschreibung** ein.
3.  Optional können Sie:
    *   **Belief Key:** Einen Überzeugungsschlüssel angeben, der bei Erfolg/Misserfolg der Aktion beeinflusst wird.
    *   **Mechanische Auswirkungen:** Klicken Sie auf 'Mechanische Auswirkungen (Optional)', um detaillierte Effekte zu definieren:
        *   **Kosten:** Als JSON-Objekt eingeben (z.B. `{"wood": 5}`).
        *   **Status-Änderungen (Deltas):** Numerische Werte für Änderungen an Gesundheit, Hunger, Durst, Müdigkeit, Stress, Währung eingeben.
        *   **Fähigkeits-Gewinn:** Eine Fähigkeit und einen Betrag auswählen, um den diese Fähigkeit erhöht wird.
4.  Klicken Sie auf **'Erstellen'**.

## 7. Admin-Kontrollpanel (Gott-Modus)

Wenn Sie den speziellen **'Admin'**-Agenten (erkennbar am roten Icon) im linken Panel auswählen, wechselt das rechte Panel zum **Admin-Kontrollpanel**. Dieses Panel bietet Ihnen direkte, 'gottgleiche' Kontrolle über die Simulation:

### 7.1 Politische Verwaltung

*   **Aktueller Anführer:** Zeigt den aktuellen Anführer an.
*   **Anführer setzen:** Wählen Sie einen Agenten aus der Liste und klicken Sie auf **'Anführer setzen'**, um ihn zum neuen Anführer zu ernennen. Die Kultur des neuen Anführers kann dadurch die Technologie 'Regierungsführung' freischalten.
*   **Wahl starten:** Startet eine neue Wahl für einen Anführer.
*   **Gesetze:** Zeigt die aktuellen Gesetze an. Sie können bestehende Gesetze mit dem **Mülleimer-Icon** aufheben.
*   **Gesetz hinzufügen:** Geben Sie einen **Gesetznamen** und den **Namen der verletzenden Aktion** (z.B. 'Steal' für Diebstahl) ein und klicken Sie auf **'Gesetz hinzufügen'**, um ein neues Gesetz zu erlassen.

### 7.2 Technologieverwaltung

*   Zeigt den **Forschungsfortschritt** jeder Kultur in Forschungspunkten an.
*   Listet alle verfügbaren Technologien auf. Technologien, die eine Kultur bereits kennt, sind grün markiert. Sie können unbekannte Technologien manuell mit **'Freischalten'** für eine Kultur freischalten.

### 7.3 Agentenverwaltung

Für jeden Agenten (außer dem Admin selbst) können Sie folgende Attribute direkt anpassen:

*   **Währung:** Setzen Sie den Währungsbetrag des Agenten.
*   **Gesundheit:** Setzen Sie den Gesundheitswert des Agenten.
*   **Krankheit:** Geben Sie den Namen einer Krankheit ein, um den Agenten zu infizieren, oder lassen Sie das Feld leer, um ihn zu heilen.
*   **Position:** Geben Sie neue X- und Y-Koordinaten ein, um den Agenten auf der Karte zu verschieben.
*   **Inhaftieren:** Geben Sie eine Dauer in Schritten ein und klicken Sie auf **'Inhaftieren'**, um den Agenten ins Gefängnis zu schicken.
*   **Wiederbeleben:** Wenn ein Agent verstorben ist, können Sie ihn mit dieser Schaltfläche wiederbeleben.

## 8. Zustand speichern, laden und Daten exportieren

Das **'Zustand speichern & laden'**-Panel (im rechten Bereich) ermöglicht die Verwaltung des Simulationszustands und den Export von Daten:

*   **Ganzen Zustand speichern:** Exportiert den gesamten aktuellen Zustand der Simulation (Agenten, Entitäten, Umgebung, Protokolle etc.) als JSON-Datei auf Ihren Computer. Dies ist nützlich, um den Fortschritt zu speichern und später fortzusetzen.
*   **Ganzen Zustand laden:** Ermöglicht das Laden eines zuvor gespeicherten Simulationszustands aus einer JSON-Datei. Dies überschreibt den aktuellen Simulationszustand.
*   **Alle Gespräche exportieren (.md):** Erstellt eine Markdown-Datei, die alle bisherigen Konversationen der Agenten enthält. Dies ist nützlich, um die sozialen Interaktionen zu analysieren.
*   **Statistiken exportieren:** Generiert einen zusammenfassenden Bericht im Markdown-Format über wichtige Ereignisse wie Eheschließungen, Geburten, Inhaftierungen und Kämpfe. Dies bietet eine statistische Übersicht über die soziale Dynamik der Welt.
*   **Erweiterte Exportoptionen:** Ermöglicht den Export spezifischer Teile des Zustands (nur Umgebung, nur Agenten, nur Entitäten) als separate JSON-Dateien.

## 9. Erweiterte Analyse (Analytics Dashboard)

Das **'Erweiterte Analyse'**-Dashboard (erreichbar über das Balkendiagramm-Icon in der Kopfzeile) bietet einen Makro-Blick auf die Simulation und hilft, emergente Muster zu erkennen, die im normalen Ereignisprotokoll untergehen würden. Es öffnet sich als Overlay und ist in mehrere Tabs unterteilt:

*   **Soziales Netzwerk:**
    *   Visualisiert das Beziehungsgeflecht der Gesellschaft als Graphen.
    *   Agenten sind Knoten, und Linien zwischen ihnen stellen Beziehungen dar.
    *   Die Farbe der Linie zeigt die Art der Beziehung an (z.B. Pink für Partner, Grün für Freunde, Rot für Rivalen).
    *   Die Deckkraft der Linie korreliert mit der Stärke der Beziehung.
    *   Dies ermöglicht es, auf einen Blick soziale Cliquen, zentrale Individuen oder isolierte Agenten zu erkennen.

*   **Wirtschaftsflüsse:**
    *   Zeigt den Fluss von Währung (`currency`) zwischen den Agenten und der Welt (z.B. durch Arbeit).
    *   Pfeile zeigen die Richtung des Geldflusses an, ihre Dicke repräsentiert das transferierte Volumen.
    *   Ein **Zeitfenster-Regler** ermöglicht es Ihnen, den Analysezeitraum anzupassen, um kurzfristige Handelsmuster oder langfristige Wirtschaftsbeziehungen zu untersuchen.

*   **Kulturelle Ausbreitung:**
    *   Diese Ansicht zeigt eine Heatmap der Weltkarte.
    *   Jede Kultur hat eine eigene Farbe.
    *   Die Farbintensität in einem Gitterbereich zeigt die Konzentration von Mitgliedern einer bestimmten Kultur an. So lässt sich die Bildung von kulturellen Enklaven oder die Vermischung von Kulturen visuell nachvollziehen.

*   **Technologie:**
    *   Visualisiert den technologischen Fortschritt jeder Kultur.
    *   Für jede Technologie im Technologiebaum wird der Forschungsfortschritt jeder Kultur als Prozentbalken dargestellt.
    *   Technologien, deren Voraussetzungen noch nicht erfüllt sind, werden ausgegraut dargestellt, was die Entwicklungswege der Kulturen verdeutlicht.

## 10. Ereignisprotokoll

Das **'Ereignisprotokoll'**-Panel (im rechten Bereich) zeigt eine chronologische Liste aller wichtigen Ereignisse und Aktionen, die in der Simulation stattfinden. Jede Protokollzeile enthält einen Zeitstempel und eine Beschreibung des Ereignisses (z.B. 'Agent X isst etwas', 'Agent Y hat ein Gesetz erlassen'). Dies ist nützlich, um den Verlauf der Simulation detailliert zu verfolgen und zu verstehen, was die Agenten tun und warum.

