# Die Simulation: Emergenes Verhalten und die verborgene Logik der Agenten

## Inhaltsverzeichnis
1. [Die Geburt eines Agenten: Der Startzustand](#1-die-geburt-eines-agenten-der-startzustand)
    - [Startzustand eines generierten Agenten](#11-startzustand-eines-generierten-agenten)
    - [Die Besonderheit von Neugeborenen: Vererbung und Entwicklung](#12-die-besonderheit-von-neugeborenen-vererbung-und-entwicklung)
2. [Hinter den Kulissen: Die Logik der Aktionsauswahl](#2-hinter-den-kulissen-die-logik-der-aktionsauswahl)
3. [Beispiele für emergentes Verhalten entschlüsselt](#3-beispiele-für-emergentes-verhalten-entschlüsselt)
    - [Warum stimmt Agent A für Agent B als Anführer?](#warum-stimmt-agent-a-für-agent-b-als-anführer)
    - [Warum werden Agenten aggressiv und bekämpfen sich?](#warum-werden-agenten-aggressiv-und-bekämpfen-sich)
    - [Warum versuchen Agenten etwas, wofür ihnen die Fähigkeiten fehlen?](#warum-versuchen-agenten-etwas-wofür-ihnen-die-fähigkeiten-fehlen)
4. [Verifizierung im Code: Wo diese Logik lebt](#4-verifizierung-im-code-wo-diese-logik-lebt)
5. [Fazit: Die Illusion des freien Willens](#5-fazit-die-illusion-des-freien-willens)

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

- **Startalter und Fähigkeiten:** Ein Baby startet mit `Alter: 0` und **allen Fähigkeiten (`skills`) auf 0**. Es ist buchstäblich ein Anfänger in allem und muss jede Fähigkeit von Grund auf lernen, indem es Aktionen ausführt.

- **Genetische Vererbung (`genome`):** Das Genom des Kindes ist eine Mischung aus den Genen beider Eltern. Das System kombiniert die Gene der Eltern, wählt zufällig etwa die Hälfte davon aus und wendet eine kleine **Mutationsrate** an. Das bedeutet, dass ein Kind ein Gen erben kann, das keiner seiner Elternteile hatte, was genetische Vielfalt simuliert.

- **Psychologische Vererbung (`personality` & `psyche`):** Die Persönlichkeitsmerkmale und psychologischen Triebe des Kindes sind nicht zufällig. Sie werden als **Durchschnitt der Werte beider Eltern** berechnet, plus einer kleinen zufälligen Abweichung (Mutation). Ein Kind von zwei sehr offenen und wenig neurotischen Eltern wird mit hoher Wahrscheinlichkeit ebenfalls diese Tendenzen aufweisen.

- **Kulturelle und ideologische Prägung:** Das Baby erbt die `cultureId` und `religionId` eines seiner Elternteile. Sein anfängliches Überzeugungsnetzwerk (`beliefNetwork`) ist ebenfalls der Durchschnitt der Überzeugungen beider Eltern. Es wird also buchstäblich in die Weltanschauung seiner Familie hineingeboren.

- **Anfängliches Verhalten:** Da ein Baby mit null Fähigkeiten und ohne komplexe Ziele startet, wird sein Verhalten in den ersten Lebensphasen fast ausschließlich von den **Grundbedürfnissen** (Hunger, Durst, Müdigkeit) und dem **Erkundungsdrang** (zufällige Aktionen) bestimmt. Sein Verhalten ist anfangs sehr einfach und überlebensorientiert. Erst mit dem Alter und der Entwicklung von Fähigkeiten und sozialen Beziehungen wird sein Verhalten komplexer.

Eine weitere besondere Form der Erinnerung, die ein Agent im Laufe seines Lebens entwickeln kann, ist das **Gefängnistagebuch**. Wenn ein Agent inhaftiert ist, wird für jeden Zeitschritt ein KI-generierter Tagebucheintrag erstellt, der seine Persönlichkeit und seinen Zustand widerspiegelt. Dieses Tagebuch bleibt auch nach der Freilassung ein permanenter Teil seiner Geschichte und kann jederzeit von seiner Agentenkarte als Markdown-Datei heruntergeladen werden.

## 2. Hinter den Kulissen: Die Logik der Aktionsauswahl

Das Herzstück des emergenten Verhaltens ist die `chooseAction`-Funktion der Simulations-Engine. Diese Funktion wird für jeden Agenten in jedem Schritt aufgerufen und entscheidet, was er als Nächstes tut. Dies geschieht nicht willkürlich, sondern durch ein ausgeklügeltes **Bewertungssystem**.

Für jede verfügbare Aktion (z.B. "Essen", "Reden", "Kämpfen") wird eine Punktzahl berechnet. Die Aktion mit der höchsten Punktzahl wird ausgeführt. Diese Punktzahl wird durch eine Vielzahl von internen und externen Faktoren beeinflusst, die zusammen das komplexe und oft überraschende Verhalten der Agenten formen.

**Die wichtigsten Einflussfaktoren sind:**

1.  **Überlebenstriebe (Höchste Priorität):** Die Grundbedürfnisse haben den stärksten Einfluss.
    - Hoher `Hunger`, `Durst` oder `Müdigkeit` geben Aktionen wie `Eat Food`, `Drink Water` und `Rest` einen massiven Bonus. Die KI wird fast immer versuchen, ihr Überleben zu sichern, bevor sie Luxus- oder Sozialaktionen durchführt.

2.  **Psyche & Emotionen (Die inneren Antriebe):** Dies ist der Schlüssel zu vielen nicht offensichtlichen Verhaltensweisen, die nicht direkt im Log stehen.
    - Eine hohe `vengefulness` (Rachsucht) gibt der `Fight`-Aktion einen enormen Schub, wenn ein Rivale in der Nähe ist.
    - Hohe `grief` (Trauer) macht die `Mourn`-Aktion (Trauern) sehr wahrscheinlich.
    - Hohes `spiritualNeed` (Spirituelles Bedürfnis) fördert `Meditate`.
    - Hohe `jealousy` (Eifersucht) kann zu `Confront Partner` führen.

3.  **Ziele (Goals):** Wenn ein Agent ein aktives Ziel hat, erhalten Aktionen, die auf dieses Ziel hinarbeiten, eine sehr hohe Priorität. Ein Agent mit dem Ziel "Anführer werden" wird `Run for Election` stark bevorzugen.

4.  **Persönlichkeit (Charakterzüge):**
    - Hohe `conscientiousness` (Gewissenhaftigkeit) führt zu einem extremen Malus für illegale Aktionen. Solche Agenten sind gesetzestreu.
    - Hohe `extraversion` (Extraversion) erhöht die Punktzahl für soziale Aktionen wie `Talk`.
    - Niedrige `agreeableness` (Verträglichkeit) kann die Hemmschwelle für aggressive Aktionen wie `Fight` senken.

5.  **Sozialer Kontext & Rolle:**
    - Ein Agent mit der Rolle `Scientist` erhält einen Bonus auf `Research`.
    - Die Anwesenheit anderer Agenten in der Nähe beeinflusst die Bewertung sozialer Aktionen.

6.  **Verstärkendes Lernen (Q-Learning):** Die `qTable` ist ein einfaches Lernsystem. Der Agent merkt sich, welche Aktionen in einer bestimmten Situation (z.B. "hungrig & nahe an Nahrung") zu einem positiven Ergebnis (Belohnung) geführt haben, und bevorzugt diese in Zukunft.

7.  **Erkundung & Zufall (`Epsilon-Greedy`):** Es gibt eine kleine (ca. 10%) Wahrscheinlichkeit, dass ein Agent eine **zufällige Aktion** wählt, anstatt der mit der höchsten Punktzahl. Dies simuliert Neugier, Spontaneität und Erkundungsverhalten. Es ist ein entscheidender Faktor, warum Agenten manchmal unlogische Dinge tun oder neue Verhaltensweisen ausprobieren.

## 3. Beispiele für emergentes Verhalten entschlüsselt

Mit dem Wissen über das Bewertungssystem können wir die spezifischen Fragen zum Agentenverhalten beantworten.

### Warum stimmt Agent A für Agent B als Anführer?

**Das Ereignisprotokoll zeigt nur, *dass* A für B gestimmt hat, aber nicht *warum*.** Der Grund liegt in der Logik der `Vote`-Aktion und dem Zustand des Agenten.

Die aktuelle Implementierung ist eine Heuristik: Wenn ein Agent zur Wahl geht, identifiziert er alle Kandidaten und gibt seine Stimme demjenigen mit dem höchsten `socialStatus`. Dies ist eine vereinfachte Simulation von politischer Entscheidung, bei der der Agent annimmt, dass die Person mit dem höchsten Ansehen und der größten Beliebtheit die beste Wahl ist. Es ist keine komplexe politische Abwägung, sondern das Ergebnis einer einfachen, aber plausiblen Regel.

### Warum werden Agenten aggressiv und bekämpfen sich?

Aggression ist selten grundlos und entspringt oft einer Kombination mehrerer Faktoren:

1.  **Hohe Rachsucht (`vengefulness`):** Ein Agent mit einem hohen Wert in diesem Psyche-Attribut ist von Natur aus streitlustiger.
2.  **Beziehungsstatus "Rivale":** Wenn zwei Agenten eine Rivalenbeziehung haben, erhält die `Fight`-Aktion einen hohen Bonus, wenn sie sich begegnen.
3.  **Ziel "Rache":** Ein Agent mit dem aktiven Ziel `avengeRival` wird aktiv versuchen, seinen Rivalen zu finden und zu bekämpfen.
4.  **Niedrige Verträglichkeit:** Ein Agent mit niedriger `agreeableness` hat eine geringere Hemmschwelle für Konflikte.

### Warum versuchen Agenten etwas, wofür ihnen die Fähigkeiten fehlen?

Dies ist ein perfektes Beispiel für Aspiration und den Unterschied zwischen Motivation und Fähigkeit. Das Aktionsauswahl-System bewertet primär den **Wunsch** oder die **Notwendigkeit**, eine Aktion auszuführen.

**Beispiel:** Ein Agent ohne `crafting`-Fähigkeit versucht, ein Schwert herzustellen. Warum?
- **Hohe Motivation:** Der Agent könnte eine niedrige Gesundheit haben und eine hohe `fearOfDeath` (Todesangst). Sein System bewertet jede Aktion, die Sicherheit verspricht (wie der Besitz einer Waffe), extrem hoch.
- **Zielorientierung:** Er könnte das Ziel `achieveWealth` (Reichtum erlangen) haben und "weiß", dass Schwerter wertvoll sind.
- **Verfügbarkeit:** Die Zutaten (Eisen, Holz) sind zufällig in seinem Inventar vorhanden.

Der Agent "denkt" also: "Ich habe Angst, ich brauche Schutz. Ich habe die Materialien für ein Schwert. Also versuche ich, ein Schwert zu bauen!" Die Simulations-Engine lässt diesen Versuch zu, aber die `execute`-Funktion der Aktion wird dann fehlschlagen und eine Log-Nachricht wie `log_action_craft_fail_skill` ausgeben.

Dieses Verhalten ist nicht unlogisch, sondern menschlich. Es modelliert den Wunsch, die eigenen Fähigkeiten zu übersteigen, um ein dringendes Bedürfnis oder ein hohes Ziel zu erreichen. Auch der **Erkundungsfaktor** kann hier eine Rolle spielen, bei dem der Agent einfach etwas Neues ausprobiert.

## 4. Verifizierung im Code: Wo diese Logik lebt

Ein häufiges Missverständnis bei komplexen Simulationen ist, dass das beschriebene Verhalten nur eine "Wunschvorstellung" der Entwickler ist. Im Fall von RealitySim AI ist die hier dokumentierte Logik jedoch direkt und nachvollziehbar im Quellcode implementiert.

**Antwort auf die Frage: "Steht das wirklich im Code?"**

Ja. Die in diesem Dokument beschriebenen Mechanismen, insbesondere die Vererbung und die komplexe Aktionsauswahl, sind das Kernstück der Simulations-Engine.

**Spezifisches Beispiel: Genom-Vererbung bei Babys**

Die Frage nach der Vererbung von Genen ist ein exzellentes Beispiel. Die Logik befindet sich in der Datei `services/simulation.ts` innerhalb der Funktion `inheritGenome`. Der Prozess läuft wie folgt ab:
1.  **Kombination:** Die Genome beider Elternteile werden zu einem gemeinsamen Genpool zusammengefügt, wobei Duplikate entfernt werden.
2.  **Auswahl:** Das Kind erbt etwa die Hälfte der Gene aus diesem kombinierten Pool, zufällig ausgewählt.
3.  **Mutation:** Es gibt eine kleine Wahrscheinlichkeit (`MUTATION_RATE`), dass ein vererbtes Gen zu einem zufälligen anderen Gen aus der Liste aller möglichen Genome (`GENOME_OPTIONS`) mutiert.
4.  **Eindeutigkeit:** Das System stellt sicher, dass das Kind am Ende keine doppelten Gene hat.

Ähnliche, klar definierte Funktionen (`inheritPersonality`, `inheritPsyche`) existieren für die Vererbung psychologischer Merkmale.

**Wo findet man die Entscheidungslogik?**

Die gesamte Logik, die das emergente Verhalten steuert (warum ein Agent kämpft, wählt oder eine ungelernte Fähigkeit ausprobiert), ist in der Funktion `chooseAction` in `services/simulation.ts` zentralisiert. Dort werden die in Abschnitt 2 beschriebenen Punktzahlen für jede mögliche Aktion berechnet.

## 5. Fazit: Die Illusion des freien Willens

Das Verhalten der Agenten ist das Ergebnis eines komplexen, aber deterministischen Systems. Es gibt keinen "echten" freien Willens, sondern eine Kaskade von Berechnungen, die auf Dutzenden von internen und externen Variablen basieren.

Die Illusion von Spontaneität und Persönlichkeit entsteht durch die schiere Komplexität dieses Zusammenspiels. Das Ereignisprotokoll (`Event Log`) kratzt nur an der Oberfläche. Um wirklich zu verstehen, warum ein Agent eine bestimmte Entscheidung getroffen hat, muss man seinen **vollständigen Zustand zum Zeitpunkt der Entscheidung** betrachten: seine Bedürfnisse, seine Persönlichkeit, seine Psyche, seine Ziele, seine Beziehungen und die kleine Prise Zufall, die ihn manchmal auf unerwartete Pfade führt. Die Agentenkarte (`Agent Card`) ist daher das wichtigste Werkzeug, um die verborgene Logik hinter dem emergenten Verhalten zu entschlüsseln.