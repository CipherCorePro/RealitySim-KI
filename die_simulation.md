# Die Simulation: Emergenes Verhalten und die verborgene Logik der Agenten

## Inhaltsverzeichnis
1. [Die Geburt eines Agenten: Der Startzustand](#1-die-geburt-eines-agenten-der-startzustand)
    - [Startzustand eines generierten Agenten](#11-startzustand-eines-generierten-agenten)
    - [Die Besonderheit von Neugeborenen: Vererbung und Entwicklung](#12-die-besonderheit-von-neugeborenen-vererbung-und-entwicklung)
2. [Hinter den Kulissen: Die Logik der Aktionsauswahl](#2-hinter-den-kulissen-die-logik-der-aktionsauswahl)
3. [Beispiele für emergentes Verhalten entschlüsselt](#3-beispiele-für-emergentes-verhalten-entschlüsselt)
    - [Warum stimmt Agent A für Agent B als Anführer?](#31-warum-stimmt-agent-a-für-agent-b-als-anführer)
    - [Wie entsteht ein neues Gesetz?](#32-wie-entsteht-ein-neues-gesetz)
    - [Warum werden Agenten aggressiv und bekämpfen sich?](#33-warum-werden-agenten-aggressiv-und-bekämpfen-sich)
    - [Warum versuchen Agenten etwas, wofür ihnen die Fähigkeiten fehlen?](#34-warum-versuchen-agenten-etwas-wofür-ihnen-die-fähigkeiten-fehlen)
4. [Die dynamische Wirtschaft: Fabriken und Erfindungen](#4-die-dynamische-wirtschaft-fabriken-und-erfindungen)
5. [Das Gedächtnis: Wie Agenten lernen und sich erinnern](#5-das-gedächtnis-wie-agenten-lernen-und-sich-erinnern)
6. [Die innere Welt: Psychoanalyse und Tagebücher](#6-die-innere-welt-psychoanalyse-und-tagebücher)
7. [Verifizierung im Code: Wo diese Logik lebt](#7-verifizierung-im-code-wo-diese-logik-lebt)
8. [Fazit: Die Illusion des freien Willens](#8-fazit-die-illusion-des-freien-willens)

---

## 1. Die Geburt eines Agenten: Der Startzustand

Wenn ein Agent in der Simulation erstellt wird, beginnt er nicht als vollkommen leeres Blatt. Sein Startzustand legt die grundlegenden Weichen für sein gesamtes zukünftiges Verhalten.

### 1.1 Startzustand eines generierten Agenten

Ein durch die KI generierter Agent (z.B. bei der Welterschaffung) hat keine expliziten Erinnerungen (`longTermMemory` ist leer). Sein anfängliches "Wissen" über die Welt und seine grundlegenden Tendenzen sind in seinen Startattributen kodiert:

- **`name` (Name):** Jeder Agent wird mit einem einzigartigen, vollständigen Namen generiert. Dieser Name, bestehend aus Vor- und Nachname, wird als eine einzige Zeichenkette im `name`-Feld gespeichert. Die KI ist angewiesen, diesen vollständigen Namen zu liefern, nicht separate Felder. Das System prüft, ob der Name mindestens zwei Wörter enthält und einzigartig ist, und generiert bei Bedarf einen zufälligen vollständigen Namen als Fallback.
- **`beliefNetwork` (Überzeugungen):** Grundlegende Annahmen wie "Fortschritt ist gut" oder "Natur ist heilig" geben ihm eine anfängliche ideologische Ausrichtung.
- **`personality` (Persönlichkeit):** Die "Big Five"-Merkmale (z.B. hohe Extraversion, niedrige Verträglichkeit) definieren seine grundlegende Veranlagung.
- **`psyche` (Psyche):** Startwerte für tiefere Triebe wie `Rachsucht` oder `Sinnsuche`.
- **`cultureId` & `religionId`:** Die Zugehörigkeit zu einer Kultur oder Religion stattet ihn mit einem geteilten Glaubenssystem aus.
- **Soziale Leere:** Der Agent beginnt ohne etablierte `Beziehungen`. Jeder andere Agent ist anfangs ein Fremder.

### 1.2 Die Besonderheit von Neugeborenen: Vererbung und Entwicklung

Wenn zwei Agenten ein Kind bekommen, durchläuft der neue Agent einen speziellen Erstellungsprozess (`addNewbornAgent`), der das Konzept von Vererbung simuliert.

- **Startalter und Fähigkeiten:** Ein Baby beginnt mit `Alter: 0` und `Fähigkeiten: 0` in allen Bereichen. Es ist anfangs völlig abhängig.
- **Vererbung:** Das Neugeborene erbt eine Mischung der Attribute seiner Eltern, mit einer leichten zufälligen Mutation:
  - **`genome` (Genom):** Eine Kombination der Gene beider Elternteile.
  - **`personality` (Persönlichkeit):** Die Persönlichkeitsmerkmale sind ein Durchschnitt der Elternwerte mit einer leichten zufälligen Abweichung.
  - **`psyche` (Psyche):** Auch die psychologischen Grundtriebe werden von den Eltern vererbt.
- **Kulturelle Prägung:** Das Kind wird in die Kultur (`cultureId`) und Religion (`religionId`) seiner Eltern hineingeboren und übernimmt deren grundlegende Überzeugungen.

Dieser Prozess sorgt für eine natürliche Generationenfolge, bei der Nachkommen ihren Eltern ähneln, aber dennoch einzigartige Individuen sind.

## 2. Hinter den Kulissen: Die Logik der Aktionsauswahl

Das Herzstück der Autonomie eines Agenten ist die `chooseAction`-Funktion. Sie läuft in jedem Schritt für jeden Agenten ab und entscheidet, was er als Nächstes tun wird. Dies ist keine zufällige Wahl, sondern ein ausgeklügeltes Bewertungssystem, das eine Vielzahl von Faktoren abwägt:

1.  **Überlebenspriorität (Höchste Priorität):** Wenn ein Agent am Verhungern (`hunger > 60`), Verdursten (`thirst > 50`) oder extrem müde (`fatigue > 85`) ist, erhalten Aktionen wie `Eat Food`, `Drink Water` oder `Rest` einen massiven Bonus. Überleben steht über allem.
2.  **Psychologische Imperative:** Starke innere Triebe aus der `psyche` drängen den Agenten zu bestimmten Handlungen:
    - Hohe `Trauer` (`grief`) führt zu `Mourn`.
    - Hohe `Rachsucht` (`vengefulness`) und ein `Rivale` in der Nähe führen zu `Fight`.
    - Hohe `Langeweile` (`boredom`) kann eine zufällige, neuartige Aktion auslösen, um die Monotonie zu durchbrechen.
    - Hohe `Eifersucht` (`jealousy`) kann zu `Confront Partner` führen.
    - Hohes `Spirituelles Bedürfnis` (`spiritualNeed`) oder `Sinnsuche` (`searchForMeaning`) machen `Meditate` sehr wahrscheinlich.
3.  **Ziele (`goals`):** Aktive Ziele geben dem Agenten eine langfristige Motivation. Ein Agent mit dem Ziel `becomeLeader` wird Aktionen wie `Run for Election` stark bevorzugen.
4.  **Rolle & Persönlichkeit:** Die Rolle und der Charakter eines Agenten beeinflussen seine "Standard"-Handlungen. Ein `Guard` wird zum `Patrol` neigen, ein `Scientist` zum `Research`. Ein extrovertierter Agent wird eher `Talk` wählen als ein introvertierter.
5.  **Gesetze & Moral:** Illegale Aktionen (z.B. `Steal`) erhalten einen starken Malus, der durch eine hohe `Gewissenhaftigkeit` (`conscientiousness`) noch verstärkt wird.
6.  **Wirtschaftliches Kalkül:** Agenten handeln ökonomisch. Ein armer Agent wird `Work for money` in Betracht ziehen. Ein reicher `Entrepreneur` könnte eine `Factory` gründen.
7.  **Verstärkungslernen (`qTable`):** Jeder Agent führt eine einfache "Q-Tabelle". Sie merkt sich, welche Aktionen in bestimmten Situationen (z.B. "hungrig und in der Nähe von Essen") zu einer positiven Belohnung (`reward`) geführt haben. Mit der Zeit "lernt" der Agent, welche Handlungen sich lohnen.
8.  **Erkundung (`EPSILON_GREEDY`):** Es gibt eine kleine (ca. 10%) Wahrscheinlichkeit, dass ein Agent eine völlig zufällige Aktion wählt. Dies simuliert Neugier und ermöglicht es dem Agenten, neue, potenziell bessere Strategien zu entdecken.
9.  **Fallback:** Wenn nach Abwägung aller Faktoren keine Aktion eine ausreichend hohe Bewertung erhält, wird der Agent einfach umherwandern (`Wander`).

## 3. Beispiele für emergentes Verhalten entschlüsselt

Das Zusammenspiel der oben genannten Regeln führt zu komplexem, oft überraschendem Verhalten.

### 3.1 Warum stimmt Agent A für Agent B als Anführer?

Die aktuelle Wahl-Logik ist sehr pragmatisch. Wenn eine Wahl aktiv ist, wird ein Agent für den Kandidaten stimmen, der den höchsten **Sozialstatus** hat. Beziehungen spielen hierbei noch eine untergeordnete Rolle. Dies modelliert eine Gesellschaft, in der Ansehen und Einfluss die Wahlentscheidung dominieren.

### 3.2 Wie entsteht ein neues Gesetz?

Dies ist ein Paradebeispiel für die fortschrittliche KI-Integration:
1.  **Auslöser:** Nur der aktuelle Anführer (`Leader`) mit der Technologie "Governance" kann ein Gesetz vorschlagen. Er wird dies eher tun, wenn seine Erinnerungen auf soziale Probleme hindeuten (z.B. viele Kämpfe).
2.  **KI-Gesetzgeber:** Die Aktion `Propose New Law` ruft die Gemini-KI auf. Die KI analysiert die jüngsten Ereignisse aus den Erinnerungen des Anführers und die Grundwerte seiner Kultur. Basierend darauf **erfindet die KI ein komplett neues, passendes Gesetz**, z.B. ein "Ressourcenschutzgesetz", wenn Ressourcen knapp werden.
3.  **Abstimmung im Clan:** Das vorgeschlagene Gesetz wird nicht einfach erlassen. Es wird eine Abstimmung unter allen Mitgliedern der Kultur des Anführers simuliert. Die Zustimmungswahrscheinlichkeit jedes Mitglieds hängt von seiner **Beziehung zum Anführer** und seiner eigenen **Verträglichkeit** (`agreeableness`) ab.
4.  **Mehrheitsentscheid:** Nur wenn die Mehrheit zustimmt, wird das Gesetz Teil der Weltregeln.

### 3.3 Warum werden Agenten aggressiv und bekämpfen sich?

Aggression ist selten zufällig. Sie entsteht aus einer Kombination von Faktoren:
- **Ziel `avengeRival`:** Ein Agent mit diesem Ziel wird aktiv die Konfrontation mit seinem Rivalen suchen.
- **Hohe `vengefulness`:** Ein rachsüchtiger Agent hat eine niedrigere Hemmschwelle, einen Kampf zu beginnen.
- **Niedrige `agreeableness`:** Ein wenig verträglicher Agent neigt eher zu Konflikten.
- **Direkter Befehl:** Der Benutzer kann einen Kampf über die Eingabeaufforderung provozieren.

### 3.4 Warum versuchen Agenten etwas, wofür ihnen die Fähigkeiten fehlen?

Dies ist oft ein Zeichen für Verzweiflung oder Neugier:
- **Verzweiflung:** Ein verhungernder Agent mit `farming: 0` wird trotzdem versuchen, `Gather Food` auszuführen, weil die Überlebenspriorität alle anderen Bedenken überstimmt.
- **Neugier (Exploration):** Die `EPSILON_GREEDY`-Logik kann dazu führen, dass ein Agent eine zufällige Aktion wie `Craft Sword` ausprobiert, einfach um zu sehen, was passiert, auch wenn seine `crafting`-Fähigkeit miserabel ist.

## 4. Die dynamische Wirtschaft: Fabriken und Erfindungen

Die Simulation verfügt über ein tiefgreifendes Wirtschaftssystem, das Produktionsketten und Innovation modelliert.
- **Ressourcen & Waren:** Es gibt Rohstoffe (`Holz`, `Eisen`, `Kohle` etc.) und daraus herstellbare Waren (`Stahlbarren`, `Werkzeuge`, `Möbel`).
- **Fabriken:** Agenten mit der Rolle `Entrepreneur` können `Factory`-Entitäten gründen, die auf die Produktion eines bestimmten Gutes spezialisiert sind.
- **Arbeitsmarkt:** Andere Agenten können in diesen Fabriken arbeiten (`Work in Factory`), um einen Lohn vom Besitzer zu erhalten, während der Besitzer die produzierten Waren erhält.
- **KI-gesteuerte Innovation:** Das Highlight ist die Aktion `Invent Product`. Ein Unternehmer kann die KI nutzen, um basierend auf den verfügbaren Ressourcen und Technologien **ein völlig neues Produktrezept zu erfinden**. Dieses neue Rezept wird dann der Simulation hinzugefügt und kann von allen fähigen Agenten hergestellt werden, was zu einer sich dynamisch entwickelnden Wirtschaft führt.

## 5. Das Gedächtnis: Wie Agenten lernen und sich erinnern

Das Gedächtnis ist der Schlüssel zu kontextbewusstem Verhalten. Es ist keine einfache Liste von Ereignissen.
- **Vektor-Datenbank:** Jede wichtige Aktion und deren Ergebnis wird in einen Text umgewandelt (z.B. "Ich habe erfolgreich 5 Holz gesammelt"). Dieser Text wird mittels KI in einen numerischen Vektor ("Embedding") umgewandelt, der die semantische Bedeutung erfasst.
- **Semantische Suche:** Wenn ein Agent eine komplexe Entscheidung treffen muss (z.B. auf die Frage "Was hältst du von Bob?"), wird die Frage ebenfalls in einen Vektor umgewandelt. Das System sucht dann im Langzeitgedächtnis nach den Erinnerungen, deren Vektoren dem Frage-Vektor am ähnlichsten sind.
- **Kontext für die KI:** Die relevantesten Erinnerungen (z.B. vergangene Kämpfe oder freundliche Gespräche mit Bob) werden der KI als zusätzlicher Kontext gegeben. Dadurch kann der Agent "wie ein Mensch" auf Basis relevanter vergangener Erfahrungen antworten, anstatt nur auf seinen unmittelbaren Zustand zu reagieren.

## 6. Die innere Welt: Psychoanalyse und Tagebücher

Um die psychologische Tiefe zu erhöhen, gibt es zwei besondere Features:
- **Psychoanalyse:** Auf Knopfdruck analysiert die KI den gesamten Zustand eines Agenten (Persönlichkeit, Erinnerungen, Traumata, Ziele) und erstellt einen detaillierten psychologischen Bericht. Dieser Bericht kann dem Agenten neue `unconscious_modifiers` (unbewusste Triebe) und ein `suggested_goal` (vorgeschlagenes Ziel) geben, was sein zukünftiges Verhalten subtil beeinflusst.
- **Gefängnistagebuch (`jailJournal`):** Wenn ein Agent inhaftiert ist, generiert die KI für jeden Schritt einen Tagebucheintrag. Dieser Eintrag reflektiert die Persönlichkeit des Agenten, seine Erinnerungen an die Tat und seine Gefühle über die Gefangenschaft. Dies bietet einen faszinierenden Einblick in die "Gedankenwelt" des Agenten.

## 7. Verifizierung im Code: Wo diese Logik lebt

Um diese Verhaltensweisen selbst zu überprüfen und zu modifizieren, sind folgende Dateien entscheidend:
- **`services/simulation.ts`:** Hier befindet sich die `chooseAction`-Methode, das "Gehirn" der Agenten. Sie enthält die gesamte Bewertungslogik, die in Abschnitt 2 beschrieben wird.
- **`services/actions.ts`:** Diese Datei enthält die Implementierung jeder einzelnen Aktion (`execute`-Funktion). Hier wird definiert, was genau passiert, wenn ein Agent z.B. kämpft, handelt oder ein Gesetz erlässt.
- **`services/geminiService.ts`:** Hier sind alle Prompts definiert, die an die KI gesendet werden, einschließlich der komplexen Anweisungen für die Gesetzeserfindung, Psychoanalyse und das Tagebuchschreiben.

## 8. Fazit: Die Illusion des freien Willens

Das Verhalten der Agenten in RealitySim AI ist nicht vorprogrammiert. Es ist das **emergente Ergebnis** aus dem Zusammenspiel von:
- **Deterministischen Regeln** (Bedürfnisse, Fähigkeiten, Mathematik des Kampfes).
- **Komplexen internen Zuständen** (Persönlichkeit, Psyche, Ziele, Erinnerungen).
- **KI-gesteuerter Kreativität und Interpretation** (Dialog, Erfindungen, Gesetze).

Diese Kombination schafft eine überzeugende Illusion von autonomen Wesen mit eigenem Willen, eigenen Motivationen und einer einzigartigen Lebensgeschichte.
