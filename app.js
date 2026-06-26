/* ============================================================
   xpong — app.js
   i18n engine + chrome (header/footer) + theme + nav
   ============================================================ */
(function () {
  'use strict';

  var XP_VERSION = 's07';
  var XP_VERSION_DATE = '25 Jun 2026';

  // Nav model (shared across pages). soon=true -> disabled, coming-soon badge
  var NAV = [
    { id: 'home',      href: 'index.html',     key: 'nav_home' },
    { id: 'about',     href: 'about.html',     key: 'nav_about' },
    { id: 'game',      href: 'game.html',      key: 'nav_game' },
    { id: 'xray',      href: 'xray.html',      key: 'nav_xray',      soon: true },
    { id: 'stab',      href: 'stab.html',      key: 'nav_stab',      soon: true },
    { id: 'evolution', href: 'evolution.html', key: 'nav_evolution', soon: true }
  ];

  // UI languages (dropdown order). sr renders from sr.cyr
  var LANGS = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'it', label: 'IT' },
    { code: 'hr', label: 'HR' },
    { code: 'sr', label: 'SR' }
  ];

  // Translations. sr nested by script so sr.lat can be added additively later.
  var T = {
    en: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'Training AI agents to play Pong — with the lights on.',
      hero_desc: 'xpong is a browser lab for reinforcement learning, built page by page as a window into how an agent learns. Classic Pong first; then the inner state made visible.',
      nav_home: 'Home', nav_about: 'About', nav_game: 'The Game', nav_xray: 'X-Ray',
      nav_stab: 'Stabilization', nav_evolution: 'Evolution',
      soon: 'coming soon',
      g_title: 'The Game — classic Pong',
      g_left: 'Left',
      g_right: 'Right',
      g_start: 'Start',
      g_pause: 'Pause',
      g_again: 'Play again',
      g_reset: 'Reset',
      g_start_hint: 'Press Space or tap to start',
      g_serve_hint: 'Press Space or tap to serve',
      g_wins: 'wins!',
      g_legend_left: 'Left player',
      g_legend_right: 'Right player',
      g_up: 'up',
      g_down: 'down',
      g_touch_left: 'or drag on the left half (touch)',
      g_touch_right: 'or drag on the right half (touch)',
      footer: 'xpong · an X-Ray project',

      ab_title: 'xpong — from two lines to a billion parameters',
      ab_h1: 'A game that never changed',
      ab_p1a: 'In 1972, Atari released a game so simple that anyone could understand it before reading a single instruction. Two lines on the sides, a dot bouncing between them, and one task: don\'t let it get past you. Pong.',
      ab_p1b: 'Many still remember it — the first game they ever saw, glowing on a television set, with a sound like a heartbeat. Fifty years later, that game looks almost the same. Two lines, a dot, a bounce. Show it to someone who has never seen it, and they grasp it in three seconds.',
      ab_p1c: 'And yet — beneath that unchanged surface, everything changed. What decides how the game behaves has travelled from a handful of electronic circuits to systems with billions of parameters. Outside: two lines. Inside: half a century of computing. This page is about that inside — and about one thing that, through all those decades, stayed the same.',
      ab_h2: '1972: logic in the circuits',
      ab_p2a: 'The first Pong had no software in the sense we mean today. There was no program running, no code anyone could read. The game was driven by an assembly of electronic components — logic circuits that, through wire and current, computed where the ball was and how it moved.',
      ab_p2b: 'For the player, the difference wasn\'t visible. They saw the result: the ball goes there, the paddle follows. They didn\'t see — and couldn\'t see — <em>how</em> the machine arrived at it. It was the first black box of its kind: a device that works perfectly while its inner workings stay hidden from whoever uses it.',
      ab_p2c: 'So already in 1972, the pattern was set that we will follow to the end of this story.',
      ab_h3: 'Rules that someone wrote',
      ab_p3a: 'As computers became real computers, the opponent in Pong came to be driven by a program — a set of explicit rules. <em>If the ball is above the paddle, move up. If below, move down.</em> Simple, readable, predictable.',
      ab_p3b: 'Here an interesting divide appears. The person who wrote those rules could read them and know exactly why the opponent behaves as it does. To them, the machine was not a black box — it was transparent. But to the player on the other side of the screen, nothing had changed. They still see only the result.',
      ab_p3c: 'That is an important nuance: opacity is not a property of the machine itself, but of the relationship. The same system is transparent to the one who built it, and closed to the one who merely uses it.',
      ab_h4: 'A machine that learns on its own',
      ab_p4a: 'The next step changes everything. Instead of writing rules for <em>how</em> to play, you write a program that <em>learns to play</em>. This is not a small difference — it is a different kind of system.',
      ab_p4b: 'In our previous Pong project we built exactly such an agent. We didn\'t tell it “follow the ball.” We told it only: keep trying, and when you win, remember what led to the win. The agent played against itself, thousands of times, building a vast table of values — an estimate of how good each move is in each situation. That technique is called Q-learning.',
      ab_p4c: 'And here something new happens. Look at the finished agent and ask “why did it move the paddle right there,” and the answer is no longer in some rule you can read. It is scattered across tens of thousands of numbers in a table, ground smooth over countless games. Even the author cannot easily unpack it. For the first time, the black box has closed even to the one who made it.',
      ab_h5: 'Deeper into the fog',
      ab_p5a: 'A table of values has a limit: it works while the situation is simple enough to be listed out. For more complex problems, a neural network replaces the table — and the fog thickens. That technique is called DQN, a deep Q-network. With it comes a phenomenon that is at once the most beautiful and the most unsettling side of this work.',
      ab_p5b: 'In the self-play phase, the agent begins to develop strategies no one gave it. In our Pong, the agent didn\'t just learn to return the ball — it learned to set traps, to deliberately drive the opponent into corners, to use the edges of the field. Those strategies were written nowhere. They <em>emerged</em>, arising on their own from the process of learning. Order that nobody programmed. That is the moment a system stops being merely a tool that executes and becomes something that produces behaviour we must observe to understand — because we cannot read it in advance.',
      ab_h6: 'All the way to large language models',
      ab_p6a: 'Follow this line far enough and you arrive at today\'s large language models — LLMs. The same principle as the agent learning Pong, only instead of a table or a small network, the system has billions of parameters and an architecture called a transformer. These models write text, translate languages, hold a conversation — and yes, they could learn to play Pong too.',
      ab_p6b: 'The leap in power is enormous. But that same trait we\'ve been tracking since 1972 has not vanished — on the contrary, it has never been more pronounced. No one, including the people who built the model, can point to exactly <em>why</em> it gave that particular answer. The most powerful software we have ever built is at the same time the most opaque.',
      ab_h7: 'The common thread: X-Ray',
      ab_p7a: 'Now let\'s return to the beginning. From the logic circuits of 1972, through readable rules, to tables, networks, and billions of parameters — the technology changed, the power changed, the mathematics changed. But one thing stayed the same across all five decades: <em>you cannot see how the software works inside.</em>',
      ab_p7b: 'xpong exists because of that one thing. Not to abolish the black box — that cannot be done — but to build windows into it. Through the same prehistoric game, Pong, I show what happens <em>inside</em> the agent as it learns: a heatmap of where it pays attention, real-time ball telemetry, the numbers with which it judges every possible move. I don\'t remove the fog. I light it up, layer by layer.',
      ab_p7c: 'That attitude has a name — X-Ray — and older roots than you might think. Aboriginal painters of Australia have for thousands of years depicted animals with their bones and organs visible from within, not just the skin outside. The punk musician Joe Strummer sang in 1999 that he wanted to see “in an x-ray style” — as an act of refusing to accept what is handed to him as settled fact. The same idea, the same resistance to opacity. xpong is that attitude applied to one game with two lines and a dot — the simplest possible entry into the biggest question of modern technology.',

      ab_side_project: 'Project info',
      ab_side_status: 'Status',
      ab_side_status_v: 'M0 — landing',
      ab_side_build: 'Build',
      ab_side_build_v: 'static, no build step',
      ab_side_verify: 'Verify, not fiction',
      ab_side_verify_text: 'Every concept in this text — from Aboriginal x-ray art to the transformer — is linked to Wikipedia. This is not decoration. The ideas I speak of are not invented for the sake of this project; they are documented, public, and verifiable. I don\'t ask you to take my word — follow the link and check for yourself.<br><br>This is the X-Ray attitude turned on the text itself: just as I light up what the agent does inside, I open up where my ideas come from.',
      ab_side_auth: 'Authorship & Collaboration',
      ab_side_auth_text: 'xpong is conceived, designed and maintained by <strong>Flavio</strong> (fladroid). The project\'s philosophy, methodology, architecture and all final design decisions are his — and remain his sole responsibility.<br><br>The project is built in ongoing collaboration with <strong><a href=\'https://claude.ai\' target=\'_blank\'>Claude</a></strong> (Anthropic) — not as a code-completion tool, but as a working partner across documented sessions: implementation, debugging, analysis, and the conceptual dialogue that shaped this very page. Every session is recorded in <code>docs/sessions/</code>, where both names appear — a deliberate choice, in the spirit of this project\'s X-Ray attitude: the process of building should be as transparent as the thing built.<br><br><em>Flavio &amp; Claude · xpong · 2026</em>',
    },
    de: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'KI-Agenten lernen Pong — bei eingeschaltetem Licht.',
      hero_desc: 'xpong ist ein Browser-Labor für Reinforcement Learning, Seite für Seite gebaut als Fenster in das Lernen eines Agenten. Zuerst klassisches Pong; dann der innere Zustand, sichtbar gemacht.',
      nav_home: 'Start', nav_about: 'Über', nav_game: 'Das Spiel', nav_xray: 'X-Ray',
      nav_stab: 'Stabilisierung', nav_evolution: 'Evolution',
      soon: 'in Kürze',
      g_title: 'Das Spiel — klassisches Pong',
      g_left: 'Links',
      g_right: 'Rechts',
      g_start: 'Start',
      g_pause: 'Pause',
      g_again: 'Nochmal',
      g_reset: 'Zurücksetzen',
      g_start_hint: 'Leertaste oder tippen zum Starten',
      g_serve_hint: 'Leertaste oder tippen für Aufschlag',
      g_wins: 'gewinnt!',
      g_legend_left: 'Spieler links',
      g_legend_right: 'Spieler rechts',
      g_up: 'hoch',
      g_down: 'runter',
      g_touch_left: 'oder links wischen (Touch)',
      g_touch_right: 'oder rechts wischen (Touch)',
      footer: 'xpong · ein X-Ray-Projekt',

      ab_title: "xpong — von zwei Strichen zu einer Milliarde Parametern",
      ab_h1: "Ein Spiel, das sich nie verändert hat",
      ab_p1a: "1972 brachte Atari ein Spiel heraus, so einfach, dass es jeder verstehen konnte, bevor er auch nur eine einzige Anleitung gelesen hatte. Zwei Striche an den Seiten, ein Punkt, der zwischen ihnen hin und her springt, und eine Aufgabe: lass ihn nicht an dir vorbei. Pong.",
      ab_p1b: "Viele erinnern sich noch daran — das erste Spiel, das sie je gesehen haben, leuchtend auf einem Fernseher, mit einem Ton wie ein Herzschlag. Fünfzig Jahre später sieht dieses Spiel fast genauso aus. Zwei Striche, ein Punkt, ein Abprallen. Zeigen Sie es jemandem, der es nie gesehen hat, und er begreift es in drei Sekunden.",
      ab_p1c: "Und doch — unter dieser unveränderten Oberfläche hat sich alles verändert. Was darüber entscheidet, wie sich das Spiel verhält, hat einen Weg von einer Handvoll elektronischer Schaltkreise bis zu Systemen mit Milliarden von Parametern zurückgelegt. Außen: zwei Striche. Innen: ein halbes Jahrhundert Informatik. Diese Seite handelt von diesem Innen — und von einer Sache, die über all diese Jahrzehnte gleich geblieben ist.",
      ab_h2: "1972: Logik in den Schaltkreisen",
      ab_p2a: "Das erste Pong hatte keine Software in dem Sinne, wie wir heute Software verstehen. Es gab kein laufendes Programm, keinen Code, den jemand lesen konnte. Das Spiel wurde von einer Ansammlung elektronischer Bauteile gesteuert — Logikschaltungen, die mit Draht und Strom berechneten, wo der Ball war und wie er sich bewegte.",
      ab_p2b: "Für den Spieler war der Unterschied nicht sichtbar. Er sah das Ergebnis: der Ball geht dorthin, der Schläger folgt. Er sah nicht — und konnte nicht sehen — <em>wie</em> die Maschine dazu gelangte. Es war die erste Blackbox ihrer Art: ein Gerät, das perfekt funktioniert, während sein Innenleben demjenigen verborgen bleibt, der es benutzt.",
      ab_p2c: "Schon 1972 war also das Muster gesetzt, dem wir bis zum Ende dieser Geschichte folgen werden.",
      ab_h3: "Regeln, die jemand geschrieben hat",
      ab_p3a: "Als Computer zu echten Computern wurden, kam der Gegner in Pong von einem Programm gesteuert — einer Reihe expliziter Regeln. <em>Ist der Ball über dem Schläger, beweg dich nach oben. Ist er darunter, nach unten.</em> Einfach, lesbar, vorhersehbar.",
      ab_p3b: "Hier zeigt sich eine interessante Trennung. Wer diese Regeln geschrieben hatte, konnte sie lesen und genau wissen, warum sich der Gegner so verhält, wie er es tut. Für ihn war die Maschine keine Blackbox — sie war durchsichtig. Aber für den Spieler auf der anderen Seite des Bildschirms hatte sich nichts geändert. Er sieht weiterhin nur das Ergebnis.",
      ab_p3c: "Das ist eine wichtige Nuance: Undurchsichtigkeit ist keine Eigenschaft der Maschine selbst, sondern der Beziehung. Dasselbe System ist durchsichtig für den, der es gebaut hat, und verschlossen für den, der es bloß benutzt.",
      ab_h4: "Eine Maschine, die von selbst lernt",
      ab_p4a: "Der nächste Schritt verändert alles. Statt Regeln zu schreiben, <em>wie</em> gespielt wird, schreibt man ein Programm, das <em>spielen lernt</em>. Das ist kein kleiner Unterschied — es ist eine andere Art von System.",
      ab_p4b: "In unserem vorherigen Pong-Projekt haben wir genau einen solchen Agenten gebaut. Wir sagten ihm nicht „folge dem Ball“. Wir sagten ihm nur: versuche es weiter, und wenn du gewinnst, merke dir, was zum Sieg geführt hat. Der Agent spielte tausende Male gegen sich selbst und baute dabei eine riesige Wertetabelle auf — eine Schätzung, wie gut jeder Zug in jeder Situation ist. Diese Technik heißt Q-learning.",
      ab_p4c: "Und hier geschieht etwas Neues. Betrachtet man den fertigen Agenten und fragt „warum hat er den Schläger genau dort bewegt“, liegt die Antwort nicht mehr in einer Regel, die man lesen kann. Sie ist über zehntausende Zahlen in einer Tabelle verstreut, geschliffen über unzählige Partien. Selbst der Autor kann sie nicht leicht entschlüsseln. Zum ersten Mal hat sich die Blackbox auch vor dem geschlossen, der sie gemacht hat.",
      ab_h5: "Tiefer in den Nebel",
      ab_p5a: "Eine Wertetabelle hat eine Grenze: sie funktioniert, solange die Situation einfach genug ist, um aufgelistet zu werden. Für komplexere Probleme ersetzt ein neuronales Netz die Tabelle — und der Nebel verdichtet sich. Diese Technik heißt DQN, ein Deep Q-Network. Mit ihr kommt ein Phänomen, das zugleich die schönste und die beunruhigendste Seite dieser Arbeit ist.",
      ab_p5b: "In der Self-Play-Phase beginnt der Agent, Strategien zu entwickeln, die ihm niemand vorgegeben hat. In unserem Pong lernte der Agent nicht nur, den Ball zurückzuspielen — er lernte, Fallen zu stellen, den Gegner gezielt in die Ecken zu treiben, die Ränder des Feldes zu nutzen. Diese Strategien standen nirgendwo geschrieben. Sie <em>emergierten</em>, entstanden von selbst aus dem Lernprozess. Ordnung, die niemand programmiert hat. Das ist der Moment, in dem ein System aufhört, bloß ein ausführendes Werkzeug zu sein, und zu etwas wird, das Verhalten hervorbringt, das wir beobachten müssen, um es zu verstehen — weil wir es nicht im Voraus lesen können.",
      ab_h6: "Bis hin zu den großen Sprachmodellen",
      ab_p6a: "Folgt man dieser Linie weit genug, gelangt man zu den heutigen großen Sprachmodellen — LLMs. Dasselbe Prinzip wie beim Agenten, der Pong lernt, nur dass das System statt einer Tabelle oder eines kleinen Netzes Milliarden von Parametern und eine Architektur namens Transformer besitzt. Diese Modelle schreiben Text, übersetzen Sprachen, führen ein Gespräch — und ja, sie könnten auch lernen, Pong zu spielen.",
      ab_p6b: "Der Sprung an Leistungsfähigkeit ist enorm. Doch dieselbe Eigenschaft, die wir seit 1972 verfolgen, ist nicht verschwunden — im Gegenteil, sie war nie ausgeprägter. Niemand, auch nicht die Menschen, die das Modell gebaut haben, kann genau angeben, <em>warum</em> es diese bestimmte Antwort gegeben hat. Die mächtigste Software, die wir je gebaut haben, ist zugleich die undurchsichtigste.",
      ab_h7: "Der gemeinsame Faden: X-Ray",
      ab_p7a: "Kehren wir nun zum Anfang zurück. Von den Logikschaltungen von 1972 über lesbare Regeln bis zu Tabellen, Netzen und Milliarden von Parametern — die Technologie änderte sich, die Leistungsfähigkeit änderte sich, die Mathematik änderte sich. Aber eines blieb über alle fünf Jahrzehnte gleich: <em>man sieht nicht, wie die Software im Inneren arbeitet.</em>",
      ab_p7b: "xpong existiert wegen dieser einen Sache. Nicht um die Blackbox abzuschaffen — das ist nicht möglich — sondern um Fenster in sie hinein zu bauen. Durch dasselbe urzeitliche Spiel, Pong, zeige ich, was <em>im Inneren</em> des Agenten geschieht, während er lernt: eine Heatmap, die zeigt, worauf er achtet, Echtzeit-Telemetrie des Balls, die Zahlen, mit denen er jeden möglichen Zug bewertet. Ich entferne den Nebel nicht. Ich leuchte ihn aus, Schicht für Schicht.",
      ab_p7c: "Diese Haltung hat einen Namen — X-Ray — und ältere Wurzeln, als man denken würde. Die Aborigine-Maler Australiens stellen seit Jahrtausenden Tiere mit von innen sichtbaren Knochen und Organen dar, nicht nur mit der Haut von außen. Der Punkmusiker Joe Strummer sang 1999, er wolle „in einem X-Ray-Stil“ sehen — als Akt der Weigerung, das als gegebene Tatsache hinzunehmen, was man ihm vorsetzt. Dieselbe Idee, derselbe Widerstand gegen Undurchsichtigkeit. xpong ist diese Haltung, angewandt auf ein Spiel mit zwei Strichen und einem Punkt — der einfachste mögliche Einstieg in die größte Frage der modernen Technik.",
      ab_side_project: "Projektinfo",
      ab_side_status: "Status",
      ab_side_status_v: "M0 — Landing",
      ab_side_build: "Build",
      ab_side_build_v: "statisch, ohne Build-Schritt",
      ab_side_verify: "Prüfen, nicht erfinden",
      ab_side_verify_text: "Jeder Begriff in diesem Text — von der Aborigine-Röntgenkunst bis zum Transformer — ist mit Wikipedia verlinkt. Das ist keine Dekoration. Die Ideen, von denen ich spreche, sind nicht für dieses Projekt erfunden; sie sind dokumentiert, öffentlich und überprüfbar. Ich bitte dich nicht, mir aufs Wort zu glauben — folge dem Link und überprüfe es selbst.<br><br>Das ist die X-Ray-Haltung, auf den Text selbst gerichtet: so wie ich ausleuchte, was der Agent im Inneren tut, lege ich offen, woher meine Ideen kommen.",
      ab_side_auth: "Urheberschaft & Zusammenarbeit",
      ab_side_auth_text: "xpong ist konzipiert, gestaltet und gepflegt von <strong>Flavio</strong> (fladroid). Die Philosophie, Methodik, Architektur und alle endgültigen Designentscheidungen des Projekts sind seine — und bleiben seine alleinige Verantwortung.<br><br>Das Projekt wird in fortlaufender Zusammenarbeit mit <strong><a href='https://claude.ai' target='_blank'>Claude</a></strong> (Anthropic) aufgebaut — nicht als Werkzeug zur Code-Vervollständigung, sondern als Arbeitspartner über dokumentierte Sessions hinweg: Implementierung, Debugging, Analyse und der konzeptionelle Dialog, der eben diese Seite geprägt hat. Jede Session wird in <code>docs/sessions/</code> festgehalten, wo beide Namen erscheinen — eine bewusste Entscheidung, im Geiste der X-Ray-Haltung dieses Projekts: der Prozess des Bauens soll so durchsichtig sein wie das Gebaute.<br><br><em>Flavio & Claude · xpong · 2026</em>",
    },
    it: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'Addestrare agenti IA a giocare a Pong — a luci accese.',
      hero_desc: 'xpong è un laboratorio nel browser per il reinforcement learning, costruito pagina per pagina come una finestra su come un agente impara. Prima il Pong classico; poi lo stato interno reso visibile.',
      nav_home: 'Home', nav_about: 'Info', nav_game: 'Il gioco', nav_xray: 'X-Ray',
      nav_stab: 'Stabilizzazione', nav_evolution: 'Evoluzione',
      soon: 'in arrivo',
      g_title: 'Il gioco — Pong classico',
      g_left: 'Sinistra',
      g_right: 'Destra',
      g_start: 'Avvia',
      g_pause: 'Pausa',
      g_again: 'Rigioca',
      g_reset: 'Reimposta',
      g_start_hint: 'Premi Spazio o tocca per iniziare',
      g_serve_hint: 'Premi Spazio o tocca per servire',
      g_wins: 'vince!',
      g_legend_left: 'Giocatore sinistro',
      g_legend_right: 'Giocatore destro',
      g_up: 'su',
      g_down: 'giù',
      g_touch_left: 'o trascina sulla metà sinistra (touch)',
      g_touch_right: 'o trascina sulla metà destra (touch)',
      footer: 'xpong · un progetto X-Ray',

      ab_title: "xpong — da due trattini a un miliardo di parametri",
      ab_h1: "Un gioco che non è mai cambiato",
      ab_p1a: "Nel 1972 Atari pubblicò un gioco così semplice che chiunque poteva capirlo prima ancora di leggere una sola istruzione. Due trattini ai lati, un puntino che rimbalza tra di essi, e un solo compito: non lasciarlo passare. Pong.",
      ab_p1b: "Molti lo ricordano ancora — il primo gioco che abbiano mai visto, luminoso su un televisore, con un suono simile a un battito. Cinquant'anni dopo, quel gioco ha quasi lo stesso aspetto. Due trattini, un puntino, un rimbalzo. Mostratelo a qualcuno che non l'ha mai visto, e lo capirà in tre secondi.",
      ab_p1c: "Eppure — sotto quella superficie immutata, tutto è cambiato. Ciò che decide come si comporta il gioco ha percorso una strada che va da una manciata di circuiti elettronici fino a sistemi con miliardi di parametri. Fuori: due trattini. Dentro: mezzo secolo di informatica. Questa pagina parla di quel dentro — e di una cosa che, attraverso tutti questi decenni, è rimasta uguale.",
      ab_h2: "1972: la logica nei circuiti",
      ab_p2a: "Il primo Pong non aveva software nel senso in cui lo intendiamo oggi. Non c'era alcun programma in esecuzione, nessun codice che qualcuno potesse leggere. Il gioco era guidato da un insieme di componenti elettronici — circuiti logici che, con filo e corrente, calcolavano dove fosse la palla e come si muovesse.",
      ab_p2b: "Per il giocatore, la differenza non era visibile. Vedeva il risultato: la palla va lì, la racchetta la segue. Non vedeva — né poteva vedere — <em>come</em> la macchina ci arrivasse. Era la prima scatola nera del suo genere: un dispositivo che funziona alla perfezione mentre il suo funzionamento interno resta nascosto a chi lo usa.",
      ab_p2c: "Già nel 1972, dunque, era stato fissato lo schema che seguiremo fino alla fine di questa storia.",
      ab_h3: "Regole che qualcuno ha scritto",
      ab_p3a: "Man mano che i computer diventavano veri computer, l'avversario in Pong cominciò a essere guidato da un programma — un insieme di regole esplicite. <em>Se la palla è sopra la racchetta, spostati in alto. Se è sotto, in basso.</em> Semplice, leggibile, prevedibile.",
      ab_p3b: "Qui compare una distinzione interessante. Chi aveva scritto quelle regole poteva leggerle e sapere esattamente perché l'avversario si comporta come si comporta. Per lui la macchina non era una scatola nera — era trasparente. Ma per il giocatore dall'altra parte dello schermo, nulla era cambiato. Continua a vedere solo il risultato.",
      ab_p3c: "È una sfumatura importante: l'opacità non è una proprietà della macchina in sé, ma della relazione. Lo stesso sistema è trasparente per chi l'ha costruito, e chiuso per chi si limita a usarlo.",
      ab_h4: "Una macchina che impara da sola",
      ab_p4a: "Il passo successivo cambia tutto. Invece di scrivere regole su <em>come</em> giocare, si scrive un programma che <em>impara a giocare</em>. Non è una piccola differenza — è un tipo di sistema diverso.",
      ab_p4b: "Nel nostro precedente progetto Pong abbiamo costruito proprio un agente di questo tipo. Non gli abbiamo detto «segui la palla». Gli abbiamo detto soltanto: continua a provare, e quando vinci, ricorda cosa ha portato alla vittoria. L'agente ha giocato contro se stesso, migliaia di volte, costruendo un'enorme tabella di valori — una stima di quanto sia buona ogni mossa in ogni situazione. Questa tecnica si chiama Q-learning.",
      ab_p4c: "E qui accade qualcosa di nuovo. Se osservate l'agente finito e chiedete «perché ha spostato la racchetta proprio lì», la risposta non è più in una regola che potete leggere. È sparsa tra decine di migliaia di numeri in una tabella, levigati attraverso innumerevoli partite. Nemmeno l'autore può decifrarla facilmente. Per la prima volta, la scatola nera si è chiusa anche di fronte a chi l'ha creata.",
      ab_h5: "Più in profondità nella nebbia",
      ab_p5a: "Una tabella di valori ha un limite: funziona finché la situazione è abbastanza semplice da poter essere elencata. Per problemi più complessi una rete neurale sostituisce la tabella — e la nebbia si infittisce. Questa tecnica si chiama DQN, una deep Q-network. Con essa arriva un fenomeno che è al tempo stesso il lato più bello e quello più inquietante di questo lavoro.",
      ab_p5b: "Nella fase di self-play, l'agente comincia a sviluppare strategie che nessuno gli ha dato. Nel nostro Pong, l'agente non ha solo imparato a rimandare la palla — ha imparato a tendere trappole, a spingere deliberatamente l'avversario negli angoli, a sfruttare i bordi del campo. Quelle strategie non erano scritte da nessuna parte. Sono <em>emerse</em>, sorte da sole dal processo di apprendimento. Ordine che nessuno ha programmato. È il momento in cui un sistema smette di essere un semplice strumento che esegue e diventa qualcosa che produce un comportamento che dobbiamo osservare per comprendere — perché non possiamo leggerlo in anticipo.",
      ab_h6: "Fino ai grandi modelli linguistici",
      ab_p6a: "Seguite questa linea abbastanza lontano e arrivate agli odierni grandi modelli linguistici — gli LLM. Lo stesso principio dell'agente che impara Pong, solo che invece di una tabella o di una piccola rete, il sistema ha miliardi di parametri e un'architettura chiamata transformer. Questi modelli scrivono testi, traducono lingue, sostengono una conversazione — e sì, potrebbero imparare anche a giocare a Pong.",
      ab_p6b: "Il salto di potenza è enorme. Ma quello stesso tratto che seguiamo dal 1972 non è scomparso — al contrario, non è mai stato così marcato. Nessuno, comprese le persone che hanno costruito il modello, può indicare esattamente <em>perché</em> abbia dato quella particolare risposta. Il software più potente che abbiamo mai costruito è al tempo stesso il più opaco.",
      ab_h7: "Il filo comune: X-Ray",
      ab_p7a: "Torniamo ora all'inizio. Dai circuiti logici del 1972, passando per le regole leggibili, fino a tabelle, reti e miliardi di parametri — la tecnologia è cambiata, la potenza è cambiata, la matematica è cambiata. Ma una cosa è rimasta uguale lungo tutti e cinque i decenni: <em>non si vede come funziona il software dentro.</em>",
      ab_p7b: "xpong esiste per questa unica cosa. Non per abolire la scatola nera — non si può — ma per aprire finestre al suo interno. Attraverso lo stesso gioco preistorico, Pong, mostro cosa accade <em>dentro</em> l'agente mentre impara: una heatmap che mostra dove rivolge l'attenzione, la telemetria della palla in tempo reale, i numeri con cui valuta ogni mossa possibile. Non rimuovo la nebbia. La illumino, strato dopo strato.",
      ab_p7c: "Questo atteggiamento ha un nome — X-Ray — e radici più antiche di quanto si pensi. I pittori aborigeni dell'Australia raffigurano da migliaia di anni gli animali con ossa e organi visibili dall'interno, non solo con la pelle esterna. Il musicista punk Joe Strummer cantava nel 1999 di voler vedere «in stile x-ray» — come atto di rifiuto di accettare ciò che gli viene servito come fatto acquisito. La stessa idea, la stessa resistenza all'opacità. xpong è quell'atteggiamento applicato a un gioco con due trattini e un puntino — l'ingresso più semplice possibile alla più grande domanda della tecnologia moderna.",
      ab_side_project: "Info progetto",
      ab_side_status: "Stato",
      ab_side_status_v: "M0 — landing",
      ab_side_build: "Build",
      ab_side_build_v: "statico, senza fase di build",
      ab_side_verify: "Verificare, non inventare",
      ab_side_verify_text: "Ogni concetto in questo testo — dall'arte aborigena a raggi X fino al transformer — è collegato a Wikipedia. Non è un ornamento. Le idee di cui parlo non sono inventate per le esigenze di questo progetto; sono documentate, pubbliche e verificabili. Non ti chiedo di credermi sulla parola — segui il link e verifica tu stesso.<br><br>È l'atteggiamento X-Ray rivolto al testo stesso: così come illumino ciò che l'agente fa dentro, apro anche da dove vengono le mie idee.",
      ab_side_auth: "Paternità e collaborazione",
      ab_side_auth_text: "xpong è concepito, progettato e mantenuto da <strong>Flavio</strong> (fladroid). La filosofia, la metodologia, l'architettura e tutte le decisioni finali di design del progetto sono sue — e restano sua esclusiva responsabilità.<br><br>Il progetto è costruito in collaborazione continua con <strong><a href='https://claude.ai' target='_blank'>Claude</a></strong> (Anthropic) — non come strumento di completamento del codice, ma come partner di lavoro attraverso sessioni documentate: implementazione, debugging, analisi e il dialogo concettuale che ha plasmato proprio questa pagina. Ogni sessione è registrata in <code>docs/sessions/</code>, dove compaiono entrambi i nomi — una scelta deliberata, nello spirito dell'atteggiamento X-Ray di questo progetto: il processo di costruzione dev'essere trasparente quanto la cosa costruita.<br><br><em>Flavio & Claude · xpong · 2026</em>",
    },
    hr: {
      lab: 'Reinforcement Learning Lab',
      tagline: 'Treniranje AI agenata za Pong — uz upaljena svjetla.',
      hero_desc: 'xpong je laboratorij u pregledniku za reinforcement learning, građen stranicu po stranicu kao prozor u to kako agent uči. Najprije klasični Pong; zatim unutarnje stanje učinjeno vidljivim.',
      nav_home: 'Početna', nav_about: 'O projektu', nav_game: 'Igra', nav_xray: 'X-Ray',
      nav_stab: 'Stabilizacija', nav_evolution: 'Evolucija',
      soon: 'uskoro',
      g_title: 'Igra — klasični Pong',
      g_left: 'Lijevo',
      g_right: 'Desno',
      g_start: 'Pokreni',
      g_pause: 'Pauza',
      g_again: 'Igraj opet',
      g_reset: 'Poništi',
      g_start_hint: 'Pritisni razmak ili dodirni za početak',
      g_serve_hint: 'Pritisni razmak ili dodirni za servis',
      g_wins: 'pobjeđuje!',
      g_legend_left: 'Lijevi igrač',
      g_legend_right: 'Desni igrač',
      g_up: 'gore',
      g_down: 'dolje',
      g_touch_left: 'ili povuci po lijevoj polovini (touch)',
      g_touch_right: 'ili povuci po desnoj polovini (touch)',
      footer: 'xpong · X-Ray projekt',

      ab_title: "xpong — od dvije crtice do milijardu parametara",
      ab_h1: "Igra koja se nije promijenila",
      ab_p1a: "Godine 1972. Atari je izbacio igru tako jednostavnu da ju je svatko mogao razumjeti prije nego što je pročitao i jednu uputu. Dvije crtice sa strane, točkica koja se odbija između njih, i jedan zadatak: ne dopusti da prođe pored tebe. Pong.",
      ab_p1b: "Mnogi je se i danas sjećaju — prve igre koju su vidjeli, svjetlucave na televizoru, sa zvukom nalik na otkucaj. Pedeset godina kasnije, ta igra izgleda gotovo isto. Dvije crtice, točkica, odbijanje. Pokažite je nekome tko je nikad nije vidio, i shvatit će je za tri sekunde.",
      ab_p1c: "A ipak — ispod te nepromijenjene površine, sve se promijenilo. Ono što odlučuje kako se igra ponaša prešlo je put od nekoliko elektroničkih sklopova do sustava s milijardama parametara. Izvana: dvije crtice. Iznutra: pola stoljeća računarstva. Ova je stranica o tom „iznutra“ — i o jednoj stvari koja je, kroz sva ta desetljeća, ostala ista.",
      ab_h2: "1972.: logika u sklopovima",
      ab_p2a: "Prvi Pong nije imao softver u smislu u kojem danas mislimo na softver. Nije bilo programa koji se pokreće, ni koda koji bi netko mogao pročitati. Igru je vodio sklop elektroničkih komponenti — logički krugovi koji su, žicom i strujom, računali gdje je loptica i kako se kreće.",
      ab_p2b: "Za igrača, razlika nije bila vidljiva. Vidio je rezultat: loptica ide tamo, palica je prati. Nije vidio — niti je mogao vidjeti — <em>kako</em> stroj do toga dolazi. Bila je to prva crna kutija te vrste: uređaj koji radi savršeno, a čiji unutarnji rad ostaje skriven onome tko ga koristi.",
      ab_p2c: "Već 1972., dakle, postavljen je obrazac koji ćemo pratiti do kraja ove priče.",
      ab_h3: "Pravila koja je netko napisao",
      ab_p3a: "Kako su računala postajala prava računala, protivnika u Pongu počeo je voditi program — niz eksplicitnih pravila. <em>Ako je loptica iznad palice, pomakni se gore. Ako je ispod, pomakni se dolje.</em> Jednostavno, čitljivo, predvidljivo.",
      ab_p3b: "Ovdje se javlja zanimljiva podjela. Čovjek koji je napisao ta pravila mogao ih je pročitati i točno znati zašto se protivnik ponaša kako se ponaša. Za njega stroj nije bio crna kutija — bio je proziran. Ali za igrača s druge strane ekrana, ništa se nije promijenilo. On i dalje vidi samo rezultat.",
      ab_p3c: "To je važna nijansa: neprozirnost nije svojstvo samog stroja, nego odnosa. Isti je sustav proziran onome tko ga je sagradio, a zatvoren onome tko ga samo koristi.",
      ab_h4: "Stroj koji uči sam",
      ab_p4a: "Sljedeći korak mijenja sve. Umjesto da napiše pravila <em>kako</em> igrati, čovjek piše program koji <em>uči igrati</em>. Ovo nije sitna razlika — to je drukčija vrsta sustava.",
      ab_p4b: "U našem prethodnom Pong projektu izgradili smo upravo takvog agenta. Nismo mu rekli „prati lopticu“. Rekli smo mu samo: pokušavaj, i kad pobijediš, zapamti što je vodilo do pobjede. Agent je igrao sam protiv sebe, tisuće puta, graditeći golemu tablicu vrijednosti — procjenu koliko je svaki potez dobar u svakoj situaciji. Ta se tehnika zove Q-learning.",
      ab_p4c: "I tu se događa nešto novo. Pogledate li gotovog agenta i pitate „zašto je baš tu pomaknuo palicu“, odgovor više nije u nekom pravilu koje možete pročitati. Razasut je kroz desetke tisuća brojeva u tablici, izbrušenih kroz bezbroj partija. Čak ni autor ne može ga lako raspakirati. Crna se kutija prvi put zatvorila i pred onim tko ju je napravio.",
      ab_h5: "Dublje u maglu",
      ab_p5a: "Tablica vrijednosti ima granicu: radi dok je situacija dovoljno jednostavna da se može popisati. Za složenije probleme tablicu zamjenjuje neuronska mreža — i magla se zgušnjava. Ta se tehnika zove DQN, duboka Q-mreža. S njom dolazi pojava koja je istovremeno i najljepša i najnelagodnija strana ovog posla.",
      ab_p5b: "U fazi kad agent igra sam protiv sebe (self-play), počinje razvijati strategije koje mu nitko nije zadao. U našem Pongu agent nije samo naučio odbijati lopticu — naučio je postavljati zamke, namjerno tjerati protivnika u kutove, koristiti rubove terena. Te strategije nisu bile nigdje napisane. <em>Emergirale</em> su, nastale same iz procesa učenja. Red koji nitko nije programirao. To je trenutak u kojem sustav prestaje biti samo alat koji izvršava i postaje nešto što proizvodi ponašanje koje moramo promatrati da bismo ga razumjeli — jer ga unaprijed ne možemo pročitati.",
      ab_h6: "Sve do velikih jezičnih modela",
      ab_p6a: "Pratite ovu liniju dovoljno daleko i stižete do današnjih velikih jezičnih modela — LLM-ova. Isti princip kao kod agenta koji uči Pong, samo umjesto tablice ili male mreže, sustav ima milijarde parametara i arhitekturu zvanu transformer. Ti modeli pišu tekst, prevode jezike, vode razgovor — i, da, mogli bi naučiti i igrati Pong.",
      ab_p6b: "Skok u moći je golem. Ali ona ista crta koju pratimo od 1972. nije nestala — naprotiv, nikad nije bila izraženija. Nitko, uključujući i ljude koji su model napravili, ne može pokazati točno <em>zašto</em> je dao baš taj odgovor. Najmoćniji softver koji smo dosad sagradili istovremeno je i najneprozirniji.",
      ab_h7: "Zajednička nit: X-Ray",
      ab_p7a: "Vratimo se sada na početak. Od logičkih krugova 1972., preko čitljivih pravila, do tablica, mreža i milijardi parametara — mijenjala se tehnologija, mijenjala se moć, mijenjala se matematika. Ali jedna je stvar ostala ista kroz svih pet desetljeća: <em>ne vidi se kako softver radi iznutra.</em>",
      ab_p7b: "xpong postoji zbog te jedne stvari. Ne da bi ukinuo crnu kutiju — to se ne može — nego da napravi prozore prema njoj. Kroz istu prapovijesnu igru, Pong, pokazujem što se događa <em>unutar</em> agenta dok uči: toplinsku mapu koja pokazuje gdje obraća pažnju, telemetriju loptice u stvarnom vremenu, brojeve kojima procjenjuje svaki mogući potez. Ne uklanjam maglu. Osvjetljavam je, sloj po sloj.",
      ab_p7c: "Taj stav ima ime — X-Ray — i starije korijene nego što biste pomislili. Aboridžinski slikari Australije tisućama godina prikazuju životinje s vidljivim kostima i organima iznutra, a ne samo kožom izvana. Punk glazbenik Joe Strummer pjevao je 1999. da želi vidjeti „u rendgenskom stilu“ — kao čin odbijanja da prihvati ono što mu se servira kao gotova činjenica. Ista ideja, isti otpor prema neprozirnosti. xpong je taj stav primijenjen na jednu igru s dvije crtice i točkicom — najjednostavniji mogući ulaz u najveće pitanje suvremene tehnologije.",
      ab_side_project: "Podaci o projektu",
      ab_side_status: "Status",
      ab_side_status_v: "M0 — landing",
      ab_side_build: "Izrada",
      ab_side_build_v: "statički, bez build koraka",
      ab_side_verify: "Provjera, ne mašta",
      ab_side_verify_text: "Svaki pojam u ovom tekstu — od aboridžinske rendgenske umjetnosti do transformera — povezan je linkom s Wikipedijom. To nije ukras. Ideje o kojima govorim nisu izmišljene za potrebe ovog projekta; dokumentirane su, javne i provjerljive. Ne tražim da mi vjeruješ na riječ — prati link i provjeri sam.<br><br>To je X-Ray stav okrenut prema samom tekstu: jednako kao što osvjetljavam što agent radi iznutra, otvaram i odakle moje ideje dolaze.",
      ab_side_auth: "Autorstvo i suradnja",
      ab_side_auth_text: "xpong je osmislio, dizajnirao i održava <strong>Flavio</strong> (fladroid). Filozofija, metodologija, arhitektura i sve konačne dizajnerske odluke projekta njegove su — i ostaju njegova isključiva odgovornost.<br><br>Projekt se gradi u stalnoj suradnji s <strong><a href='https://claude.ai' target='_blank'>Claudeom</a></strong> (Anthropic) — ne kao alat za dopunjavanje koda, već kao radni partner kroz dokumentirane sesije: implementacija, debugiranje, analiza i konceptualni dijalog koji je oblikovao upravo ovu stranicu. Svaka je sesija zabilježena u <code>docs/sessions/</code>, gdje se pojavljuju oba imena — namjeran izbor, u duhu X-Ray stava ovog projekta: proces izgradnje treba biti jednako proziran kao i izgrađena stvar.<br><br><em>Flavio & Claude · xpong · 2026</em>",
    },
    sr: {
      cyr: {
        lab: 'Reinforcement Learning Lab',
        tagline: 'Тренирање AI агената да играју Понг — уз упаљено светло.',
        hero_desc: 'xpong је лабораторија у прегледачу за reinforcement learning, грађена страницу по страницу као прозор у то како агент учи. Прво класични Понг; затим унутрашње стање учињено видљивим.',
        nav_home: 'Почетна', nav_about: 'О пројекту', nav_game: 'Игра', nav_xray: 'X-Ray',
        nav_stab: 'Стабилизација', nav_evolution: 'Еволуција',
        soon: 'ускоро',
        g_title: 'Игра — класични Pong',
        g_left: 'Лево',
        g_right: 'Десно',
        g_start: 'Покрени',
        g_pause: 'Пауза',
        g_again: 'Играј опет',
        g_reset: 'Поништи',
        g_start_hint: 'Притисни размак или додирни за почетак',
        g_serve_hint: 'Притисни размак или додирни за сервис',
        g_wins: 'побеђује!',
        g_legend_left: 'Леви играч',
        g_legend_right: 'Десни играч',
        g_up: 'горе',
        g_down: 'доле',
        g_touch_left: 'или превуци по левој половини (touch)',
        g_touch_right: 'или превуци по десној половини (touch)',
        footer: 'xpong · X-Ray пројекат',

        ab_title: "xpong — од две црте до милијарду параметара",
        ab_h1: "Игра која се није променила",
        ab_p1a: "Године 1972. из Атарија је изашла игра тако једноставна да ју је свако могао разумети пре него што је прочитао и једно упутство. Две црте са стране, тачкица која се одбија између њих, и један задатак: не дозволи да прође поред тебе. Понг.",
        ab_p1b: "Многи је се и данас сећају — прве игре коју су видели, светлуцаве на телевизору, са звуком налик на откуцај. Педесет година касније, та игра изгледа готово исто. Две црте, тачкица, одбијање. Покажите је некоме ко је никад није видео, и схватиће је за три секунде.",
        ab_p1c: "А ипак — испод те непромењене површине, све се променило. Оно што одлучује како се игра понаша прешло је пут од неколико електронских кола до система са милијардама параметара. Споља: две црте. Изнутра: пола века рачунарства. Ова страница је о том „изнутра“ — и о једној ствари која је, кроз све те деценије, остала иста.",
        ab_h2: "1972: логика у колима",
        ab_p2a: "Први Понг није имао софтвер у смислу у ком данас мислимо на софтвер. Није било програма који се покреће, ни кода који би неко могао да прочита. Игру је водио склоп електронских компоненти — логичка кола која су, жицом и струјом, рачунала где је лопта и како се креће.",
        ab_p2b: "За играча, разлика није била видљива. Видео је резултат: лопта иде тамо, рекет је прати. Није видео — нити је могао да види — <em>како</em> машина долази до тога. Била је то прва црна кутија те врсте: уређај који ради савршено, а чији унутрашњи рад остаје скривен од оног ко га користи.",
        ab_p2c: "Већ 1972, дакле, постављен је образац који ћемо пратити до краја ове приче.",
        ab_h3: "Правила која је неко написао",
        ab_p3a: "Како су рачунари постајали прави рачунари, противника у Понг-у почео је да води програм — низ експлицитних правила. <em>Ако је лопта изнад рекета, помери се горе. Ако је испод, помери се доле.</em> Једноставно, читљиво, предвидљиво.",
        ab_p3b: "Овде се јавља занимљива подела. Човек који је написао та правила могао је да их прочита и тачно зна зашто се противник понаша како се понаша. За њега машина није била црна кутија — била је провидна. Али за играча са друге стране екрана, ништа се није променило. Он и даље види само резултат.",
        ab_p3c: "То је важна нијанса: непрозирност није својство саме машине, него односа. Исти систем је провидан ономе ко га је саградио, а затворен ономе ко га само користи.",
        ab_h4: "Машина која учи сама",
        ab_p4a: "Следећи корак мења све. Уместо да напише правила <em>како</em> да се игра, човек пише програм који <em>учи да игра</em>. Ово није ситна разлика — то је другачија врста система.",
        ab_p4b: "У нашем претходном Понг пројекту направили смо управо таквог агента. Нисмо му рекли „прати лопту“. Рекли смо му само: покушавај, и кад победиш, запамти шта је водило до победе. Агент је играо сам против себе, хиљаде пута, градећи огромну табелу вредности — процену колико је сваки потез добар у свакој ситуацији. Та техника се зове Q-learning.",
        ab_p4c: "И ту се дешава нешто ново. Кад погледате готовог агента и питате „зашто је баш ту померио рекет“, одговор више није у неком правилу које можете прочитати. Разасут је кроз десетине хиљада бројева у табели, избрушених кроз безброј партија. Чак ни аутор не може лако да га распакује. Црна кутија се, први пут, затворила и пред оним ко ју је направио.",
        ab_h5: "Дубље у маглу",
        ab_p5a: "Табела вредности има границу: ради док је ситуација довољно једноставна да се може пописати. За сложеније проблеме табелу замењује неуронска мрежа — и магла се згушњава. Та техника се зове DQN, дубока Q-мрежа. Са њом долази појава која је истовремено и најлепша и најнелагоднија страна овог посла.",
        ab_p5b: "У фази кад агент игра сам против себе (self-play), почиње да развија стратегије које му нико није задао. У нашем Понг-у агент није само научио да одбија лопту — научио је да поставља замке, да намерно тера противника у ћошкове, да користи ивице терена. Те стратегије нису биле нигде написане. <em>Емергирале</em> су, настале саме из процеса учења. Ред који нико није програмирао. То је тренутак у ком систем престаје да буде само алат који извршава и постаје нешто што производи понашање које морамо да посматрамо да бисмо га разумели — јер га унапред не можемо прочитати.",
        ab_h6: "До великих језичких модела",
        ab_p6a: "Пратите ову линију довољно далеко и стижете до данашњих великих језичких модела — LLM-ова. Исти принцип као код агента који учи Понг, само уместо табеле или мале мреже, систем има милијарде параметара и архитектуру звану transformer. Ти модели пишу текст, преводе језике, воде разговор — и, да, могли би да науче и да играју Понг.",
        ab_p6b: "Скок у моћи је огроман. Али она иста црта коју пратимо од 1972. није нестала — напротив, никад није била израженија. Нико, укључујући и људе који су модел направили, не може да покаже тачно <em>зашто</em> је дао баш тај одговор. Најмоћнији софтвер који смо досад саградили истовремено је и најнепрозирнији.",
        ab_h7: "Заједничка нит: X-Ray",
        ab_p7a: "Вратимо се сада на почетак. Од логичких кола 1972, преко читљивих правила, до табела, мрежа и милијарди параметара — мењала се технологија, мењала се моћ, мењала се математика. Али једна ствар је остала иста кроз свих пет деценија: <em>не види се како софтвер ради изнутра.</em>",
        ab_p7b: "xpong постоји због те једне ствари. Не да би укинуо црну кутију — то се не може — него да направи прозоре према њој. Кроз исту праисторијску игру, Понг, показујем шта се дешава <em>унутар</em> агента док учи: топлотну мапу која показује где обраћа пажњу, телеметрију лопте у реалном времену, бројеве којима процењује сваки могући потез. Не уклањам маглу. Осветљавам је, слој по слој.",
        ab_p7c: "Тај став има име — X-Ray — и старије корене него што бисте помислили. Абориџински сликари Аустралије хиљадама година приказују животиње са видљивим костима и органима изнутра, а не само кожом споља. Панк музичар Joe Strummer певао је 1999. да жели да види „у рендгенском стилу“ — као чин одбијања да прихвати оно што му се сервира као готова чињеница. Иста идеја, исти отпор према непрозирности. xpong је тај став примењен на једну игру са две црте и тачкицом — најједноставнији могући улаз у највеће питање савремене технологије.",
        ab_side_project: "Подаци о пројекту",
        ab_side_status: "Статус",
        ab_side_status_v: "M0 — landing",
        ab_side_build: "Израда",
        ab_side_build_v: "статички, без build корака",
        ab_side_verify: "Провера, не машта",
        ab_side_verify_text: "Сваки појам у овом тексту — од абориџинске рендгенске уметности до transformer-а — повезан је линком са Википедијом. То није украс. Идеје о којима говорим нису измишљене за потребе овог пројекта; документоване су, јавне и проверљиве. Не тражим да ми верујеш на реч — прати линк и провери сам.<br><br>То је X-Ray став окренут према самом тексту: исто као што осветљавам шта агент ради изнутра, отварам и одакле моје идеје долазе.",
        ab_side_auth: "Ауторство и сарадња",
        ab_side_auth_text: "xpong је осмислио, дизајнирао и одржава <strong>Flavio</strong> (fladroid). Филозофија, методологија, архитектура и све коначне дизајнерске одлуке пројекта његове су — и остају његова искључива одговорност.<br><br>Пројекат се гради у сталној сарадњи са <strong><a href='https://claude.ai' target='_blank'>Claude-ом</a></strong> (Anthropic) — не као алат за допуњавање кода, већ као радни партнер кроз документоване сесије: имплементација, дебаговање, анализа и концептуални дијалог који је обликовао управо ову страницу. Свака сесија је забележена у <code>docs/sessions/</code>, где се појављују оба имена — намеран избор, у духу X-Ray става овог пројекта: процес изградње треба да буде једнако прозиран као и изграђена ствар.<br><br><em>Flavio & Claude · xpong · 2026</em>",
      }
    }
  };

  function dict(lang) { return lang === 'sr' ? T.sr.cyr : (T[lang] || T.en); }
  function getLang() { var l = localStorage.getItem('xpong_lang'); return T[l] ? l : 'en'; }
  function t(key, lang) {
    var d = dict(lang || getLang());
    if (d && d[key] != null) return d[key];
    return T.en[key] != null ? T.en[key] : key;
  }

  function applyI18n() {
    var lang = getLang();
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'), lang);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'), lang);
    });
  }

  function getTheme() { return localStorage.getItem('xpong_theme') || 'light'; }
  function applyTheme() { document.documentElement.setAttribute('data-theme', getTheme()); }
  function updateThemeIcon() {
    var b = document.getElementById('xp-theme-toggle');
    if (b) b.textContent = getTheme() === 'dark' ? '☀' : '🌙';
  }
  function toggleTheme() {
    localStorage.setItem('xpong_theme', getTheme() === 'dark' ? 'light' : 'dark');
    applyTheme(); updateThemeIcon();
  }

  function pageId() { return document.body.getAttribute('data-page') || 'home'; }

  function buildHeader() {
    var host = document.getElementById('xp-header');
    if (!host) return;
    var cur = pageId(), lang = getLang();
    var navLinks = NAV.map(function (n) {
      var label = t(n.key, lang);
      if (n.soon) {
        return '<a class="xp-nav-link xp-btn-disabled" title="' + t('soon', lang) + '">' +
               label + ' <span class="xp-badge xp-badge-coming-soon">' + t('soon', lang) + '</span></a>';
      }
      return '<a class="xp-nav-link' + (n.id === cur ? ' active' : '') + '" href="' + n.href + '">' + label + '</a>';
    }).join('');
    var opts = LANGS.map(function (l) {
      return '<option value="' + l.code + '"' + (l.code === lang ? ' selected' : '') + '>' + l.label + '</option>';
    }).join('');
    host.innerHTML =
      '<div id="xp-header-inner">' +
        '<a id="xp-logo" href="index.html">xpong</a>' +
        '<button id="xp-burger" aria-label="menu">☰</button>' +
        '<nav id="xp-nav">' + navLinks + '</nav>' +
        '<div id="xp-header-controls">' +
          '<select id="xp-lang-select" aria-label="language">' + opts + '</select>' +
          '<button id="xp-theme-toggle" aria-label="theme"></button>' +
        '</div>' +
      '</div>';
    document.getElementById('xp-lang-select').addEventListener('change', function (e) {
      localStorage.setItem('xpong_lang', e.target.value); render();
    });
    document.getElementById('xp-theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('xp-burger').addEventListener('click', function () {
      document.getElementById('xp-nav').classList.toggle('open');
    });
    updateThemeIcon();
  }

  function buildFooter() {
    var host = document.getElementById('xp-footer');
    if (host) host.innerHTML = '<span data-i18n-html="footer"></span> · ' + XP_VERSION + ' (' + XP_VERSION_DATE + ')';
  }

  function renderConcepts() {
    var page = document.body.getAttribute('data-page');
    if (!page) return;
    var footer = document.getElementById('xp-footer');
    if (!footer) return;
    var existing = document.getElementById('xp-key-concepts');
    if (existing) existing.remove();
    fetch('data/concepts.json?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var concepts = data[page];
        if (!concepts || !concepts.length) return;
        var section = document.createElement('section');
        section.id = 'xp-key-concepts';
        var title = document.createElement('h2');
        title.className = 'xp-concepts-title';
        title.textContent = 'Key Concepts';
        section.appendChild(title);
        var grid = document.createElement('div');
        grid.className = 'xp-concepts-grid';
        concepts.forEach(function (c) {
          var card = document.createElement('div');
          card.className = 'xp-concept-card';
          card.innerHTML =
            '<span class="xp-concept-icon">' + c.icon + '</span>' +
            '<div class="xp-concept-body">' +
              '<a class="xp-concept-name" href="https://en.wikipedia.org/wiki/' + c.wiki + '" target="_blank" rel="noopener">' + c.name + '</a>' +
              '<span class="xp-concept-desc">' + c.description + '</span>' +
            '</div>';
          grid.appendChild(card);
        });
        section.appendChild(grid);
        footer.parentNode.insertBefore(section, footer);
      })
      .catch(function () {});
  }

  function render() { buildHeader(); buildFooter(); applyI18n(); renderConcepts(); }

  function injectFavicon() {
    var l = document.createElement('link');
    l.rel = 'icon'; l.type = 'image/svg+xml'; l.href = 'favicon.svg';
    document.head.appendChild(l);
  }

  injectFavicon();
  applyTheme();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else { render(); }

  window.xpong = { t: t, getLang: getLang, render: render };
})();
