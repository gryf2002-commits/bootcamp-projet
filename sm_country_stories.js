const SM_COUNTRY_STORIES = {
  "france": {
    emoji: "🇫🇷", name: "France",
    facts: [
      { icon: "🧀", title: "Pays du fromage", story: "On y recense plus de 1 200 fromages. De Gaulle plaisantait en disant qu'on ne peut pas gouverner un pays qui en compte autant." },
      { icon: "✈️", title: "Numéro 1 mondial", story: "La France est le pays le plus visité au monde, avec près de 90 millions de voyageur·ses par an, devant l'Espagne et les États-Unis." },
      { icon: "⏱️", title: "Le méridien d'origine", story: "Avant Greenwich, le méridien de référence passait par l'Observatoire de Paris. Une ligne de médaillons traverse encore la ville pour s'en souvenir." }
    ],
    highlights: "Versailles, le Mont-Saint-Michel, les calanques de Marseille, les châteaux de la Loire."
  },
  "espagne": {
    emoji: "🇪🇸", name: "Espagne",
    facts: [
      { icon: "🍅", title: "La bataille de tomates", story: "Chaque août, à Buñol, des milliers de personnes se lancent 150 tonnes de tomates lors de la Tomatina, la plus grande bataille de nourriture au monde." },
      { icon: "🏗️", title: "Un chantier de 140 ans", story: "La Sagrada Família de Gaudí à Barcelone est en construction depuis 1882. Son achèvement est espéré pour les années 2030, soit plus d'un siècle de travaux." },
      { icon: "😴", title: "Vivre en décalé", story: "L'Espagne devrait être à l'heure de Londres, mais Franco l'a alignée sur Berlin en 1940. Du coup on y dîne très tard, souvent après 21h." }
    ],
    highlights: "L'Alhambra de Grenade, la Sagrada Família, les plages des Baléares, le musée du Prado à Madrid."
  },
  "portugal": {
    emoji: "🇵🇹", name: "Portugal",
    facts: [
      { icon: "📜", title: "La plus vieille alliance", story: "Le traité de Windsor, signé entre le Portugal et l'Angleterre en 1386, est la plus ancienne alliance diplomatique encore en vigueur au monde." },
      { icon: "🌉", title: "Lisbonne et San Francisco", story: "Le pont du 25-Avril à Lisbonne ressemble tellement au Golden Gate qu'il a été construit par la même entreprise américaine de charpente métallique." },
      { icon: "🐓", title: "Le coq porte-bonheur", story: "Le célèbre coq de Barcelos vient d'une légende où un coq rôti se met à chanter pour sauver un pèlerin innocent de la pendaison." }
    ],
    highlights: "Le tram 28 de Lisbonne, les caves de Porto, les falaises de l'Algarve, le palais de Sintra."
  },
  "italie": {
    emoji: "🇮🇹", name: "Italie",
    facts: [
      { icon: "🍝", title: "Carbonara sans crème", story: "La vraie carbonara romaine ne contient jamais de crème, seulement œuf, pecorino, guanciale et poivre. Glisser de la crème fait bondir les Italien·nes." },
      { icon: "🐀", title: "Une si petite république", story: "Saint-Marin, enclavée dans l'Italie, est l'une des plus vieilles républiques du monde, fondée selon la tradition en l'an 301." },
      { icon: "🗼", title: "La tour qui penche encore", story: "La tour de Pise a commencé à pencher dès sa construction au XIIe siècle, à cause d'un sol trop mou. On l'a stabilisée sans la redresser totalement." }
    ],
    highlights: "Le Colisée de Rome, les canaux de Venise, la côte amalfitaine, les Offices de Florence."
  },
  "allemagne": {
    emoji: "🇩🇪", name: "Allemagne",
    facts: [
      { icon: "🍞", title: "Royaume du pain", story: "L'Allemagne recense plus de 3 000 sortes de pain officiellement répertoriées, au point que la culture du pain est classée au patrimoine national." },
      { icon: "🛣️", title: "Rouler sans limite", story: "Sur une partie des autoroutes, l'autobahn n'impose aucune limite de vitesse maximale, juste une vitesse conseillée de 130 km/h." },
      { icon: "🏰", title: "Le château de conte", story: "Le château de Neuschwanstein, perché en Bavière, a directement inspiré Walt Disney pour le château de la Belle au bois dormant." }
    ],
    highlights: "La porte de Brandebourg à Berlin, la Forêt-Noire, le château de Neuschwanstein, la cathédrale de Cologne."
  },
  "royaume-uni": {
    emoji: "🇬🇧", name: "Royaume-Uni",
    facts: [
      { icon: "🚇", title: "Le plus vieux métro", story: "Le métro de Londres, ouvert en 1863, est le plus ancien du monde. Les premières rames roulaient à la vapeur sous terre, ambiance enfumée garantie." },
      { icon: "🦢", title: "Les cygnes de la reine", story: "Par une vieille loi, la monarchie possède théoriquement tous les cygnes muets en eaux libres. Un recensement annuel a lieu sur la Tamise." },
      { icon: "☕", title: "Une nation de thé", story: "Les Britanniques boivent environ 100 millions de tasses de thé par jour, soit près de 36 milliards par an. Le rituel structure vraiment la journée." }
    ],
    highlights: "Big Ben et Westminster, Stonehenge, les Highlands écossais, le Loch Ness."
  },
  "irlande": {
    emoji: "🇮🇪", name: "Irlande",
    facts: [
      { icon: "🍀", title: "Pas de serpents", story: "L'Irlande n'a aucun serpent indigène. Une légende l'attribue à saint Patrick, mais la vraie raison est que l'île s'est isolée avant leur arrivée." },
      { icon: "📚", title: "Halloween est née ici", story: "Halloween descend de la fête celtique de Samhain, célébrée en Irlande il y a plus de 2 000 ans pour marquer la fin des récoltes." },
      { icon: "🏰", title: "Le don du bavardage", story: "Embrasser la pierre de Blarney, perchée dans un château du sud, donnerait selon la tradition le don de l'éloquence et du beau parler." }
    ],
    highlights: "Les falaises de Moher, la Chaussée des Géants, Trinity College à Dublin, l'anneau du Kerry."
  },
  "pays-bas": {
    emoji: "🇳🇱", name: "Pays-Bas",
    facts: [
      { icon: "🚲", title: "Plus de vélos que d'habitants", story: "Aux Pays-Bas, on compte plus de vélos que d'habitant·es. Beaucoup de gens en possèdent même plusieurs selon l'usage, un vélo de ville et un autre pour les trajets plus longs." },
      { icon: "🌊", title: "Un pays gagné sur la mer", story: "Près d'un tiers du territoire se situe sous le niveau de la mer, protégé par un immense système de digues et de polders." },
      { icon: "📏", title: "Les plus grand·es du monde", story: "Les Néerlandais·es sont en moyenne les personnes les plus grandes de la planète, avec des hommes dépassant souvent 1,83 m." }
    ],
    highlights: "Les canaux d'Amsterdam, les champs de tulipes de Keukenhof, les moulins de Kinderdijk, le musée Van Gogh."
  },
  "belgique": {
    emoji: "🇧🇪", name: "Belgique",
    facts: [
      { icon: "🍟", title: "Les frites sont belges", story: "Malgré leur nom anglais, les frites seraient nées dans la vallée de la Meuse en Belgique, où l'on friait le poisson, puis des pommes de terre l'hiver." },
      { icon: "🚄", title: "Un réseau ferré dense", story: "La Belgique possède l'un des réseaux ferroviaires les plus denses au monde, héritage de sa révolution industrielle très précoce." },
      { icon: "💧", title: "Le petit pisseur célèbre", story: "Le Manneken-Pis de Bruxelles possède une garde-robe de plus de 1 000 costumes, qu'on lui change régulièrement selon les événements." }
    ],
    highlights: "La Grand-Place de Bruxelles, les canaux de Bruges, le carnaval de Binche, les champs de bataille de Waterloo."
  },
  "suisse": {
    emoji: "🇨🇭", name: "Suisse",
    facts: [
      { icon: "🍫", title: "Le chocolat au lait inventé ici", story: "Le chocolat au lait moderne est né en Suisse en 1875, quand Daniel Peter a eu l'idée d'y mélanger le lait en poudre de son voisin Henri Nestlé." },
      { icon: "🏔️", title: "Des bunkers partout", story: "La Suisse possède assez d'abris antiatomiques pour protéger toute sa population, une particularité quasi unique au monde." },
      { icon: "🏞️", title: "Quatre langues officielles", story: "On y parle officiellement allemand, français, italien et romanche, un héritage qui change carrément d'ambiance selon le canton traversé." }
    ],
    highlights: "Le Cervin à Zermatt, le lac Léman, le train panoramique du Glacier Express, la vieille ville de Berne."
  },
  "autriche": {
    emoji: "🇦🇹", name: "Autriche",
    facts: [
      { icon: "🎶", title: "La patrie de la valse", story: "Vienne a vu naître la valse et reste la capitale mondiale de la musique classique, avec Mozart, Schubert et la dynastie Strauss." },
      { icon: "🍰", title: "Le café au patrimoine", story: "La culture des cafés viennois est inscrite au patrimoine immatériel de l'UNESCO. On peut y rester des heures avec un seul café et un verre d'eau." },
      { icon: "🔔", title: "Douce nuit est née ici", story: "Le célèbre chant de Noël Stille Nacht (Douce nuit) a été composé en 1818 dans un petit village près de Salzbourg, par un instituteur et un prêtre, le soir de Noël." }
    ],
    highlights: "Le château de Schönbrunn à Vienne, les Alpes du Tyrol, la vieille ville de Salzbourg, les lacs du Salzkammergut."
  },
  "grece": {
    emoji: "🇬🇷", name: "Grèce",
    facts: [
      { icon: "🏛️", title: "Berceau de la démocratie", story: "Le mot démocratie vient du grec et la première en a vu le jour à Athènes vers le Ve siècle avant notre ère, où les citoyens votaient les lois." },
      { icon: "🏝️", title: "Des milliers d'îles", story: "La Grèce compte environ 6 000 îles et îlots, mais seulement 200 environ sont habités. De quoi avoir l'embarras du choix." },
      { icon: "🏃", title: "L'origine du marathon", story: "Le marathon tire son nom de la course d'un messager grec qui aurait couru de Marathon à Athènes pour annoncer une victoire, soit environ 42 km." }
    ],
    highlights: "L'Acropole d'Athènes, les couchers de soleil de Santorin, les monastères des Météores, la vieille ville de Rhodes."
  },
  "suede": {
    emoji: "🇸🇪", name: "Suède",
    facts: [
      { icon: "♻️", title: "Le pays qui importe ses déchets", story: "La Suède recycle si efficacement qu'elle manque de déchets pour ses centrales et en importe d'autres pays pour produire de la chaleur." },
      { icon: "☕", title: "La pause fika sacrée", story: "Le fika, pause café accompagnée d'une viennoiserie, est une institution sociale en Suède, un vrai moment pour ralentir et discuter." },
      { icon: "🏨", title: "Dormir dans la glace", story: "À Jukkasjärvi, en Laponie suédoise, l'Icehotel est entièrement reconstruit chaque hiver en glace et en neige, puis fond au printemps." }
    ],
    highlights: "La vieille ville de Stockholm, les aurores boréales de Laponie, l'archipel de la mer Baltique, le musée Vasa."
  },
  "danemark": {
    emoji: "🇩🇰", name: "Danemark",
    facts: [
      { icon: "🧱", title: "Le LEGO est danois", story: "Les briques LEGO sont nées à Billund en 1949. Le nom vient du danois leg godt, qui signifie bien jouer, et deux briques s'emboîtent de millions de façons différentes." },
      { icon: "🕯️", title: "L'art du hygge", story: "Le hygge, cette atmosphère cosy de bougies et de chaleur partagée, est un véritable mode de vie au Danemark, surtout pendant les longs hivers." },
      { icon: "🚲", title: "Copenhague à vélo", story: "À Copenhague, plus de la moitié des habitant·es vont au travail ou à l'école à vélo, sur un réseau de pistes pensé pour eux." }
    ],
    highlights: "La Petite Sirène de Copenhague, les jardins de Tivoli, le château de Kronborg, les plages de Skagen."
  },
  "norvege": {
    emoji: "🇳🇴", name: "Norvège",
    facts: [
      { icon: "🌅", title: "Le soleil de minuit", story: "Au nord du cercle polaire, le soleil ne se couche pas pendant plusieurs semaines en été. En hiver, c'est l'inverse, la nuit polaire s'installe." },
      { icon: "🧀", title: "Un fromage caramel", story: "Le brunost norvégien est un fromage brun au goût de caramel, fait à partir de lactosérum cuit. Une tartine surprenante au petit-déjeuner." },
      { icon: "🛶", title: "Des fjords spectaculaires", story: "Les fjords norvégiens, vallées creusées par les glaciers et envahies par la mer, comptent parmi les paysages les plus photographiés au monde." }
    ],
    highlights: "Les fjords de Geiranger et de Nærøy, Bergen et ses maisons colorées, les îles Lofoten, le cap Nord."
  },
  "islande": {
    emoji: "🇮🇸", name: "Islande",
    facts: [
      { icon: "🌋", title: "Terre de feu et de glace", story: "L'Islande chevauche deux plaques tectoniques et compte plus de 30 systèmes volcaniques actifs. On peut littéralement voir le sol se déchirer." },
      { icon: "🦟", title: "Aucun moustique", story: "L'Islande est l'un des très rares pays au monde où l'on ne trouve aucun moustique, sans qu'on sache totalement pourquoi." },
      { icon: "📖", title: "Tout le monde écrit", story: "L'Islande publie énormément de livres par habitant·e. Une tradition de Noël, le jólabókaflóð, consiste à s'offrir des livres puis à lire toute la soirée." }
    ],
    highlights: "Le Cercle d'or, le Blue Lagoon, les cascades de Skógafoss et Gullfoss, les aurores boréales."
  },
  "republique tcheque": {
    emoji: "🇨🇿", name: "République tchèque",
    facts: [
      { icon: "🍺", title: "Les rois de la bière", story: "Les Tchèques sont les plus gros consommateurs de bière par habitant·e au monde. La pils blonde a d'ailleurs été inventée à Plzeň en 1842." },
      { icon: "🤖", title: "Le mot robot vient d'ici", story: "Le mot robot a été inventé en 1920 par l'écrivain tchèque Karel Čapek, à partir du mot robota qui signifie travail forcé." },
      { icon: "🏰", title: "Le plus grand château", story: "Le château de Prague est considéré comme le plus grand complexe castral du monde, dominant la ville depuis plus de mille ans." }
    ],
    highlights: "Le pont Charles et l'horloge astronomique de Prague, le château de Prague, la ville thermale de Karlovy Vary."
  },
  "hongrie": {
    emoji: "🇭🇺", name: "Hongrie",
    facts: [
      { icon: "✒️", title: "Le stylo à bille hongrois", story: "Le stylo à bille moderne a été inventé par le journaliste hongrois László Bíró, raison pour laquelle on l'appelle encore biro dans plusieurs langues." },
      { icon: "♨️", title: "La capitale des thermes", story: "Budapest repose sur plus d'une centaine de sources thermales et abrite des bains historiques majestueux comme Széchenyi et Gellért." },
      { icon: "🧊", title: "Le Rubik's Cube", story: "Le célèbre casse-tête a été créé en 1974 par Ernő Rubik, professeur d'architecture hongrois, au départ comme outil pédagogique." }
    ],
    highlights: "Le Parlement et les bains de Budapest, le lac Balaton, le pont des Chaînes, le quartier du château de Buda."
  },
  "turquie": {
    emoji: "🇹🇷", name: "Turquie",
    facts: [
      { icon: "🌉", title: "À cheval sur deux continents", story: "Istanbul est la seule grande ville au monde répartie sur deux continents, l'Europe et l'Asie, séparées par le détroit du Bosphore." },
      { icon: "🎈", title: "Cheminées de fées", story: "En Cappadoce, l'érosion a sculpté d'étranges colonnes de roche. On y a creusé des villes souterraines et on les survole en montgolfière au lever du jour." },
      { icon: "☕", title: "Lire l'avenir dans le café", story: "Après un café turc, on retourne la tasse et on lit l'avenir dans les motifs du marc. Une tradition conviviale toujours bien vivante." }
    ],
    highlights: "Sainte-Sophie et la Mosquée bleue à Istanbul, la Cappadoce, les vasques de Pamukkale, les ruines d'Éphèse."
  },
  "maroc": {
    emoji: "🇲🇦", name: "Maroc",
    facts: [
      { icon: "🐐", title: "Des chèvres dans les arbres", story: "Dans le sud-ouest, les chèvres grimpent dans les arganiers pour manger leurs fruits. Un spectacle réel qui surprend beaucoup de voyageur·ses." },
      { icon: "🎨", title: "La médina bleue", story: "Chefchaouen, nichée dans le Rif, est entièrement peinte dans des nuances de bleu. On hésite encore sur l'origine exacte de cette tradition." },
      { icon: "🍵", title: "Le thé de l'amitié", story: "Le thé à la menthe, versé de haut pour créer de la mousse, est un rituel d'hospitalité. Refuser un verre peut presque passer pour un affront." }
    ],
    highlights: "La place Jemaa el-Fna à Marrakech, les médinas de Fès et Chefchaouen, le désert de Merzouga, les côtes d'Essaouira."
  },
  "egypte": {
    emoji: "🇪🇬", name: "Égypte",
    facts: [
      { icon: "🐱", title: "Les chats étaient sacrés", story: "Dans l'Égypte ancienne, tuer un chat, même par accident, pouvait être puni de mort. La déesse Bastet était représentée avec une tête de chatte." },
      { icon: "🏗️", title: "Cléopâtre plus proche de nous", story: "Cléopâtre a vécu plus près de la construction du premier iPhone que de celle de la grande pyramide de Khéops, tant cette pyramide est ancienne." },
      { icon: "📐", title: "La dernière merveille", story: "La grande pyramide de Gizeh est la seule des sept merveilles du monde antique encore debout, après plus de 4 500 ans, et resta la plus haute construction humaine pendant des millénaires." }
    ],
    highlights: "Les pyramides de Gizeh et le Sphinx, les temples de Louxor et Karnak, la vallée des Rois, une croisière sur le Nil."
  },
  "afrique du sud": {
    emoji: "🇿🇦", name: "Afrique du Sud",
    facts: [
      { icon: "🏛️", title: "Trois capitales", story: "L'Afrique du Sud n'a pas une mais trois capitales, Pretoria pour l'exécutif, Le Cap pour le législatif et Bloemfontein pour le judiciaire." },
      { icon: "🗣️", title: "Onze langues officielles", story: "Le pays reconnaît onze langues officielles, dont le zoulou, le xhosa et l'afrikaans. Mandela disait qu'on touche le cœur en parlant la langue de l'autre." },
      { icon: "❤️", title: "La première greffe du cœur", story: "La première transplantation cardiaque humaine a été réalisée au Cap en 1967 par le chirurgien Christiaan Barnard, un exploit médical qui fit le tour du monde à l'époque." }
    ],
    highlights: "La Montagne de la Table au Cap, le parc Kruger en safari, la route des jardins, le cap de Bonne-Espérance."
  },
  "japon": {
    emoji: "🇯🇵", name: "Japon",
    facts: [
      { icon: "🚄", title: "Des trains d'une ponctualité folle", story: "Les trains japonais sont si ponctuels qu'un retard de quelques secondes peut donner lieu à des excuses officielles de la compagnie." },
      { icon: "🍣", title: "Des distributeurs partout", story: "Le Japon compte des millions de distributeurs automatiques, environ un pour quelques dizaines d'habitant·es, vendant de tout, du café chaud à la soupe." },
      { icon: "🌸", title: "Suivre les cerisiers", story: "Au printemps, une carte nationale annonce l'avancée de la floraison des cerisiers du sud au nord, pour pique-niquer sous les fleurs au bon moment." }
    ],
    highlights: "Les temples de Kyoto, le carrefour de Shibuya à Tokyo, le mont Fuji, les daims de Nara."
  },
  "coree du sud": {
    emoji: "🇰🇷", name: "Corée du Sud",
    facts: [
      { icon: "🎂", title: "Un âge différent", story: "Pendant longtemps, les Coréen·nes se comptaient un an de plus dès la naissance et vieillissaient tous au Nouvel An. Le système a été uniformisé récemment." },
      { icon: "📶", title: "Le pays ultra-connecté", story: "La Corée du Sud possède l'un des internets les plus rapides au monde, et le wifi public y est quasiment partout, même dans le métro." },
      { icon: "🌶️", title: "Le kimchi national", story: "Le kimchi, chou fermenté pimenté, est un incontournable de chaque repas. Beaucoup de foyers possèdent un réfrigérateur dédié à sa conservation." }
    ],
    highlights: "Les palais de Séoul, le village hanok de Bukchon, l'île de Jeju, la zone démilitarisée à la frontière."
  },
  "chine": {
    emoji: "🇨🇳", name: "Chine",
    facts: [
      { icon: "🐼", title: "Les pandas sont prêtés", story: "Tous les pandas géants du monde appartiennent en réalité à la Chine, qui les prête aux zoos étrangers dans le cadre d'une diplomatie du panda." },
      { icon: "🧱", title: "Une muraille pas visible de la Lune", story: "Contrairement au mythe, la Grande Muraille n'est pas visible à l'œil nu depuis la Lune. Elle reste pourtant la plus longue construction humaine, sur des milliers de km." },
      { icon: "⏰", title: "Un seul fuseau horaire", story: "Malgré son immensité, toute la Chine vit officiellement à la même heure, celle de Pékin, ce qui crée de drôles de décalages à l'ouest du pays." }
    ],
    highlights: "La Grande Muraille, la Cité interdite à Pékin, l'armée de terre cuite de Xi'an, les paysages de Guilin."
  },
  "thailande": {
    emoji: "🇹🇭", name: "Thaïlande",
    facts: [
      { icon: "👑", title: "Le pays jamais colonisé", story: "La Thaïlande est le seul pays d'Asie du Sud-Est à n'avoir jamais été colonisé, jouant habilement des rivalités entre puissances européennes." },
      { icon: "📛", title: "Un nom de ville record", story: "Le vrai nom cérémoniel de Bangkok est l'un des plus longs noms de lieu au monde, une longue suite de mots que peu de gens récitent en entier." },
      { icon: "🐘", title: "L'éléphant emblème", story: "L'éléphant est un symbole national fort. Les éléphants blancs étaient autrefois si sacrés qu'ils appartenaient au roi et ne pouvaient pas travailler." }
    ],
    highlights: "Les temples et le Grand Palais de Bangkok, les plages de Phuket et Krabi, les marchés flottants, Chiang Mai au nord."
  },
  "vietnam": {
    emoji: "🇻🇳", name: "Vietnam",
    facts: [
      { icon: "☕", title: "Géant du café", story: "Le Vietnam est le deuxième producteur mondial de café. On y boit le ca phe sua da, un café glacé sucré au lait concentré, intense et rafraîchissant." },
      { icon: "🛵", title: "Une mer de scooters", story: "Le pays compte des dizaines de millions de scooters. Traverser une rue à Hanoï est tout un art, il faut avancer calmement et laisser le flot vous contourner." },
      { icon: "🕳️", title: "Des tunnels labyrinthe", story: "Les tunnels de Cu Chi forment un réseau souterrain de centaines de kilomètres, creusés à la main durant la guerre du Vietnam." }
    ],
    highlights: "La baie d'Halong, la vieille ville de Hoi An, le delta du Mékong, les rizières en terrasses de Sapa."
  },
  "indonesie": {
    emoji: "🇮🇩", name: "Indonésie",
    facts: [
      { icon: "🏝️", title: "Un archipel immense", story: "L'Indonésie compte plus de 17 000 îles réparties sur trois fuseaux horaires, ce qui en fait le plus grand pays insulaire du monde." },
      { icon: "🐉", title: "Les dragons de Komodo", story: "Le varan de Komodo, plus grand lézard vivant au monde, ne vit à l'état sauvage que sur quelques îles indonésiennes. Il peut dépasser trois mètres." },
      { icon: "🗣️", title: "Des centaines de langues", story: "On y parle plus de 700 langues. Le bahasa indonesia sert de langue commune pour relier des centaines de cultures et de peuples différents." }
    ],
    highlights: "Les rizières et temples de Bali, le temple de Borobudur, les volcans du Bromo, les dragons de Komodo."
  },
  "inde": {
    emoji: "🇮🇳", name: "Inde",
    facts: [
      { icon: "🎬", title: "Plus de films qu'Hollywood", story: "L'industrie du cinéma indien produit chaque année bien plus de longs métrages qu'Hollywood, dans des dizaines de langues différentes." },
      { icon: "🔢", title: "Le zéro vient d'ici", story: "Le concept du zéro comme nombre à part entière a été formalisé par des mathématiciens indiens, une révolution pour toutes les sciences." },
      { icon: "🌧️", title: "Le lieu le plus pluvieux", story: "La région de Mawsynram, dans le nord-est, est parmi les endroits les plus arrosés de la planète, avec des pluies de mousson spectaculaires." }
    ],
    highlights: "Le Taj Mahal à Agra, les palais du Rajasthan, les ghats de Varanasi, les plages de Goa."
  },
  "emirats arabes unis": {
    emoji: "🇦🇪", name: "Émirats arabes unis",
    facts: [
      { icon: "🏙️", title: "La plus haute tour", story: "Le Burj Khalifa de Dubaï culmine à plus de 828 mètres, restant de loin la plus haute structure construite par l'humanité." },
      { icon: "🏜️", title: "Du désert aux gratte-ciel", story: "Il y a quelques décennies, Dubaï n'était qu'une bourgade de pêche de perles. La transformation en métropole ultramoderne s'est faite en une génération." },
      { icon: "🚓", title: "La police de luxe", story: "La police de Dubaï possède une flotte de voitures de sport haut de gamme, utilisées surtout pour le tourisme et les relations publiques." }
    ],
    highlights: "Le Burj Khalifa et les malls de Dubaï, la mosquée Sheikh Zayed d'Abou Dabi, les dunes du désert, les îles artificielles."
  },
  "australie": {
    emoji: "🇦🇺", name: "Australie",
    facts: [
      { icon: "🦘", title: "Plus de kangourous que d'humains", story: "L'Australie compte plus de kangourous que d'habitant·es. On peut en croiser un peu partout dès qu'on sort des grandes villes." },
      { icon: "🪨", title: "Un récif vivant énorme", story: "La Grande Barrière de corail est si vaste qu'elle est visible depuis l'espace, et c'est la plus grande structure construite par des organismes vivants." },
      { icon: "📮", title: "Une clôture interminable", story: "La clôture anti-dingos du sud-est s'étire sur plus de 5 000 km, l'une des plus longues barrières jamais construites par l'humain." }
    ],
    highlights: "L'opéra de Sydney, la Grande Barrière de corail, le rocher d'Uluru, la route Great Ocean Road."
  },
  "nouvelle-zelande": {
    emoji: "🇳🇿", name: "Nouvelle-Zélande",
    facts: [
      { icon: "🐑", title: "Bien plus de moutons", story: "La Nouvelle-Zélande compte plusieurs moutons pour chaque habitant·e, un héritage de son histoire agricole encore très présent dans le paysage." },
      { icon: "🎬", title: "La Terre du Milieu", story: "Les paysages du pays ont servi de décor à toute la trilogie du Seigneur des anneaux. On peut visiter le village hobbit de Hobbiton près de Matamata." },
      { icon: "🗳️", title: "Pionnière du vote des femmes", story: "En 1893, la Nouvelle-Zélande est devenue le premier pays au monde à accorder le droit de vote aux femmes lors des élections nationales." }
    ],
    highlights: "Les fjords de Milford Sound, les sources géothermiques de Rotorua, le village de Hobbiton, les Alpes du Sud."
  },
  "etats-unis": {
    emoji: "🇺🇸", name: "États-Unis",
    facts: [
      { icon: "🗽", title: "La statue, cadeau français", story: "La statue de la Liberté a été offerte par la France en 1886. Sa structure interne a été conçue par Gustave Eiffel, le père de la fameuse tour." },
      { icon: "🍴", title: "Pizza à toute heure", story: "Aux États-Unis, on engloutit environ 100 hectares de pizza chaque jour, tant ce plat venu d'Italie est devenu un pilier de la culture populaire." },
      { icon: "🏞️", title: "Le premier parc national", story: "Yellowstone, créé en 1872, est le tout premier parc national du monde. Ses geysers et son Grand Prismatic sont d'une couleur irréelle." }
    ],
    highlights: "Times Square à New York, le Grand Canyon, Yellowstone, le Golden Gate de San Francisco."
  },
  "canada": {
    emoji: "🇨🇦", name: "Canada",
    facts: [
      { icon: "🏞️", title: "Le pays des lacs", story: "Le Canada abrite à lui seul plus de lacs que tout le reste du monde réuni, des millions d'étendues d'eau parsemant ses forêts et sa toundra." },
      { icon: "🍁", title: "Royaume du sirop d'érable", story: "Le Québec produit la grande majorité du sirop d'érable mondial. Le pays gère même une réserve stratégique pour stabiliser les prix." },
      { icon: "🐻‍❄️", title: "La capitale des ours polaires", story: "La ville de Churchill, au Manitoba, est surnommée la capitale mondiale des ours polaires, qu'on peut y observer à l'automne." }
    ],
    highlights: "Les chutes du Niagara, le Vieux-Québec, les Rocheuses de Banff, la ville cosmopolite de Toronto."
  },
  "mexique": {
    emoji: "🇲🇽", name: "Mexique",
    facts: [
      { icon: "💀", title: "Une fête pour les morts", story: "Le Jour des morts n'est pas triste mais joyeux. Les familles honorent leurs proches disparus avec des autels colorés, des fleurs et leurs plats préférés." },
      { icon: "🍫", title: "Le chocolat est né ici", story: "Le chocolat vient des civilisations mésoaméricaines, qui buvaient le cacao en boisson amère et épicée bien avant l'arrivée des Européens." },
      { icon: "🦋", title: "La forêt aux papillons", story: "Chaque hiver, des centaines de millions de papillons monarques migrent jusqu'aux forêts du centre du Mexique, couvrant les arbres d'orange." }
    ],
    highlights: "Les pyramides de Teotihuacan et Chichén Itzá, les plages de la Riviera Maya, la ville de Mexico, Oaxaca et sa gastronomie."
  },
  "bresil": {
    emoji: "🇧🇷", name: "Brésil",
    facts: [
      { icon: "🌳", title: "Le poumon vert", story: "La majeure partie de la forêt amazonienne se trouve au Brésil. Elle abrite une biodiversité inouïe et de nombreuses espèces encore inconnues." },
      { icon: "🎉", title: "Le plus grand carnaval", story: "Le carnaval de Rio est la plus grande fête du monde, avec des défilés d'écoles de samba répétés toute l'année et des millions de personnes dans la rue." },
      { icon: "🗣️", title: "Le géant lusophone", story: "Le Brésil est le seul grand pays d'Amérique à parler portugais, héritage de la colonisation, et compte le plus de lusophones au monde." }
    ],
    highlights: "Le Christ Rédempteur et les plages de Rio, les chutes d'Iguaçu, l'Amazonie, les dunes des Lençóis Maranhenses."
  },
  "argentine": {
    emoji: "🇦🇷", name: "Argentine",
    facts: [
      { icon: "💃", title: "Le tango est né ici", story: "Le tango a vu le jour dans les quartiers populaires de Buenos Aires à la fin du XIXe siècle, avant de conquérir les salons du monde entier." },
      { icon: "🥩", title: "Une passion pour la viande", story: "L'Argentine est l'un des plus gros consommateurs de bœuf au monde. L'asado, le barbecue du dimanche, est un véritable rituel familial et social." },
      { icon: "🏔️", title: "Du sommet au bout du monde", story: "Le pays abrite l'Aconcagua, plus haut sommet hors d'Asie, et la ville d'Ushuaïa, souvent présentée comme la ville la plus australe du globe." }
    ],
    highlights: "Buenos Aires et son quartier La Boca, les chutes d'Iguazú, le glacier Perito Moreno, les vignobles de Mendoza."
  }
};
SM_COUNTRY_STORIES["united states"] = SM_COUNTRY_STORIES["etats-unis"];
SM_COUNTRY_STORIES["germany"] = SM_COUNTRY_STORIES["allemagne"];
SM_COUNTRY_STORIES["spain"] = SM_COUNTRY_STORIES["espagne"];
SM_COUNTRY_STORIES["italy"] = SM_COUNTRY_STORIES["italie"];
SM_COUNTRY_STORIES["japan"] = SM_COUNTRY_STORIES["japon"];
SM_COUNTRY_STORIES["morocco"] = SM_COUNTRY_STORIES["maroc"];
SM_COUNTRY_STORIES["united kingdom"] = SM_COUNTRY_STORIES["royaume-uni"];
SM_COUNTRY_STORIES["brazil"] = SM_COUNTRY_STORIES["bresil"];
SM_COUNTRY_STORIES["mexico"] = SM_COUNTRY_STORIES["mexique"];
SM_COUNTRY_STORIES["netherlands"] = SM_COUNTRY_STORIES["pays-bas"];
SM_COUNTRY_STORIES["greece"] = SM_COUNTRY_STORIES["grece"];
SM_COUNTRY_STORIES["iceland"] = SM_COUNTRY_STORIES["islande"];
SM_COUNTRY_STORIES["thailand"] = SM_COUNTRY_STORIES["thailande"];
SM_COUNTRY_STORIES["switzerland"] = SM_COUNTRY_STORIES["suisse"];
SM_COUNTRY_STORIES["ireland"] = SM_COUNTRY_STORIES["irlande"];
SM_COUNTRY_STORIES["sweden"] = SM_COUNTRY_STORIES["suede"];
SM_COUNTRY_STORIES["austria"] = SM_COUNTRY_STORIES["autriche"];
SM_COUNTRY_STORIES["belgium"] = SM_COUNTRY_STORIES["belgique"];
SM_COUNTRY_STORIES["portugal"] = SM_COUNTRY_STORIES["portugal"];
SM_COUNTRY_STORIES["denmark"] = SM_COUNTRY_STORIES["danemark"];
SM_COUNTRY_STORIES["norway"] = SM_COUNTRY_STORIES["norvege"];
SM_COUNTRY_STORIES["hungary"] = SM_COUNTRY_STORIES["hongrie"];
SM_COUNTRY_STORIES["turkey"] = SM_COUNTRY_STORIES["turquie"];
SM_COUNTRY_STORIES["egypt"] = SM_COUNTRY_STORIES["egypte"];
SM_COUNTRY_STORIES["china"] = SM_COUNTRY_STORIES["chine"];
SM_COUNTRY_STORIES["india"] = SM_COUNTRY_STORIES["inde"];
SM_COUNTRY_STORIES["vietnam"] = SM_COUNTRY_STORIES["vietnam"];
SM_COUNTRY_STORIES["indonesia"] = SM_COUNTRY_STORIES["indonesie"];
SM_COUNTRY_STORIES["australia"] = SM_COUNTRY_STORIES["australie"];
SM_COUNTRY_STORIES["canada"] = SM_COUNTRY_STORIES["canada"];
SM_COUNTRY_STORIES["argentina"] = SM_COUNTRY_STORIES["argentine"];
SM_COUNTRY_STORIES["united arab emirates"] = SM_COUNTRY_STORIES["emirats arabes unis"];
SM_COUNTRY_STORIES["south africa"] = SM_COUNTRY_STORIES["afrique du sud"];
SM_COUNTRY_STORIES["south korea"] = SM_COUNTRY_STORIES["coree du sud"];
SM_COUNTRY_STORIES["czechia"] = SM_COUNTRY_STORIES["republique tcheque"];
SM_COUNTRY_STORIES["new zealand"] = SM_COUNTRY_STORIES["nouvelle-zelande"];
SM_COUNTRY_STORIES["france-fr"] = SM_COUNTRY_STORIES["france"];
