# Benutzerhandbuch für RealitySim KI

_Willkommen beim Benutzerhandbuch für RealitySim KI, einer interaktiven webbasierten Simulationsumgebung. Diese Anwendung ermöglicht es Ihnen, eine dynamische Welt zu beobachten und zu steuern, in der KI-Agenten mit einzigartigen Überzeugungen, komplexen psychologischen Profilen und Erinnerungen miteinander und mit ihrer Umgebung interagieren. Sie können Agenten über natürliche Sprache steuern, Simulationsschritte ausführen und das emergente kognitive und soziale Verhalten des Systems visualisieren. Tauchen Sie ein in eine lebendige Welt, die sich mit jedem Schritt weiterentwickelt._

## 1. Erste Schritte

Bevor Sie in die Details der Simulation eintauchen, lernen Sie hier die grundlegenden Bedienelemente kennen:

*   **Einstellungen** (Knopf mit Zahnrad-Symbol): **WICHTIG:** Bevor Sie KI-Funktionen nutzen können, müssen Sie hier den API-Endpunkt und den Modellnamen Ihres lokalen LM Studio Servers eintragen.
*   **Welt generieren** (Knopf mit Globus-Symbol): Klicken Sie hier, um ein Dialogfenster zu öffnen, in dem Sie die Anzahl der zu generierenden Agenten und Entitäten festlegen können. Nach der Bestätigung erstellt die KI eine völlig neue Welt nach Ihren Vorgaben.
*   **Schritt** (Knopf mit Play-Symbol): Führt die Simulation um einen einzelnen Zeitschritt voran. Agenten treffen Entscheidungen, interagieren und die Umgebung entwickelt sich weiter.
*   **Start** (Knopf mit Fast-Forward-Symbol): Ermöglicht es Ihnen, die Simulation um eine vordefinierte Anzahl von Schritten (standardmäßig 10) automatisch ablaufen zu lassen. Die Anzahl der Schritte kann im Eingabefeld daneben angepasst werden.
*   **Reset** (Knopf mit Zurück-Pfeil-Symbol): Setzt die gesamte Simulation auf ihren ursprünglichen Startzustand zurück. Alle Änderungen und Fortschritte gehen dabei verloren.
*   **Sprache wechseln** (Knopf mit Sprachkürzel wie 'DE' oder 'EN'): Klicken Sie hier, um die Benutzeroberfläche zwischen Deutsch und Englisch umzuschalten.
*   **Mit KI hinzufügen** (Knopf mit Plus-Symbol): Öffnet ein Dialogfenster, um zusätzliche Agenten oder Entitäten mit Hilfe der KI zu generieren und zur bestehenden Welt hinzuzufügen.

### 1.1. Konfiguration des lokalen KI-Modells
Diese Anwendung verwendet ein KI-Modell, das lokal über LM Studio ausgeführt wird. Sie müssen die Anwendung so konfigurieren, dass sie sich mit Ihrem LM Studio Server verbinden kann.

1.  **Starten Sie LM Studio:** Stellen Sie sicher, dass LM Studio auf Ihrem Computer läuft und Sie ein Modell geladen haben.
2.  **Starten Sie den lokalen Server:** Gehen Sie in LM Studio zum Tab **Local Server** (Symbol: `<->`) und klicken Sie auf **Start Server**.
3.  **Finden Sie die Konfigurationsdetails:**
    *   **Server-URL:** LM Studio zeigt oben eine erreichbare Adresse an (z.B. `http://localhost:1234`). Sie benötigen nur diesen Basisteil der URL.
    *   **Modell-Identifier:** In der rechten Seitenleiste unter "API Usage" finden Sie den "API Identifier" des Modells (z.B. `google/gemma-2b-it`). Dies ist **nicht** der Dateiname der `.gguf`-Datei.
4.  **Konfigurieren Sie RealitySim KI:**
    *   Klicken Sie in der Kopfzeile der Anwendung auf das Zahnrad-Symbol, um die Einstellungen zu öffnen.
    *   Wählen Sie 'LM Studio' als KI-Anbieter.
    *   Fügen Sie die **Basis-URL** (z.B. `http://localhost:1234`) in das Feld "LM Studio API-Endpunkt" ein. Fügen Sie **nicht** den Pfad `/v1/chat/completions` hinzu.
    *   Fügen Sie den **API Identifier** des Modells (z.B. `google/gemma-2b-it`) in das Feld "Modellname" ein.
    *   Klicken Sie auf "Speichern".

### 1.2 Die Rolle der KI
Alle intelligenten Funktionen in RealitySim KI werden durch das von Ihnen in den Einstellungen konfigurierte lokale KI-Modell (via LM Studio) gesteuert. Dies umfasst:

*   **Weltgenerierung**: Die Erstellung neuer, komplexer Welten mit psychologisch differenzierten Agenten.
*   **Interaktive Prompts**: Die Interpretation Ihrer Anweisungen an die Agenten, wenn der KI-Schalter aktiviert ist.
*   **Psychologische Analyse**: Die Erstellung detaillierter psychologischer Profile von Agenten.

Es findet **keine** Kommunikation mit externen KI-Diensten statt. Die gesamte KI-Verarbeitung erfolgt lokal auf Ihrem Rechner über LM Studio.

## 2. Die Benutzeroberfläche (GUI) im Überblick

Die RealitySim KI-Anwendung ist in mehrere Bereiche unterteilt:

*   **Kopfzeile**: Enthält das Kontrollpanel für die Simulation (Schritt, Start, Reset, Welt generieren, Mit KI hinzufügen), die Einstellungen und den Sprachwechsler.
*   **Linke Seitenleiste**: Zeigt Listen aller **Agenten** und **Entitäten** in der Simulation. Sie können hier Agenten auswählen, um deren Details anzuzeigen, oder Agenten/Entitäten löschen.
*   **Mittlerer Bereich**: Dieser Bereich ist dynamisch:
    *   **Agentenkarte**: Wenn ein Agent aus der linken Seitenleiste ausgewählt ist, wird hier seine detaillierte Karte angezeigt. Diese Karte bietet Einblicke in seine Persönlichkeit, Bedürfnisse, Beziehungen, Inventar, Ziele und mehr.
    *   **Weltkarte**: Unter der Agentenkarte befindet sich die grafische Darstellung der Welt, auf der Agenten und Entitäten als Symbole auf einem Raster angezeigt werden. Beziehungen zwischen Agenten werden durch Linien dargestellt.
*   **Rechte Seitenleiste**: Enthält globale Informationen und Steuerungselemente:
    *   **Umgebung**: Zeigt den aktuellen Zustand der Welt an, z.B. die Zeit und den Status der Wahlen.
    *   **Verfügbare Aktionen**: Eine Liste aller Aktionen, die Agenten in der Simulation ausführen können.
    *   **Neu erstellen**: Ein Panel zum manuellen Erstellen neuer Agenten, Entitäten oder Aktionen.
    *   **Ereignisprotokoll**: Zeigt eine chronologische Liste aller wichtigen Ereignisse und Aktionen in der Simulation an.
    *   **Zustand speichern & laden**: Ermöglicht das Speichern und Laden des gesamten Simulationszustands oder einzelner Komponenten.
    *   **Admin-Kontrollpanel**: Dieses Panel erscheint nur, wenn der spezielle 'Admin'-Agent ausgewählt ist, und bietet erweiterte Manipulationsmöglichkeiten für die Simulation.

## 3. Kernfunktionen und Workflows

RealitySim KI bietet eine Vielzahl von Funktionen, die das Verhalten der Agenten und die Entwicklung der Welt steuern. Hier sind die wichtigsten Workflows und Konzepte:

### 3.1. Simulation steuern

*   **Einen Schritt ausführen**: Klicken Sie auf den Button 'Schritt' (Play-Symbol) in der Kopfzeile, um die Simulation um einen einzelnen Zeitschritt voranzutreiben. Alle Agenten wählen und führen eine Aktion aus.
*   **Mehrere Schritte ausführen**: Geben Sie die gewünschte Anzahl von Schritten in das Eingabefeld neben dem 'Start'-Button ein und klicken Sie dann auf 'Start' (Fast-Forward-Symbol). Die Simulation läuft automatisch für die angegebene Anzahl von Schritten.
*   **Simulation zurücksetzen**: Klicken Sie auf den 'Reset'-Button (Zurück-Pfeil-Symbol), um die Welt auf ihren ursprünglichen Zustand zurückzusetzen. Dies löscht alle Fortschritte und generierten Inhalte.

### 3.2. Agenten verstehen und interagieren

1.  **Agenten auswählen**: Klicken Sie in der linken Seitenleiste auf den Namen eines Agenten, um dessen **Agentenkarte** im mittleren Bereich anzuzeigen.
2.  **Agentenkarte lesen**: Die Agentenkarte bietet umfassende Informationen:
    *   **Name und Beschreibung**: Grundlegende Informationen über den Agenten.
    *   **Position**: Aktuelle Koordinaten des Agenten auf der Weltkarte.
    *   **Währung**: Der aktuelle Geldbestand des Agenten.
    *   **Sozialstatus**: Ein Maß für den Einfluss und die Stellung des Agenten in der Gesellschaft.
    *   **Lebensphase, Rolle, Kultur, Religion**: Zugehörigkeiten und Entwicklungsstufen.
    *   **Status & Bedürfnisse**: Gesundheitsbalken, Stresslevel, Hunger, Durst und Müdigkeit. Achten Sie auf rote Balken, die auf dringende Bedürfnisse hinweisen.
    *   **Persönlichkeit**: Die 'Big Five'-Persönlichkeitsmerkmale (Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus) als Balkendiagramm.
    *   **Fähigkeiten**: Die verschiedenen Fähigkeiten des Agenten (z.B. Heilung, Holzfällen, Rhetorik) und deren Level.
    *   **Überzeugungen & Emotionen**: Die inneren Gedanken und Gefühle des Agenten, ebenfalls als Balkendiagramme dargestellt.
    *   **Beziehungen**: Eine Liste der Beziehungen des Agenten zu anderen Agenten, inklusive Beziehungstyp und -stärke.
    *   **Aktive Ziele**: Die aktuellen Ziele, die der Agent verfolgt (z.B. 'Anführer werden', 'Ein Haus bauen').
    *   **Genom & Merkmale**: Die genetischen Eigenschaften des Agenten und ihre Auswirkungen auf sein Verhalten und seine Fähigkeiten.
    *   **Inventar**: Eine Liste der Gegenstände, die der Agent besitzt.
3.  **Mit Agenten interagieren (Befehle geben)**:
    *   Wählen Sie einen Agenten aus.
    *   Im Abschnitt 'Interagieren' auf der Agentenkarte finden Sie ein Eingabefeld.
    *   **KI benutzen (Standard)**: Der Schalter 'KI benutzen' ist standardmäßig aktiviert. Geben Sie hier einen Befehl in natürlicher Sprache ein (z.B. 'Geh nach Norden' oder 'Finde etwas zu essen'). Die KI interpretiert Ihren Befehl und wählt die passendste Aktion aus den verfügbaren Aktionen.
    *   **Direkte Aktion (KI deaktiviert)**: Deaktivieren Sie den Schalter 'KI benutzen'. Geben Sie nun den **exakten Namen** einer verfügbaren Aktion (z.B. 'Move North', 'Gather Food') in das Eingabefeld ein. Der Agent versucht dann, genau diese Aktion auszuführen.
    *   Klicken Sie auf den 'Senden'-Button (Pfeil-Symbol), um den Befehl auszuführen. Die Ergebnisse werden im Ereignisprotokoll angezeigt.

### 3.3. Welt generieren und Inhalte hinzufügen

*   **Neue Welt generieren**: Klicken Sie in der Kopfzeile auf 'Welt generieren' (Globus-Symbol).
    *   Geben Sie die gewünschte Anzahl von Agenten und Entitäten (Nahrungs-, Wasser-, Holz-, Eisenquellen, Gebäude) ein.
    *   Bestätigen Sie mit 'Generieren'. Die KI erstellt eine komplett neue Welt mit den angegebenen Parametern.
*   **Inhalte mit KI hinzufügen**: Klicken Sie in der Kopfzeile auf 'Mit KI hinzufügen' (Plus-Symbol).
    *   Sie können hier wählen, ob Sie zusätzliche Agenten oder Entitäten generieren möchten.
    *   Geben Sie die gewünschte Anzahl für Agenten oder die spezifischen Mengen für verschiedene Entitätstypen ein.
    *   Klicken Sie auf 'Agenten generieren' oder 'Entitäten generieren'. Die KI fügt die neuen Elemente zur bestehenden Welt hinzu.

### 3.4. Objekte manuell erstellen

1.  In der rechten Seitenleiste finden Sie das Panel 'Neu erstellen'.
2.  Wählen Sie den Typ des Objekts, das Sie erstellen möchten: 'Agent', 'Entität' oder 'Aktion'.
3.  Geben Sie die erforderlichen Details wie Name und Beschreibung ein.
    *   Für Agenten können Sie zusätzlich Überzeugungen (im JSON-Format), Gene, eine Rolle und Persönlichkeitsmerkmale festlegen oder zufällig generieren lassen.
    *   Für Aktionen können Sie einen optionalen 'Belief-Schlüssel' hinzufügen.
4.  Klicken Sie auf 'Erstellen', um das Objekt zur Simulation hinzuzufügen.

### 3.5. Zustand speichern und laden

1.  In der rechten Seitenleiste finden Sie das Panel 'Zustand speichern & laden'.
2.  **Ganzen Zustand speichern**: Klicken Sie auf diesen Button, um den gesamten aktuellen Zustand der Simulation (Agenten, Entitäten, Umgebung, Aktionen, Kulturen, Religionen) als JSON-Datei herunterzuladen.
3.  **Ganzen Zustand laden**: Klicken Sie auf diesen Button, um eine zuvor gespeicherte JSON-Datei auszuwählen und den Simulationszustand zu laden. Dies überschreibt den aktuellen Zustand.
4.  **Erweiterte Exportoptionen**: Klappen Sie diesen Bereich auf, um nur spezifische Teile des Zustands (Umgebung, Agenten oder Entitäten) zu exportieren.

## 4. Detaillierte Funktionsbeschreibung

Die Simulation wurde um tiefgreifende Wirtschafts-, Politik- und Technologiesysteme erweitert.

### 4.1 Erweiterte Wirtschaftsmodelle
Die Ökonomie geht nun über das einfache Sammeln von Ressourcen hinaus.

*   **Währung**: Agenten besitzen nun eine Währung ("Simoleons", symbolisiert durch '$'), die auf der Agentenkarte angezeigt wird. Sie können Geld durch die Aktion "Für Geld arbeiten" verdienen.
*   **Märkte und Handel**: In der Welt existiert ein zentraler **Marktplatz**. Agenten müssen sich in dessen Nähe begeben, um zu handeln.
    *   **Gegenstand auf Markt anbieten**: Agenten können Gegenstände aus ihrem Inventar auf dem Marktplatz zum Verkauf anbieten. Der Preis wird dabei simpel kalkuliert.
    *   **Vom Markt kaufen**: Agenten können Angebote anderer einsehen und Gegenstände kaufen, sofern sie über genügend Währung verfügen.
*   **Komplexere Produktionsketten**: Die Simulation umfasst nun **Crafting**. Agenten können Rohstoffe wie Holz und Eisen (eine neue Ressource) kombinieren, um neue Gegenstände herzustellen (z.B. ein Schwert oder einen Pflug). Dies erfordert:
    *   **Rezepte**: Die Kenntnis des richtigen Rezepts.
    *   **Fähigkeiten**: Einen ausreichend hohen "Handwerk"-Skill.
    *   **Technologie**: Einige fortgeschrittene Rezepte sind erst nach Erforschung der entsprechenden Technologie verfügbar.

### 4.2 Politische Systeme und Governance
Die Gesellschaft der Agenten organisiert sich nun politisch.

*   **Regierungsform**: Die Welt wird durch eine Regierung gesteuert, standardmäßig eine **Demokratie**.
*   **Anführer und Wahlen**: In regelmäßigen Abständen (alle 100 Schritte) finden Wahlen statt.
    *   **Kandidatur**: Agenten mit hohem Sozialstatus können für das Amt des Anführers kandidieren (Aktion: 'Run for Election').
    *   **Wahl**: Agenten stimmen für den Kandidaten, zu dem sie die beste Beziehung haben (Aktion: 'Vote').
    *   **Anführer**: Der Gewinner der Wahl wird zum Anführer und sein Name wird im Admin-Panel angezeigt.
*   **Gesetze und Strafen**: Der Anführer kann Gesetze erlassen (Aktion: 'Enact Law').
    *   **Gesetzesbruch**: Wenn ein Agent eine Aktion ausführt, die durch ein Gesetz verboten ist (z.B. "Stehlen"), wird er bestraft.
    *   **Strafen**: Die Standardstrafe ist eine Geldstrafe, die vom Konto des Agenten abgebucht und dem Anführer gutgeschrieben wird, oder eine Inhaftierung im Gefängnis.
    *   **Verhalten**: Agenten mit hoher Gewissenhaftigkeit neigen dazu, Gesetze zu befolgen.

### 4.3 Technologische Entwicklung
Kulturen können nun kollektiv Wissen anhäufen und Technologien erforschen.

*   **Forschungspunkte**: Wissenschaftler können die Aktion "Forschen" ausführen, um Forschungspunkte für ihre Kultur zu generieren.
*   **Technologiebaum**: Es gibt einen vordefinierten Technologiebaum. Wenn eine Kultur genügend Forschungspunkte gesammelt hat und die Voraussetzungen erfüllt, schaltet sie eine neue Technologie frei.
*   **Effekte**: Technologien können die Effizienz von Aktionen verbessern (z.B. "Landwirtschaft" verbessert die Nahrungssuche), neue Aktionen freischalten ("Metallurgie" schaltet "Eisen abbauen" frei) oder neue Crafting-Rezepte verfügbar machen.
*   **Kollektives Lernen**: Wissenschaftler können die Aktion "Wissen teilen" ausführen, wenn sie sich treffen, um den Forschungsprozess ihrer Kultur zu beschleunigen.

### 4.4 Agenten verstehen
Jeder Agent ist eine komplexe Entität. Die Agentenkarte bietet Ihnen einen tiefen Einblick in seine innere Welt.

*   **Psychologisches Profil**: Das Verhalten wird durch die "Big Five"-Persönlichkeit, Ziele, Stress und Traumata bestimmt. Ein Agent mit hohem Neurotizismus reagiert empfindlicher auf Stress, während ein gewissenhafter Agent eher produktive oder legale Aktionen wählt.
*   **Fähigkeiten und Lernen**: Agenten verbessern ihre Fähigkeiten (z.B. Handeln, Craften, Forschen) durch die Ausführung entsprechender Aktionen.
*   **Überlebensmechaniken**: Agenten müssen ihre Bedürfnisse (Hunger, Durst, Müdigkeit) befriedigen, um gesund zu bleiben.

### 4.5 Tiefenpsychologisches Profil
Um ein noch tieferes Verständnis für die Agenten zu ermöglichen, können Sie ein KI-generiertes psychologisches Profil anfordern.

*   **Profil anzeigen**: Klicken Sie auf das Gehirn-Symbol (🧠) in der oberen rechten Ecke der Agentenkarte.
*   **Analyse**: Die KI analysiert daraufhin alle verfügbaren Daten des Agenten – von seiner Persönlichkeit über seine letzten Handlungen bis hin zu seinen Beziehungen – und erstellt einen detaillierten Bericht.
*   **Inhalt des Berichts**: Der Bericht enthält Einblicke in:
    *   **Psychodynamik**: Unbewusste Motive und innere Konflikte.
    *   **Persönlichkeitsbild**: Eine Beschreibung der Charakterzüge.
    *   **Beziehungsdynamik**: Typische Verhaltensmuster in Beziehungen.
    *   **Mögliche Belastungen**: Hinweise auf Ängste, Traumata oder Stressfaktoren.
    *   **Kulturelle Prägung**: Wie Kultur und Religion das Innenleben beeinflussen.
    *   **Therapeutische Empfehlung**: Ein Vorschlag, was dem Agenten helfen könnte, sein seelisches Gleichgewicht wiederzufinden.

#### Automatische Integration der Analyse
Die Ergebnisse der Psychoanalyse werden **sofort und automatisch** dazu genutzt, das Verhalten und die Ziele des Agenten anzupassen. Die Analyse wird zur Triebfeder für die Weiterentwicklung des Agenten:

1.  **Dynamische Zielerzeugung**: Die KI liest die "Therapeutische Empfehlung" und wandelt sie in ein konkretes, neues Ziel für den Agenten um. Wenn die Empfehlung beispielsweise lautet, dass ein Agent ein Mentor sein sollte, erhält dieser Agent automatisch das neue Ziel "Einen jungen Agenten unterrichten" und wird proaktiv versuchen, dieses Ziel zu verfolgen.

2.  **Unbewusste Einflüsse**: Der Analysebericht identifiziert auch latente psychologische Zustände (z.B. "unterdrückte Melancholie", "versteckte Aggression"). Diese werden als "unbewusste Modifikatoren" im Zustand des Agenten gespeichert und beeinflussen subtil seine Aktionswahl. Ein Agent mit "unterdrückter Melancholie" könnte beispielsweise soziale Interaktionen meiden, selbst wenn es seinem aktuellen Ziel widerspricht.

Dieses Werkzeug macht die Psychoanalyse zu einem aktiven Mechanismus, der es den Agenten ermöglicht, sich selbst zu analysieren und sich auf Basis dieser Analyse weiterzuentwickeln.

### 4.6 Genetik und Fortpflanzung

#### 4.6.1. Das Genom der Agenten
Jeder KI-Agent in RealitySim KI verfügt über ein "Genom", das als eine Liste von genetischen Markern repräsentiert wird. Diese Gene sind nicht nur passive Beschreibungen, sondern verleihen den Agenten "passive Boni" oder beeinflussen spezifische Verhaltensweisen und Fähigkeiten innerhalb der Simulation.

Zu den verfügbaren Genen gehören:
*   **G-RESISTANT**: Reduziert den Gesundheitsverlust durch Krankheiten (halbiert ihn von 5 HP auf 2 HP pro Schritt) und erhöht die Heilungschance beim Ausruhen um 15%.
*   **G-AGILE**: Ermöglicht dem Agenten, sich schneller zu bewegen (Schrittgröße 2 statt 1).
*   **G-SOCIAL**: Erhöht die Wahrscheinlichkeit, dass der Agent eine Konversation initiiert (40% statt 10%).
*   **G-LONGEVITY**: Halbiert den Gesundheitsverlust durch Altersschwäche ab einem Alter von 80 Jahren.
*   **G-FASTHEAL**: Ermöglicht eine schnellere Gesundheitserholung beim Ausruhen (10 HP statt 5 HP).
*   **G-INTELLIGENT**: Lernt Fähigkeiten und sammelt Forschungspunkte schneller.
*   **G-FERTILE**: Erhöhte Chance auf erfolgreiche Fortpflanzung.

Benutzer können beim manuellen Erstellen neuer Agenten eine kommaseparierte Liste dieser Gene angeben oder zufällige Gene generieren lassen.

#### 4.6.2. Vererbung von Genen bei der Fortpflanzung
Wenn Agenten in RealitySim KI sich fortpflanzen und ein Kind bekommen, erbt das neugeborene Kind Gene von beiden Elternteilen. Dieser Prozess beinhaltet eine Kombination und eine geringe Mutationsrate, um genetische Vielfalt zu gewährleisten.

Der Vererbungsprozess funktioniert wie folgt:
1.  **Kombination einzigartiger Gene**: Zuerst werden alle einzigartigen Gene beider Elternteile gesammelt. Duplikate werden entfernt, sodass eine kombinierte Liste aller Gene entsteht, die bei den Eltern vorhanden sind.
2.  **Vererbung der Hälfte**: Das Kind erbt dann ungefähr die Hälfte dieser kombinierten, einzigartigen Gene. Die Auswahl erfolgt dabei zufällig.
3.  **Mutation**: Anschließend wird eine geringe Mutationsrate von 5% (MUTATION_RATE = 0.05) auf jedes geerbte Gen angewendet. Wenn ein Gen mutiert, wird es durch ein zufällig ausgewähltes Gen aus der gesamten Liste der verfügbaren Gene (GENOME_OPTIONS) ersetzt.
4.  **Einzigartigkeit nach Mutation**: Nach der Mutation wird sichergestellt, dass das Genom des Kindes keine doppelten Gene enthält.

Das neugeborene Kind startet mit einem Alter von 0 Jahren in der Rolle "Arbeiter" und erbt die Religion des ersten Elternteils. Die Gene, die es geerbt hat, sind von Beginn an aktiv und beeinflussen seine Entwicklung und sein Verhalten im weiteren Verlauf der Simulation.

#### 4.6.3. Fortpflanzung als Mechanismus der Genweitergabe
Die Möglichkeit der Agenten, Kinder zu bekommen, ist der zentrale Mechanismus für die genetische Vererbung. Agenten können die Aktion "Reproduce" (Fortpflanzen) ausführen, sofern bestimmte Voraussetzungen erfüllt sind:
*   Sie müssen sich im fortpflanzungsfähigen Alter befinden (standardmäßig zwischen 20 und 50 Jahren).
*   Sie benötigen einen "Partner" oder "Ehepartner" in Reichweite.
*   Sie dürfen die maximale Anzahl an Nachkommen pro Agent (MAX_OFFSPRING = 2) nicht überschritten haben.

Diese umfassende Modellierung von Genen und ihrer Vererbung trägt zur Komplexität und zum emergenten Verhalten der Agenten in RealitySim KI bei, indem sie langfristige, generationenübergreifende Einflüsse auf die Population ermöglicht.

Sie können das spezifische Genom eines Agenten und die damit verbundenen Fähigkeiten direkt auf seiner **Agentenkarte** einsehen. Unter der Überschrift **"Genom & Merkmale"** finden Sie eine Auflistung aller Gene. Wenn Sie mit der Maus über ein Gen fahren, wird eine genaue Beschreibung seiner Auswirkungen in der Simulation angezeigt.

## 5. Admin-Kontrollzentrum

Wenn der spezielle 'Admin'-Agent ausgewählt ist, erscheint das Admin-Panel in der rechten Seitenleiste, das erweiterte Steuerungs- und Manipulationsmöglichkeiten bietet:

*   **Politische Verwaltung**:
    *   **Aktueller Anführer**: Zeigt den Namen des aktuellen Anführers an.
    *   **Wahl starten**: Startet manuell eine neue Wahl für einen Anführer.
    *   **Gesetze**: Zeigt eine Liste der aktuellen Gesetze an. Sie können bestehende Gesetze aufheben (Mülleimer-Symbol).
    *   **Gesetz hinzufügen**: Erstellen Sie neue Gesetze, indem Sie einen Namen und die 'verletzende Aktion' (den Namen der Aktion, die durch das Gesetz verboten wird) eingeben und auf 'Gesetz hinzufügen' klicken.
*   **Technologieverwaltung**:
    *   Zeigt die Forschungspunkte und bekannten Technologien jeder Kultur an.
    *   Ermöglicht das manuelle Freischalten von Technologien für bestimmte Kulturen.
*   **Agentenverwaltung**:
    *   Für jeden Agenten (außer dem Admin-Agenten selbst) können Sie:
        *   **Währung**: Den Geldbetrag des Agenten anpassen.
        *   **Gesundheit**: Die Gesundheit des Agenten anpassen.
        *   **Krankheit**: Eine Krankheit hinzufügen oder entfernen.
        *   **Position**: Die X- und Y-Koordinaten des Agenten ändern.
        *   **Wiederbeleben**: Verstorbene Agenten wiederbeleben.
*   **Umgebung überschreiben**: (Nicht direkt im Admin-Panel sichtbar, aber über die `onUpdateEnvironment` Funktion impliziert) Ermöglicht die Änderung globaler Umgebungsvariablen wie Zeit oder Wetter (falls implementiert).
*   **Weltregel-Editor**: (Nicht direkt im Admin-Panel sichtbar, aber über `onCreateAction` und `onDeleteAction` impliziert) Ermöglicht das Erstellen oder Löschen von Aktionen direkt in der Simulation.

## 6. Fehlerbehebung und Häufig gestellte Fragen (FAQ)

Hier finden Sie Lösungen für häufig auftretende Probleme und Antworten auf wichtige Fragen:

*   **KI-Funktionen funktionieren nicht / 'Failed to connect to LM Studio' Fehler**:
    *   **Problem**: Die KI-Funktionen (Weltgenerierung, Agenten-Prompts) reagieren nicht oder es erscheint eine Fehlermeldung wie 'Failed to connect to LM Studio. This is usually a Cross-Origin Resource Sharing (CORS) issue.'
    *   **Lösung**: Stellen Sie sicher, dass LM Studio korrekt konfiguriert ist:
        1.  Öffnen Sie LM Studio und gehen Sie zum Tab **Local Server** (Symbol: `<->`).
        2.  Vergewissern Sie sich, dass der Server **Running** ist.
        3.  **Sehr wichtig**: Suchen Sie die Option **CORS** und stellen Sie sicher, dass diese **aktiviert** ist.
        4.  Überprüfen Sie in den RealitySim KI-Einstellungen (Zahnrad-Symbol in der Kopfzeile), ob der 'LM Studio API-Endpunkt' und der 'Modellname' exakt mit den Angaben in LM Studio übereinstimmen (nur die Basis-URL, z.B. `http://localhost:1234`, ohne `/v1/chat/completions`).

*   **Agenten führen keine sinnvollen Aktionen aus / 'AI could not find a suitable action' Fehler**:
    *   **Problem**: Agenten wandern nur umher oder die KI findet keine passende Aktion.
    *   **Lösung**: Dies kann mehrere Ursachen haben:
        1.  **KI-Konfiguration**: Überprüfen Sie die LM Studio-Einstellungen wie oben beschrieben.
        2.  **Modellqualität**: Das verwendete KI-Modell in LM Studio ist möglicherweise nicht leistungsfähig genug oder nicht für diese Art von Aufgaben optimiert. Versuchen Sie ein anderes, größeres oder spezialisierteres Modell.
        3.  **Prompt-Qualität**: Wenn Sie manuelle Prompts verwenden, stellen Sie sicher, dass diese klar und eindeutig sind. Wenn 'KI benutzen' aktiviert ist, versuchen Sie, allgemeinere Anweisungen zu geben.
        4.  **Weltzustand**: Möglicherweise fehlen Ressourcen oder andere Agenten, die für bestimmte Aktionen notwendig wären. Generieren Sie eine neue Welt oder fügen Sie mit der KI weitere Entitäten hinzu.

*   **Simulation läuft langsam**:
    *   **Problem**: Die Simulation verarbeitet Schritte sehr langsam, besonders wenn viele Agenten oder komplexe KI-Interaktionen stattfinden.
    *   **Lösung**:
        1.  **KI-Modell**: Größere oder komplexere KI-Modelle benötigen mehr Rechenleistung. Versuchen Sie, ein kleineres oder schnelleres Modell in LM Studio zu verwenden.
        2.  **Anzahl der Agenten/Entitäten**: Eine hohe Anzahl von Agenten und Entitäten erhöht die Komplexität pro Schritt. Reduzieren Sie die Anzahl beim Generieren einer neuen Welt oder löschen Sie nicht benötigte Objekte.
        3.  **Hardware**: Stellen Sie sicher, dass Ihr Computer über ausreichend RAM und eine leistungsstarke CPU/GPU verfügt, um das lokale KI-Modell effizient auszuführen.

*   **Gespeicherter Zustand kann nicht geladen werden**:
    *   **Problem**: Beim Laden einer JSON-Datei erscheint ein Fehler wie 'Invalid or incomplete world state file'.
    *   **Lösung**: Stellen Sie sicher, dass die geladene Datei eine vollständige und gültige RealitySim KI-Zustandsdatei ist, die zuvor mit der Option 'Ganzen Zustand speichern' exportiert wurde. Manuell bearbeitete Dateien können Fehler enthalten.

