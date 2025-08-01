Benutzerhandbuch für RealitySim KI
Willkommen beim Benutzerhandbuch für RealitySim KI, einer interaktiven webbasierten Simulationsumgebung. Diese Anwendung ermöglicht es Ihnen, eine dynamische Welt zu beobachten und zu steuern, in der KI-Agenten mit einzigartigen Überzeugungen und Erinnerungen miteinander und mit ihrer Umgebung interagieren. Sie können Agenten über natürliche Sprache steuern, Simulationsschritte ausführen und das emergente kognitive Verhalten des Systems visualisieren. Tauchen Sie ein in eine lebendige Welt, die sich mit jedem Schritt weiterentwickelt.

## 1. Erste Schritte
Bevor Sie in die Details der Simulation eintauchen, lernen Sie hier die grundlegenden Bedienelemente kennen:

*   **Einstellungen** (Knopf mit Zahnrad-Symbol): **WICHTIG:** Bevor Sie KI-Funktionen nutzen können, müssen Sie hier den API-Endpunkt und den Modellnamen Ihres lokalen LM Studio Servers eintragen.
*   **Welt generieren** (Knopf mit Globus-Symbol): Klicken Sie hier, um ein Dialogfenster zu öffnen, in dem Sie die Anzahl der zu generierenden Agenten und Entitäten festlegen können. Nach der Bestätigung erstellt die KI eine völlig neue Welt nach Ihren Vorgaben.
*   **Schritt** (Knopf mit Play-Symbol): Führt die Simulation um einen einzelnen Zeitschritt voran. Agenten treffen Entscheidungen, interagieren und die Umgebung entwickelt sich weiter.
*   **Start** (Knopf mit Fast-Forward-Symbol): Ermöglicht es Ihnen, die Simulation um eine vordefinierte Anzahl von Schritten (standardmäßig 10) automatisch ablaufen zu lassen. Die Anzahl der Schritte kann im Eingabefeld daneben angepasst werden.
*   **Zurücksetzen** (Knopf mit Zurück-Pfeil-Symbol): Setzt die gesamte Simulation auf ihren ursprünglichen Startzustand zurück. Alle Änderungen und Fortschritte gehen dabei verloren.
*   **Sprache wechseln** (Knopf mit Sprachkürzel wie 'DE' oder 'EN'): Klicken Sie hier, um die Benutzeroberfläche zwischen Deutsch und Englisch umzuschalten.

### 1.1. Konfiguration des lokalen KI-Modells
Diese Anwendung verwendet ein KI-Modell, das lokal über LM Studio ausgeführt wird. Sie müssen die Anwendung so konfigurieren, dass sie sich mit Ihrem LM Studio Server verbinden kann.

1.  **Starten Sie LM Studio:** Stellen Sie sicher, dass LM Studio auf Ihrem Computer läuft und Sie ein Modell geladen haben.
2.  **Starten Sie den lokalen Server:** Gehen Sie in LM Studio zum Tab **Local Server** (Symbol: `<->`) und klicken Sie auf **Start Server**.
3.  **Finden Sie die Konfigurationsdetails:**
    *   **Server-URL:** LM Studio zeigt oben eine erreichbare Adresse an (z.B. `http://localhost:1234`). Sie benötigen nur diesen Basisteil der URL.
    *   **Modell-Identifier:** In der rechten Seitenleiste unter "API Usage" finden Sie den "API Identifier" des Modells (z.B. `google/gemma-2b-it`). Dies ist **nicht** der Dateiname der `.gguf`-Datei.
4.  **Konfigurieren Sie RealitySim KI:**
    *   Klicken Sie in der Kopfzeile der Anwendung auf das Zahnrad-Symbol, um die Einstellungen zu öffnen.
    *   Fügen Sie die **Basis-URL** (z.B. `http://localhost:1234`) in das Feld "LM Studio API Endpunkt" ein. Fügen Sie **nicht** den Pfad `/v1/chat/completions` hinzu.
    *   Fügen Sie den **API Identifier** des Modells (z.B. `google/gemma-2b-it`) in das Feld "Modellname" ein.
    *   Klicken Sie auf "Speichern".

#### Fehlerbehebung: "Verbindung zu LM Studio fehlgeschlagen" (Failed to fetch)
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

### 1.2 Die Rolle der KI
Alle intelligenten Funktionen in RealitySim KI werden durch das von Ihnen in den Einstellungen konfigurierte lokale KI-Modell (via LM Studio) gesteuert. Dies umfasst:

*   **Weltgenerierung**: Die Erstellung neuer, komplexer Welten.
*   **Interaktive Prompts**: Die Interpretation Ihrer Anweisungen an die Agenten, wenn der KI-Schalter aktiviert ist.
*   **Autonome Agenten-Kommunikation**: Die Dialoge und Aktionen, die Agenten untereinander aushandeln, wenn sie sich treffen.

Es findet **keine** Kommunikation mit externen KI-Diensten (wie z.B. Gemini oder OpenAI) statt. Die gesamte KI-Verarbeitung erfolgt lokal auf Ihrem Rechner über LM Studio.

## 2. Die Benutzeroberfläche (GUI)
Die RealitySim KI-Anwendung ist in mehrere Bereiche unterteilt, die Ihnen einen umfassenden Überblick über die Simulation und Interaktionsmöglichkeiten bieten:

*   **Kopfzeile**: Oben auf dem Bildschirm finden Sie den Titel der Anwendung ('RealitySim KI'), den Sprachwechsler, das Einstellungsmenü und das Kontrollpanel für die Simulationssteuerung.
*   **Linke Seitenleiste**:
    *   **Agenten**: Eine Liste aller aktiven und verstorbenen Agenten in der Simulation. Klicken Sie auf einen Agentennamen, um dessen detaillierte Informationen in der Agentenkarte im mittleren Bereich anzuzeigen. Verstorbene Agenten sind grau markiert. Über das Mülleimer-Symbol können Agenten gelöscht werden.
    *   **Entitäten**: Eine Liste aller statischen Objekte (Entitäten) in der Welt. Auch hier können Entitäten über das Mülleimer-Symbol entfernt werden.
*   **Mittlerer Bereich**:
    *   **Agentenkarte**: Zeigt detaillierte Informationen über den aktuell ausgewählten Agenten an. Dies ist Ihr Hauptinteraktionspunkt mit einzelnen Agenten.
    *   **Weltkarte**: Eine visuelle Darstellung der Simulationswelt als Raster. Sie zeigt die Positionen von Agenten (mit Rollen-Icons und Kultur-Farben) und Entitäten. Beziehungen zwischen Agenten werden durch Linien visualisiert (z.B. pink für Partner/Ehepartner, rot für Rivalen).
*   **Rechte Seitenleiste**:
    *   **Umgebung**: Zeigt den aktuellen globalen Zustand der Simulationsumgebung an, wie z.B. die aktuelle Zeit, das Wetter oder die Größe des Rasters.
    *   **Verfügbare Aktionen**: Eine Liste aller Aktionen, die Agenten in dieser Simulation ausführen können. Sie können hier auch benutzerdefinierte Aktionen löschen.
    *   **Neu erstellen**: Ein Panel, das es Ihnen ermöglicht, neue Agenten, Entitäten oder benutzerdefinierte Aktionen zur Simulation hinzuzufügen.
    *   **Ereignisprotokoll**: Eine chronologische Liste aller wichtigen Ereignisse, die in der Simulation stattfinden, wie Agentenaktionen, Interaktionen oder Umweltveränderungen.
    *   **Status Speichern & Laden**: Ermöglicht das Speichern und Laden des aktuellen Zustands der Simulation.
    *   **Admin-Kontrollzentrum**: Dieses Panel ist nur sichtbar, wenn der spezielle 'Admin'-Agent ausgewählt ist. Es bietet erweiterte Steuerungsmöglichkeiten für die Simulation.

## 3. Agenten verstehen
Jeder Agent in RealitySim KI ist eine komplexe KI-Entität mit einer Vielzahl von Eigenschaften und inneren Zuständen, die sein Verhalten beeinflussen. Die Agentenkarte bietet Ihnen einen detaillierten Einblick:

*   **Name und Beschreibung**: Identifiziert den Agenten und gibt einen kurzen Überblick über seine Persönlichkeit.
*   **Position**: Die aktuellen X- und Y-Koordinaten des Agenten auf der Weltkarte.
*   **Nachkommen**: Die Anzahl der Kinder, die der Agent bisher hatte.
*   **Status**:
    *   **Lebensphase**: Zeigt an, ob der Agent ein Kind, Jugendlicher, Erwachsener oder Ältester ist. Dies beeinflusst seine möglichen Aktionen.
    *   **Rolle**: Die gesellschaftliche Rolle des Agenten (z.B. Arbeiter, Heiler, Wissenschaftler, Anführer). Bestimmte Aktionen sind rollenspezifisch.
    *   **Kultur**: Die Kultur, der der Agent angehört (z.B. 'culture-utopian', 'culture-primitivist'). Kulturen beeinflussen geteilte Überzeugungen.
    *   **Religion**: Die Religion, der der Agent angehört.
    * **Gesundheit & Krankheit**: Der aktuelle Gesundheitszustand und eventuelle Krankheiten.
*   **Genom**: Eine Liste genetischer Marker, die passive Boni verleihen (z.B. schnellere Heilung, höhere Intelligenz).
*   **Diagramme (Überzeugungen, Emotionen, Resonanz)**: Visualisieren die inneren Zustände des Agenten. Überzeugungen sind langfristig, Emotionen sind situativ und kurzlebig, und Resonanz zeigt an, welche Aktionen der Agent in letzter Zeit bevorzugt hat.
*   **Beziehungen & Dispositionen**: Zeigt die Beziehungen des Agenten zu anderen Agenten (z.B. Freund, Rivale) und die langfristig erlernten emotionalen Gefühle (Dispositionen) gegenüber diesen an.
*   **Soziales Gedächtnis**: Protokolliert wichtige vergangene Interaktionen und deren emotionalen Einfluss.
*   **Letzte Aktionen**: Eine Liste der zuletzt durchgeführten Aktionen.
*   **Interagieren**: Das Eingabefeld, um dem Agenten Befehle zu geben. Mit aktiviertem "Lokale KI verwenden"-Schalter können Sie Anweisungen in natürlicher Sprache formulieren (z.B. "sprich mit der nächsten Person"), die von der KI in eine passende Aktion übersetzt werden.

## 4. Überlebens- und Wirtschaftsmechaniken
Zusätzlich zu den sozialen und ideologischen Aspekten müssen Agenten nun auch grundlegende physiologische Bedürfnisse befriedigen, um zu überleben. Dies führt zu neuen Verhaltensweisen und Interaktionen.

### 4.1 Agentenbedürfnisse
Jeder Agent hat drei neue, überlebenswichtige Statuswerte, die auf der Agentenkarte angezeigt werden:
*   **Hunger** (0-100): Steigt mit der Zeit. Ein hoher Wert bedeutet, dass der Agent hungrig ist.
*   **Durst** (0-100): Steigt ebenfalls kontinuierlich. Ein hoher Wert signalisiert Durst.
*   **Müdigkeit** (0-100): Nimmt über den Tag zu. Ein hoher Wert bedeutet, dass der Agent erschöpft ist.

**Konsequenzen:**
*   Wenn der Hunger- oder Durstwert 100 übersteigt, beginnt der Agent, **Gesundheit zu verlieren**. Wird dieser Zustand nicht behoben, kann der Agent an Hunger oder Durst sterben.
*   Die KI der Agenten ist so programmiert, dass sie diese Bedürfnisse **priorisiert**. Ein sehr durstiger Agent wird alles andere ignorieren, um Wasser zu finden. Ein müder Agent wird versuchen, sich auszuruhen.

### 4.2 Ressourcen und Inventar
Um ihre Bedürfnisse zu befriedigen, müssen Agenten Ressourcen sammeln und verwalten.
*   **Ressourcen auf der Karte**: In der Welt existieren Ressourcen-Entitäten wie **Beerensträucher** (Nahrung), **Quellen** (Wasser) oder **Wälder** (Holz). Diese haben eine begrenzte Menge, die beim Sammeln abnimmt.
*   **Inventar**: Jeder Agent hat ein eigenes Inventar, um gesammelte Ressourcen zu lagern. Der Inhalt des Inventars wird auf der Agentenkarte angezeigt.

### 4.3 Neue Aktionen für das Überleben
Um mit dem neuen System zu interagieren, wurden mehrere neue Aktionen eingeführt:
*   **Essen**: Der Agent konsumiert Nahrung aus seinem Inventar, um seinen Hunger zu reduzieren.
*   **Wasser trinken**: Der Agent trinkt aus einer Wasserquelle, um seinen Durst zu stillen.
*   **Nahrung sammeln**: Der Agent sammelt Nahrung von einer Nahrungsquelle (z.B. Beerenstrauch) und legt sie in sein Inventar.
*   **Holz sammeln**: Der Agent sammelt Holz von einer Holzquelle (z.B. Wald).
*   **Unterkunft bauen**: Der Agent verwendet Holz aus seinem Inventar, um eine einfache Unterkunft zu bauen. Dies kann in zukünftigen Updates Schutz- oder Ruheboni bieten.
*   **Ausruhen/Schlafen**: Die bereits vorhandene `Rest`-Aktion wurde erweitert und reduziert nun effektiv die Müdigkeit des Agenten.

Diese neuen Mechaniken schaffen eine Grundlage für emergenten Handel, Konflikte um knappe Ressourcen und die Bildung von Siedlungen in der Nähe von wertvollen Rohstoffvorkommen.
