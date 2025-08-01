# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
RealitySim KI: Wo virtuelle Welten lebendig werden – Ein Blick hinter die Kulissen von Ralf Krümmel
Hallo liebe Simulations-Enthusiasten und KI-Interessierte! Ralf Krümmel hier, der Entwickler von RealitySim KI. Heute möchte ich Sie auf eine spannende Reise mitnehmen, um Ihnen mein Herzensprojekt vorzustellen: RealitySim KI. Stellen Sie sich eine Welt vor, in der KI-Agenten nicht nur Befehle ausführen, sondern wirklich leben, fühlen, interagieren und sich entwickeln. Genau das ist die Vision hinter RealitySim KI – eine interaktive, webbasierte Simulationsumgebung, die das emergente Verhalten von KI-Agenten in einer dynamischen Welt modelliert und visualisiert.

Was ist RealitySim KI überhaupt?
RealitySim KI ist mehr als nur eine Software; es ist ein lebendiges Ökosystem. Mein Hauptziel war es, komplexe adaptive Systeme zugänglich zu machen und Ihnen die Interaktion mit ihnen zu ermöglichen. In dieser Umgebung interagieren Agenten mit einzigartigen Überzeugungen und Erinnerungen mit ihrer Umgebung und anderen Agenten, was zu faszinierenden gesellschaftlichen, sozialen und sogar religiösen Konsequenzen führen kann. Das Besondere daran? Wir kombinieren eine intuitive Benutzeroberfläche mit der Leistungsfähigkeit lokal gehosteter Large Language Models (LLMs) für dynamische Inhalte und die Steuerung von Agenten durch natürliche Sprache. Das schafft eine Plattform, die sowohl forschungsfreundlich als auch faszinierend zu beobachten ist. (Siehe auch: "Whitepaper: RealitySim KI – Eine Interaktive Simulationsumgebung für KI-Agenten", Abschnitt 2, 6)

Das Herzstück: Unsere KI-Agenten
Die Agenten sind die Seele von RealitySim KI. Sie sind hochentwickelte KI-Entitäten mit einer Vielzahl interner Zustände, die ihr Verhalten auf komplexe Weise beeinflussen:

Überzeugungsnetzwerke (Beliefs): Jeder Agent besitzt individuelle, quantifizierbare Überzeugungssysteme (z.B. {"weather_sunny":0.7, "progress_good":0.8}), die seine Entscheidungen langfristig prägen. ("RealitySim KI: Agenten erstellen und anpassen", Abschnitt 3)
Emotionen und Dispositionen: Kurzlebige "situative Emotionen" (Freude, Traurigkeit, Wut) und langfristig erlernte "Dispositionen" (Vertrauen, Wut gegenüber anderen Agenten) entwickeln sich dynamisch durch Interaktionen. Jede Interaktion, insbesondere Gespräche, beeinflusst den "Beziehungswert" (von 0 für Hass bis 100 für Liebe) und diese Dispositionen. ("Interaktion und Beziehungen von KI-Agenten in RealitySim", Abschnitt 2)
Resonanz: Dieser Wert zeigt, welche Aktionen der Agent in letzter Zeit bevorzugt hat – eine Art innerer Kompass für seine aktuellen Neigungen. ("Dokumentation.md", Abschnitt 3)
Soziales Gedächtnis: Agenten protokollieren wichtige vergangene Interaktionen und deren emotionalen Einfluss. Das ist entscheidend für die Entwicklung dynamischer Beziehungen. ("Whitepaper: RealitySim KI", Abschnitt 7.1)
Genom: Eine Liste genetischer Marker, die passive Boni verleihen, wie G-AGILE für schnellere Bewegung oder G-FERTILE für erhöhte Fortpflanzungschancen. Diese Gene machen jeden Agenten einzigartig und beeinflussen seine Lebensweise. ("RealitySim KI: Agenten erstellen und anpassen", Abschnitt 3)
Unsere Agenten durchlaufen zudem verschiedene Lebensphasen (Kind, Jugendlicher, Erwachsener, Ältester) und können gesellschaftliche Rollen wie 'Worker', 'Healer', 'Scientist' oder 'Leader' einnehmen. Bestimmte Aktionen sind rollenspezifisch; nur ein Heiler kann beispielsweise andere Agenten heilen. ("RealitySim KI: Leben, Konflikte und Dynamiken", Abschnitt 4)

Leben und Überleben in der simulierten Welt
RealitySim KI bildet ein echtes Ökosystem ab, in dem Agenten ums Überleben kämpfen müssen. Das bedeutet:

Grundbedürfnisse: Hunger, Durst und Müdigkeit sind überlebenswichtige Statuswerte. Erreichen Hunger oder Durst den Wert 100, verlieren Agenten Gesundheit und können sterben. Die KI priorisiert die Befriedigung dieser Bedürfnisse: Ein sehr durstiger Agent ignoriert beispielsweise alles andere, um Wasser zu finden. ("RealitySim KI: Leben, Konflikte und Dynamiken", Abschnitt 4)
Ressourcenmanagement: Die Welt ist voller Ressourcen wie Beerensträucher (Nahrung), Quellen (Wasser) oder Wälder (Holz). Agenten sammeln diese und verwalten sie in ihrem Inventar, um zu überleben. ("RealitySim KI: Ökosystem, Gesellschaft und Beziehungen", Abschnitt 1)
Krankheit und Heilung: Agenten können krank werden und Gesundheit verlieren. Heilung erfolgt durch "Ausruhen" oder die Hilfe eines 'Heiler'-Agenten.
Unterkünfte bauen: Mit 10 Holz können Agenten eine "Unterkunft bauen", was ihnen Schutz und einen Ort zum Ausruhen bietet. ("RealitySim KI: Leben, Konflikte und Dynamiken", Abschnitt 2)
Ein Spiegel der Gesellschaft: Soziale Dynamiken
Das vielleicht aufregendste Element von RealitySim KI sind die komplexen sozialen und gesellschaftlichen Interaktionen, die sich organisch entwickeln:

Autonome Kommunikation: Agenten führen "richtige Gespräche", die von ihrem lokalen KI-Modell gesteuert werden. Dialog und Aktionen basieren auf Persönlichkeit, Rolle, Bedürfnissen, Emotionen und der Beziehung zum Gesprächspartner. Gespräche erhöhen den Beziehungswert um 5 Punkte pro Runde und können das Vertrauen steigern. ("Interaktion und Beziehungen von KI-Agenten in RealitySim", Abschnitt 1, 2)
Beziehungen und Gefühle: Beziehungen haben einen numerischen "Beziehungswert" (0-100) und langfristige "Dispositionen". Diese entwickeln sich organisch. Ein monogames Ehesystem ist modelliert, und Agenten können heiraten, wenn Liebe und Vertrauen hoch genug sind. Das System erzwingt keine spezifische sexuelle Orientierung; Beziehungen können zwischen beliebigen Agenten entstehen. ("Fortpflanzung und Beziehungen in RealitySim KI", Abschnitt 3, 4)
Fortpflanzung: Ja, Agenten können Kinder bekommen! Unter bestimmten Voraussetzungen (fortpflanzungsfähiges Alter, Partner, max. zwei Nachkommen) können sie die Aktion "Fortpflanzen" ausführen. Neugeborene erben Gene beider Elternteile mit einer geringen Mutationsrate. ("Fortpflanzung und Beziehungen in RealitySim KI", Abschnitt 1)
Konflikte: Auch wenn kein ausgewachsener Krieg simuliert wird, gibt es Mechanismen für direkte Aggression durch die "Fight"-Aktion, die zu Gesundheitsverlust und drastischer Verschlechterung der Beziehung führt. Fällt der Beziehungswert unter 10, wird der Typ auf "Rivale" gesetzt. ("RealitySim KI: Leben, Konflikte und Dynamiken", Abschnitt 3)
Kulturen und Religionen: Agenten können Kulturen (z.B. 'Utopian Technocrats') und Religionen (z.B. 'Technotheism') angehören, die ihre geteilten Überzeugungen und Verhaltensweisen beeinflussen. Mechanismen wie "kulturelle Assimilation", "Beten", "Missionieren" und "Konvertieren" tragen zur Entwicklung komplexer gesellschaftlicher Strukturen bei. Anführer können sogar "exkommunizieren". ("RealitySim KI: Ökosystem, Gesellschaft und Beziehungen", Abschnitt 2, 4)
Sie sind der Schöpfer: Ihre Rolle als Admin
Eine meiner Lieblingsfunktionen ist der spezielle "Admin"-Agent, den Sie steuern können. Dieser Agent (ID: agent-admin) besitzt "gottähnliche" Fähigkeiten und ist von den üblichen Simulationsmechanismen ausgenommen. Über das "Admin-Kontrollzentrum" können Sie als Admin-Agent:

Globale Umgebungsparameter ändern: Zeit, Wetter, Weltgröße – Sie haben die Kontrolle.
Weltregeln definieren: Erstellen oder löschen Sie benutzerdefinierte Aktionen, um die Spielregeln der Welt zu ändern.
Andere Agenten direkt verwalten: Gesundheit setzen, Krankheiten zufügen/heilen, Position ändern oder sogar verstorbene Agenten wiederbeleben! ("Der allmächtige Admin-Agent in RealitySim", Abschnitt 3)
Zudem können Sie neue Agenten manuell erstellen, ihnen Befehle in natürlicher Sprache geben und den gesamten Zustand der Simulation als JSON-Datei speichern und laden. So können Sie Ihre Welten sichern und jederzeit wiederherstellen. ("Dokumentation.md", Abschnitt 7)

Warum lokal? Unsere technische Philosophie
Ein zentraler Pfeiler von RealitySim KI ist die lokale KI-Verarbeitung über LM Studio. Das ist keine Nebensächlichkeit, sondern eine bewusste Entscheidung. Es bedeutet, dass die gesamte intelligente Funktionalität – von der Weltgenerierung über die Interpretation Ihrer Anweisungen bis hin zur autonomen Agenten-Kommunikation – auf Ihrem eigenen Rechner abläuft. "Es findet keine Kommunikation mit externen KI-Diensten (wie z.B. Gemini oder OpenAI) statt." ("Dokumentation.md", Abschnitt 1.2; "Whitepaper: RealitySim KI", Abschnitt 6, 7.2)

Das bietet immense Vorteile:

Datenschutz: Ihre Daten und Simulationen bleiben privat.
Kostenkontrolle: Keine teuren Cloud-API-Gebühren.
Flexibilität: Sie können das KI-Modell wählen und konfigurieren, das am besten zu Ihren Bedürfnissen passt.
Die Anwendung ist als Single-Page-Application (SPA) auf Basis von React konzipiert, mit einer modularen Architektur. Und falls Sie mal auf "Verbindung zu LM Studio fehlgeschlagen" stoßen, keine Sorge: Meistens liegt es an CORS-Problemen, die sich leicht beheben lassen (einfach CORS in LM Studio aktivieren!). ("Dokumentation.md", Abschnitt 8.1)

Das Herzstück der Simulation ist jedoch das emergente Verhalten. Die komplexen Wechselwirkungen zwischen Bedürfnissen, Emotionen, Genen, Beziehungen, Rollen, Kultur und Religion führen zu unvorhersehbaren und oft erstaunlich realistischen Verhaltensweisen der Agenten und der Welt. Das ist es, was RealitySim KI so fesselnd macht.

Fazit: Tauchen Sie ein in Ihre eigene simulierte Realität!
Ich hoffe, dieser Einblick hat Ihnen die Faszination von RealitySim KI nähergebracht. Es ist ein Projekt, das die Grenzen dessen, was wir mit KI-Simulationen erreichen können, immer weiter ausloten möchte. Ich lade Sie herzlich ein, selbst in diese dynamischen Welten einzutauchen, Ihre eigenen Experimente durchzuführen und zu beobachten, wie sich Leben und Gesellschaft unter Ihren Augen entfalten. Die Möglichkeiten sind grenzenlos!
