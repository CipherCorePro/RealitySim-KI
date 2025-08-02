# Benutzerhandbuch für RealitySim KI
Willkommen beim Benutzerhandbuch für RealitySim KI, einer interaktiven webbasierten Simulationsumgebung. Diese Anwendung ermöglicht es Ihnen, eine dynamische Welt zu beobachten und zu steuern, in der KI-Agenten mit einzigartigen Überzeugungen, komplexen psychologischen Profilen und Erinnerungen miteinander und mit ihrer Umgebung interagieren. Sie können Agenten über natürliche Sprache steuern, Simulationsschritte ausführen und das emergente kognitive und soziale Verhalten des Systems visualisieren. Tauchen Sie ein in eine lebendige Welt, die sich mit jedem Schritt weiterentwickelt.

## 1. Erste Schritte
Bevor Sie in die Details der Simulation eintauchen, lernen Sie hier die grundlegenden Bedienelemente kennen:

*   **Einstellungen** (Knopf mit Zahnrad-Symbol): **WICHTIG:** Bevor Sie KI-Funktionen nutzen können, müssen Sie hier den API-Endpunkt und den Modellnamen Ihres lokalen LM Studio Servers eintragen.
*   **Welt generieren** (Knopf mit Globus-Symbol): Klicken Sie hier, um ein Dialogfenster zu öffnen, in dem Sie die Anzahl der zu generierenden Agenten und Entitäten festlegen können. Nach der Bestätigung erstellt die KI eine völlig neue Welt nach Ihren Vorgaben.
*   **Schritt** (Knopf mit Play-Symbol): Führt die Simulation um einen einzelnen Zeitschritt voran. Agenten treffen Entscheidungen, interagieren und die Umgebung entwickelt sich weiter.
*   **Laufen** (Knopf mit Fast-Forward-Symbol): Ermöglicht es Ihnen, die Simulation um eine vordefinierte Anzahl von Schritten (standardmäßig 10) automatisch ablaufen zu lassen. Die Anzahl der Schritte kann im Eingabefeld daneben angepasst werden.
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

### 1.2 Die Rolle der KI
Alle intelligenten Funktionen in RealitySim KI werden durch das von Ihnen in den Einstellungen konfigurierte lokale KI-Modell (via LM Studio) gesteuert. Dies umfasst:

*   **Weltgenerierung**: Die Erstellung neuer, komplexer Welten mit psychologisch differenzierten Agenten.
*   **Interaktive Prompts**: Die Interpretation Ihrer Anweisungen an die Agenten, wenn der KI-Schalter aktiviert ist.

Es findet **keine** Kommunikation mit externen KI-Diensten statt. Die gesamte KI-Verarbeitung erfolgt lokal auf Ihrem Rechner über LM Studio.

## 2. Die Benutzeroberfläche (GUI)
Die RealitySim KI-Anwendung ist in mehrere Bereiche unterteilt:

*   **Kopfzeile**: Kontrollpanel, Einstellungen, Sprachwechsler.
*   **Linke Seitenleiste**: Listen der Agenten und Entitäten.
*   **Mittlerer Bereich**: Detailansicht für den ausgewählten Agenten (Agentenkarte) und die Weltkarte.
*   **Rechte Seitenleiste**: Globale Informationen wie Umgebung, Aktionen, Erstellungstools, Ereignisprotokoll und das Admin-Panel.

## 3. Kernkonzepte der Simulation
Die Simulation wurde um tiefgreifende Wirtschafts-, Politik- und Technologiesysteme erweitert.

### 3.1 Erweiterte Wirtschaftsmodelle
Die Ökonomie geht nun über das einfache Sammeln von Ressourcen hinaus.

*   **Währung**: Agenten besitzen nun eine Währung ("Simoleons", symbolisiert durch '$'), die auf der Agentenkarte angezeigt wird. Sie können Geld durch die Aktion "Für Geld arbeiten" verdienen.
*   **Märkte und Handel**: In der Welt existiert ein zentraler **Marktplatz**. Agenten müssen sich in dessen Nähe begeben, um zu handeln.
    *   **Gegenstand auf Markt anbieten**: Agenten können Gegenstände aus ihrem Inventar auf dem Marktplatz zum Verkauf anbieten. Der Preis wird dabei simpel kalkuliert.
    *   **Vom Markt kaufen**: Agenten können Angebote anderer einsehen und Gegenstände kaufen, sofern sie über genügend Währung verfügen.
*   **Komplexere Produktionsketten**: Die Simulation umfasst nun **Crafting**. Agenten können Rohstoffe wie Holz und Eisen (eine neue Ressource) kombinieren, um neue Gegenstände herzustellen (z.B. ein Schwert oder einen Pflug). Dies erfordert:
    *   **Rezepte**: Die Kenntnis des richtigen Rezepts.
    *   **Fähigkeiten**: Einen ausreichend hohen "Crafting"-Skill.
    *   **Technologie**: Einige fortgeschrittene Rezepte sind erst nach Erforschung der entsprechenden Technologie verfügbar.

### 3.2 Politische Systeme und Governance
Die Gesellschaft der Agenten organisiert sich nun politisch.

*   **Regierungsform**: Die Welt wird durch eine Regierung gesteuert, standardmäßig eine **Demokratie**.
*   **Anführer und Wahlen**: In regelmäßigen Abständen (alle 100 Schritte) finden Wahlen statt.
    *   **Kandidatur**: Agenten mit hohem Sozialstatus können für das Amt des Anführers kandidieren.
    *   **Wahl**: Agenten stimmen für den Kandidaten, zu dem sie die beste Beziehung haben.
    *   **Anführer**: Der Gewinner der Wahl wird zum Anführer und sein Name wird im Admin-Panel angezeigt.
*   **Gesetze und Strafen**: Der Anführer kann Gesetze erlassen.
    *   **Gesetzesbruch**: Wenn ein Agent eine Aktion ausführt, die durch ein Gesetz verboten ist (z.B. "Stehlen"), wird er bestraft.
    *   **Strafen**: Die Standardstrafe ist eine Geldstrafe, die vom Konto des Agenten abgebucht und dem Anführer gutgeschrieben wird.
    *   **Verhalten**: Agenten mit hoher Gewissenhaftigkeit neigen dazu, Gesetze zu befolgen.

### 3.3 Technologische Entwicklung
Kulturen können nun kollektiv Wissen anhäufen und Technologien erforschen.

*   **Forschungspunkte**: Wissenschaftler können die Aktion "Forschen" ausführen, um Forschungspunkte für ihre Kultur zu generieren.
*   **Technologiebaum**: Es gibt einen vordefinierten Technologiebaum. Wenn eine Kultur genügend Forschungspunkte gesammelt hat und die Voraussetzungen erfüllt, schaltet sie eine neue Technologie frei.
*   **Effekte**: Technologien können die Effizienz von Aktionen verbessern (z.B. "Landwirtschaft" verbessert die Nahrungssuche), neue Aktionen freischalten ("Metallurgie" schaltet "Eisen abbauen" frei) oder neue Crafting-Rezepte verfügbar machen.
*   **Kollektives Lernen**: Wissenschaftler können die Aktion "Wissen teilen" ausführen, wenn sie sich treffen, um den Forschungsprozess ihrer Kultur zu beschleunigen.

### 3.4 Agenten verstehen
Jeder Agent ist eine komplexe Entität. Die Agentenkarte bietet Ihnen einen tiefen Einblick in seine innere Welt.

*   **Psychologisches Profil**: Das Verhalten wird durch die "Big Five"-Persönlichkeit, Ziele, Stress und Traumata bestimmt. Ein Agent mit hohem Neurotizismus reagiert empfindlicher auf Stress, während ein gewissenhafter Agent eher produktive oder legale Aktionen wählt.
*   **Fähigkeiten und Lernen**: Agenten verbessern ihre Fähigkeiten (z.B. Handeln, Craften, Forschen) durch die Ausführung entsprechender Aktionen.
*   **Überlebensmechaniken**: Agenten müssen ihre Bedürfnisse (Hunger, Durst, Müdigkeit) befriedigen, um gesund zu bleiben.

## 4. Admin-Kontrollzentrum
Wenn der spezielle 'Admin'-Agent ausgewählt ist, erscheint das Admin-Panel, das erweiterte Steuerungs- und Manipulationsmöglichkeiten bietet:

*   **Umgebung überschreiben**: Ändern Sie globale Variablen wie die Zeit oder das Wetter.
*   **Weltregel-Editor**: Erstellen oder löschen Sie Aktionen direkt in der Simulation.
*   **Agentenverwaltung**:
    *   Passen Sie die Gesundheit, Position und Währung jedes Agenten an.
    *   Verursachen oder heilen Sie Krankheiten.
    *   Beleben Sie verstorbene Agenten wieder.
*   **Politik- und Tech-Management (Neu)**:
    *   Starten Sie manuell eine Wahl.
    *   Ernennen Sie einen Anführer direkt.
    *   Fügen Sie neue Gesetze hinzu oder entfernen Sie bestehende.
    *   Schalten Sie Technologien für Kulturen frei.

## 5. Genetik und Fortpflanzung
### 1. Das Genom der Agenten
Jeder KI-Agent in RealitySim KI verfügt über ein "Genom", das als eine Liste von genetischen Markern (string[]) repräsentiert wird. Diese Gene sind nicht nur passive Beschreibungen, sondern verleihen den Agenten "passive Boni" oder beeinflussen spezifische Verhaltensweisen und Fähigkeiten innerhalb der Simulation.
Zu den verfügbaren Genen gehören:
• G-RESISTANT: Reduziert den Gesundheitsverlust durch Krankheiten (halbiert ihn von 5 HP auf 2 HP pro Schritt) und erhöht die Heilungschance beim Ausruhen um 15%.
• G-AGILE: Ermöglicht dem Agenten, sich schneller zu bewegen (Schrittgröße 2 statt 1).
• G-SOCIAL: Erhöht die Wahrscheinlichkeit, dass der Agent eine Konversation initiiert (40% statt 10%).
• G-LONGEVITY: Halbiert den Gesundheitsverlust durch Altersschwäche ab einem Alter von 80 Jahren.
• G-FASTHEAL: Ermöglicht eine schnellere Gesundheitserholung beim Ausruhen (10 HP statt 5 HP).
• G-INTELLIGENT: (Die genaue Auswirkung wird in den Quellen nicht detailliert beschrieben, aber es ist als Gen aufgeführt, das die "Intelligenz" steigern kann).
• G-FERTILE: Erhöht die Fortpflanzungschancen des Agenten um einen Faktor von 1,5.
Benutzer können beim manuellen Erstellen neuer Agenten eine kommaseparierte Liste dieser Gene angeben oder zufällige Gene generieren lassen.

### 2. Vererbung von Genen bei der Fortpflanzung
Wenn Agenten in RealitySim KI sich fortpflanzen und ein Kind bekommen, erbt das neugeborene Kind Gene von beiden Elternteilen. Dieser Prozess beinhaltet eine Kombination und eine geringe Mutationsrate, um genetische Vielfalt zu gewährleisten.
Der Vererbungsprozess funktioniert wie folgt:
1. Kombination einzigartiger Gene: Zuerst werden alle einzigartigen Gene beider Elternteile gesammelt. Duplikate werden entfernt, sodass eine kombinierte Liste aller Gene entsteht, die bei den Eltern vorhanden sind.
2. Vererbung der Hälfte: Das Kind erbt dann ungefähr die Hälfte dieser kombinierten, einzigartigen Gene. Die Auswahl erfolgt dabei zufällig.
3. Mutation: Anschließend wird eine geringe Mutationsrate von 5% (MUTATION_RATE = 0.05) auf jedes geerbte Gen angewendet. Wenn ein Gen mutiert, wird es durch ein zufällig ausgewähltes Gen aus der gesamten Liste der verfügbaren Gene (GENOME_OPTIONS) ersetzt.
4. Einzigartigkeit nach Mutation: Nach der Mutation wird sichergestellt, dass das Genom des Kindes keine doppelten Gene enthält.
Das neugeborene Kind startet mit einem Alter von 0 Jahren in der Rolle "Worker" und erbt die Religion des ersten Elternteils. Die Gene, die es geerbt hat, sind von Beginn an aktiv und beeinflussen seine Entwicklung und sein Verhalten im weiteren Verlauf der Simulation.

### 3. Fortpflanzung als Mechanismus der Genweitergabe
Die Möglichkeit der Agenten, Kinder zu bekommen, ist der zentrale Mechanismus für die genetische Vererbung. Agenten können die Aktion "Fortpflanzen" ausführen, sofern bestimmte Voraussetzungen erfüllt sind:
• Sie müssen sich im fortpflanzungsfähigen Alter befinden (standardmäßig zwischen 20 und 50 Jahren).
• Sie benötigen einen "Partner" oder "Ehepartner" in Reichweite.
• Sie dürfen die maximale Anzahl an Nachkommen pro Agent (MAX_OFFSPRING = 2) nicht überschritten haben.
Diese umfassende Modellierung von Genen und ihrer Vererbung trägt zur Komplexität und zum emergenten Verhalten der Agenten in RealitySim KI bei, indem sie langfristige, generationenübergreifende Einflüsse auf die Population ermöglicht.

Sie können das spezifische Genom eines Agenten und die damit verbundenen Fähigkeiten direkt auf seiner **Agentenkarte** einsehen. Unter der Überschrift **"Genom & Merkmale"** finden Sie eine Auflistung aller Gene. Wenn Sie mit der Maus über ein Gen fahren, wird eine genaue Beschreibung seiner Auswirkungen in der Simulation angezeigt.