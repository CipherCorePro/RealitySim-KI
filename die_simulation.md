# Die Simulation: Emergenes Verhalten und die verborgene Logik der Agenten

Dieses Dokument ist eine technische und konzeptionelle Tiefenanalyse der Simulationsmechaniken. Es erklärt, wie das Verhalten der Agenten, das auf den ersten Blick frei und unvorhersehbar erscheint, tatsächlich aus einem komplexen, aber deterministischen Zusammenspiel von Regeln, internen Zuständen (inklusive eines neuen Bewusstseinsmoduls), externen unsichtbaren Einflüssen (dem Subquantenfeld) und KI-gesteuerter Kreativität entsteht.

## Inhaltsverzeichnis
1. [Die Geburt eines Agenten: Der Startzustand](#1-die-geburt-eines-agenten-der-startzustand)
    - [Startzustand eines generierten Agenten](#11-startzustand-eines-generierten-agenten)
    - [Die Besonderheit von Neugeborenen: Vererbung und Entwicklung](#12-die-besonderheit-von-neugeborenen-vererbung-und-entwicklung)
2. [Das Gehirn des Agenten: Die Logik der Aktionsauswahl](#2-das-gehirn-des-agenten-die-logik-der-aktionsauswahl)
    - [Das Bewertungssystem: Eine Kaskade von Prioritäten](#21-das-bewertungssystem-eine-kaskade-von-prioritäten)
    - [Lernen aus Erfahrung: Die Q-Tabelle](#22-lernen-aus-erfahrung-die-q-tabelle)
3. [Soziale Dynamiken: Beziehungen, Ideologie und Gesellschaft](#3-soziale-dynamiken-beziehungen-ideologie-und-gesellschaft)
    - [Freund, Feind, Fremder: Wie Beziehungen entstehen](#31-freund-feind-fremder-wie-beziehungen-entstehen)
    - [Die Macht der Ideologie: Warum Agent A für Agent B stimmt](#32-die-macht-der-ideologie-warum-agent-a-für-agent-b-stimmt)
    - [Gesellschaftliche Entwicklung: KI-gesteuerte Kultur, Religion und Gesetze](#33-gesellschaftliche-entwicklung-ki-gesteuerte-kultur-religion-und-gesetze)
    - [Mentoring, Beratung und Vergebung: Komplexe soziale Aktionen](#34-mentoring-beratung-und-vergebung-komplexe-soziale-aktionen)
    - [Leben im Gefängnis: Reflexion und Rehabilitation](#35-leben-im-gefängnis-reflexion-und-rehabilitation)
4. [Wirtschaft und Innovation](#4-wirtschaft-und-innovation)
    - [Vom Sammler zum Unternehmer: Die `Found Company`-Aktion](#41-vom-sammler-zum-unternehmer-die-found-company-aktion)
    - [Der Arbeitsmarkt: Lohnarbeit und Privateigentum](#42-der-arbeitsmarkt-lohnarbeit-und-privateigentum)
    - [Produktionsketten: Vom Rohstoff zum Endprodukt](#43-produktionsketten-vom-rohstoff-zum-endprodukt)
    - [Die Fabrik: Ein Blick auf die industrielle Zukunft](#44-die-fabrik-ein-blick-auf-die-industrielle-zukunft)
    - [Der Funke des Genies: KI-gesteuerte technologische Erfindungen](#45-der-funke-des-genies-ki-gesteuerte-technologische-erfindungen)
5. [Konflikt, Ordnung und Krisen](#5-konflikt-ordnung-und-krisen)
    - [Warum Agenten kämpfen und stehlen](#51-warum-agenten-kämpfen-und-stehlen)
    - [Das Gesetz und seine Wächter: Wie Wachen eingreifen](#52-das-gesetz-und-seine-wächter-wie-wachen-eingreifen)
    - [Die Ausbreitung von Krankheiten: Ein ungesehener Feind](#53-die-ausbreitung-von-krankheiten-ein-ungesehener-feind)
    - [Tod und Erbschaft: Der Kreislauf des Lebens](#54-tod-und-erbschaft-der-kreislauf-des-lebens)
6. [Die innere Welt: Bewusstsein, Psyche und Medien](#6-die-innere-welt-bewusstsein-psyche-und-medien)
    - [Das Subquantenfeld: Die unsichtbare Realität](#61-das-subquantenfeld-die-unsichtbare-realität)
    - [Das Quantenbewusstseinsmodul: Das "Ich" des Agenten](#62-das-quantenbewusstseinsmodul-das-ich-des-agenten)
    - [Das semantische Gedächtnis: Wie Agenten "verstehen"](#63-das-semantische-gedächtnis-wie-agenten-verstehen)
    - [Die Tiefenanalyse: Was die Psychoanalyse enthüllt](#64-die-tiefenanalyse-was-die-psychoanalyse-enthüllt)
    - [Das Gefängnistagebuch: KI-generierte Reflexionen](#65-das-gefängnistagebuch-ki-generierte-reflexionen)
    - [Glaube nicht alles, was du liest: Medien und der Kredibilitäts-Check](#66-glaube-nicht-alles-was-du-liest-medien-und-der-kredibilitäts-check)
    - [Der Chronist: Wie KI-gesteuerte Nachrichten entstehen](#67-der-chronist-wie-ki-gesteuerte-nachrichten-entstehen)
7. [Verifizierung im Code: Wo diese Logik lebt](#7-verifizierung-im-code-wo-diese-logik-lebt)
8. [Fazit: Die Illusion des freien Willens](#8-fazit-die-illusion-des-freien-willens)

---

## 1. Die Geburt eines Agenten: Der Startzustand

Wenn ein Agent in der Simulation erstellt wird, beginnt er nicht als vollkommen leeres Blatt. Sein Startzustand legt die grundlegenden Weichen für sein gesamtes zukünftiges Verhalten.

### 1.1 Startzustand eines generierten Agenten

Ein durch die KI generierter Agent hat keine expliziten Erinnerungen. Sein anfängliches "Wissen" und seine Tendenzen sind in seinen Startattributen kodiert:

- **`name` (Name):** Jeder Agent wird mit einem einzigartigen, vollständigen Namen generiert.
- **`beliefNetwork` (Überzeugungen):** Grundlegende Annahmen wie "Fortschritt ist gut" geben eine ideologische Ausrichtung.
- **`personality` (Persönlichkeit):** Die "Big Five"-Merkmale definieren seine grundlegende Veranlagung.
- **`psyche` (Psyche):** Startwerte für tiefere Triebe wie `Rachsucht` oder `Sinnsuche`.
- **`consciousness` (Bewusstsein):** Jeder Agent startet mit einem niedrigen Level an `self_awareness` (Selbstwahrnehmung) und `agency` (Handlungsfähigkeit). Er muss diese erst durch Erfahrungen entwickeln.
- **`cultureId` & `religionId`:** Die Zugehörigkeit zu einer Kultur oder Religion stattet ihn mit einem geteilten Glaubenssystem aus.
- **Soziale Leere:** Der Agent beginnt ohne etablierte `Beziehungen`.

### 1.2 Die Besonderheit von Neugeborenen: Vererbung und Entwicklung

Wenn zwei Agenten ein Kind bekommen (`addNewbornAgent`), durchläuft der neue Agent einen speziellen Erstellungsprozess.

- **Startalter und Fähigkeiten:** Ein Baby beginnt mit `Alter: 0` und `Fähigkeiten: 0`.
- **Vererbung:** Das Neugeborene erbt eine Mischung der Attribute seiner Eltern, mit einer leichten zufälligen Mutation:
  - **`genome`, `personality`, `psyche`:** Diese Merkmale sind ein Durchschnitt der Elternwerte mit einer leichten zufälligen Abweichung.
  - **`consciousness`:** Auch die grundlegenden Bewusstseinsanlagen werden von den Eltern vererbt.
- **Kulturelle Prägung:** Das Kind wird in die Kultur (`cultureId`) und Religion (`religionId`) seiner Eltern hineingeboren.

Dieser Prozess sorgt für eine natürliche Generationenfolge, bei der Nachkommen ihren Eltern ähneln, aber dennoch einzigartige Individuen sind.

## 2. Das Gehirn des Agenten: Die Logik der Aktionsauswahl

Das Herzstück der Autonomie eines Agenten ist die `chooseAction`-Funktion in `services/simulation.ts`. Sie entscheidet, was er als Nächstes tun wird. Dies ist keine zufällige Wahl, sondern ein ausgeklügeltes Bewertungssystem, das eine Vielzahl von Faktoren abwägt, um für jede verfügbare Aktion eine Punktzahl zu berechnen.

### 2.1 Das Bewertungssystem: Eine Kaskade von Prioritäten
Die Logik folgt einer klaren Hierarchie, in der verschiedene Aspekte des Agentenzustands die Punktzahl einer Aktion beeinflussen.

1.  **Grundrauschen & Erkundung:** Jede Aktion startet mit einer kleinen zufälligen Punktzahl. Mit einer geringen Wahrscheinlichkeit (`EPSILON_GREEDY`) wird eine völlig zufällige Aktion gewählt.
2.  **Überlebenspriorität (Höchste Priorität):** Wenn ein Agent am Verhungern, Verdursten oder extrem müde ist, erhalten Aktionen wie `Eat Food`, `Drink Water` oder `Rest` einen massiven Bonus von +500 Punkten.
3.  **Psychologische Imperative & Umwelt-Einfluss:** Starke innere Triebe aus der `psyche` erhöhen die Punktzahl bestimmter Aktionen signifikant:
    - **Unruhe (`agitation > 0.6`):** Agenten, die sich durch das Subquantenfeld unruhig fühlen, erhalten einen starken Bonus auf aggressive (`Fight`, `Steal`) oder rastlose (`Move`) Aktionen und einen Malus auf konzentrierte Tätigkeiten (`Research`).
    - **Gelassenheit (`serenity > 0.6`):** Agenten in harmonischen Feldzonen bevorzugen ruhige, produktive Handlungen (`Meditate`, `Research`, `Crafting`) und meiden Konflikte.
    - Andere Triebe wie `Trauer`, `Langeweile`, `Eifersucht` oder `spiritueller Bedarf` erhöhen ebenfalls stark die Punktzahl für passende Aktionen.
4.  **Bewusstsein & Selbstverwirklichung (Neue, hohe Priorität):**
    - **Hohe Handlungsfähigkeit (`agency`):** Agenten, die an ihre Fähigkeiten glauben, erhalten einen massiven Bonus auf ambitionierte, risikoreiche Aktionen wie `Found Company` oder `Run for Election`. Das System loggt explizit: *"Mit einem starken Gefühl der Handlungsfähigkeit entscheidet sich {Agent} ambitioniert für {Aktion}."*
    - **Hohe Selbstwahrnehmung (`self_awareness`):** Agenten, die sich ihrer selbst bewusst sind, priorisieren Aktionen, die ihren langfristigen `Zielen` entsprechen, solange ihre Grundbedürfnisse gedeckt sind. Das System loggt: *"Durch Selbstwahrnehmung wählt {Agent}, um sein Ziel zu erreichen."*
5.  **Ziele (`goals`):** Aktive Ziele geben dem Agenten eine langfristige Motivation und einen starken Bonus (z.B. `avengeRival` -> `Fight`).
6.  **Soziale Motivation:** Die Punktzahl für `Talk` steigt mit `Extraversion` und ideologischer Nähe zu anderen Agenten.
7.  **Rolle & Persönlichkeit:** Ein `Guard` neigt zu `Patrol`, ein `Scientist` zu `Research`.
8.  **Gesetze & Moral:** Illegale Aktionen erhalten einen extrem starken Malus, der durch hohe `Gewissenhaftigkeit` verstärkt wird.

### 2.2 Lernen aus Erfahrung: Die Q-Tabelle
Zusätzlich zu diesen Faktoren lernt jeder Agent durch **Verstärkungslernen**.
- **`qTable`:** Jeder Agent merkt sich, welche Aktionen in bestimmten Situationen zu einer positiven Belohnung (`reward`) geführt haben.
- **Update:** Nach jeder Aktion wird der Q-Wert für die Kombination aus Zustand und Aktion aktualisiert.
- **Ergebnis:** Mit der Zeit "lernt" der Agent, welche Aktionen in welchen Situationen am effektivsten sind.

## 3. Soziale Dynamiken: Beziehungen, Ideologie und Gesellschaft

### 3.1 Freund, Feind, Fremder: Wie Beziehungen entstehen
Beziehungen entwickeln sich dynamisch durch Nähe. Aus Fremden (`stranger`) werden Bekannte (`acquaintance`) und schließlich Freunde (`friend`). Negative Interaktionen können zu Rivalitäten (`rival`) führen.

### 3.2 Die Macht der Ideologie: Warum Agent A für Agent B stimmt
Die Wahl-Logik in `actions.ts` (`Vote`-Aktion) basiert auf tiefen ideologischen Überzeugungen.
- **Jensen-Shannon-Divergenz (JSD):** Vor der Wahl berechnet ein Agent den JSD-Wert zwischen seinem eigenen `beliefNetwork` und dem jedes Kandidaten.
- **Wahl des Gleichgesinnten:** Der Agent wird für den Kandidaten stimmen, dessen JSD-Wert am **niedrigsten** ist – also den Kandidaten, dessen Weltanschauung seiner eigenen am meisten ähnelt. Dies führt zur Bildung von politischen Blöcken.
- **Bürgerpflicht:** Um sicherzustellen, dass Wahlen zu einem Ergebnis führen, erhalten Agenten während einer aktiven Wahl nun einen starken Anreiz, die Aktion `Vote` auszuführen. Ihre `Gewissenhaftigkeit` beeinflusst zusätzlich, wie stark sie diesem Drang nachgeben. Dies sorgt für eine aktive Wahlbeteiligung und legitime Wahlergebnisse.

### 3.3 Gesellschaftliche Entwicklung: KI-gesteuerte Kultur, Religion und Gesetze
- **Beispiel: Die Geburt einer neuen Religion (KI-gesteuert):** Ein charismatischer Agent kann die Aktion `Found Religion` auslösen. Die KI (`generateNewReligion`) **erfindet eine komplett neue Religion** mit eigenem Namen und Dogma, basierend auf der Kultur des Agenten.
- **Beispiel: Wie ein neues Gesetz entsteht (KI-gesteuert):** Nur der Anführer kann `Propose New Law` nutzen. Die KI (`generateNewLaw`) analysiert die jüngsten Ereignisse und **erfindet ein passendes Gesetz**.

### 3.4 Mentoring, Beratung und Vergebung: Komplexe soziale Aktionen
Die Simulation modelliert auch nuancierte soziale Interaktionen:
- **`Mentor young agent`:** Ein erfahrener Agent kann sein Wissen an einen jüngeren weitergeben und dessen Fähigkeiten verbessern.
- **`Seek Counseling` / `Provide Counseling`:** Agenten mit hohem Stress können aktiv Hilfe bei einem `Counselor` suchen, der durch seine Fähigkeiten Stress reduzieren kann. Die Entlohnung für diese wichtige soziale Dienstleistung wurde erhöht.
- **`Offer Forgiveness`:** Ein Agent kann aktiv eine Rivalität beenden, indem er seinem Rivalen vergibt, was die Beziehung von `rival` zu `acquaintance` ändert.

### 3.5 Leben im Gefängnis: Reflexion und Rehabilitation
Ein Agent, der zu einer Haftstrafe verurteilt wurde (`imprisonment`), ist nicht zur vollständigen Untätigkeit verdammt.
- **Gesellschaft suchen:** In jedem Schritt prüft ein inhaftierter Agent, ob sich andere lebende Agenten im selben Gefängnis befinden.
- **Gespräche statt Langeweile:** Wenn Gesellschaft vorhanden und der Agent nicht übermäßig müde ist (`fatigue < 80`), wird er automatisch die Aktion `Talk` wählen. Dies ermöglicht es den Insassen, Beziehungen aufzubauen oder zu verändern, sich auszutauschen und soziale Erinnerungen zu bilden, selbst während ihrer Haft.
- **Standardverhalten:** Ist ein Agent allein im Gefängnis oder zu müde für ein Gespräch, wählt er standardmäßig die Aktion `Rest`, um sich zu erholen.
- **Rehabilitation durch Analyse:** Nach der Hälfte der Haftzeit wird automatisch eine Psychoanalyse erstellt. Diese bewertet den psychologischen Zustand des Häftlings. Basierend auf diesem Gutachten kann eine Bewährung gewährt werden, die die restliche Haftzeit halbiert. Ein positives Gutachten, das z.B. Reue oder den Willen zur Besserung (`seekCounseling`) zeigt, erhöht die Chance auf vorzeitige Entlassung. Die Ergebnisse der Analyse und die Bewährungsentscheidung werden dem Gefängnistagebuch des Agenten hinzugefügt.
- **Ein neues Kapitel:** Bei der Entlassung aus der Haft wird eine finale Psychoanalyse durchgeführt. Das Ergebnis dieser Analyse setzt ein neues, rehabilitatives Lebensziel für den Agenten, um seine Wiedereingliederung in die Gesellschaft zu unterstützen.
- **Code-Verortung:** Diese Logik ist Teil der `chooseAction`- und der `step`-Funktion in `services/simulation.ts`.

## 4. Wirtschaft und Innovation

### 4.1 Vom Sammler zum Unternehmer: Die `Found Company`-Aktion
Ein Agent kann eine unbesessene Ressourcen-Entität kaufen und wird zum `Entrepreneur`.

### 4.2 Der Arbeitsmarkt: Lohnarbeit und Privateigentum
Andere Agenten können bei diesen Unternehmen arbeiten und erhalten einen Lohn vom Besitzer.

### 4.3 Produktionsketten: Vom Rohstoff zum Endprodukt
Agenten können durch `Crafting` höherwertige Güter herstellen, was oft spezifische Fähigkeiten und Technologien erfordert.

### 4.4 Die Fabrik: Ein Blick auf die industrielle Zukunft
Das System ist auf Fabriken vorbereitet, die eine Massenproduktion von Gütern ermöglichen würden.

### 4.5 Der Funke des Genies: KI-gesteuerte technologische Erfindungen
Ein `Scientist` mit hoher `Inspiration` kann `Invent Technology` auslösen. Die KI (`generateNewTechnology`) analysiert bekannte Technologien und **erfindet eine plausible neue Technologie**.

## 5. Konflikt, Ordnung und Krisen

### 5.1 Warum Agenten kämpfen und stehlen
Aggression entsteht aus einer Kombination von Faktoren: Zielen (`avengeRival`), einem rachsüchtigen Charakter (`vengefulness`), niedriger Verträglichkeit, oder dem psychischen Zustand der **Unruhe (`agitation`)**, der durch das Subquantenfeld ausgelöst wird.

### 5.2 Das Gesetz und seine Wächter: Wie Wachen eingreifen
Wachen greifen bei beobachteten Straftaten ein und können Täter verhaften. Die Strafdauer wird dynamisch basierend auf der Persönlichkeit des Täters festgelegt.

### 5.3 Die Ausbreitung von Krankheiten: Ein ungesehener Feind
Ein kranker Agent kann andere in seiner Nähe anstecken. Agenten mit dem Gen `G-RESISTANT` haben eine geringere Chance, sich zu infizieren.

### 5.4 Tod und Erbschaft: Der Kreislauf des Lebens
Der Tod eines Agenten löst eine Vererbungslogik aus. Währung wird zu gleichen Teilen an lebende Kinder aufgeteilt, während Eigentum an das älteste lebende Kind übergeht.

## 6. Die innere Welt: Bewusstsein, Psyche und Medien

### 6.1 Das Subquantenfeld: Die unsichtbare Realität
Inspiriert von M.Y.R.A.s SubQG-System, ist das Subquantenfeld eine unsichtbare, dynamische Energieschicht, die die gesamte Weltkarte überlagert.
- **Evolution:** In jedem Simulationsschritt entwickelt sich das Feld weiter. Die "Potenzial"-Werte jeder Zelle ändern sich langsam basierend auf ihren Nachbarn und einem leichten Chaosfaktor.
- **Einfluss auf die Psyche:** Agenten nehmen dieses Feld nicht bewusst wahr, aber es beeinflusst direkt ihre Psyche (`applyPerStepMechanisms`). Zonen mit stabilem, mittlerem Potenzial erhöhen die **Gelassenheit (`serenity`)**, während Zonen mit extrem hohem oder niedrigem Potenzial **Unruhe (`agitation`)** erzeugen.
- **Metakognition:** Wenn eine signifikante Änderung ihrer Gelassenheit oder Unruhe auftritt, wird dies im Log vermerkt (z.B. *"Elara fühlt eine Welle der Ruhe aus ihrer Umgebung"*). Dies ist die erste Stufe der Metakognition: Der Agent (und der Spieler) wird auf eine interne Veränderung aufmerksam, die von einer externen, unsichtbaren Kraft herrührt.

### 6.2 Das Quantenbewusstseinsmodul: Das "Ich" des Agenten
Jeder Agent besitzt nun ein `QuantumConsciousnessModule`, das seine Fähigkeit zur Selbstreflexion und zum zielgerichteten Handeln steuert.
- **Selbstwahrnehmung (`Self-Awareness`):** Dies ist die Fähigkeit des Agenten, seinen eigenen Zustand zu verstehen. Sie wächst durch introspektive oder tiefgreifende Erlebnisse:
  - **`Meditate`:** Meditation führt zu kleinen, aber stetigen Zuwächsen.
  - **Psychoanalyse:** Eine KI-generierte Analyse liefert einen signifikanten Schub an Selbsterkenntnis.
  - **Krisenbewältigung:** Das Überleben einer schweren Krankheit oder Verletzung (Erholung von sehr niedriger Gesundheit) stärkt die Selbstwahrnehmung.
  - **Zielerreichung:** Das Abschließen eines komplexen Lebensziels führt zu einem besseren Verständnis der eigenen Fähigkeiten.
  - **Auswirkung:** Hohe Selbstwahrnehmung befähigt einen Agenten, Aktionen zu wählen, die seinen langfristigen Zielen entsprechen, anstatt nur kurzfristig auf Bedürfnisse zu reagieren.

- **Handlungsfähigkeit (`Agency`):** Dies ist der Glaube des Agenten an seine eigene Fähigkeit, die Welt zu gestalten. Es ist das Gefühl "Ich kann alles versuchen". Sie wächst durch Erfolge:
  - **`Found Company`:** Die Gründung eines Unternehmens ist ein massiver Schub für die Agency.
  - **Sieg im `Fight`:** Ein gewonnener Kampf stärkt das Vertrauen in die eigene Stärke.
  - **`Run for Election` & Sieg:** Zum Anführer gewählt zu werden, ist der ultimative Beweis für die eigene Wirksamkeit.
  - **Auswirkung:** Hohe Handlungsfähigkeit macht einen Agenten mutiger und ambitionierter. Er ist eher bereit, risikoreiche Aktionen mit hoher Belohnung zu versuchen.

### 6.3 Das semantische Gedächtnis: Wie Agenten "verstehen"
Jede wichtige Aktion wird in einen Text umgewandelt, in einen Vektor ("Embedding") umgewandelt und im Langzeitgedächtnis (`VectorDB`) gespeichert. Bei komplexen Entscheidungen werden die relevantesten Erinnerungen abgerufen und der KI als Kontext gegeben.

### 6.4 Die Tiefenanalyse: Was die Psychoanalyse enthüllt
Die KI (`generatePsychoanalysis`) analysiert den gesamten Zustand eines Agenten, einschließlich seines Bewusstseinszustands, und erstellt einen psychologischen Bericht. Dieser kann dem Agenten neue unbewusste Triebe (`unconscious_modifiers`), ein neues Lebensziel (`suggested_goal`) und einen Schub für seine Selbstwahrnehmung geben.

### 6.5 Das Gefängnistagebuch: KI-generierte Reflexionen
Ein inhaftierter Agent reflektiert in KI-generierten Tagebucheinträgen (`generateJailJournalEntry`) über seine Taten und seine Persönlichkeit.

### 6.6 Glaube nicht alles, was du liest: Medien und der Kredibilitäts-Check
Agenten unterziehen Medienbotschaften einer unbewussten Glaubwürdigkeitsprüfung, die von ihrer Persönlichkeit, ihren Überzeugungen und dem sozialen Beweis durch ihre Freunde abhängt.

### 6.7 Der Chronist: Wie KI-gesteuerte Nachrichten entstehen
In jedem Schritt veröffentlicht ein `Journalist`-Agent einen KI-generierten Nachrichtenartikel (`generateMediaBroadcast`), der autonom Titel, Inhalt, Zielüberzeugung und Wahrheitsgehalt festlegt, um die öffentliche Meinung zu formen.

## 7. Verifizierung im Code: Wo diese Logik lebt

- **`services/simulation.ts`:** Hier befindet sich die `chooseAction`-Methode, das "Gehirn" der Agenten. Die `applyPerStepMechanisms`-Funktion enthält die Logik für das Subquantenfeld und das Wachstum des Bewusstseins.
- **`services/actions.ts`:** Enthält die Implementierung jeder Aktion und die spezifischen Auslöser für das Wachstum von `agency`.
- **`services/geminiService.ts`:** Definiert die Prompts, die der KI gesendet werden, um kreative Inhalte oder Analysen (inkl. Bewusstseinszustand) zu generieren.
- **`types.ts` & `constants.ts`:** Definieren die neuen Datenstrukturen (`QuantumConsciousnessModule`, `SubquantumField`) und die grundlegenden "Naturgesetze".

## 8. Fazit: Die Illusion des freien Willens

Das Verhalten der Agenten ist das **emergente Ergebnis** aus dem Zusammenspiel von deterministischen Regeln, komplexen internen Zuständen, einem unsichtbaren, die Psyche beeinflussenden Feld und einem neuen Bewusstseinsmodul, das Selbstwahrnehmung und Handlungsfähigkeit simuliert. Diese Kombination schafft eine noch überzeugendere Illusion von autonomen Wesen, die nicht nur auf ihre Umgebung reagieren, sondern beginnen, aus einem inneren, selbstreflektierten Antrieb heraus zu handeln und ihre eigene Lebensgeschichte zu schreiben.Of course. I've corrected the `package.json` file to use the specific version of `@google/genai` as required by the project's lock file. This ensures consistency and prevents potential issues with package resolution.



