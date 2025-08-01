# Benutzerhandbuch für RealitySim KI

_Willkommen beim Benutzerhandbuch für RealitySim KI, einer interaktiven webbasierten Simulationsumgebung. Diese Anwendung ermöglicht es Ihnen, eine dynamische Welt zu beobachten und zu steuern, in der KI-Agenten mit einzigartigen Überzeugungen und Erinnerungen miteinander und mit ihrer Umgebung interagieren. Sie können Agenten über natürliche Sprache steuern, Simulationsschritte ausführen und das emergente kognitive Verhalten des Systems visualisieren. Tauchen Sie ein in eine lebendige Welt, die sich mit jedem Schritt weiterentwickelt._

## 1. Erste Schritte

Bevor Sie in die Details der Simulation eintauchen, lernen Sie hier die grundlegenden Bedienelemente kennen:

### 1.1 Installation und Start
RealitySim KI ist eine webbasierte Anwendung. Es ist keine komplexe Installation erforderlich. Öffnen Sie einfach die `index.html`-Datei in Ihrem Webbrowser, um die Anwendung zu starten.

### 1.2 Konfiguration des lokalen KI-Modells (LM Studio)
Diese Anwendung verwendet ein KI-Modell, das lokal über LM Studio ausgeführt wird. Sie müssen die Anwendung so konfigurieren, dass sie sich mit Ihrem LM Studio Server verbinden kann, bevor Sie KI-Funktionen nutzen können.

1.  **Starten Sie LM Studio:** Stellen Sie sicher, dass LM Studio auf Ihrem Computer läuft und Sie ein Modell geladen haben.
2.  **Starten Sie den lokalen Server:** Gehen Sie in LM Studio zum Tab **Local Server** (Symbol: `<->`) und klicken Sie auf **Start Server**.
3.  **Finden Sie die Konfigurationsdetails:**
    *   **Server-URL:** LM Studio zeigt oben eine erreichbare Adresse an (z.B. `http://localhost:1234`). Sie benötigen nur diesen Basisteil der URL.
    *   **Modell-Identifier:** In der rechten Seitenleiste unter "API Usage" finden Sie den "API Identifier" des Modells (z.B. `google/gemma-2b-it`). Dies ist **nicht** der Dateiname der `.gguf`-Datei.
4.  **Konfigurieren Sie RealitySim KI:**
    *   Klicken Sie in der Kopfzeile der Anwendung auf das Zahnrad-Symbol (<Settings-Icon>), um die **Einstellungen** zu öffnen.
    *   Fügen Sie die **Basis-URL** (z.B. `http://localhost:1234`) in das Feld "LM Studio API Endpunkt" ein. Fügen Sie **nicht** den Pfad `/v1/chat/completions` hinzu.
    *   Fügen Sie den **API Identifier** des Modells (z.B. `google/gemma-2b-it`) in das Feld "Modellname" ein.
    *   Klicken Sie auf "Speichern".

### 1.3 Grundlegende Simulationssteuerung
Die Hauptsteuerungselemente finden Sie in der Kopfzeile der Anwendung:

*   **Welt generieren** (Knopf mit Globus-Symbol <Globe-Icon>): Öffnet ein Dialogfenster, in dem Sie die Anzahl der zu generierenden Agenten und Entitäten festlegen können. Nach der Bestätigung erstellt die KI eine völlig neue Welt nach Ihren Vorgaben.
*   **Schritt** (Knopf mit Play-Symbol <Play-Icon>): Führt die Simulation um einen einzelnen Zeitschritt voran. Agenten treffen Entscheidungen, interagieren und die Umgebung entwickelt sich weiter.
*   **Start** (Knopf mit Fast-Forward-Symbol <FastForward-Icon>): Ermöglicht es Ihnen, die Simulation um eine vordefinierte Anzahl von Schritten (standardmäßig 10) automatisch ablaufen zu lassen. Die Anzahl der Schritte kann im Eingabefeld daneben angepasst werden.
*   **Zurücksetzen** (Knopf mit Zurück-Pfeil-Symbol <RotateCcw-Icon>): Setzt die gesamte Simulation auf ihren ursprünglichen Startzustand zurück. Alle Änderungen und Fortschritte gehen dabei verloren.
*   **Sprache wechseln** (Knopf mit Sprachkürzel wie 'DE' oder 'EN'): Klicken Sie hier, um die Benutzeroberfläche zwischen Deutsch und Englisch umzuschalten.

## 2. Die Benutzeroberfläche (GUI) im Überblick

Die RealitySim KI-Anwendung ist in mehrere Bereiche unterteilt, die Ihnen einen umfassenden Überblick über die Simulation und Interaktionsmöglichkeiten bieten:

*   **Kopfzeile**: Oben auf dem Bildschirm finden Sie den Titel der Anwendung ('RealitySim KI'), den Sprachwechsler, das Einstellungsmenü (Zahnrad-Symbol <Settings-Icon>) und das Kontrollpanel für die Simulationssteuerung.

*   **Linke Seitenleiste**:
    *   **Agenten** (<Cpu-Icon>): Eine Liste aller aktiven und verstorbenen Agenten in der Simulation. Klicken Sie auf einen Agentennamen, um dessen detaillierte Informationen in der Agentenkarte im mittleren Bereich anzuzeigen. Verstorbene Agenten sind grau markiert. Über das Mülleimer-Symbol (<Trash2-Icon>) können Agenten gelöscht werden.
    *   **Entitäten** (<Boxes-Icon>): Eine Liste aller statischen Objekte (Entitäten) in der Welt. Auch hier können Entitäten über das Mülleimer-Symbol (<Trash2-Icon>) entfernt werden.

*   **Mittlerer Bereich**:
    *   **Agentenkarte**: Zeigt detaillierte Informationen über den aktuell ausgewählten Agenten an. Dies ist Ihr Hauptinteraktionspunkt mit einzelnen Agenten. (Siehe Abschnitt 3: Agenten verstehen).
    *   **Weltkarte** (<Share2-Icon>): Eine visuelle Darstellung der Simulationswelt als Raster. Sie zeigt die Positionen von Agenten (mit Rollen-Icons und Kultur-Farben) und Entitäten. Beziehungen zwischen Agenten werden durch Linien visualisiert (z.B. pink für Partner/Ehepartner, rot für Rivalen).

*   **Rechte Seitenleiste**:
    *   **Umgebung** (<Microscope-Icon>): Zeigt den aktuellen globalen Zustand der Simulationsumgebung an, wie z.B. die aktuelle Zeit, das Wetter oder die Größe des Rasters.
    *   **Verfügbare Aktionen** (<Zap-Icon>): Eine Liste aller Aktionen, die Agenten in dieser Simulation ausführen können. Sie können hier auch benutzerdefinierte Aktionen löschen.
    *   **Neu erstellen** (<PlusCircle-Icon>): Ein Panel, das es Ihnen ermöglicht, neue Agenten, Entitäten oder benutzerdefinierte Aktionen zur Simulation hinzuzufügen.
    *   **Ereignisprotokoll** (<BookText-Icon>): Eine chronologische Liste aller wichtigen Ereignisse, die in der Simulation stattfinden, wie Agentenaktionen, Interaktionen oder Umweltveränderungen.
    *   **Status Speichern & Laden** (<Download-Icon>): Ermöglicht das Speichern und Laden des aktuellen Zustands der Simulation.
    *   **Admin-Kontrollzentrum** (<Shield-Icon>): Dieses Panel ist nur sichtbar, wenn der spezielle 'Admin'-Agent ausgewählt ist. Es bietet erweiterte Steuerungsmöglichkeiten für die Simulation.

## 3. Agenten verstehen

Jeder Agent in RealitySim KI ist eine komplexe KI-Entität mit einer Vielzahl von Eigenschaften und inneren Zuständen, die sein Verhalten beeinflussen. Die Agentenkarte bietet Ihnen einen detaillierten Einblick:

*   **Name und Beschreibung**: Identifiziert den Agenten und gibt einen kurzen Überblick über seine Persönlichkeit.
*   **Position** (<MapPin-Icon>): Die aktuellen X- und Y-Koordinaten des Agenten auf der Weltkarte.
*   **Nachkommen** (<Users-Icon>): Die Anzahl der Kinder, die der Agent bisher hatte.
*   **Status** (<HeartPulse-Icon>):
    *   **Lebensphase** (<Baby-Icon>/<User-Icon>/<PersonStanding-Icon>): Zeigt an, ob der Agent ein Kind, Jugendlicher, Erwachsener oder Ältester ist. Dies beeinflusst seine möglichen Aktionen.
    *   **Rolle** (<Award-Icon>): Die gesellschaftliche Rolle des Agenten (z.B. Arbeiter, Heiler, Wissenschaftler, Anführer). Bestimmte Aktionen sind rollenspezifisch.
    *   **Kultur** (<Globe-Icon>): Die Kultur, der der Agent angehört (z.B. 'Utopian Technocrats', 'Primitivist Collective'). Kulturen beeinflussen geteilte Überzeugungen.
    *   **Religion** (<Church-Icon>): Die Religion, der der Agent angehört.
    *   **Gesundheit & Krankheit**: Der aktuelle Gesundheitszustand (grün = gesund, gelb = angeschlagen, rot = kritisch) und eventuelle Krankheiten (z.B. 'Grippe').
*   **Genom** (<Dna-Icon>): Eine Liste genetischer Marker, die passive Boni verleihen (z.B. schnellere Heilung, höhere Intelligenz).
*   **Inventar** (<Boxes-Icon>): Zeigt die gesammelten Ressourcen des Agenten an (z.B. Nahrung, Wasser, Holz, Medizin).
*   **Diagramme**:
    *   **Überzeugungen** (<BrainCircuit-Icon>): Visualisiert die langfristigen Überzeugungen des Agenten (z.B. 'Wetter: Sonnig', 'Fortschritt ist Gut').
    *   **Situative Emotionen** (<Heart-Icon>): Zeigt die aktuellen, kurzlebigen emotionalen Zustände des Agenten an (z.B. Freude, Traurigkeit, Wut).
    *   **Aktionsresonanz** (<GitCommitHorizontal-Icon>): Gibt an, welche Aktionen der Agent in letzter Zeit bevorzugt hat.
*   **Beziehungen** (<Users-Icon>) **& Erlernte Dispositionen** (<GitBranch-Icon>): Zeigt die Beziehungen des Agenten zu anderen Agenten (z.B. Freund, Rivale) und die langfristig erlernten emotionalen Gefühle (Dispositionen) gegenüber diesen an.
*   **Soziales Gedächtnis** (<BookText-Icon>): Protokolliert wichtige vergangene Interaktionen und deren emotionalen Einfluss.
*   **Letzte Aktionen** (<MessageSquare-Icon>): Eine Liste der zuletzt durchgeführten Aktionen.
*   **Interagieren** (<MessageSquare-Icon>): Das Eingabefeld, um dem Agenten Befehle zu geben. Mit aktiviertem "Lokale KI verwenden"-Schalter (<Sparkles-Icon>) können Sie Anweisungen in natürlicher Sprache formulieren (z.B. "sprich mit der nächsten Person"), die von der KI in eine passende Aktion übersetzt werden. Wenn der Schalter deaktiviert ist, müssen Sie den exakten Namen einer verfügbaren Aktion eingeben.

## 4. Kernfunktionen und Workflows

Dieser Abschnitt beschreibt die wichtigsten Interaktionsmöglichkeiten mit der Simulation.

### 4.1 Simulation steuern
*   **Einen Schritt ausführen**: Klicken Sie auf den "Schritt"-Knopf (<Play-Icon>) im Kontrollpanel, um die Simulation um einen einzelnen Zeitschritt voranzutreiben. Alle Agenten führen eine Aktion aus, und die Umgebung wird aktualisiert.
*   **Mehrere Schritte ausführen**: Geben Sie eine Zahl in das Eingabefeld neben dem "Start"-Knopf (<FastForward-Icon>) ein und klicken Sie dann auf "Start", um die Simulation automatisch um die angegebene Anzahl von Schritten ablaufen zu lassen.
*   **Simulation zurücksetzen**: Der "Zurücksetzen"-Knopf (<RotateCcw-Icon>) setzt die gesamte Welt auf ihren ursprünglichen Zustand zurück, wie sie beim Start der Anwendung war. Alle generierten Agenten, Entitäten und Änderungen gehen verloren.

### 4.2 Eine neue Welt generieren
1.  Klicken Sie auf den "Welt generieren"-Knopf (<Globe-Icon>) im Kontrollpanel.
2.  Ein Dialogfenster "Neue Welt generieren" wird geöffnet.
3.  Geben Sie die gewünschte "Anzahl der Agenten" und "Anzahl der Entitäten" ein.
4.  Klicken Sie auf "Generieren". Die KI erstellt eine neue Welt basierend auf Ihren Vorgaben. Dies kann einen Moment dauern. Der Fortschritt wird im Ereignisprotokoll angezeigt.

### 4.3 Mit Agenten interagieren
1.  **Agent auswählen**: Klicken Sie in der linken Seitenleiste auf den Namen eines Agenten, um dessen Details in der Agentenkarte im mittleren Bereich anzuzeigen.
2.  **Befehl eingeben**: Im Abschnitt "Interagieren" der Agentenkarte finden Sie ein Eingabefeld.
    *   **Mit KI-Interpretation (Standard)**: Stellen Sie sicher, dass der Schalter "Lokale KI verwenden" (<Sparkles-Icon>) aktiviert ist. Geben Sie eine Anweisung in natürlicher Sprache ein (z.B. "Gehe nach Osten" oder "Finde etwas zu essen"). Die KI des Agenten wird versuchen, Ihre Anweisung in eine passende Aktion umzusetzen.
    *   **Direkte Aktionseingabe**: Deaktivieren Sie den Schalter "Lokale KI verwenden". Geben Sie den **exakten Namen** einer der "Verfügbaren Aktionen" (rechte Seitenleiste) ein (z.B. "Move East" oder "Eat Food").
3.  **Befehl senden**: Klicken Sie auf den Senden-Knopf (<Send-Icon>) oder drücken Sie Enter. Die Aktion wird sofort ausgeführt und im Ereignisprotokoll vermerkt.

### 4.4 Neue Objekte erstellen
Im Panel "Neu erstellen" in der rechten Seitenleiste können Sie der Simulation neue Elemente hinzufügen:

1.  **Typ auswählen**: Wählen Sie im Dropdown-Menü aus, ob Sie einen "Agent", eine "Entität" oder eine "Aktion" erstellen möchten.
2.  **Details eingeben**:
    *   **Name**: Ein eindeutiger Name für das neue Objekt.
    *   **Beschreibung**: Eine kurze Beschreibung.
    *   **Für Agenten zusätzlich**:
        *   **Überzeugungen**: Geben Sie Überzeugungen im JSON-Format ein (z.B. `{"weather_sunny":0.7, "progress_good":0.8}`). Dies beeinflusst das Verhalten des Agenten.
        *   **Gene**: Eine kommaseparierte Liste von Genen (z.B. `G-AGILE, G-SOCIAL`). Sie können auch auf das DNA-Symbol (<Dna-Icon>) klicken, um zufällige Gene zu generieren.
        *   **Rolle**: Wählen Sie eine gesellschaftliche Rolle aus dem Dropdown-Menü.
    *   **Für Aktionen zusätzlich**:
        *   **Belief-Schlüssel**: Ein optionaler Schlüssel, der die Aktion mit einer bestimmten Überzeugung verknüpft.
3.  **Erstellen**: Klicken Sie auf den "Erstellen"-Knopf. Das neue Objekt wird der Simulation hinzugefügt und ist sofort aktiv.

## 5. Detaillierte Funktionsbeschreibung (Agenten-Aktionen)

Agenten können eine Vielzahl von Aktionen ausführen, die ihr Überleben, ihre sozialen Interaktionen und ihre Entwicklung beeinflussen. Hier sind einige der wichtigsten Aktionen, die Sie beobachten oder Agenten befehlen können:

### 5.1 Überlebensmechaniken
Agenten haben grundlegende Bedürfnisse (Hunger, Durst, Müdigkeit), die sie befriedigen müssen. Wenn diese Werte zu hoch werden, verlieren Agenten Gesundheit und können sterben.

*   **Essen** (<CookingPot-Icon>): Der Agent konsumiert Nahrung aus seinem Inventar, um seinen Hunger zu reduzieren. Voraussetzung: Nahrung im Inventar.
*   **Wasser trinken** (<GlassWater-Icon>): Der Agent trinkt aus einer Wasserquelle in der Nähe, um seinen Durst zu stillen. Voraussetzung: Eine Wasserquelle in Reichweite.
*   **Nahrung sammeln** (<Apple-Icon>): Der Agent sammelt Nahrung von einer Nahrungsquelle (z.B. Beerenstrauch) und legt sie in sein Inventar. Voraussetzung: Eine Nahrungsquelle in Reichweite mit verfügbarer Menge.
*   **Holz sammeln** (<Log-Icon>): Der Agent sammelt Holz von einer Holzquelle (z.B. Wald) und legt es in sein Inventar. Voraussetzung: Eine Holzquelle in Reichweite mit verfügbarer Menge.
*   **Unterkunft bauen** (<Home-Icon>): Der Agent verwendet Holz aus seinem Inventar, um eine einfache Unterkunft an seiner aktuellen Position zu bauen. Kosten: 10 Holz. Voraussetzung: Genug Holz im Inventar.
*   **Ausruhen** (<Bed-Icon>): Der Agent ruht sich aus, um seine Müdigkeit zu reduzieren und Gesundheit zu regenerieren. Kann auch zur Heilung von Krankheiten beitragen.

### 5.2 Soziale und kulturelle Aktionen
Agenten interagieren miteinander und beeinflussen sich gegenseitig basierend auf ihren Beziehungen, Kulturen und Religionen.

*   **Beten** (<Church-Icon>): Der Agent betet, was seine Emotionen positiv beeinflusst (reduziert Angst, erhöht Freude). Voraussetzung: Der Agent muss einer Religion angehören.
*   **Heilen** (<HeartPulse-Icon>): Ein Agent mit der Rolle 'Heiler' kann einen kranken Agenten in der Nähe heilen. Dies entfernt die Krankheit und stellt etwas Gesundheit wieder her. Voraussetzung: Agent ist 'Heiler', kranker Agent in Reichweite.
*   **Missionieren** (<Church-Icon>): Der Agent versucht, seine religiösen Überzeugungen an einen anderen Agenten in der Nähe weiterzugeben. Dies kann zur Konvertierung führen.
*   **Konvertieren** (<Sparkles-Icon>): Versucht, einen anderen Agenten zur eigenen Religion zu bekehren. Hat eine Erfolgschance.
*   **Exkommunizieren** (<Award-Icon>): Ein Agent mit der Rolle 'Anführer' kann ein Mitglied seiner Religion in der Nähe exkommunizieren, wodurch es seine Religion verliert. Voraussetzung: Agent ist 'Anführer', Zielagent gehört derselben Religion an und ist in Reichweite.
*   **Heiratsantrag machen** (<Heart-Icon>): Ein Agent kann einem Partner einen Heiratsantrag machen. Erfolg hängt von der Beziehungsqualität und den Emotionen des Partners ab. Bei Erfolg werden beide 'Ehepartner'. Bei Ablehnung sinkt die Stimmung des Antragstellers.
*   **Fortpflanzen** (<Baby-Icon>): Agenten im fortpflanzungsfähigen Alter (standardmäßig 20-50 Jahre) können versuchen, mit einem Partner ein Kind zu bekommen. Erfolg führt zur Geburt eines neuen Agenten mit Genen der Eltern. Voraussetzung: Partner in Reichweite, beide im fortpflanzungsfähigen Alter, und noch nicht die maximale Nachkommenzahl erreicht.
*   **Kämpfen** (<Zap-Icon>): Ein Agent kann einen Kampf mit einem anderen Agenten beginnen, insbesondere wenn die Wut hoch ist oder die Beziehung 'Rivale' ist. Dies reduziert die Gesundheit beider Agenten und verschlechtert die Beziehung.

### 5.3 Bewegung und Umweltinteraktion
*   **Nach Norden/Süden/Osten/Westen bewegen**: Der Agent bewegt sich einen Schritt in die angegebene Richtung. Agenten mit dem Gen 'G-AGILE' bewegen sich schneller.
*   **Wetter ändern (Beispiel)**: Einige Aktionen können die Umgebung direkt beeinflussen, wie z.B. das Wetter auf 'sonnig' oder 'regnerisch' ändern. Diese Aktionen sind oft mit bestimmten Überzeugungen verknüpft.

## 6. Admin-Kontrollzentrum

Das Admin-Kontrollzentrum (<Shield-Icon>) bietet erweiterte Steuerungsmöglichkeiten für die Simulation und ist nur sichtbar, wenn der spezielle 'Admin'-Agent in der linken Seitenleiste ausgewählt ist.

### 6.1 Umgebung überschreiben
In diesem Bereich können Sie die globalen Umgebungsparameter direkt ändern. Dies umfasst Werte wie `time`, `weather`, `location`, `width` und `height` der Welt. Geben Sie die neuen Werte in die entsprechenden Felder ein und klicken Sie auf "Umgebung aktualisieren", um die Änderungen zu übernehmen.

### 6.2 Weltregel-Editor
Dieser Editor ermöglicht es Ihnen, benutzerdefinierte Aktionen zu erstellen und bestehende zu löschen.

*   **Neue Aktion erstellen**:
    1.  Geben Sie einen "Namen" und eine "Beschreibung" für die neue Aktion ein.
    2.  Optional können Sie einen "Belief-Schlüssel" hinzufügen, der die Aktion mit einer bestimmten Überzeugung verknüpft.
    3.  Klicken Sie auf "Aktion erstellen". Die neue Aktion wird sofort für alle Agenten verfügbar.
*   **Bestehende Aktionen löschen**: Unter "Bestehende Aktionen" finden Sie eine Liste aller verfügbaren Aktionen. Klicken Sie auf das Mülleimer-Symbol (<Trash2-Icon>) neben einer Aktion, um diese zu entfernen. Standardaktionen können nicht gelöscht werden.

### 6.3 Agenten-Verwaltung
Hier können Sie einzelne Agenten direkt manipulieren:

*   **Gesundheit setzen**: Wählen Sie einen Agenten aus, geben Sie einen neuen Gesundheitswert (0-100) ein und klicken Sie auf "Setzen".
*   **Krankheit zufügen/heilen**: Geben Sie einen Krankheitsnamen (z.B. "Grippe") ein, um den Agenten zu infizieren, oder lassen Sie das Feld leer, um ihn zu heilen. Klicken Sie auf "Setzen".
*   **Position setzen**: Geben Sie neue X- und Y-Koordinaten für den Agenten ein und klicken Sie auf "Setzen", um ihn an eine bestimmte Stelle auf der Karte zu bewegen.
*   **Wiederbeleben**: Wenn ein Agent verstorben ist, können Sie auf "Wiederbeleben" klicken, um ihn mit halber Gesundheit und ohne Krankheit wieder ins Leben zurückzuholen.

## 7. Speichern und Laden des Simulationsstatus

Das Panel "Status Speichern & Laden" (<Download-Icon>) in der rechten Seitenleiste ermöglicht es Ihnen, den aktuellen Zustand Ihrer Simulation zu sichern und später wiederherzustellen.

*   **Vollständigen Status speichern**: Klicken Sie auf diesen Knopf, um den gesamten Zustand der Simulation (Umgebung, Agenten, Entitäten, Aktionen, Kulturen, Religionen) als JSON-Datei auf Ihrem Computer zu speichern. Der Dateiname enthält einen Zeitstempel.
*   **Vollständigen Status laden**: Klicken Sie auf diesen Knopf, um eine zuvor gespeicherte JSON-Datei auszuwählen und den Simulationsstatus wiederherzustellen. Dies überschreibt den aktuellen Zustand der Simulation.
*   **Erweiterte Export-Optionen**: Unter "Erweiterte Export-Optionen" können Sie auswählen, nur bestimmte Teile des Zustands zu exportieren (z.B. "Nur Umgebung exportieren", "Nur Agenten exportieren", "Nur Entitäten exportieren"). Dies ist nützlich, wenn Sie nur bestimmte Daten sichern oder teilen möchten.

## 8. Fehlerbehebung

Hier finden Sie Lösungen für häufig auftretende Probleme.

### 8.1 Verbindung zu LM Studio fehlgeschlagen (CORS)
Diese Fehlermeldung ist die häufigste und wird fast immer durch eine blockierte Anfrage aufgrund von **CORS (Cross-Origin Resource Sharing)** verursacht. CORS ist eine Sicherheitsfunktion von Webbrowsern.

**Lösung:**
1.  Gehen Sie in Ihrer LM Studio Anwendung zum Tab **Local Server**.
2.  Suchen Sie nach der Option **CORS**.
3.  **Setzen Sie einen Haken bei der Checkbox, um CORS zu aktivieren.**
4.  Starten Sie den Server neu, falls erforderlich.

Wenn der Fehler weiterhin besteht, überprüfen Sie Folgendes:
*   Ist die URL in den RealitySim-Einstellungen korrekt und **ohne** einen Pfad am Ende (z.B. `/v1/...`)?
*   Läuft der LM Studio Server wirklich (wird als "Running" angezeigt)?
*   Sind Ihr Computer und das Gerät, auf dem die App läuft, im selben Netzwerk? (Relevant, wenn Sie die App auf einem anderen Gerät als LM Studio verwenden).

### 8.2 KI generiert nicht die erwartete Anzahl von Agenten/Entitäten
Nach der Weltgenerierung kann es vorkommen, dass im Ereignisprotokoll eine Warnung erscheint, dass die KI nicht die exakt angeforderte Anzahl von Agenten oder Entitäten generiert hat (z.B. "⚠️ KI hat 18/20 Agenten und 19/20 Entitäten generiert."). Dies ist ein bekanntes Verhalten von KI-Modellen, die manchmal Schwierigkeiten haben, exakte Zahlenvorgaben in generierten Daten einzuhalten. Die Simulation wird mit den tatsächlich generierten Ergebnissen fortgesetzt.

### 8.3 Agenten führen keine Aktionen aus / KI findet keine Aktion
Wenn Agenten untätig bleiben oder die KI keine passende Aktion finden kann, überprüfen Sie Folgendes:
*   **LM Studio Konfiguration**: Stellen Sie sicher, dass Ihr LM Studio Server korrekt konfiguriert und erreichbar ist (siehe Abschnitt 1.2).
*   **Agentenzustand**: Ist der Agent am Leben? Hat er ausreichend Gesundheit? Ist er zu müde, hungrig oder durstig, um andere Aktionen auszuführen?
*   **Verfügbare Aktionen**: Sind die Aktionen, die der Agent ausführen soll, in der Liste der "Verfügbaren Aktionen" in der rechten Seitenleiste vorhanden? Wenn Sie eine benutzerdefinierte Aktion befehlen, muss der Name exakt übereinstimmen (wenn "Lokale KI verwenden" deaktiviert ist).
*   **Agenten-Prompt**: Wenn Sie die lokale KI verwenden, versuchen Sie, Ihren Prompt klarer und präziser zu formulieren. Manchmal hilft es, die Bedürfnisse des Agenten im Prompt zu erwähnen (z.B. "Ich bin hungrig, finde Nahrung").

