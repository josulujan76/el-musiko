let jugador = {
  nombre: "",
  nacionalidad: "",
  estilo: "",
  instrumento: "",
  edad: 16,
  gral: 50,
  bandaActual: "",
  reputacionBandaActual: "",
  fans: 0,
  fueDespedido: false,
  ultimaBandaDespido: "",
  categoria: "Under",
  pendienteSeparacion: false,
  rol: "Titular",
  rolFijadoPorEvento: false,
  cansancio: 0,
  modo: "Normal",
  cooldownTendinitis: 0,
  bieniosJugados: 0,

  shows: 0,
  solos: 0,
  ovaciones: 0,

  premios: [],
  historial: [],
  ultimoLogro: "-",
  bandaOrigen: "",
  reputacionOrigen: "",
  sorteoPendiente: null,
  premiosPendientes: [],
  carreraTerminada: false,
  ofertaOrigenBienio: null,

  solista: {
    shows: 0,
    ovaciones: 0,
    solos: 0,
    sesiones: 0,
    sesionEsteBienio: false,
    premios: []
  },

  eventoPendiente: null,

  modificadoresBienio: {
    bonusOvaciones: 0,
    fansExtra: 0,
    cambioGralExtra: 0,
    chancePremioExtra: 0,
    showsFactor: 1
  }
};




let pendienteAnimarEtapa = false;

const CLAVE_AUDIO_MUTE = "el-musiko-audio-mute";
let audioCtx = null;
let audioMute = false;

try {
  audioMute = localStorage.getItem(CLAVE_AUDIO_MUTE) === "1";
} catch (error) {
  audioMute = false;
}

function asegurarAudio() {
  if (audioMute) {
    return null;
  }
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      return null;
    }
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function tonoMusiko(freq, duracion, tipo, volumen, cuando) {
  const ctx = asegurarAudio();
  if (!ctx) {
    return;
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t0 = ctx.currentTime + (cuando || 0);
  osc.type = tipo || "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volumen || 0.05, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (duracion || 0.08));
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + (duracion || 0.08) + 0.02);
}

function sonarClick() {
  tonoMusiko(520, 0.04, "square", 0.035);
}

function sonarPremio() {
  tonoMusiko(660, 0.07, "triangle", 0.05, 0);
  tonoMusiko(880, 0.09, "triangle", 0.045, 0.07);
  tonoMusiko(1175, 0.12, "triangle", 0.04, 0.14);
}

function sonarFinCarrera() {
  tonoMusiko(392, 0.12, "sine", 0.05, 0);
  tonoMusiko(494, 0.12, "sine", 0.05, 0.12);
  tonoMusiko(587, 0.18, "sine", 0.055, 0.24);
}

function sonarBienio() {
  tonoMusiko(440, 0.06, "sine", 0.03);
  tonoMusiko(554, 0.08, "sine", 0.028, 0.06);
}

function textoMute() {
  return audioMute ? "AUDIO: OFF" : "AUDIO: ON";
}

function actualizarBotonMute() {
  const boton = document.getElementById("btn-audio");
  if (boton) {
    boton.textContent = textoMute();
  }
}

function alternarAudio() {
  audioMute = !audioMute;
  try {
    localStorage.setItem(CLAVE_AUDIO_MUTE, audioMute ? "1" : "0");
  } catch (error) {}
  actualizarBotonMute();
  if (!audioMute) {
    sonarClick();
  }
}

document.addEventListener("click", function (evento) {
  const alvo = evento.target.closest("button, .btn, .carta-banda, .opcion-ritmo");
  if (!alvo) {
    return;
  }
  if (alvo.id === "btn-audio") {
    return;
  }
  sonarClick();
}, true);

const CLAVE_GUARDADO = "el-musiko-save-v1";

function estadoJugadorInicial() {
  return {
  nombre: "",
  nacionalidad: "",
  estilo: "",
  instrumento: "",
  edad: 16,
  gral: 50,
  bandaActual: "",
  reputacionBandaActual: "",
  fans: 0,
  fueDespedido: false,
  ultimaBandaDespido: "",
  categoria: "Under",
  pendienteSeparacion: false,
  rol: "Titular",
  rolFijadoPorEvento: false,
  cansancio: 0,
  modo: "Normal",
  cooldownTendinitis: 0,
  bieniosJugados: 0,

  shows: 0,
  solos: 0,
  ovaciones: 0,

  premios: [],
  historial: [],
  ultimoLogro: "-",
  bandaOrigen: "",
  reputacionOrigen: "",
  sorteoPendiente: null,
  premiosPendientes: [],
  carreraTerminada: false,
  ofertaOrigenBienio: null,

  solista: {
    shows: 0,
    ovaciones: 0,
    solos: 0,
    sesiones: 0,
    sesionEsteBienio: false,
    premios: []
  },

  eventoPendiente: null,

  modificadoresBienio: {
    bonusOvaciones: 0,
    fansExtra: 0,
    cambioGralExtra: 0,
    chancePremioExtra: 0,
    showsFactor: 1
  }
};
}

function guardarPartida() {
  try {
    if (!jugador || !jugador.nombre) {
      return;
    }
    localStorage.setItem(
      CLAVE_GUARDADO,
      JSON.stringify({
        version: 1,
        guardadoEn: Date.now(),
        jugador: jugador
      })
    );
  } catch (error) {
    console.warn("No se pudo guardar El Musiko", error);
  }
}

function leerPartidaGuardada() {
  try {
    const raw = localStorage.getItem(CLAVE_GUARDADO);
    if (!raw) {
      return null;
    }
    const data = JSON.parse(raw);
    if (!data || !data.jugador || !data.jugador.nombre) {
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
}

function hayPartidaGuardada() {
  return !!leerPartidaGuardada();
}

function borrarPartidaGuardada() {
  try {
    localStorage.removeItem(CLAVE_GUARDADO);
  } catch (error) {
    console.warn("No se pudo borrar el guardado", error);
  }
}

function continuarPartida() {
  const data = leerPartidaGuardada();
  if (!data) {
    alert("No hay una partida guardada.");
    actualizarMenuInicio();
    return;
  }
  jugador = Object.assign(estadoJugadorInicial(), data.jugador);
  if (!jugador.solista) {
    jugador.solista = normalizarSolista(null);
  } else {
    jugador.solista = normalizarSolista(jugador.solista);
  }
  if (!jugador.modificadoresBienio) {
    jugador.modificadoresBienio = {
      bonusOvaciones: 0,
      fansExtra: 0,
      cambioGralExtra: 0,
      chancePremioExtra: 0
    };
  }
  aplicarTemaEstilo(jugador.estilo || "Rock");
  mostrarPantallaPrincipal();
}

function nuevaCarrera() {
  borrarPartidaGuardada();
  location.reload();
}

function actualizarMenuInicio() {
  actualizarBotonMute();
  const bloque = document.getElementById("bloque-continuar");
  const resumen = document.getElementById("resumen-partida-guardada");
  if (!bloque) {
    return;
  }
  const data = leerPartidaGuardada();
  if (!data) {
    bloque.style.display = "none";
    if (resumen) {
      resumen.textContent = "";
    }
    return;
  }
  const j = data.jugador;
  bloque.style.display = "";
  if (resumen) {
    const banda = j.bandaActual || "sin banda";
    const estado = j.carreraTerminada
      ? "carrera terminada"
      : ("edad " + j.edad);
    resumen.textContent = j.nombre + " | " + banda + " | " + estado;
  }
}

document.addEventListener("DOMContentLoaded", function () { actualizarMenuInicio(); actualizarBotonMute(); });

const exigenciaBandas = {
  Under: 40,
  Regional: 60,
  Nacional: 75,
  Internacional: 82,
  Leyenda: 92
};

const ordenCategorias = [
  "Under",
  "Regional",
  "Nacional",
  "Internacional",
  "Leyenda"
];


function indiceCategoria(nombre) {
  return ordenCategorias.indexOf(nombre);
}


function subirCategoria() {
  const indice = indiceCategoria(jugador.categoria);

  if (indice < 0 || indice >= ordenCategorias.length - 1) {
    return false;
  }

  jugador.categoria = ordenCategorias[indice + 1];
  return true;
}


function bajarCategoria() {
  const indice = indiceCategoria(jugador.categoria);

  if (indice <= 0) {
    jugador.categoria = "Under";
    return false;
  }

  jugador.categoria = ordenCategorias[indice - 1];
  return true;
}


function reputacionesPermitidas() {
  const permitidas = [];
  const cat = jugador.categoria || "Under";
  const idx = Math.max(0, indiceCategoria(cat));
  function add(n) {
    if (n && permitidas.indexOf(n) === -1) permitidas.push(n);
  }
  add(ordenCategorias[idx]);
  if (idx > 0) add(ordenCategorias[idx - 1]);
  // Potential: any tier your GRAL can reasonably interest
  for (let i = 0; i < ordenCategorias.length; i++) {
    const nombre = ordenCategorias[i];
    const ex = exigenciaBandas[nombre];
    // clubs see potential ~12 below exigencia; big jump needs closer GRAL
    const holgura = i <= idx + 1 ? 12 : 6;
    if (jugador.gral + holgura >= ex) add(nombre);
  }
  return permitidas;
}


function listaPremiosCategoria(categoria) {
  const bloque = premiosPorCategoria[categoria];

  if (!bloque) {
    return [];
  }

  return [].concat(bloque.clave || [], bloque.extra || []);
}


function esPremioDeCategoria(nombre, categoria) {
  const bloque = premiosPorCategoria[categoria];

  if (!nombre || !bloque) {
    return false;
  }

  return bloque.clave.indexOf(nombre) !== -1;
}


const catalogoBandas = {
  Rock: {
    Under: [
  "Mi Perro Imaginario",
  "Livraga",
  "Ascia Vadas",
  "Carnicero de Jiles",
  "Entre Miles",
  "Praga",
  "1000 Odios",
  "4 Vientos",
  "50 Monos",
  "Abismal",
  "Acciones Violentas",
  "Aguará",
  "Ahínco",
  "Argel",
  "Arkahn",
  "Ataque Sónico",
  "Atentado",
  "Athernum",
  "Atormentador",
  "Aucá",
  "Avtomata",
  "Balrog",
  "Bardo",
  "Bonavena",
  "Calamo",
  "Caudillo",
  "Lobo",
  "Mortal",
  "NON",
  "Reptil",
  "Robayo",
  "Trimotor MDP",
  "Velocidad 22",
  "Vorax",
  "Xenda",
  "Yerra",
  "Culto Viejo",
  "Los Jokers",
  "Malverde",
  "Nenes de Bulgaria",
  "Paparush",
  "Facazo",
  "Infesto",
  "Metastasy",
  "Orate",
  "Defacto",
  "Makt",
  "Kainoas",
  "Dumbieja",
  "Matar o Morir",
  "Messiah",
  "Moriture",
  "Necratal",
  "Sangre Antigua",
  "Vinator",
  "Null",
  "Orkos de la Nieve",
  "Taurah",
  "Greenhouse Effect",
  "Proyecto Roswell",
  "Metal Jacket",
  "Noiser",
  "Pretorius",
  "Sangra la Tierra",
  "Estandar",
  "Tripalium",
  "SLAP!",
  "Ataraxia",
  "Mil Puertas",
  "BYPOLAR"
    ],
    Regional: [
  "El Plan de la Mariposa",
  "Pura Vida",
  "La H No Murió",
  "Cielo Razzo",
  "Sueño de Pescado",
  "Nagual",
  "Salta La Banca",
  "La Chancha Muda",
  "Cruzando el Charco",
  "La Mancha de Rolando",
  "Los Pérez García",
  "Don Osvaldo",
  "Ojos Locos",
  "Barrios Bajos",
  "Maldita Suerte",
  "La Condena de Caín",
  "El Buen Salvaje",
  "Sordos Rock",
  "Connor Questa",
  "Todo Aparenta Normal",
  "Parteplaneta",
  "Utopians",
  "Boiler",
  "Las Diferencias",
  "Los Rusos Hijos de Puta",
  "Pez",
  "Poseidótica",
  "Bicicletas",
  "Mustafunk",
  "Octafonic",
  "Acorazado Potemkin",
  "La hembra paraguaya",
  "Huevo",
  "Falsa Cubana",
  "Karamelo Santo",
  "Dancing Mood",
  "Mimi Maura",
  "Los Umbanda",
  "Smitten",
  "Cadena Perpetua"
    ],
    Nacional: [
  "A.N.I.M.A.L.",
  "Carajo",
  "Eruca Sativa",
  "Catupecu Machu",
  "Las Pelotas",
  "Massacre",
  "Airbag",
  "Guasones",
  "El Bordo",
  "Callejeros",
  "La 25",
  "Viejas Locas",
  "Intoxicados",
  "Jóvenes Pordioseros",
  "Attaque 77",
  "2 Minutos",
  "Kapanga",
  "Los Auténticos Decadentes",
  "Bersuit Vergarabat",
  "Árbol",
  "Los Tipitos",
  "Turf",
  "Estelares",
  "Él Mató a un Policía Motorizado",
  "Miranda!",
  "Los Brujos",
  "Los Caballeros de la Quema",
  "La Mississippi",
  "Pier",
  "Los Espíritus"
    ],
    Internacional: [
  // Cinco grandes bandas argentinas
  "Patricio Rey y sus Redonditos de Ricota",
  "La Renga",
  "Divididos",
  "Los Fabulosos Cadillacs",
  "Babasónicos",

  // Bandas extranjeras
  "Deftones",
  "Korn",
  "Slipknot",
  "System of a Down",
  "Linkin Park",
  "Green Day",
  "Red Hot Chili Peppers",
  "Pearl Jam",
  "Oasis",
  "Radiohead",
  "The Cure",
  "Arctic Monkeys",
  "Muse",
  "Queens of the Stone Age",
  "Paramore",
  "Evanescence",
  "Avenged Sevenfold",
  "Limp Bizkit",
  "Ghost",
  "Rammstein",
  "The Offspring",
  "Blink-182",
  "Placebo",
  "Incubus",
  "Audioslave"
    ],
    Leyenda: [
  "Soda Stereo",
  "The Beatles",
  "The Rolling Stones",
  "Led Zeppelin",
  "Queen",
  "Pink Floyd",
  "Black Sabbath",
  "Metallica",
  "AC/DC",
  "Nirvana",
  "Guns N Roses",
  "Iron Maiden",
  "U2",
  "Foo Fighters",
  "The Who"
    ]
  },

  Pop: {
    Under: [
      "Las Ligas Menores",
      "El Zar",
      "Gauchito Club",
      "Superchería",
      "1915",
      "Mi Amigo Invencible",
      "Isla de Caras",
      "Louta",
      "Feli Colina",
      "Sofía Viola",
      "Valdés",
      "Juana Rozas",
      "Elsa y Elmar",
      "Benjamín Amadeo",
      "J Mena",
      "Angela Torres",
      "MYA",
      "FMK",
      "Rusherking",
      "El Kuelgue"
    ],
    Regional: [
      "Conociendo Rusia",
      "Bandalos Chinos",
      "Silvestre y La Naranja",
      "Koino Yokan",
      "Usted Señalemelo",
      "Zoe Gotusso",
      "Daniela Spalla",
      "Luck Ra",
      "Lit Killah",
      "Tiago PZK",
      "WOS",
      "Trueno",
      "Emilia"
    ],
    Nacional: [
      "Miranda!",
      "Tan Biónica",
      "Los Auténticos Decadentes",
      "Turf",
      "Estelares",
      "Árbol",
      "Los Tipitos",
      "Vicentico",
      "Diego Torres",
      "Abel Pintos",
      "Axel",
      "Bandana",
      "Erreway",
      "Teen Angels",
      "Fabiana Cantilo",
      "Lali",
      "TINI",
      "María Becerra",
      "Nathy Peluso",
      "Duki",
      "Bizarrap",
      "Airbag",
      "Babasónicos"
    ],
    Internacional: [
      "Shakira",
      "Taylor Swift",
      "Dua Lipa",
      "The Weeknd",
      "Billie Eilish",
      "Ariana Grande",
      "Lady Gaga",
      "Bruno Mars",
      "Harry Styles",
      "Adele",
      "Ed Sheeran",
      "Coldplay",
      "Maroon 5",
      "Katy Perry",
      "Rihanna",
      "Beyoncé",
      "Olivia Rodrigo",
      "Sabrina Carpenter",
      "Rosalía",
      "Karol G",
      "SZA",
      "Doja Cat"
    ],
    Leyenda: [
      "Madonna",
      "Michael Jackson",
      "Prince",
      "Whitney Houston",
      "ABBA",
      "Elvis Presley",
      "Stevie Wonder",
      "Elton John",
      "David Bowie",
      "Bee Gees",
      "Tina Turner",
      "Cher",
      "Queen",
      "The Beatles",
      "Soda Stereo"
    ]
  },

  Cumbia: {
    Under: [
      "Flor de Piedra",
      "Meta Guacha",
      "Guachín",
      "Altos Cumbieros",
      "La Base",
      "El Empuje",
      "18 Kilates",
      "La Repandilla",
      "Eh!!! Guacho",
      "Los Chicos de la Vía",
      "La Banda de Lechuga",
      "Los Gedes",
      "El Dipy",
      "Callejero Fino",
      "La Piba",
      "Supermerk2",
      "Mala Fama",
      "Cumbia Nena",
      "El Villano"
    ],
    Regional: [
      "Grupo Red",
      "Los Lamas",
      "El Super Hobby",
      "Los Lirios",
      "Grupo Cali",
      "Grupo Flash",
      "La Pionera",
      "Grupo Tambo",
      "Banda Registrada",
      "Canto 4",
      "Trinidad",
      "La Diosa",
      "Los Dinos",
      "Siete Lunas",
      "El Reja",
      "Perro Primo",
      "El Original",
      "Cachumba"
    ],
    Nacional: [
      "El Polaco",
      "Néstor en Bloque",
      "Grupo Play",
      "La Champions Liga",
      "La T y la M",
      "Migrantes",
      "Dalila",
      "Ángela Leiva",
      "Los Charros",
      "Gladys La Bomba Tucumana",
      "Grupo Sombras",
      "Los del Fuego",
      "Daniel Agostini",
      "Super Sónica",
      "Los Leales",
      "Coty Hernández",
      "Sebastián Mendoza",
      "Mario Luis",
      "Uriel Lozano",
      "Pocho La Pantera",
      "Jambao",
      "Los Totora",
      "Q'Lokura",
      "BM",
      "Nene Malo",
      "Marama",
      "Rombai"
    ],
    Internacional: [
      "Ráfaga",
      "Amar Azul",
      "Los Pibes Chorros",
      "Yerba Brava",
      "La Delio Valdez",
      "Karina",
      "La Nueva Luna",
      "Ke Personajes",
      "L-Gante",
      "Los Ángeles de Charly",
      "Agapornis",
      "Grupo 5",
      "Corazón Serrano",
      "Agua Marina",
      "Armonía 10",
      "Tony Rosado",
      "Celso Piña",
      "Grupo Cañaveral",
      "Kumbia Kings",
      "La Sonora de Tommy Rey",
      "Américo",
      "Santaferia",
      "Grupo Néctar",
      "Bronco",
      "Lisandro Meza",
      "Aniceto Molina"
    ],
    Leyenda: [
      "Los Palmeras",
      "Gilda",
      "Rodrigo",
      "Leo Mattioli",
      "Damas Gratis",
      "Antonio Ríos",
      "Alcides",
      "Los Wawancó",
      "Cuarteto Imperial",
      "Los Ángeles Azules",
      "Selena",
      "La Sonora Dinamita",
      "Andrés Landero",
      "Los Mirlos"
    ]
  },

  Reggae: {
    Under: [
      "Riddim",
      "Sin Semilla",
      "La Celestina",
      "Mensajeros Reggae",
      "Química Reggae",
      "I Nesta",
      "Mentados",
      "La Manija",
      "Antidoping",
      "King Coya",
      "Vibración Positive",
      "Laguna Pai"
    ],
    Regional: [
      "Kameleba",
      "Dancing Mood",
      "Mimi Maura",
      "Mustafunk",
      "Lumumba",
      "Alika",
      "La Zimbabwe",
      "Pablo Molina",
      "Actitud María Marta",
      "Karamelo Santo",
      "Sig Ragga",
      "Resistencia Suburbana"
    ],
    Nacional: [
      "Los Pericos",
      "Los Cafres",
      "Nonpalidece",
      "Fidel Nadal",
      "Dread Mar-I",
      "Todos Tus Muertos",
      "Los Fabulosos Cadillacs",
      "Los Auténticos Decadentes"
    ],
    Internacional: [
      "Gondwana",
      "Cultura Profética",
      "Quique Neira",
      "Inner Circle",
      "Alpha Blondy",
      "Gentleman",
      "Sublime",
      "SOJA",
      "Rebelution",
      "Chronixx",
      "Damian Marley",
      "Stephen Marley",
      "Shaggy",
      "Sean Paul",
      "Buju Banton",
      "Barrington Levy",
      "Morodo",
      "Third World"
    ],
    Leyenda: [
      "Bob Marley and The Wailers",
      "Peter Tosh",
      "Bunny Wailer",
      "Jimmy Cliff",
      "Toots and the Maytals",
      "Burning Spear",
      "Desmond Dekker",
      "Lee Scratch Perry",
      "Gregory Isaacs",
      "Dennis Brown",
      "Black Uhuru",
      "The Skatalites",
      "Israel Vibration",
      "Steel Pulse",
      "UB40"
    ]
  }
};

const logosBandas = {
  "Los Pérez García": "logos/los-perez-garcia.png",
  "Don Osvaldo": "logos/don-osvaldo.png",
  "Connor Questa": "logos/connor-questa.png",
  "Karamelo Santo": "logos/karamelo-santo.png",
  "Smitten": "logos/smitten.png",
  "A.N.I.M.A.L.": "logos/animal.png",
  "Carajo": "logos/carajo.png",
  "Eruca Sativa": "logos/eruca-sativa.png",
  "Callejeros": "logos/callejeros.png",
  "La 25": "logos/la-25.png",
  "Intoxicados": "logos/intoxicados.png",
  "Attaque 77": "logos/attaque-77.png",
  "2 Minutos": "logos/2-minutos.png",
  "Miranda!": "logos/miranda.png",
  "Los Brujos": "logos/los-brujos.png",
  "La Renga": "logos/la-renga.png",
  "Los Fabulosos Cadillacs": "logos/los-fabulosos-cadillacs.png",
  "Deftones": "logos/deftones.png",
  "Korn": "logos/korn.png",
  "Slipknot": "logos/slipknot.png",
  "System of a Down": "logos/system-of-a-down.png",
  "Linkin Park": "logos/linkin-park.png",
  "Green Day": "logos/green-day.png",
  "Red Hot Chili Peppers": "logos/red-hot-chili-peppers.png",
  "Pearl Jam": "logos/pearl-jam.png",
  "Oasis": "logos/oasis.png",
  "Radiohead": "logos/radiohead.png",
  "The Cure": "logos/the-cure.png",
  "Arctic Monkeys": "logos/arctic-monkeys.png",
  "Muse": "logos/muse.png",
  "Queens of the Stone Age": "logos/queens-of-the-stone-age.png",
  "Paramore": "logos/paramore.png",
  "Evanescence": "logos/evanescence.png",
  "Avenged Sevenfold": "logos/avenged-sevenfold.png",
  "Limp Bizkit": "logos/limp-bizkit.png",
  "Ghost": "logos/ghost.png",
  "Rammstein": "logos/rammstein.png",
  "The Offspring": "logos/the-offspring.png",
  "Blink-182": "logos/blink-182.png",
  "Placebo": "logos/placebo.png",
  "Incubus": "logos/incubus.png",
  "Audioslave": "logos/audioslave.png",
  "Soda Stereo": "logos/soda-stereo.png",
  "The Beatles": "logos/the-beatles.png",
  "The Rolling Stones": "logos/the-rolling-stones.png",
  "Led Zeppelin": "logos/led-zeppelin.png",
  "Queen": "logos/queen.png",
  "Pink Floyd": "logos/pink-floyd.png",
  "Black Sabbath": "logos/black-sabbath.png",
  "Metallica": "logos/metallica.png",
  "AC/DC": "logos/acdc.png",
  "Nirvana": "logos/nirvana.png",
  "Guns N Roses": "logos/guns-n-roses.png",
  "Iron Maiden": "logos/iron-maiden.png",
  "U2": "logos/u2.png",
  "Foo Fighters": "logos/foo-fighters.png",
  "The Who": "logos/the-who.png",
  "Tan Biónica": "logos/tan-bionica.png",
  "Abel Pintos": "logos/abel-pintos.png",
  "Bandana": "logos/bandana.png",
  "Lali": "logos/lali.png",
  "TINI": "logos/tini.png",
  "Shakira": "logos/shakira.png",
  "Taylor Swift": "logos/taylor-swift.png",
  "Dua Lipa": "logos/dua-lipa.png",
  "The Weeknd": "logos/the-weeknd.png",
  "Billie Eilish": "logos/billie-eilish.png",
  "Ariana Grande": "logos/ariana-grande.png",
  "Lady Gaga": "logos/lady-gaga.png",
  "Bruno Mars": "logos/bruno-mars.png",
  "Harry Styles": "logos/harry-styles.png",
  "Adele": "logos/adele.png",
  "Ed Sheeran": "logos/ed-sheeran.png",
  "Coldplay": "logos/coldplay.png",
  "Maroon 5": "logos/maroon-5.png",
  "Katy Perry": "logos/katy-perry.png",
  "Rihanna": "logos/rihanna.png",
  "Beyoncé": "logos/beyonce.png",
  "Olivia Rodrigo": "logos/olivia-rodrigo.png",
  "Sabrina Carpenter": "logos/sabrina-carpenter.png",
  "Rosalía": "logos/rosalia.png",
  "Karol G": "logos/karol-g.png",
  "Doja Cat": "logos/doja-cat.png",
  "Madonna": "logos/madonna.png",
  "Michael Jackson": "logos/michael-jackson.png",
  "Whitney Houston": "logos/whitney-houston.png",
  "ABBA": "logos/abba.png",
  "David Bowie": "logos/david-bowie.png",
  "Bee Gees": "logos/bee-gees.png",
  "Tina Turner": "logos/tina-turner.png",
  "Cher": "logos/cher.png",
  "Selena": "logos/selena.png",
  "Gondwana": "logos/gondwana.png",
  "Sean Paul": "logos/sean-paul.png",
  "Elton John": "logos/elton-john.png",
  "Elvis Presley": "logos/elvis-presley.png",
  "Sublime": "logos/sublime.png",
  "La Sonora de Tommy Rey": "logos/la-sonora-de-tommy-rey.png",
  "UB40": "logos/ub40.png",
  "Bob Marley and The Wailers": "logos/bob-marley-and-the-wailers.png",
  "SZA": "logos/sza.png",
  "Stevie Wonder": "logos/stevie-wonder.png",
  "Toots and the Maytals": "logos/toots-and-the-maytals.png",
  "Turf": "logos/turf.png",
  "La Pionera": "logos/la-pionera.png",
  "Pez": "logos/pez.png",
  "Babasónicos": "logos/babasonicos.png",
  "Bersuit Vergarabat": "logos/bersuit-vergarabat.png",
  "Catupecu Machu": "logos/catupecu-machu.png",
  "Corazón Serrano": "logos/corazon-serrano.png",
  "Cultura Profética": "logos/cultura-profetica.png",
  "Divididos": "logos/divididos.png",
  "Grupo 5": "logos/grupo-5.png",
  "Karina": "logos/karina.png",
  "Ke Personajes": "logos/ke-personajes.png",
  "La Sonora Dinamita": "logos/la-sonora-dinamita.png",
  "Las Pelotas": "logos/las-pelotas.png",
  "Leo Mattioli": "logos/leo-mattioli.png",
  "Los Mirlos": "logos/los-mirlos.png",
  "Los Palmeras": "logos/los-palmeras.png",
  "Los Ángeles Azules": "logos/los-angeles-azules.png",
  "Massacre": "logos/massacre.png",
  "Patricio Rey y sus Redonditos de Ricota": "logos/patricio-rey-y-sus-redonditos-de-ricota.png",
  "Rebelution": "logos/rebelution.png",
  "Ráfaga": "logos/rafaga.png",
  "SOJA": "logos/soja.png",
  "Viejas Locas": "logos/viejas-locas.png",
  "Yerba Brava": "logos/yerba-brava.png",
  "Damas Gratis": "logos/damas-gratis.png",
  "Duki": "logos/duki.png",
  "Bizarrap": "logos/bizarrap.png",
  "Rodrigo": "logos/rodrigo.png",
  "Airbag": "logos/airbag.png",
  "Kapanga": "logos/kapanga.png",
  "Los Cafres": "logos/los-cafres.png",
  "Guasones": "logos/guasones.png",
  "Black Uhuru": "logos/black-uhuru.png",
  "Marama": "logos/marama.png",
  "Agua Marina": "logos/agua-marina.png",
  "Dread Mar-I": "logos/dread-mar-i.png",
  "Desmond Dekker": "logos/desmond-dekker.png",
  "The Skatalites": "logos/the-skatalites.png",
  "Vicentico": "logos/vicentico.png",
  "Lee Scratch Perry": "logos/lee-scratch-perry.png",
  "Bronco": "logos/bronco.png",
  "Prince": "logos/prince.png",
  "Santaferia": "logos/santaferia.png",
  "Los Auténticos Decadentes": "logos/los-autenticos-decadentes.png",
  "Steel Pulse": "logos/steel-pulse.png",
  "Peter Tosh": "logos/peter-tosh.png",
  "Jimmy Cliff": "logos/jimmy-cliff.png",
  "Gregory Isaacs": "logos/gregory-isaacs.png",
  "Israel Vibration": "logos/israel-vibration.png",
  "Dennis Brown": "logos/dennis-brown.png",
  "Estelares": "logos/estelares.png",
  "Kumbia Kings": "logos/kumbia-kings.png",
  "Los Pibes Chorros": "logos/los-pibes-chorros.png",
  "Los Pericos": "logos/los-pericos.png",
  "L-Gante": "logos/l-gante.png",
  "Nonpalidece": "logos/nonpalidece.png",
  "Agapornis": "logos/agapornis.png",
  "Burning Spear": "logos/burning-spear.png",
  "Gilda": "logos/gilda.png",
  "Amar Azul": "logos/amar-azul.png",
  "Antonio Ríos": "logos/antonio-rios.png",
  "Alcides": "logos/alcides.png"
};


function slugBanda(nombre) {
  const especiales = {
    "AC/DC": "acdc",
    "A.N.I.M.A.L.": "animal",
    "SLAP!": "slap",
    "Miranda!": "miranda"
  };

  if (especiales[nombre]) {
    return especiales[nombre];
  }

  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}


function obtenerLogoBanda(nombre) {
  return logosBandas[nombre] || ("logos/" + slugBanda(nombre) + ".png");
}


function nombrePremio(premio) {
  if (!premio) {
    return "";
  }

  if (typeof premio === "string") {
    return premio.replace(" · ASCENSO", "").trim();
  }

  return String(premio.nombre || "").replace(" · ASCENSO", "").trim();
}


function yaTienePremio(nombre) {
  return jugador.premios.some(
    premio => nombrePremio(premio) === nombre
  );
}


function slugPremio(nombre) {
  return slugBanda(nombrePremio(nombre));
}


function obtenerLogoPremio(nombre) {
  return "premios/" + slugPremio(nombre) + ".png";
}


function mostrarLogoPremio(premio, tamaño = 22) {
  const limpio = nombrePremio(premio);

  if (!limpio) {
    return "";
  }

  return `
    <img
      class="logo-premio"
      src="${obtenerLogoPremio(limpio)}"
      alt="${limpio}"
      title="${limpio}"
      width="${tamaño}"
      height="${tamaño}"
      onerror="this.onerror=null; this.src='premios/default.png'"
    >
  `;
}


function mostrarLogoBanda(nombre, tamaño = 40) {
  if (!nombre) {
    return "";
  }

  return `
    <img
      class="logo-banda"
      src="${obtenerLogoBanda(nombre)}"
      alt="Logo de ${nombre}"
      width="${tamaño}"
      height="${tamaño}"
      onerror="this.onerror=null; this.src='logos/default.png'"
    >
  `;
}


function modificadoresVacios() {
  return {
    bonusOvaciones: 0,
    fansExtra: 0,
    cambioGralExtra: 0,
    chancePremioExtra: 0,
    cansancioDelta: 0,
    showsFactor: 1
  };
}


function signoNumero(valor) {
  return (valor > 0 ? "+" : "") + valor;
}


function opcionSorteo(texto, chanceBuena, resultadoBueno, resultadoMalo, etiqueta) {
  return {
    texto: texto,
    sorteo: true,
    chanceBuena: chanceBuena,
    resultadoBueno: resultadoBueno,
    resultadoMalo: resultadoMalo,
    etiqueta: etiqueta || ""
  };
}


function seguirComoSiempre() {
  // Compat: ya no es "no hacer nada". Quedarte al margen cuesta un poco.
  return quedarteAlMargen();
}

function quedarteAlMargen() {
  return {
    texto: "No te metés",
    modificadores: { cambioGralExtra: -1 }
  };
}

function bancarElMomento() {
  return {
    texto: "Bancar el momento",
    modificadores: { cambioGralExtra: 1 }
  };
}


function opcionIrseDeBanda() {
  return {
    texto: "Irse de la banda",
    separacion: true,
    salidaVoluntaria: true,
    modificadores: modificadoresVacios()
  };
}


function extraGral(opcion) {
  const m = (opcion && opcion.modificadores) || modificadoresVacios();
  return m.cambioGralExtra || 0;
}


// Estilo Copero: acción arriba, abajo solo el detalle corto.
// Ej: "GRAL +3"  |  "GRAL +3 / GRAL -4"  |  "Salís de la banda"
// Sin fans, % ovaciones ni textos largos mezclados.
function textoEfecto(opcion) {
  if (!opcion) {
    return "";
  }

  if (opcion.etiqueta) {
    return opcion.etiqueta;
  }

  const partes = [];
  const m = opcion.modificadores || modificadoresVacios();
  const gral = m.cambioGralExtra || 0;

  if (gral !== 0) {
    partes.push("GRAL " + (gral > 0 ? "+" : "") + gral);
  }

  if (opcion.rol) {
    partes.push(opcion.rol);
  }

  if (opcion.descenso) {
    partes.push("Descenso");
  }

  if (opcion.separacion) {
    partes.push("Salís");
  }

  if (opcion.volverOrigen) {
    partes.push("Volvés");
  }

  if (m.showsFactor && m.showsFactor < 1) {
    partes.push("Menos shows");
  } else if (m.showsFactor && m.showsFactor > 1) {
    partes.push("Más shows");
  }

  return partes.join(" · ");
}


function formatearEfectos(opcion) {
  if (!opcion) {
    return "";
  }

  if (opcion.etiqueta) {
    return opcion.etiqueta;
  }

  if (opcion.sorteo) {
    const gBueno = extraGral(opcion.resultadoBueno);
    const gMalo = extraGral(opcion.resultadoMalo);
    if (gBueno !== 0 || gMalo !== 0) {
      const a = "GRAL " + (gBueno > 0 ? "+" : "") + gBueno;
      const b = "GRAL " + (gMalo > 0 ? "+" : "") + gMalo;
      return a + " / " + b;
    }
    const bueno = textoEfecto(opcion.resultadoBueno);
    const malo = textoEfecto(opcion.resultadoMalo);
    if (bueno && malo) {
      return bueno + " / " + malo;
    }
    return bueno || malo || "A suerte";
  }

  return textoEfecto(opcion);
}


function clampCansancio(valor) {
  return 0;
}


function aplicarCansancioEvento() {
  jugador.cansancio = 0;
}


function cargarCansancioBienio(showsBienio, anios) {
  jugador.cansancio = 0;
}


function umbralesEtapa() {
  const intenso = jugador.modo === "Intenso";
  const base = intenso
    ? {
        ovacionPremio: 5,
        ovacionPremioAlto: 7,
        soloPremio: 4,
        ovacionGral: 5,
        soloGral: 3,
        soloGuitarra: 4,
        ovacionDespido: 5,
        soloDespido: 3,
        ovacionOferta: 5,
        soloOferta: 4,
        ovacionTitular: 4,
        soloTitular: 3
      }
    : {
        ovacionPremio: 10,
        ovacionPremioAlto: 14,
        soloPremio: 8,
        ovacionGral: 10,
        soloGral: 7,
        soloGuitarra: 9,
        ovacionDespido: 10,
        soloDespido: 6,
        ovacionOferta: 10,
        soloOferta: 8,
        ovacionTitular: 8,
        soloTitular: 6
      };

  const exigencia =
    exigenciaBandas[jugador.reputacionBandaActual] || 40;
  const holgura = Math.max(0, jugador.gral - exigencia);

  // En bandas chicas, si ya sos claramente mejor, los premios cuestan mas (anti-farm).
  const escalaPremio = 1 + Math.min(0.9, holgura * 0.045);

  // En bandas grandes, un buen bienio cuenta aunque el GRAL todavia no llegue a la exigencia.
  const escalaGral = exigencia >= 75 ? 0.82 : exigencia >= 60 ? 0.92 : 1;

  let multOv = 1;
  let multSo = 1;
  const inst = jugador.instrumento;

  if (inst === "Cantante") {
    multOv = 0.88; // favorece ovaciones
  } else if (inst === "Guitarra") {
    multSo = 0.88; // favorece solos
  } else if (inst === "Bajista" || inst === "Batería" || inst === "Percusión") {
    multOv = 0.94; // ritmo: umbrales un toque más blandos (shows pesan)
  }

  return {
    ovacionPremio: Math.max(3, Math.round(base.ovacionPremio * escalaPremio * multOv)),
    ovacionPremioAlto: Math.max(4, Math.round(base.ovacionPremioAlto * escalaPremio * multOv)),
    soloPremio: Math.max(2, Math.round(base.soloPremio * escalaPremio * multSo)),
    ovacionGral: Math.max(3, Math.round(base.ovacionGral * escalaGral * multOv)),
    soloGral: Math.max(2, Math.round(base.soloGral * escalaGral * multSo)),
    soloGuitarra: Math.max(2, Math.round(base.soloGuitarra * escalaGral * multSo)),
    ovacionDespido: Math.max(3, Math.round(base.ovacionDespido * multOv)),
    soloDespido: Math.max(2, Math.round(base.soloDespido * multSo)),
    ovacionOferta: Math.max(3, Math.round(base.ovacionOferta * multOv)),
    soloOferta: Math.max(2, Math.round(base.soloOferta * multSo)),
    ovacionTitular: Math.max(3, Math.round(base.ovacionTitular * multOv)),
    soloTitular: Math.max(2, Math.round(base.soloTitular * multSo))
  };
}


function actualizarRol(ovacionesBienio, solosBienio) {
  if (!jugador.bandaActual) {
    return false;
  }

  if (jugador.rolFijadoPorEvento) {
    jugador.rolFijadoPorEvento = false;
    return true;
  }

  const anterior = jugador.rol;
  const umbral = umbralesEtapa();

  if (
    jugador.rol === "Suplente" &&
    (ovacionesBienio >= umbral.ovacionTitular ||
      solosBienio >= umbral.soloTitular)
  ) {
    jugador.rol = "Titular";
  } else if (
    jugador.rol === "Titular" &&
    ovacionesBienio <= 3 &&
    solosBienio <= 2 &&
    jugador.cansancio >= 99
  ) {
    jugador.rol = "Suplente";
  }

  return jugador.rol !== anterior;
}


const premiosPorCategoria = {
  Under: {
    clave: [
      "Batalla de bandas de la ciudad"
    ],
    extra: [
      "Revelación de radio FM",
      "Mejor artista del circuito independiente"
    ]
  },
  Regional: {
    clave: [
      "Premio Gardel · Mejor nuevo artista"
    ],
    extra: [
      "Disco de oro",
      "N.º 1 más escuchado en Spotify",
      "N.º 1 videoclip de YouTube",
      "Gaviota de Plata (Viña del Mar)"
    ]
  },
  Nacional: {
    clave: [
      "Gardel de Oro"
    ],
    extra: [
      "Premio Gardel · Canción del año",
      "Disco de platino",
      "Gaviota de Oro (Viña del Mar)"
    ]
  },
  Internacional: {
    clave: [
      "Latin Grammy"
    ],
    extra: [
      "MTV EMA",
      "Billboard Latin Music Award",
      "Multiplatino"
    ]
  },
  Leyenda: {
    clave: [
      "Grammy"
    ],
    extra: [
      "Disco de diamante",
      "Polar Music Prize",
      "Latin Grammy Persona del Año"
    ]
  }
};


const premiosSolista = [
  "Sesión destacada",
  "Featuring del año",
  "Hit solista",
  "Gira íntima sold-out",
  "Unplugged TV",
  "Colaboración viral",
  "Disco solista de oro",
  "Artista solista del año"
];

function esPremioSolista(nombre) {
  return premiosSolista.indexOf(nombre) !== -1;
}

function otorgarPremio(nombre) {
  if (!nombre || yaTienePremio(nombre)) {
    return false;
  }

  const esSolista = esPremioSolista(nombre);

  jugador.premios.push({
    nombre: nombre,
    banda: esSolista ? "Solista" : (jugador.bandaActual || ""),
    tipo: esSolista ? "solista" : "banda"
  });
  jugador.ultimoLogro = nombre;
  jugador.premiosPendientes.push(nombre);

  if (esSolista) {
    jugador.solista = normalizarSolista(jugador.solista);
    if (!Array.isArray(jugador.solista.premios)) {
      jugador.solista.premios = [];
    }
    if (jugador.solista.premios.indexOf(nombre) === -1) {
      jugador.solista.premios.push(nombre);
    }
  } else if (esPremioDeCategoria(nombre, jugador.categoria)) {
    if (subirCategoria()) {
      jugador.ultimoLogro = nombre + " · ASCENSO";
    }
  }

  sonarPremio();
  return true;
}


function premioDeLaCategoria() {
  const categoria =
    jugador.categoria ||
    jugador.reputacionBandaActual;

  if (!categoria) {
    return [];
  }

  return listaPremiosCategoria(categoria).filter(
    premio => !yaTienePremio(premio)
  );
}


function evaluarPremioBienio(ovacionesBienio, solosBienio, fueDespedido) {
  if (fueDespedido || !jugador.reputacionBandaActual) {
    return;
  }

  const opciones = premioDeLaCategoria();

  if (opciones.length === 0) {
    return;
  }

  const categoria =
    jugador.categoria || jugador.reputacionBandaActual || "Under";
  const umbral = umbralesEtapa();

  const basePorCategoria = {
    Under: 0.03,
    Regional: 0.045,
    Nacional: 0.07,
    Internacional: 0.09,
    Leyenda: 0.11
  };

  let chance =
    (basePorCategoria[categoria] || 0.05) +
    (jugador.modificadoresBienio.chancePremioExtra || 0);

  if (ovacionesBienio >= umbral.ovacionPremio) {
    chance += 0.10;
  }

  if (ovacionesBienio >= umbral.ovacionPremioAlto) {
    chance += 0.08;
  }

  if (solosBienio >= umbral.soloPremio) {
    chance += 0.06;
  }

  const exigencia =
    exigenciaBandas[jugador.reputacionBandaActual];

  // Solo bonus de "estas a la altura" desde Nacional: en Under era regalar premios.
  if (
    exigencia &&
    jugador.gral >= exigencia &&
    (categoria === "Nacional" ||
      categoria === "Internacional" ||
      categoria === "Leyenda")
  ) {
    chance += 0.07;
  }

  if (jugador.rol === "Suplente") {
    chance -= 0.10;
  }

  if (jugador.cansancio >= 99) {
    chance -= 0.12;
  }

  const maxChance =
    categoria === "Under" || categoria === "Regional" ? 0.22 : 0.40;
  chance = Math.max(0.015, Math.min(maxChance, chance));

  const maxPremios =
    categoria === "Under" ? 1 : categoria === "Regional" ? 1 : 2;

  const mezcladas = [...opciones].sort(() => Math.random() - 0.5);
  const ganados = [];

  mezcladas.forEach(premio => {
    if (ganados.length >= maxPremios) {
      return;
    }

    let tiro = chance;

    if (esPremioDeCategoria(premio, jugador.categoria)) {
      // El premio clave (ascenso) es mas raro al principio.
      tiro +=
        categoria === "Under" || categoria === "Regional" ? 0.02 : 0.05;
    }

    if (Math.random() < tiro && otorgarPremio(premio)) {
      ganados.push(premio);
    }
  });
}


function renderVitrina(conBanda, tamano) {
  if (jugador.premios.length === 0) {
    return `
      <p class="muted">
        Todavía no ganaste ningún premio.
      </p>
    `;
  }

  let items = "";

  jugador.premios.forEach(premio => {
    const nombre = nombrePremio(premio);
    const banda =
      conBanda && premio && premio.banda ? premio.banda : "";
    const titulo = banda ? nombre + " · " + banda : nombre;

    items += `
      <li class="item-premio" title="${titulo}">
        ${mostrarLogoPremio(premio, tamano || 32)}
      </li>
    `;
  });

  return `
    <ul class="vitrina-grid">
      ${items}
    </ul>
  `;
}


function desglosarLogro(logro) {
  const valor = logro && logro !== "-" ? logro : "";
  const estados = {
    DESPEDIDO: true,
    SEPARACIÓN: true,
    SALISTE: true,
    TITULAR: true,
    SUPLENTE: true,
    ASCENSO: true
  };

  if (estados[valor]) {
    return {
      estado: valor,
      premio: ""
    };
  }

  return {
    estado: "",
    premio: valor
  };
}


function premiosDeEtapa(etapa) {
  if (etapa.premios && etapa.premios.length) {
    return etapa.premios;
  }

  const partes = desglosarLogro(etapa.logro);
  return partes.premio ? [nombrePremio(partes.premio)] : [];
}


function headersTimeline() {
  const inst = jugador.instrumento;
  if (inst === "Cantante") {
    return { shows: "SHOWS", ovaciones: "OVACIONES", solos: "MOMENTOS" };
  }
  if (inst === "Guitarra") {
    return { shows: "SHOWS", ovaciones: "OVACIONES", solos: "SOLOS" };
  }
  if (inst === "Bajista") {
    return { shows: "SHOWS", ovaciones: "GROOVE", solos: "BREAKS" };
  }
  if (inst === "Batería" || inst === "Percusión") {
    return { shows: "SHOWS", ovaciones: "OVACIONES", solos: "FILLS" };
  }
  return { shows: "SHOWS", ovaciones: "OVACIONES", solos: "SOLOS" };
}


function icoStat(tipo) {
  if (tipo === "shows") {
    return jugador.instrumento === "Guitarra" ? "🎸" : "🎤";
  }
  if (tipo === "ovaciones") {
    return "👏";
  }
  return "⚡";
}


function celdaStat(valor, tipo) {
  return (
    '<td class="num celda-stat">' +
    '<span class="stat-ico">' + icoStat(tipo) + "</span>" +
    valor +
    "</td>"
  );
}


function renderLineaTiempo() {
  let filas = "";
  const heads = headersTimeline();

  if (jugador.historial.length === 0) {
    filas = `
      <tr>
        <td class="etapa-vacia" colspan="8">
          Todavía no hay años jugados.
        </td>
      </tr>
    `;
  } else {
    jugador.historial.forEach((etapa, indice) => {
      const partes = desglosarLogro(etapa.logro);
      const esUltima = indice === jugador.historial.length - 1;
      const activa = esUltima ? " etapa-activa" : "";
      const nueva =
        esUltima && pendienteAnimarEtapa ? " etapa-nueva" : "";

      filas += `
        <tr class="${activa}${nueva}">
          <td>${etapa.edad}</td>
          <td>
            <span class="col-banda">
              ${mostrarLogoBanda(etapa.banda, 16)}
              ${etapa.banda || "Sin banda"}
            </span>
          </td>
          <td>${partes.estado}</td>
          <td class="col-premio">
            ${premiosDeEtapa(etapa).map(premio => mostrarLogoPremio(premio, 22)).join("")}
          </td>
          ${celdaStat(etapa.shows, "shows")}
          ${celdaStat(etapa.ovaciones, "ovaciones")}
          ${celdaStat(etapa.solos, "solos")}
          <td class="num col-gral">${etapa.gral}</td>
        </tr>
      `;
    });
  }

  const sol = normalizarSolista(jugador.solista);
  const sesiones = sol.sesiones || 0;
  const premiosSol = Array.isArray(sol.premios) ? sol.premios : [];
  const ultimoPremioSol =
    premiosSol.length > 0 ? premiosSol[premiosSol.length - 1] : "";
  const celdaPremioSol = ultimoPremioSol
    ? mostrarLogoPremio(ultimoPremioSol, 22)
    : (premiosSol.length
        ? premiosSol.length + "★"
        : "—");

  filas += `
    <tr class="etapa-solista">
      <td>Solista</td>
      <td>${sesiones > 0 ? "Solista" : "—"}</td>
      <td>${sesiones > 0 ? sesiones + " ses." : "—"}</td>
      <td class="col-premio">${celdaPremioSol}</td>
      ${celdaStat(sol.shows || 0, "shows")}
      ${celdaStat(sol.ovaciones || 0, "ovaciones")}
      ${celdaStat(sol.solos || 0, "solos")}
      <td class="num">—</td>
    </tr>
  `;

  return `
    <aside class="linea-tiempo">
      <h2>CARRERA</h2>
      <div class="tabla-anos-wrap">
        <table class="tabla-anos">
          <thead>
            <tr>
              <th>Edad</th>
              <th>Banda</th>
              <th>Estado</th>
              <th>Premio</th>
              <th>${heads.shows}</th>
              <th>${heads.ovaciones}</th>
              <th>${heads.solos}</th>
              <th>GRAL</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      </div>
    </aside>
  `;
}


function textoTendinitis() {
  if (jugador.instrumento === "Cantante") {
    return "Nódulos en las cuerdas: el médico dice parar.";
  }
  return "Tendinitis de mano: el médico dice parar.";
}

function historiaTendinitis() {
  if (jugador.instrumento === "Cantante") {
    return "En el ensayo la voz se corta a la tercera canción. El otorrino habla de nódulos y de semanas sin micrófono. El manager mira el calendario de peñas y boliches como si fuera un enemigo.";
  }
  return "En el ensayo el pulgar se traba al tercer tema. El traumatólogo habla de tendinitis y de reposo real. El manager mira la grilla de la gira y no quiere escuchar la palabra cancelar.";
}


const eventos = [
  {
    texto: "Te ofrecen abrir para una banda nacional.",
    historia: "El manager larga el WhatsApp a las 2 de la mañana: tres fechas, micro a Córdoba y vuelta sin dormir. La platea sería enorme, pero el cuerpo ya viene rasposo de la peña del finde.",
    opcionA: {
      texto: "Bancarte el viaje",
      modificadores: { bonusOvaciones: 0.10, fansExtra: 800, cambioGralExtra: 3, cansancioDelta: 2 }
    },
    opcionB: {
      texto: "Priorizar el cuerpo",
      modificadores: { bonusOvaciones: 0.02, fansExtra: 100, cambioGralExtra: 1, cansancioDelta: -1 }
    }
  },
  {
    texto: "La gira se estira: más escenarios, menos sueño.",
    historia: "Sumaron Rosario, Santa Fe y un boliche de última hora. El batero ya no habla de mañana; habla de ibuprofeno. Queda decidir si la banda persigue el momentum o se guarda para no quebrarse.",
    opcionA: {
      texto: "Priorizar la gira",
      modificadores: { bonusOvaciones: 0.08, fansExtra: 1000, cambioGralExtra: 3, cansancioDelta: 3 }
    },
    opcionB: {
      texto: "Bajar fechas y dormir",
      modificadores: { showsFactor: 0.75, bonusOvaciones: 0.02, fansExtra: 200, cambioGralExtra: 1, cansancioDelta: -2 }
    }
  },
  {
    texto: "Un artista más grande te tienta con un feat.",
    historia: "Te mandan el dembow a medio armar y un cachetazo que cubre tres meses de ensayo. Suena a puerta grande, pero también a ceder el arreglo y firmar con el logo de otro arriba del tuyo.",
    opcionA: {
      texto: "Agarrar el feat",
      modificadores: { bonusOvaciones: 0.05, fansExtra: 1200, cambioGralExtra: 3, chancePremioExtra: 0.12 }
    },
    opcionB: {
      texto: "Cuidar tu sonido",
      modificadores: { bonusOvaciones: 0.04, fansExtra: 200, cambioGralExtra: 2 }
    }
  },
  {
    id: "tendinitis",
    texto: "Una tendinitis te avisa en el ensayo. El médico dice parar.",
    historia: "El cuerpo corta la discusión: o frenás o el próximo show te cobra con intereses. El manager empuja fechas; tus manos (o tu garganta) piden fisio y silencio.",
    prioridadCansancio: true,
    opcionA: {
      texto: "Fisio + técnica",
      modificadores: { bonusOvaciones: 0.04, fansExtra: 200, cambioGralExtra: 2, cansancioDelta: -1 },
      postEfecto: function () { jugador.cooldownTendinitis = 3; }
    },
    opcionB: {
      texto: "Bajar shows",
      modificadores: { showsFactor: 0.7, bonusOvaciones: 0.02, fansExtra: 100, cambioGralExtra: 1, cansancioDelta: -1 },
      postEfecto: function () { jugador.cooldownTendinitis = 2; }
    },
    opcionC: opcionSorteo(
      "Ignorar el dolor",
      0.30,
      {
        texto: "Aguantás la fecha y el vivo queda en la memoria del boliche.",
        modificadores: { bonusOvaciones: 0.08, fansExtra: 500, cambioGralExtra: 3, cansancioDelta: 2 },
        postEfecto: function () { jugador.cooldownTendinitis = 3; }
      },
      {
        texto: "Te quebrás a mitad del set y el cuerpo te cobra la factura.",
        modificadores: { bonusOvaciones: -0.08, fansExtra: 40, cambioGralExtra: -4, cansancioDelta: 4, showsFactor: 0.6 },
        postEfecto: function () { jugador.cooldownTendinitis = 3; }
      }
    )
  },
  {
    texto: "Hay una batalla de bandas en tu ciudad.",
    historia: "El under local arma la grilla en un club de barrio. Ganar es cartel y birra de honor; perder es bancar el chiste en el after durante meses. Tus pibes te miran esperando que digas que sí.",
    estilos: ["Rock"],
    categorias: ["Under"],
    opcionA: opcionSorteo(
      "Anotarse y pelearla",
      0.42,
      {
        texto: "Ganás la batalla y la sala te lleva en andas hasta la puerta.",
        modificadores: { bonusOvaciones: 0.08, fansExtra: 600, cambioGralExtra: 3, chancePremioExtra: 0.35 }
      },
      {
        texto: "Quedás afuera en semifinal y el barrio se acuerda igual.",
        modificadores: { bonusOvaciones: -0.03, fansExtra: 50, cambioGralExtra: -1 }
      }
    ),
    opcionB: {
      texto: "Cederle el cupo a otra banda",
      modificadores: { bonusOvaciones: 0.02, fansExtra: 80, cambioGralExtra: 1 }
    }
  },
  {
    texto: "Una competencia pop te mete en la grilla.",
    historia: "Hay jurado, luces y un productor que promete playlist. Suena a atajo hacia la radio, pero también a quedar etiquetado como banda de casting frente a tus amigos del circuito.",
    estilos: ["Pop"],
    categorias: ["Under"],
    opcionA: opcionSorteo(
      "Competir con todo",
      0.40,
      {
        texto: "La competencia te deja nombre en la boca de la platea pop.",
        modificadores: { bonusOvaciones: 0.08, fansExtra: 600, cambioGralExtra: 3, chancePremioExtra: 0.35 }
      },
      {
        texto: "Quedás en el medio de la grilla y el casting te gasta.",
        modificadores: { bonusOvaciones: -0.03, fansExtra: 50, cambioGralExtra: -1 }
      }
    ),
    opcionB: {
      texto: "Seguir por el circuito propio",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 150, cambioGralExtra: 2 }
    }
  },
  {
    texto: "Costa Cannabis busca la mejor banda del encuentro.",
    historia: "El flyer circula entre amigos del reggae: escenario al aire libre, gente de toda la costa y un premio que abre fechas. También es calor, demora y un horario que te puede dejar tocando para las reposeras.",
    estilos: ["Reggae"],
    categorias: ["Under"],
    opcionA: opcionSorteo(
      "Subir al encuentro",
      0.42,
      {
        texto: "El encuentro te levanta y sumás fechas en la costa.",
        modificadores: { bonusOvaciones: 0.08, fansExtra: 600, cambioGralExtra: 3, chancePremioExtra: 0.35 }
      },
      {
        texto: "El horario te come y tocás cuando la gente ya se fue a la carpa.",
        modificadores: { bonusOvaciones: -0.03, fansExtra: 50, cambioGralExtra: -1 }
      }
    ),
    opcionB: {
      texto: "Guardar energía para la peña",
      modificadores: { cansancioDelta: -1, cambioGralExtra: 1, fansExtra: 80 }
    }
  },
  {
    texto: "Tu zona te pide que subas a la batalla de barrios.",
    historia: "Los pibes del barrio armaron la pelea en el club. Si no vas, alguien más lleva la bandera. Si vas y perdés, el after se pone pesado. La lealtad pesa tanto como el cachet.",
    estilos: ["Cumbia"],
    categorias: ["Under"],
    opcionA: opcionSorteo(
      "Salir a ganarla por el barrio",
      0.40,
      {
        texto: "Tu zona te lleva en andas y el audio del vivo se reparte por WhatsApp.",
        modificadores: { bonusOvaciones: 0.08, fansExtra: 600, cambioGralExtra: 3, chancePremioExtra: 0.35 }
      },
      {
        texto: "La batalla se te va y el barrio te mira raro en el after.",
        modificadores: { bonusOvaciones: -0.03, fansExtra: 50, cambioGralExtra: -1 }
      }
    ),
    opcionB: {
      texto: "Bancarle al DJ local el cupo",
      modificadores: { cambioGralExtra: 1, fansExtra: 100, bonusOvaciones: 0.02 }
    }
  },
  {
    texto: "El corte puede pelear el N.º 1 digital.",
    historia: "El community pide plata para ads y un videoclip express. Podés empujar el single como si fuera final de Champions o dejar que labure solo y cuidar la plata del ensayo.",
    categorias: ["Regional"],
    opcionA: {
      texto: "Empujar el corte con todo",
      modificadores: { bonusOvaciones: 0.04, fansExtra: 700, cambioGralExtra: 2, chancePremioExtra: 0.22, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Dejar que labure sin forzar",
      modificadores: { fansExtra: 150, cambioGralExtra: 1 }
    }
  },
  {
    texto: "Te llaman al Festival de Viña del Mar.",
    historia: "El mail llega con membrete y nervios: escenario enorme, prensa chilena y una platea que silba sin piedad. Es el salto regional soñado… o el vivo que te marca para siempre si se te traba un verso.",
    categorias: ["Regional", "Nacional"],
    opcionA: opcionSorteo(
      "Cruzar a Viña",
      0.38,
      {
        texto: "Viña te aplaude y el clip del vivo te abre la frontera.",
        modificadores: { bonusOvaciones: 0.05, fansExtra: 900, cambioGralExtra: 2, chancePremioExtra: 0.18, cansancioDelta: 1 }
      },
      {
        texto: "El festival te pasa por arriba y el silbido queda en el highlight.",
        modificadores: { cambioGralExtra: -2, cansancioDelta: 2 }
      }
    ),
    opcionB: {
      texto: "Seguir laburando el circuito local",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 200, cambioGralExtra: 1 }
    }
  },
  {
    texto: "Suena tu nombre en los Premios Gardel.",
    historia: "La lista filtrada te mete en la conversación. Hacer campaña es asados con votantes, stories y sonreír de más; no hacerla es bancar el orgullo… y arriesgarte a que te pasen por al lado.",
    categorias: ["Nacional"],
    opcionA: {
      texto: "Hacer la campaña completa",
      modificadores: { bonusOvaciones: 0.05, fansExtra: 900, cambioGralExtra: 2, chancePremioExtra: 0.20, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Dejar que hable el disco",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 250, cambioGralExtra: 1 }
    }
  },
  {
    texto: "La academia latina te mete en los Latin Grammy.",
    historia: "Hay vuelo, alfombra y una foto que puede cruzar fronteras. También hay que sonreírle a gente que no conoce tu peña de origen. El manager ya compró el traje; vos todavía dudás del precio.",
    categorias: ["Internacional"],
    opcionA: {
      texto: "Jugar la alfombra",
      modificadores: { bonusOvaciones: 0.05, fansExtra: 1200, cambioGralExtra: 3, chancePremioExtra: 0.18, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Quedarte laburando con la banda",
      modificadores: { bonusOvaciones: 0.04, fansExtra: 300, cambioGralExtra: 2 }
    }
  },
  {
    texto: "Suena tu nombre en las nominaciones al Grammy.",
    historia: "Un mail en inglés y un grupo de WhatsApp explotado. Es el cartel más alto… y el más caro en tiempo, cabeza y expectativa. La banda pregunta si esto sigue siendo de ustedes o ya es otra liga.",
    categorias: ["Leyenda"],
    opcionA: opcionSorteo(
      "Apostar toda la campaña",
      0.32,
      {
        texto: "El mundo te apunta y el nombre salta de continente.",
        modificadores: { bonusOvaciones: 0.05, fansExtra: 1400, cambioGralExtra: 3, chancePremioExtra: 0.16 }
      },
      {
        texto: "La campaña no alcanza y volvés con la valija más pesada.",
        modificadores: { cambioGralExtra: -2, cansancioDelta: 1 }
      }
    ),
    opcionB: {
      texto: "Bajar el perfil y cuidar el foco",
      modificadores: { cambioGralExtra: 1, fansExtra: 200, cansancioDelta: -1 }
    }
  },
  {
    texto: "El disco nuevo sale flojo y la prensa lo parte.",
    historia: "Un diario grande titula sin piedad. En el ensayo nadie mira a nadie. Podés salir a bancar el palo en público o encerrarte a reescribir… sabiendo que el silencio también se lee como derrota.",
    categorias: ["Regional", "Nacional", "Internacional", "Leyenda"],
    opcionA: opcionSorteo(
      "Salir a bancar el palo",
      0.35,
      {
        texto: "Aguantás el palo y la platea te respeta por no esconderte.",
        modificadores: { bonusOvaciones: -0.02, fansExtra: -100, cambioGralExtra: 1 }
      },
      {
        texto: "La prensa te hunde y el relato se te va de las manos.",
        descenso: true,
        modificadores: { bonusOvaciones: -0.06, fansExtra: -400, cambioGralExtra: -2 }
      }
    ),
    opcionB: {
      texto: "Encerrarte a reescribir el disco",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 50, cambioGralExtra: 2, cansancioDelta: 2, showsFactor: 0.85 }
    }
  },
  {
    texto: "El de al lado no llega: te ofrecen cubrir todo.",
    historia: "El titular se trabó con un vuelo y el manager te mira como a la única salida. Es la chance de pasar de banco a nombre en el flyer… a costa de cargar todos los shows y las broncas ajenas.",
    roles: ["Suplente"],
    opcionA: {
      texto: "Agarrar el puesto completo",
      rol: "Titular",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 250, cambioGralExtra: 2, cansancioDelta: 2 }
    },
    opcionB: {
      texto: "Seguir en el banco",
      rol: "Suplente",
      modificadores: modificadoresVacios()
    }
  },
  {
    texto: "Quieren rotar la formación y bajarte un cambio.",
    historia: "Lo largan en el after como si fuera logística. Un pibe más joven, más barato, más 'disponible'. Es orgullo versus quedarte a pelear el lugar en una banda que ya te midió en frío.",
    roles: ["Titular"],
    opcionA: {
      texto: "Pelear el puesto en ensayo",
      rol: "Titular",
      modificadores: { bonusOvaciones: 0.04, fansExtra: 200, cambioGralExtra: 2, cansancioDelta: 1 }
    },
    opcionB: opcionIrseDeBanda()
  },
  {
    texto: "Se te cruza tatuarte la cara.",
    historia: "Después del show, con la adrenalina todavía caliente, alguien pasa el contacto del tatuador. Es identidad a fuego o un error que la prensa va a agrandar. La banda ni opina: es tu cara.",
    opcionA: opcionSorteo(
      "Tatuarse la cara",
      0.35,
      {
        texto: "El tatuaje te da un aire y la gente te cree de entrada.",
        modificadores: { bonusOvaciones: 0.06, fansExtra: 600, cambioGralExtra: 2 }
      },
      {
        texto: "Se infecta y el nombre se ensucia en las stories del under.",
        modificadores: { bonusOvaciones: -0.04, fansExtra: -200, cambioGralExtra: -2, cansancioDelta: 2 }
      }
    ),
    opcionB: {
      texto: "Dejar la cara en paz",
      modificadores: { cambioGralExtra: 1 }
    }
  },
  {
    texto: "Te llaman a un programa de TV.",
    historia: "Es exposición nacional y también un living con chistes baratos. El productor promete 'humano y cercano'; vos sabés que un gag mal parado te puede quedar pegado más que un single.",
    opcionA: {
      texto: "Entrar al circo",
      modificadores: { bonusOvaciones: 0.04, fansExtra: 1400, cambioGralExtra: 3, chancePremioExtra: 0.10, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Cuidar el misterio",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 200, cambioGralExtra: 1 }
    }
  },
  {
    texto: "En el after te ofrecen una sustancia misteriosa.",
    historia: "La mesa del fondo, la conversación baja y alguien acerca el sobre como si fuera un favor. Promete un período más vivo. También promete un doping, un hueco y una conversación que nadie quiere tener.",
    opcionA: opcionSorteo(
      "Consumir",
      0.28,
      {
        texto: "Pegó: el período te sale más vivo y la gente lo nota.",
        modificadores: { bonusOvaciones: 0.04, fansExtra: 200, cambioGralExtra: 3, cansancioDelta: 1 }
      },
      {
        texto: "Salís en el doping y el nombre se ensucia de un saque.",
        modificadores: { bonusOvaciones: -0.04, fansExtra: -500, cambioGralExtra: -4, cansancioDelta: 2 }
      }
    ),
    opcionB: {
      texto: "Pasar el sobre y pedir agua",
      modificadores: { cambioGralExtra: 1, cansancioDelta: -1 }
    }
  },
  {
    texto: "El público te silba y en la banda ya no te bancan.",
    historia: "Dos shows flojos y el camerino se pone frío. El líder habla de 'energía'. Podés jugarte el próximo vivo como si fuera juicio final… o largar antes de que te echen con el flyer ya impreso.",
    opcionA: opcionSorteo(
      "Jugarse el vivo",
      0.40,
      {
        texto: "Les cerrás la boca y el silbido se convierte en ovación.",
        rol: "Titular",
        modificadores: { bonusOvaciones: 0.08, fansExtra: 400, cambioGralExtra: 3, cansancioDelta: 1 }
      },
      {
        texto: "El vivo se cae y el camerino se vuelve un tribunal.",
        modificadores: { bonusOvaciones: -0.06, fansExtra: -300, cambioGralExtra: -3, cansancioDelta: 2 }
      }
    ),
    opcionB: opcionIrseDeBanda()
  },
  {
    texto: "Un pibe del under te come el lugar en los ensayos.",
    historia: "Llega temprano, aprende tus partes y el técnico ya le sonríe. Podés pelearle el puesto, bajarte con dignidad… o irte antes de que la comparación se vuelva costumbre.",
    roles: ["Titular"],
    opcionA: {
      texto: "Pelearle el puesto",
      rol: "Titular",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 100, cambioGralExtra: 2, cansancioDelta: 1 }
    },
    opcionB: opcionIrseDeBanda()
  },
  {
    texto: "El líder de la banda te quiere afuera.",
    historia: "Te lo dice sin micrófono, en el estacionamiento. Habla de 'rumbo' y de 'química'. Quedarte es bancar humillación con chance de reconciliar; irte es orgullo… y empezar de nuevo.",
    opcionA: opcionSorteo(
      "Quedarte a bancarla",
      0.40,
      {
        texto: "Se calma después del ensayo y te deja en la foto.",
        rol: "Titular",
        modificadores: { bonusOvaciones: 0.04, fansExtra: 200, cambioGralExtra: 2, cansancioDelta: 1 }
      },
      {
        texto: "Te echa igual y el flyer siguiente ya no te nombra.",
        separacion: true,
        modificadores: { fansExtra: -300, cambioGralExtra: -2 }
      }
    ),
    opcionB: opcionIrseDeBanda()
  },
  {
    texto: "El furgón pincha en la ruta hacia otro boliche.",
    historia: "Es de noche, llueve fino y el teléfono no tiene señal. Llegar igual es heroico y peligroso; cancelar es perder cachet y quedar como poco confiables frente al dueño del lugar.",
    categorias: ["Under", "Regional"],
    opcionA: {
      texto: "Llegar igual como sea",
      modificadores: { bonusOvaciones: 0.08, fansExtra: 400, cambioGralExtra: 3, cansancioDelta: 3 }
    },
    opcionB: {
      texto: "Cancelar y avisar al boliche",
      modificadores: { fansExtra: -80, cambioGralExtra: -1, cansancioDelta: 1 }
    }
  },
  {
    texto: "Quieren grabar el EP en un living, de madrugada.",
    historia: "Cuatro canales, un colchón contra la pared y vecinos que todavía no reclamaron. Sale barato y con carácter… o sale a lata. Esperar un estudio limpio cuesta plata que todavía no tienen.",
    categorias: ["Under"],
    opcionA: {
      texto: "Grabar en el living",
      modificadores: { bonusOvaciones: 0.05, fansExtra: 300, cambioGralExtra: 3, chancePremioExtra: 0.10, cansancioDelta: 2 }
    },
    opcionB: {
      texto: "Esperar un estudio decente",
      modificadores: { cambioGralExtra: 1, cansancioDelta: -1, fansExtra: 50 }
    }
  },
  {
    texto: "Te ofrecen telonear: el cachet es birra.",
    historia: "Banda más grande, sala llena, plata cero. El manager dice 'exposición'. El batero pregunta quién paga la nafta. Es amistad con el circuito versus no regalar otro show.",
    categorias: ["Under", "Regional"],
    opcionA: {
      texto: "Tocar igual por la platea",
      modificadores: { bonusOvaciones: 0.06, fansExtra: 600, cambioGralExtra: 3, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "No regalar el show",
      modificadores: { cambioGralExtra: 1, fansExtra: 40 }
    }
  },
  {
    texto: "El titular se lesiona en el soundcheck.",
    historia: "Se dobla el tobillo entre los cables y todos te miran. Es tu chance de titularidad en vivo… o de quemarte si el set se desarma frente a una platea que vino a ver a otro.",
    roles: ["Suplente"],
    opcionA: opcionSorteo(
      "Salir a cubrir",
      0.55,
      {
        texto: "El vivo te deja el puesto y el flyer siguiente ya lleva tu nombre.",
        rol: "Titular",
        modificadores: { bonusOvaciones: 0.05, fansExtra: 300, cambioGralExtra: 3, cansancioDelta: 2 }
      },
      {
        texto: "El vivo se te va y volvés al banco con la cabeza gacha.",
        rol: "Suplente",
        modificadores: { cambioGralExtra: -1, cansancioDelta: 1 }
      }
    ),
    opcionB: {
      texto: "Cederle el lugar a otro suplente",
      modificadores: { cambioGralExtra: 1, cansancioDelta: -1 }
    }
  },
  {
    texto: "Faltás a un ensayo clave y arman la lista sin vos.",
    historia: "Fue un turno, un viaje o una pelea casera: da igual. Cuando llegás, tu atril no está. Pedir perdón es tragar orgullo; irte es no bancar que te midan como reemplazable.",
    roles: ["Titular"],
    opcionA: {
      texto: "Pedir perdón y pelearla",
      rol: "Titular",
      modificadores: { cambioGralExtra: 1, cansancioDelta: 1, fansExtra: 50 }
    },
    opcionB: opcionIrseDeBanda()
  },
  {
    id: "ensayo-fallido",
    texto: "El ensayo se va al demonio.",
    historia: "Nadie acuerda el puente y el batero se va antes, dejando el platillo todavía temblando. Imponer el arreglo puede cerrar el tema… o partir la sala en dos bandos hasta el próximo finde.",
    opcionA: {
      texto: "Imponer el arreglo",
      modificadores: { bonusOvaciones: 0.06, fansExtra: 250, cambioGralExtra: 2, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Bajar un cambio y escuchar",
      modificadores: { cambioGralExtra: 1, cansancioDelta: -1, bonusOvaciones: 0.02 }
    }
  },
  {
    id: "cover-polemico",
    texto: "Proponen un cover de una banda enemiga.",
    historia: "Las redes ya están mirando. Sacar el cover es meme, platea nueva y bronca de los puristas. Quedarse en el repertorio propio es lealtad… y tal vez perder el trending de la semana.",
    opcionA: opcionSorteo(
      "Sacar el cover igual",
      0.38,
      {
        texto: "El meme te sirve: más gente en la puerta del boliche.",
        modificadores: { bonusOvaciones: 0.07, fansExtra: 700, cambioGralExtra: 2, chancePremioExtra: 0.15 }
      },
      {
        texto: "La platea te silba y el manager corta el after temprano.",
        modificadores: { bonusOvaciones: -0.05, fansExtra: 80, cambioGralExtra: -2 }
      }
    ),
    opcionB: {
      texto: "Quedarse en el repertorio propio",
      modificadores: { bonusOvaciones: 0.02, fansExtra: 100, cambioGralExtra: 1 }
    }
  },
  {
    id: "sesion-estudio",
    texto: "Sesión de estudio de madrugada, pagan poco.",
    historia: "El productor tiene contactos en radios chicas y un café quemado para toda la noche. Entrar es red y cansancio; rechazar es dormir… y que el contacto se lo lleve otro guitarrista.",
    opcionA: {
      texto: "Entrar al estudio",
      modificadores: { bonusOvaciones: 0.05, fansExtra: 400, cambioGralExtra: 3, cansancioDelta: 2 }
    },
    opcionB: {
      texto: "Dormir y cuidar la voz",
      modificadores: { cansancioDelta: -2, cambioGralExtra: 1 }
    }
  },
  {
    id: "festival-cancelado",
    texto: "Cancelan el festival: queda un telonero de urgencia.",
    historia: "El escenario grande se cae por la lluvia. Ofrecen un boliche chico a dos horas. Aceptar es no perder el finde; descansar es lo que el cuerpo pide desde el martes.",
    categorias: ["Under", "Regional"],
    opcionA: {
      texto: "Aceptar el telonero",
      modificadores: { bonusOvaciones: 0.06, fansExtra: 500, cambioGralExtra: 2, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Descansar el fin de semana",
      modificadores: { showsFactor: 0.85, cansancioDelta: -2, cambioGralExtra: 1 }
    }
  },
  {
    id: "pelea-setlist",
    texto: "Pelea de setlist: hits versus temas nuevos.",
    historia: "El cantante quiere Garantía de platea; el resto quiere estrenar el tema del ensayo. Bancarle a los nuevos es riesgo artístico. Ir a lo seguro es paz de camerino… y un poco de resignación.",
    roles: ["Titular"],
    opcionA: {
      texto: "Bancarle a los temas nuevos",
      modificadores: { bonusOvaciones: 0.08, fansExtra: 450, cambioGralExtra: 3 }
    },
    opcionB: {
      texto: "Ir a lo seguro con los hits",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 200, cambioGralExtra: 1 }
    },
    opcionC: opcionIrseDeBanda()
  },
  {
    id: "pelea-monitores",
    texto: "Los monitores fallan y nadie se escucha.",
    historia: "El técnico se pelea con el manager al costado del escenario. Tocar a oído es épica de sala o desastre de tempo. Parar y recalibrar es profesional… y deja a la platea silbando de impaciencia.",
    opcionA: opcionSorteo(
      "Tocar igual a oído",
      0.36,
      {
        texto: "Salís airoso y el vivo se vuelve leyenda de esa sala.",
        modificadores: { bonusOvaciones: 0.09, fansExtra: 350, cambioGralExtra: 3, cansancioDelta: 2 }
      },
      {
        texto: "El tempo se desarma y el público se enfría de a poco.",
        modificadores: { bonusOvaciones: -0.06, fansExtra: 40, cambioGralExtra: -2, cansancioDelta: 2 }
      }
    ),
    opcionB: {
      texto: "Parar y recalibrar",
      modificadores: { showsFactor: 0.9, bonusOvaciones: 0.02, cansancioDelta: 1, cambioGralExtra: 1 }
    }
  },
  {
    id: "vender-el-sonido",
    texto: "Una marca quiere comprar el sonido de la banda.",
    historia: "Plata ya para un comercial de gaseosa. El under te va a marcar. El manager habla de alquiler. Es orgullo de escena versus llegar a fin de mes sin pelearte con el dueño de la sala de ensayo.",
    categorias: ["Regional", "Nacional", "Internacional"],
    opcionA: {
      texto: "Firmar el comercial",
      modificadores: { fansExtra: 900, cambioGralExtra: 2, chancePremioExtra: 0.1, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Rechazar y cuidar el nombre",
      modificadores: { bonusOvaciones: 0.04, fansExtra: 150, cambioGralExtra: 2 }
    }
  },
  {
    id: "invitado-sorpresa",
    texto: "Un invitado grande quiere subir sin ensayar.",
    historia: "Es un nombre que llena stories. También es alguien que no conoce el puente. Dejarlo subir es spotlight prestado; decir que no es proteger el set… y bancarte el gesto raro en el after.",
    opcionA: opcionSorteo(
      "Dejarlo subir",
      0.42,
      {
        texto: "El dúo explota y las stories se llenan antes del encore.",
        modificadores: { bonusOvaciones: 0.10, fansExtra: 1100, cambioGralExtra: 3, chancePremioExtra: 0.2 }
      },
      {
        texto: "Se pisa el arreglo y queda un silencio raro en el medio del vivo.",
        modificadores: { bonusOvaciones: -0.04, fansExtra: 120, cambioGralExtra: -1 }
      }
    ),
    opcionB: {
      texto: "Proteger el set de la banda",
      modificadores: { bonusOvaciones: 0.03, fansExtra: 100, cambioGralExtra: 1 }
    }
  },
  {
    id: "equipo-robado",
    texto: "Roban el equipo en la carga. El show es mañana.",
    historia: "Faltan pedales, cables y un amplificador. Pedir prestado es Frankenstein y orgullo herido; cancelar es no fallarle a la platea… fallándole igual, pero con honestidad.",
    opcionA: {
      texto: "Pedir prestado lo que haya",
      modificadores: { bonusOvaciones: 0.05, fansExtra: 200, cambioGralExtra: 2, cansancioDelta: 2 }
    },
    opcionB: {
      texto: "Cancelar y rearmar",
      modificadores: { showsFactor: 0.6, cansancioDelta: -1, cambioGralExtra: -1 }
    }
  },
  {
    id: "critica-medios",
    texto: "Una crítica te tilda de 'sin peligro'.",
    historia: "Duele porque hay algo de verdad. Responder en vivo es declaración de guerra; ignorar y laburar es madurez… o miedo disfrazado de profesionalismo. El camerino discute cuál de las dos es cobardía.",
    categorias: ["Nacional", "Internacional", "Leyenda"],
    opcionA: {
      texto: "Responder en vivo con todo",
      modificadores: { bonusOvaciones: 0.09, fansExtra: 600, cambioGralExtra: 3, cansancioDelta: 2 }
    },
    opcionB: {
      texto: "Ignorar y laburar",
      modificadores: { cambioGralExtra: 1, fansExtra: 100 }
    }
  },
  {
    id: "presion-autotune",
    texto: "El productor insiste con autotune en el single.",
    historia: "'Así suena la radio', dice, y pone el plugin antes de que termines la toma. Aceptar es playlist y mira rara de la base; bancar la voz cruda es orgullo… y tal vez quedarte afuera del algoritmo.",
    estilos: ["Pop", "Cumbia"],
    roles: ["Titular"],
    opcionA: {
      texto: "Aceptar el autotune",
      modificadores: { fansExtra: 1200, cambioGralExtra: 2, chancePremioExtra: 0.25, bonusOvaciones: 0.03 }
    },
    opcionB: {
      texto: "Bancar la voz cruda",
      modificadores: { bonusOvaciones: 0.05, fansExtra: 180, cambioGralExtra: 2 }
    }
  },
  {
    id: "meet-and-greet",
    texto: "Arman un meet & greet eterno.",
    historia: "Selfies, abrazos y una nena que llora al verte. Las cuerdas y la cabeza piden agua. Quedarte hasta el final enamora; cortar corto guarda el show de la noche. Las dos cosas son cariño de distinta forma.",
    opcionA: {
      texto: "Quedarte hasta el último fan",
      modificadores: { fansExtra: 800, bonusOvaciones: 0.04, cambioGralExtra: 1, cansancioDelta: 3 }
    },
    opcionB: {
      texto: "Saludar corto y guardar energía",
      modificadores: { fansExtra: 200, cansancioDelta: -1, showsFactor: 1, cambioGralExtra: 1 }
    }
  },
  {
    id: "cisma-liderazgo",
    texto: "Cisma: te piden que elijas bando.",
    historia: "Dos quieren mandar el rumbo. Uno habla de singles; el otro, de gira larga. Mediar es heroico y peligroso. Bancarle a uno es lealtad… y enemigo seguro del otro. Irte es no ser el juguete de la pelea.",
    roles: ["Titular"],
    categorias: ["Under", "Regional", "Nacional"],
    opcionA: {
      texto: "Mediar y proponer reglas",
      modificadores: { cambioGralExtra: 3, bonusOvaciones: 0.04, fansExtra: 200, cansancioDelta: 1 }
    },
    opcionB: {
      texto: "Bancarle a uno",
      modificadores: { cambioGralExtra: 2, fansExtra: 150, bonusOvaciones: 0.02 }
    },
    opcionC: opcionIrseDeBanda()
  },
  {
    id: "volver-origen",
    texto: "Tu primera banda te llama para volver.",
    historia: "El mensaje es corto: 'hacemos el club de siempre, falta tu parte'. Volver es casa, olor a ensayo viejo y menos luces. Quedarte donde estás es ambición… y tal vez traición blanda a los que te criaron.",
    opcionA: {
      texto: "Volver con los de siempre",
      volverOrigen: true,
      rol: "Titular",
      modificadores: { cambioGralExtra: 2, cansancioDelta: -1 }
    },
    opcionB: {
      texto: "Quedarte donde estás",
      modificadores: { cambioGralExtra: 1 }
    }
  }
];



function obtenerCatalogoEstilo() {
  return catalogoBandas[jugador.estilo] || catalogoBandas.Rock;
}


function obtenerBandasPorReputacion(reputacion) {
  return obtenerCatalogoEstilo()[reputacion] || [];
}


function obtenerTodasLasBandas() {
  const catalogo = obtenerCatalogoEstilo();

  return [
    ...catalogo.Under.map(nombre => ({
      nombre: nombre,
      reputacion: "Under",
      exigencia: exigenciaBandas.Under
    })),

    ...catalogo.Regional.map(nombre => ({
      nombre: nombre,
      reputacion: "Regional",
      exigencia: exigenciaBandas.Regional
    })),

    ...catalogo.Nacional.map(nombre => ({
      nombre: nombre,
      reputacion: "Nacional",
      exigencia: exigenciaBandas.Nacional
    })),

    ...catalogo.Internacional.map(nombre => ({
      nombre: nombre,
      reputacion: "Internacional",
      exigencia: exigenciaBandas.Internacional
    })),

    ...catalogo.Leyenda.map(nombre => ({
      nombre: nombre,
      reputacion: "Leyenda",
      exigencia: exigenciaBandas.Leyenda
    }))
  ];
}


function calcularChanceOferta(banda) {
  const diferencia = jugador.gral - banda.exigencia;

  let chance;

  if (diferencia >= 15) {
    chance = 0.95;

  } else if (diferencia >= 8) {
    chance = 0.80;

  } else if (diferencia >= 0) {
    chance = 0.60;

  } else if (diferencia >= -5) {
    chance = 0.35;

  } else if (diferencia >= -10) {
    chance = 0.15;

  } else if (diferencia >= -15) {
    chance = 0.05;

  } else {
    chance = 0.01;
  }

  const ultimaEtapa =
    jugador.historial[jugador.historial.length - 1];

  if (ultimaEtapa) {
    const umbral = umbralesEtapa();

    if (ultimaEtapa.ovaciones >= umbral.ovacionOferta) {
      chance += 0.08;
    }

    if (ultimaEtapa.solos >= umbral.soloOferta) {
      chance += 0.05;
    }
  }

  if (
    jugador.instrumento === "Percusión" &&
    (banda.reputacion === "Regional" ||
      banda.reputacion === "Nacional")
  ) {
    chance += 0.08;
  }

  const idxCat = Math.max(0, indiceCategoria(jugador.categoria || "Under"));
  const idxBanda = indiceCategoria(banda.reputacion);
  // 2+ tiers above award track: possible but rarer
  if (idxBanda >= 0 && idxBanda >= idxCat + 2) {
    chance *= 0.65;
  }
  // Prefer mid tiers when GRAL fits the band exigencia
  if (idxBanda >= 0 && Math.abs(diferencia) <= 10 && idxBanda >= Math.max(0, idxCat - 1)) {
    chance *= 1.08;
  }

  return Math.min(chance, 0.98);
}


function eventoDisponible(evento) {
  if (
    evento.id === "tendinitis" &&
    (jugador.cooldownTendinitis || 0) > 0
  ) {
    return false;
  }

  if (
    evento.id === "volver-origen" &&
    (!puedeVolverOrigen() || jugador.edad < 40)
  ) {
    return false;
  }

  if (
    evento.estilos &&
    evento.estilos.indexOf(jugador.estilo) === -1
  ) {
    return false;
  }

  if (evento.categorias) {
    if (evento.categorias.indexOf(jugador.categoria) === -1) {
      return false;
    }
  } else if (
    evento.reputaciones &&
    evento.reputaciones.indexOf(jugador.reputacionBandaActual) === -1
  ) {
    return false;
  }

  if (
    evento.roles &&
    evento.roles.indexOf(jugador.rol) === -1
  ) {
    return false;
  }

  return true;
}


function generarEvento() {
  if (jugador.carreraTerminada) {
    jugador.eventoPendiente = null;
    return false;
  }

  // Year/Intenso needs more events (only ~15 seasons); bienio a bit higher too
  const chanceEvento = jugador.modo === "Intenso" ? 0.42 : 0.34;
  const hayEvento =
    Math.random() < chanceEvento;

  if (!hayEvento) {
    jugador.eventoPendiente = null;
    return false;
  }

  const posibles = eventos.filter(eventoDisponible);

  let bolsa = posibles.length > 0 ? posibles : eventos.filter(evento =>
    eventoDisponible(evento) &&
    !evento.estilos &&
    !evento.reputaciones &&
    !evento.categorias &&
    !evento.roles
  );

  if (false) {
    const deCuerpo = posibles.filter(
      evento => evento.prioridadCansancio
    );

    if (deCuerpo.length > 0 && Math.random() < 0.50) {
      bolsa = deCuerpo;
    }
  }

  if (bolsa.length === 0) {
    jugador.eventoPendiente = null;
    return false;
  }

  bolsa = bolsa.filter(function (evento) {
    if (evento.id === "tendinitis" && Math.random() < 0.65) {
      return false;
    }
    return true;
  });

  if (bolsa.length === 0) {
    jugador.eventoPendiente = null;
    return false;
  }

  const evento =
    bolsa[Math.floor(Math.random() * bolsa.length)];

  jugador.eventoPendiente = Object.assign({}, evento);
  if (evento.id === "tendinitis") {
    jugador.eventoPendiente.texto = textoTendinitis();
    jugador.eventoPendiente.historia = historiaTendinitis();
  }

  return true;
}


function aplicarOpcionYAvanzar(elegida) {
  if (!elegida) {
    return;
  }

  const m = elegida.modificadores || modificadoresVacios();

  let extraGralEvento = m.cambioGralExtra || 0;
  const clubChicoEvento =
    jugador.reputacionBandaActual === "Under" ||
    jugador.reputacionBandaActual === "Regional";

  // En etapas tempranas los eventos no dan saltos de skill enormes.
  if (clubChicoEvento && extraGralEvento > 1) {
    extraGralEvento = Math.max(1, Math.round(extraGralEvento * 0.4));
  }

  jugador.modificadoresBienio = {
    bonusOvaciones: m.bonusOvaciones || 0,
    fansExtra: m.fansExtra || 0,
    cambioGralExtra: extraGralEvento,
    chancePremioExtra: m.chancePremioExtra || 0,
    cansancioDelta: m.cansancioDelta || 0,
    showsFactor: (m.showsFactor != null && m.showsFactor > 0) ? m.showsFactor : 1
  };

  if (typeof elegida.postEfecto === "function") {
    elegida.postEfecto();
  }

  if (elegida.premio) {
    otorgarPremio(elegida.premio);
  }

  if (elegida.descenso) {
    bajarCategoria();
  }

  if (elegida.separacion) {
    jugador.pendienteSeparacion = elegida.salidaVoluntaria
      ? "voluntaria"
      : true;
  }

  if (elegida.volverOrigen && jugador.bandaOrigen) {
    jugador.bandaActual = jugador.bandaOrigen;
    jugador.reputacionBandaActual = jugador.reputacionOrigen || "Under";
    jugador.fueDespedido = false;
    jugador.rol = elegida.rol || "Titular";
    jugador.rolFijadoPorEvento = true;
  } else if (elegida.rol) {
    jugador.rol = elegida.rol;
    jugador.rolFijadoPorEvento = true;
  }

  jugador.eventoPendiente = null;
  jugador.sorteoPendiente = null;

  avanzarBienio();
}


function puedeVolverOrigen() {
  if (!jugador.bandaOrigen) {
    return false;
  }

  if (jugador.edad < 40 || jugador.carreraTerminada) {
    return false;
  }

  if (jugador.bandaActual) {
    return jugador.bandaActual !== jugador.bandaOrigen;
  }

  return jugador.ultimaBandaDespido !== jugador.bandaOrigen;
}


function debeOfrecerOrigen() {
  if (!puedeVolverOrigen()) {
    return false;
  }

  if (jugador.ofertaOrigenBienio === true) {
    return true;
  }

  if (jugador.ofertaOrigenBienio === false) {
    return false;
  }

  jugador.ofertaOrigenBienio = Math.random() < 0.35;
  return jugador.ofertaOrigenBienio;
}


function cartaVolverOrigen() {
  if (!debeOfrecerOrigen()) {
    return "";
  }

  return `
    <button class="carta-banda carta-origen" onclick="volverABandaOrigen()">
      ${mostrarLogoBanda(jugador.bandaOrigen)}
      <span>
        VOLVER A ${jugador.bandaOrigen}
        <small>${jugador.reputacionOrigen || "Under"}</small>
      </span>
    </button>
  `;
}


function volverABandaOrigen() {
  if (!puedeVolverOrigen()) {
    return;
  }

  jugador.bandaActual = jugador.bandaOrigen;
  jugador.reputacionBandaActual = jugador.reputacionOrigen || "Under";
  jugador.fueDespedido = false;
  jugador.rol = "Titular";
  jugador.rolFijadoPorEvento = true;

  prepararBienio();
}


function botonOpcionEvento(letra, opcion, secundario) {
  if (!opcion) {
    return "";
  }

  const clase = secundario ? "btn btn-secundario" : "btn";

  const efecto = formatearEfectos(opcion);
  const lineaEfecto = efecto
    ? `<small class="efecto">${efecto}</small>`
    : "";

  return `
    <button class="${clase}" onclick="elegirOpcionEvento('${letra}')">
      ${opcion.texto}
      ${lineaEfecto}
    </button>
  `;
}


function elegirOpcionEvento(opcion) {
  if (jugador.sorteoPendiente) {
    return;
  }

  const evento = jugador.eventoPendiente;

  if (!evento) {
    return;
  }

  let elegida = null;
  if (opcion === "A") {
    elegida = evento.opcionA;
  } else if (opcion === "B") {
    elegida = evento.opcionB;
  } else if (opcion === "C") {
    elegida = evento.opcionC;
  }

  if (!elegida) {
    return;
  }

  if (elegida.sorteo) {
    mostrarSorteoYAplicar(elegida);
    return;
  }

  aplicarOpcionYAvanzar(elegida);
}


function mostrarSorteoYAplicar(elegida) {
  jugador.sorteoPendiente = true;

  const chance = elegida.chanceBuena || 0.5;
  const bueno = Math.random() < chance;
  const resultado = bueno
    ? elegida.resultadoBueno
    : elegida.resultadoMalo;
  const pct = Math.round(chance * 100);
  const overlay = document.createElement("div");

  overlay.className = "sorteo-overlay";
  overlay.innerHTML = `
    <div class="sorteo-carta">
      <h3>${elegida.texto}</h3>
      <div class="sorteo-pista">
        <div class="sorteo-cara cara-buena">
          <strong>${pct}%</strong>
          <span>${textoEfecto(elegida.resultadoBueno)}</span>
        </div>
        <div class="sorteo-cara cara-mala">
          <strong>${100 - pct}%</strong>
          <span>${textoEfecto(elegida.resultadoMalo)}</span>
        </div>
      </div>
      <p class="sorteo-estado">Sorteando...</p>
    </div>
  `;

  document.body.appendChild(overlay);

  const caraBuena = overlay.querySelector(".cara-buena");
  const caraMala = overlay.querySelector(".cara-mala");
  const estado = overlay.querySelector(".sorteo-estado");
  const carta = overlay.querySelector(".sorteo-carta");
  let tick = 0;
  const total = 18;
  let revelado = false;
  let cerrado = false;

  function marcar(ladoBueno) {
    caraBuena.classList.toggle("activo", ladoBueno);
    caraMala.classList.toggle("activo", !ladoBueno);
  }

  function continuar() {
    if (!revelado || cerrado) {
      return;
    }
    cerrado = true;
    overlay.remove();
    aplicarOpcionYAvanzar(resultado);
  }

  function paso() {
    tick += 1;
    marcar(tick % 2 === 1);

    if (tick >= total) {
      caraBuena.classList.remove("activo");
      caraMala.classList.remove("activo");
      (bueno ? caraBuena : caraMala).classList.add("ganador");
      estado.textContent = resultado.texto || (bueno ? "Salió bien" : "Salió mal");
      revelado = true;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sorteo-continuar btn-principal";
      btn.textContent = "Continuar";
      btn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        continuar();
      });
      carta.appendChild(btn);

      // Tap/click overlay as secondary dismiss only AFTER reveal (not during shuffle)
      overlay.addEventListener("click", continuar);
      return;
    }

    const delay = tick < 10 ? 70 : tick < 15 ? 130 : 210;
    setTimeout(paso, delay);
  }

  paso();
}


function pintarCuerpo(html, alListo) {
  const jugando = !!document.querySelector(".app-carrera");

  function despuesDePintar() {
    scrollearLineaTiempoAlFinal();
    actualizarBotonMute();
    if (pendienteAnimarEtapa) {
      // deja correr la animación y limpia el flag
      setTimeout(function () {
        pendienteAnimarEtapa = false;
      }, 700);
    }
    if (alListo) {
      alListo();
    }
  }

  if (jugando) {
    document.body.innerHTML = html;
    despuesDePintar();
    return;
  }

  document.body.classList.add("fundiendo");

  setTimeout(function () {
    document.body.innerHTML = html;
    document.body.classList.remove("fundiendo");

    const app = document.querySelector(".app");

    if (app) {
      app.classList.add("pantalla-entra");
    }

    despuesDePintar();
  }, 220);
}



function transicionarPantallas(idDesde, idHacia) {
  const desde = document.getElementById(idDesde);
  const hacia = document.getElementById(idHacia);

  if (!desde || !hacia) {
    return;
  }

  desde.classList.remove("visible", "entra");
  desde.classList.add("sale");
  hacia.classList.remove("sale");
  hacia.classList.add("visible", "entra");

  setTimeout(function () {
    desde.classList.remove("sale");
    hacia.classList.remove("entra");
  }, 420);
}


function mostrarAlertasPremio(alTerminar) {
  const cola = (jugador.premiosPendientes || []).slice();
  jugador.premiosPendientes = [];

  if (cola.length === 0) {
    if (alTerminar) {
      alTerminar();
    }
    return;
  }

  function siguiente() {
    if (cola.length === 0) {
      if (alTerminar) {
        alTerminar();
      }
      return;
    }

    mostrarAlertaPremio(cola.shift(), siguiente);
  }

  setTimeout(siguiente, 320);
}


function mostrarAlertaPremio(premio, luego) {
  const overlay = document.createElement("div");
  const nombre = nombrePremio(premio);

  overlay.className = "premio-overlay visible";
  overlay.innerHTML = `
    <div class="premio-alerta">
      <p class="premio-alerta-marca">PREMIO</p>
      ${mostrarLogoPremio(premio, 168)}
      <p class="premio-alerta-nombre">${nombre}</p>
    </div>
  `;

  document.body.appendChild(overlay);

  let cerrado = false;

  function cerrar() {
    if (cerrado) {
      return;
    }

    cerrado = true;
    overlay.classList.remove("visible");
    overlay.classList.add("sale");

    setTimeout(function () {
      overlay.remove();
      if (luego) {
        luego();
      }
    }, 280);
  }

  overlay.addEventListener("click", cerrar);
  setTimeout(cerrar, 2400);
}


function prepararBienio() {
  jugador.modificadoresBienio = modificadoresVacios();

  const aparecioEvento = generarEvento();

  if (aparecioEvento) {
    mostrarPantallaPrincipal();

  } else {
    avanzarBienio();
  }
}


function obtenerOfertas() {
  const todas = obtenerTodasLasBandas();
  const permitidas = reputacionesPermitidas();

  const disponibles = todas.filter(
    banda =>
      banda.nombre !== jugador.bandaActual &&
      banda.nombre !== jugador.ultimaBandaDespido &&
      permitidas.indexOf(banda.reputacion) !== -1
  );

  let candidatas = disponibles.filter(banda => {
    const chance = calcularChanceOferta(banda);

    return Math.random() < chance;
  });

  candidatas.sort(() => Math.random() - 0.5);

  if (candidatas.length < 2) {
    const respaldo = disponibles
      .filter(banda =>
        banda.exigencia <= jugador.gral + 10
      )
      .sort(() => Math.random() - 0.5);

    respaldo.forEach(banda => {
      const yaEsta = candidatas.some(
        candidata => candidata.nombre === banda.nombre
      );

      if (!yaEsta && candidatas.length < 2) {
        candidatas.push(banda);
      }
    });
  }

  if (candidatas.length < 2) {
    const resto = disponibles
      .filter(banda =>
        jugador.gral + 8 >= banda.exigencia
      )
      .sort(() => Math.random() - 0.5);

    resto.forEach(banda => {
      const yaEsta = candidatas.some(
        candidata => candidata.nombre === banda.nombre
      );

      if (!yaEsta && candidatas.length < 2) {
        candidatas.push(banda);
      }
    });
  }

  return candidatas.slice(0, 2);
}


function aplicarTemaEstilo(estilo) {
  const valor =
    estilo ||
    jugador.estilo ||
    "Rock";

  document.documentElement.setAttribute(
    "data-estilo",
    valor
  );
}


const selectorEstilo =
  document.getElementById("estilo");

if (selectorEstilo) {
  aplicarTemaEstilo(selectorEstilo.value);
}


function elegirEstilo(estilo) {
  const campo = document.getElementById("estilo");

  if (campo) {
    campo.value = estilo;
  }

  aplicarTemaEstilo(estilo);

  const botones = document.querySelectorAll(".opcion-estilo");

  botones.forEach(boton => {
    if (boton.getAttribute("data-estilo") === estilo) {
      boton.classList.add("activo");
    } else {
      boton.classList.remove("activo");
    }
  });
}


function elegirInstrumento(nombre) {
  const campo = document.getElementById("instrumento");

  if (campo) {
    campo.value = nombre;
  }

  const botones = document.querySelectorAll(".opcion-instrumento");

  botones.forEach(boton => {
    if (boton.getAttribute("data-instrumento") === nombre) {
      boton.classList.add("activo");
    } else {
      boton.classList.remove("activo");
    }
  });
}


function elegirModo(modo) {
  const valor = modo === "Intenso" ? "Intenso" : "Normal";
  const campo = document.getElementById("modo");

  if (campo) {
    campo.value = valor;
  }

  const botones = document.querySelectorAll(".opcion-ritmo[data-modo]");

  botones.forEach(boton => {
    if (boton.getAttribute("data-modo") === valor) {
      boton.classList.add("activo");
    } else {
      boton.classList.remove("activo");
    }
  });
}


function irACrearMusico() {
  const estilo =
    document.getElementById("estilo").value;

  aplicarTemaEstilo(estilo);

  const instrumentos = [
    "Cantante",
    "Guitarra",
    "Bajista"
  ];

  if (estilo === "Rock" || estilo === "Pop") {
    instrumentos.push("Batería");

  } else {
    instrumentos.push("Percusión");
  }

  const caja = document.getElementById("opciones-instrumento");
  caja.innerHTML = "";

  instrumentos.forEach(nombre => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-ritmo opcion-instrumento";
    boton.setAttribute("data-instrumento", nombre);
    boton.textContent = nombre;
    boton.onclick = function () {
      elegirInstrumento(nombre);
    };
    caja.appendChild(boton);
  });

  elegirInstrumento(instrumentos[0]);

  transicionarPantallas("pantalla1", "pantalla2");
}


function volverInicio() {
  transicionarPantallas("pantalla2", "pantalla1");
}


function comenzarCarrera() {
  const nombre =
    document.getElementById("nombre").value;

  const nacionalidad =
    document.getElementById("nacionalidad").value;

  const estilo =
    document.getElementById("estilo").value;

  const instrumento =
    document.getElementById("instrumento").value;

  if (nombre.trim() === "") {
    alert("Ingresa el nombre de tu musico.");
    return;
  }

  if (!instrumento) {
    alert("Elegi un instrumento.");
    return;
  }

  borrarPartidaGuardada();
  jugador = estadoJugadorInicial();
  jugador.nombre = nombre.trim();
  jugador.nacionalidad = nacionalidad;
  jugador.estilo = estilo;
  jugador.instrumento = instrumento;
  jugador.modo =
    document.getElementById("modo").value === "Intenso"
      ? "Intenso"
      : "Normal";

  guardarPartida();
  mostrarPantallaPrincipal();
}



function clamp01(valor, min, max) {
  return Math.max(min, Math.min(max, valor));
}

function normalizarSolista(sol) {
  if (!sol || typeof sol !== "object") {
    return {
      shows: 0,
      ovaciones: 0,
      solos: 0,
      sesiones: 0,
      sesionEsteBienio: false,
      premios: []
    };
  }
  if (typeof sol.sesiones !== "number") {
    sol.sesiones =
      typeof sol.convocatorias === "number" ? sol.convocatorias : 0;
  }
  if (typeof sol.sesionEsteBienio !== "boolean") {
    sol.sesionEsteBienio = !!sol.convocadoEsteBienio;
  }
  if (typeof sol.shows !== "number") sol.shows = 0;
  if (typeof sol.ovaciones !== "number") sol.ovaciones = 0;
  if (typeof sol.solos !== "number") sol.solos = 0;
  if (!Array.isArray(sol.premios)) sol.premios = [];
  return sol;
}


function evaluarSesionSolista(ovacionesBienio, solosBienio) {
  jugador.solista = normalizarSolista(jugador.solista);

  jugador.solista.sesionEsteBienio = false;

  if (jugador.gral < 58) {
    return false;
  }

  const bonusCat = {
    Under: 0,
    Regional: 0.02,
    Nacional: 0.05,
    Internacional: 0.08,
    Leyenda: 0.10
  }[jugador.categoria || "Under"] || 0;

  let chance =
    0.04 +
    (jugador.gral - 55) * 0.008 +
    (ovacionesBienio || 0) * 0.01 +
    (solosBienio || 0) * 0.006 +
    bonusCat;

  chance = clamp01(chance, 0.04, 0.45);

  if (Math.random() >= chance) {
    return false;
  }

  jugador.solista.sesionEsteBienio = true;
  jugador.solista.sesiones = (jugador.solista.sesiones || 0) + 1;

  let shows = 3 + Math.floor(Math.random() * 8); // 3–10
  let ovaciones = Math.floor(Math.random() * 5); // 0–4
  let solos = Math.floor(Math.random() * 4); // 0–3
  const inst = jugador.instrumento || "";

  if (inst === "Guitarra") {
    solos = Math.min(3, solos + 1);
  } else if (inst === "Cantante") {
    ovaciones = Math.min(4, ovaciones + 1);
    shows = Math.min(10, shows + 1);
  } else if (inst === "Batería" || inst === "Bateria" || inst === "Percusión" || inst === "Percusion") {
    shows = Math.min(10, shows + 1);
  } else if (inst === "Bajista") {
    solos = Math.max(0, solos - 1);
  }

  jugador.solista.shows += shows;
  jugador.solista.ovaciones += ovaciones;
  jugador.solista.solos += solos;
  return true;
}

function evaluarPremiosSolista() {
  if (!jugador.solista || !jugador.solista.sesionEsteBienio) {
    return;
  }

  const disponibles = premiosSolista.filter(function (p) {
    return !yaTienePremio(p);
  });
  if (disponibles.length === 0) {
    return;
  }

  const sesiones = jugador.solista.sesiones || 0;
  const stats =
    (jugador.solista.ovaciones || 0) * 0.012 +
    (jugador.solista.solos || 0) * 0.01 +
    (jugador.solista.shows || 0) * 0.0015;
  let chance = 0.08 + Math.min(0.28, sesiones * 0.035) + Math.min(0.18, stats);
  if (jugador.gral >= 75) chance += 0.05;
  if (jugador.gral >= 85) chance += 0.05;
  chance = clamp01(chance, 0.08, 0.55);

  if (Math.random() >= chance) {
    return;
  }

  const premio = disponibles[Math.floor(Math.random() * disponibles.length)];
  otorgarPremio(premio);
}

function avanzarBienio() {
  const edadInicio = jugador.edad;
  const intenso = jugador.modo === "Intenso";
  const anios = intenso ? 1 : 2;
  const umbral = umbralesEtapa();
  jugador.ofertaOrigenBienio = null;

  jugador.bieniosJugados = (jugador.bieniosJugados || 0) + 1;
  if ((jugador.cooldownTendinitis || 0) > 0) {
    jugador.cooldownTendinitis -= 1;
  }

  let showsBienio = intenso
    ? Math.floor(Math.random() * 17) + 12
    : Math.floor(Math.random() * 31) + 20;

  if (jugador.instrumento === "Batería") {
    showsBienio += 5;
  }

  if (jugador.instrumento === "Bajista") {
    showsBienio += 3;
  }

  if (jugador.rol === "Suplente") {
    showsBienio = Math.max(
      intenso ? 5 : 8,
      Math.floor(showsBienio * 0.55)
    );
  }

  const showsFactor =
    (jugador.modificadoresBienio && jugador.modificadoresBienio.showsFactor) || 1;
  if (showsFactor > 0 && showsFactor !== 1) {
    showsBienio = Math.max(
      intenso ? 4 : 6,
      Math.floor(showsBienio * showsFactor)
    );
  }

  aplicarCansancioEvento();

  const exigencia =
    exigenciaBandas[jugador.reputacionBandaActual];

  const diferencia =
    jugador.gral - exigencia;

  let probabilidadOvacion =
    0.18 +
    (diferencia * 0.01) +
    jugador.modificadoresBienio.bonusOvaciones;

  let probabilidadSolo =
    0.08 +
    (diferencia * 0.008);

  if (jugador.instrumento === "Cantante") {
    probabilidadOvacion += 0.04;
  }

  if (jugador.instrumento === "Guitarra") {
    probabilidadSolo += 0.05;
  }

  if (jugador.cansancio >= 99) {
    probabilidadOvacion -= 0.04;
    probabilidadSolo -= 0.03;
  }

  if (jugador.cansancio >= 99) {
    probabilidadOvacion -= 0.04;
    probabilidadSolo -= 0.03;
  }

  probabilidadOvacion = Math.max(
    0.03,
    Math.min(0.70, probabilidadOvacion)
  );

  probabilidadSolo = Math.max(
    0.01,
    Math.min(0.55, probabilidadSolo)
  );

  let ovacionesBienio = 0;
  let solosBienio = 0;

  for (let i = 0; i < showsBienio; i++) {
    if (Math.random() < probabilidadOvacion) {
      ovacionesBienio++;
    }

    if (Math.random() < probabilidadSolo) {
      solosBienio++;
    }
  }

  let riesgoDespido = 0;

  if (diferencia <= -20) {
    riesgoDespido = 0.65;

  } else if (diferencia <= -15) {
    riesgoDespido = 0.45;

  } else if (diferencia <= -10) {
    riesgoDespido = 0.25;

  } else if (diferencia <= -5) {
    riesgoDespido = 0.10;
  }

  if (ovacionesBienio >= umbral.ovacionDespido) {
    riesgoDespido -= 0.10;
  }

  if (solosBienio >= umbral.soloDespido) {
    riesgoDespido -= 0.08;
  }

  if (jugador.instrumento === "Bajista") {
    riesgoDespido -= 0.08;
  }

  if (jugador.rol === "Suplente") {
    riesgoDespido -= 0.10;
  }

  if (jugador.cansancio >= 99) {
    riesgoDespido += 0.10;
  }

  riesgoDespido = Math.max(
    0,
    riesgoDespido
  );

  const fueDespedido =
    Math.random() < riesgoDespido;

// Sumamos las estadisticas
jugador.shows += showsBienio;
jugador.ovaciones += ovacionesBienio;
jugador.solos += solosBienio;

// Evolucion del GRAL (curva estilo Copero: potencial + club + rendimiento)
  // Retune playtest4: elite soft ceiling kept (~88-92 peak); real late decline
  // after ~36-38 (mandatory drag, net-negative past 40 if gral>=85). Soft floor untouched.
  const potencialCarrera = 94;
  const exigenciaGral =
    exigenciaBandas[jugador.reputacionBandaActual] || 40;
  const huecoPotencial = Math.max(0, potencialCarrera - jugador.gral);

  let factorEdad = 1;
  if (jugador.edad < 22) {
    factorEdad = 1.25;
  } else if (jugador.edad < 26) {
    factorEdad = 1.15;
  } else if (jugador.edad < 30) {
    factorEdad = 1.05;
  } else if (jugador.edad < 34) {
    factorEdad = 1.00;
  } else if (jugador.edad < 38) {
    factorEdad = 0.8;
  } else if (jugador.edad < 42) {
    factorEdad = 0.55;
  } else {
    factorEdad = 0.3;
  }

  const factorClub = {
    Under: 0.70,
    Regional: 0.84,
    Nacional: 1.12,
    Internacional: 1.28,
    Leyenda: 1.38
  }[jugador.reputacionBandaActual] || 1;

  const ratioOvacion =
    ovacionesBienio / Math.max(1, umbral.ovacionGral);
  const ratioSolo =
    solosBienio / Math.max(1, umbral.soloGral);
  const rendimiento = Math.min(
    1.5,
    ratioOvacion * 0.65 + ratioSolo * 0.35
  );

  let cambioGral = 0;

  if (rendimiento >= 0.55) {
    // Bienio solido: creces hacia el potencial; clubes grandes ensenan mas.
    // Hueco coeff 0.022 (antes 0.028) para no disparar mid-80s en Regional.
    const base =
      0.55 + huecoPotencial * 0.022 + Math.min(1.4, rendimiento);
    cambioGral = base * factorEdad * factorClub;
  } else if (rendimiento >= 0.35) {
    cambioGral = (0.25 + huecoPotencial * 0.012) * factorEdad;
  } else if (jugador.gral > exigenciaGral + 8) {
    // Muy por arriba de la banda y rindiendo mal: estancamiento suave.
    cambioGral = -0.4;
  } else {
    // En club grande todavia "chico": no castigar con espiral de muerte.
    cambioGral = 0.15 * factorEdad;
  }

  // Variacion chica (antes el random temprano era +3..+6 y rompia la curva)
  cambioGral += Math.random() * 0.8 - 0.3;

  if (ovacionesBienio >= umbral.ovacionGral) {
    cambioGral += (jugador.reputacionBandaActual === "Under" || jugador.reputacionBandaActual === "Regional") ? 0.35 : 0.7;
  }

  if (solosBienio >= umbral.soloGral) {
    cambioGral += (jugador.reputacionBandaActual === "Under" || jugador.reputacionBandaActual === "Regional") ? 0.35 : 0.7;
  }

  if (jugador.instrumento === "Cantante") {
    if (cambioGral < 0) {
      cambioGral -= 0.5;
    }
  }

  if (jugador.instrumento === "Guitarra") {
    if (solosBienio >= umbral.soloGuitarra) {
      cambioGral += 0.8;
    }
  }

  if (jugador.instrumento === "Bajista") {
    // Late career needs visible drops; loosen floor after peak window.
    const pisoBajo = jugador.edad >= 40 ? -2 : -1;
    if (cambioGral < pisoBajo) {
      cambioGral = pisoBajo;
    }
  }

  if (jugador.instrumento === "Bateria" || jugador.instrumento === "Batería") {
    // Soften late buff so aging drag still shows (was +0.8 and fought decline).
    if (jugador.edad >= 37 && cambioGral < 0) {
      if (jugador.edad >= 40) {
        cambioGral += 0.25;
      } else {
        cambioGral += 0.45;
      }
    }
  }

  if (jugador.cansancio >= 99) {
    cambioGral -= 1;
  }

  // Escala suave solo en modo Intenso (1 año); bienio queda en 1.0
  // (no reintroducir doble penalizacion Intenso)
  if (anios === 1) {
    cambioGral *= 0.9;
  }

  // Aging drag playtest4: after peak window (~34-38) GRAL tends down even on
  // decent Intenso seasons. Strong seasons only slow the drop, not erase it.
  // Values are per-year; bienio (~1.7x) so two-year steps still drop visibly.
  if (jugador.edad >= 36) {
    let dragMin;
    let dragMax;
    if (jugador.edad >= 43) {
      dragMin = 1.5;
      dragMax = 2.3;
    } else if (jugador.edad >= 40) {
      dragMin = 1.0;
      dragMax = 2.0;
    } else if (jugador.edad >= 38) {
      dragMin = 0.6;
      dragMax = 1.2;
    } else {
      // 36-37: small mandatory drag (climb still possible mid-80s)
      dragMin = 0.2;
      dragMax = 0.45;
    }
    let agingDrag = dragMin + Math.random() * (dragMax - dragMin);

    // Excelente rendimiento: reduce ~30-40% but keep net negative late+high
    if (rendimiento >= 1.05) {
      agingDrag *= 0.62;
    } else if (rendimiento >= 0.85) {
      agingDrag *= 0.72;
    } else if (rendimiento >= 0.65) {
      agingDrag *= 0.88;
    }

    if (anios > 1) {
      agingDrag *= 1.7;
    }

    cambioGral -= agingDrag;

    // Past ~40 at elite: force net negative even after strong positive base
    if (jugador.edad >= 40 && jugador.gral >= 85) {
      let pisoNeg =
        rendimiento >= 1.05 ? -0.55 : rendimiento >= 0.75 ? -0.85 : -1.25;
      if (anios > 1) {
        pisoNeg *= 1.5;
      }
      if (cambioGral > pisoNeg) {
        cambioGral = pisoNeg;
      }
    } else if (jugador.edad >= 38 && jugador.gral >= 88 && cambioGral > 0.35) {
      // Peak plateau: strong seasons at best near-flat, slight drop tendency
      cambioGral = 0.35 - Math.random() * 0.7;
    }
  }

  // Soft overqualified dampen: only on climbs (must not shrink late declines)
  const sobre = jugador.gral - exigenciaGral;
  if (cambioGral > 0) {
    if (sobre > 22) {
      cambioGral *= 0.65;
    } else if (sobre > 16) {
      cambioGral *= 0.85;
    }
  }

  // Caps base: Under/Regional year +3 / bienio +4; Nacional+ year +4 / bienio +5
  // Si ya vas alto en club chico, apretar: gral>=78 year +2; >=88 year +1
  const clubChico =
    jugador.reputacionBandaActual === "Under" ||
    jugador.reputacionBandaActual === "Regional";
  let capChico = anios === 1 ? 3 : 4;
  if (clubChico && jugador.gral >= 88) {
    capChico = anios === 1 ? 1 : 2;
  } else if (clubChico && jugador.gral >= 78) {
    capChico = anios === 1 ? 2 : 3;
  }
  const capGrande = anios === 1 ? 4 : 5;
  if (clubChico && cambioGral > capChico) {
    cambioGral = capChico;
  }
  if (!clubChico && cambioGral > capGrande) {
    cambioGral = capGrande;
  }

  cambioGral = Math.round(cambioGral);

  // Soft floor +1 solo joven/mid: edad < 36 y gral < 75 (antes 40/82 disparaba)
  if (
    cambioGral < 1 &&
    jugador.edad < 36 &&
    jugador.gral < 75 &&
    sobre < 16 &&
    (rendimiento >= 0.35 || ovacionesBienio >= 1)
  ) {
    cambioGral = 1;
  }
  // Young in small clubs: at least +1 if performing
  if (
    cambioGral < 1 &&
    jugador.edad < 28 &&
    clubChico &&
    rendimiento >= 0.5 &&
    jugador.gral < 75 &&
    sobre < 14
  ) {
    cambioGral = 1;
  }

  let deltaGral =
    cambioGral + (jugador.modificadoresBienio.cambioGralExtra || 0);

  const clubChicoFinal = clubChico;

  // Event extras cannot break small-club cap
  if (clubChicoFinal && deltaGral > capChico) {
    deltaGral = capChico;
  }
  if (clubChicoFinal && deltaGral < -capChico) {
    deltaGral = -capChico;
  }

  // Soft ceiling ladder playtest3: apply on final deltaGral (after event extras)
  // so +2/+3 de evento no perforan el techo elite. Soft floor arriba queda intacto.
  // Under/Regional: igual que playtest2. Nacional+: amortigua desde 82; max+1 desde 85;
  // a menudo 0 desde 88-90; 93-94 raro; 95+ casi nunca.
  if (clubChicoFinal && jugador.gral >= 90) {
    if (deltaGral > 0) deltaGral = Math.random() < 0.12 ? 1 : 0;
  } else if (clubChicoFinal && jugador.gral >= 86) {
    if (deltaGral > 1) deltaGral = 1;
    if (deltaGral > 0 && Math.random() < 0.4) deltaGral = 0;
  } else if (jugador.gral >= 95) {
    if (deltaGral > 0) deltaGral = Math.random() < 0.04 ? 1 : 0;
  } else if (jugador.gral >= 93) {
    if (deltaGral > 1) deltaGral = 1;
    if (deltaGral > 0 && Math.random() < 0.92) deltaGral = 0;
  } else if (jugador.gral >= 90) {
    if (deltaGral > 1) deltaGral = 1;
    if (deltaGral > 0 && Math.random() < 0.78) deltaGral = 0;
  } else if (jugador.gral >= 88) {
    if (deltaGral > 1) deltaGral = 1;
    if (deltaGral > 0 && Math.random() < 0.50) deltaGral = 0;
  } else if (jugador.gral >= 85) {
    if (deltaGral > 1) deltaGral = 1;
  } else if (jugador.gral >= 82) {
    if (deltaGral > 2) deltaGral = 2;
  } else if (jugador.gral >= potencialCarrera - 1 && deltaGral > 1) {
    deltaGral = Math.min(deltaGral, 1);
  }

  jugador.gral += deltaGral;

  jugador.gral = Math.max(
    1,
    Math.min(99, jugador.gral)
  );



// Fans ganados durante el bienio
let fansGanados =
  (ovacionesBienio * 100) +
  (solosBienio * 40) +
  Math.floor(Math.random() * 301);

if (jugador.instrumento === "Cantante") {
  fansGanados = Math.floor(fansGanados * 1.15);
}

if (jugador.instrumento === "Percusión" || jugador.instrumento === "Percusion") {
  fansGanados = Math.floor(fansGanados * 1.10);
}


// Sumamos los fans
jugador.fans +=
  fansGanados +
  jugador.modificadoresBienio.fansExtra;

  jugador.fans = Math.max(0, jugador.fans);

  jugador.edad += anios;

  cargarCansancioBienio(showsBienio, anios);

  jugador.historial.push({
    edad: edadInicio + "-" + jugador.edad,
    banda: jugador.bandaActual,
    logro: "-",
    premios: [],
    gral: jugador.gral,
    shows: showsBienio,
    ovaciones: ovacionesBienio,
    solos: solosBienio
  });

  if (fueDespedido) {
    jugador.historial[
      jugador.historial.length - 1
    ].logro = "DESPEDIDO";
  
    jugador.ultimaBandaDespido =
      jugador.bandaActual;
  
    jugador.fueDespedido = true;
    jugador.bandaActual = "";
    jugador.reputacionBandaActual = "";
    jugador.pendienteSeparacion = false;
  } else if (jugador.pendienteSeparacion) {
    const voluntaria =
      jugador.pendienteSeparacion === "voluntaria";

    jugador.historial[
      jugador.historial.length - 1
    ].logro = voluntaria ? "SALISTE" : "SEPARACIÓN";

    jugador.ultimaBandaDespido =
      jugador.bandaActual;

    jugador.fueDespedido = true;
    jugador.bandaActual = "";
    jugador.reputacionBandaActual = "";
    jugador.pendienteSeparacion = false;
  } else {
    evaluarPremioBienio(
      ovacionesBienio,
      solosBienio,
      fueDespedido
    );

    const cambioRol = actualizarRol(
      ovacionesBienio,
      solosBienio
    );

    const ultimaEtapa =
      jugador.historial[jugador.historial.length - 1];

    if (cambioRol && ultimaEtapa.logro === "-") {
      ultimaEtapa.logro = jugador.rol.toUpperCase();
    }
  }

  const etapaHecha =
    jugador.historial[jugador.historial.length - 1];

  if (etapaHecha && jugador.premiosPendientes.length) {
    etapaHecha.premios = jugador.premiosPendientes.slice();

    if (String(jugador.ultimoLogro).indexOf("ASCENSO") !== -1) {
      etapaHecha.logro = "ASCENSO";
    }
  }

  // Track paralelo solista (sesión + premios propios; no ensucia fila de banda)
  evaluarSesionSolista(ovacionesBienio, solosBienio);
  evaluarPremiosSolista();

  jugador.modificadoresBienio = modificadoresVacios();
  jugador.rolFijadoPorEvento = false;

  if (jugador.edad >= 45) {
    jugador.carreraTerminada = true;
  }

  pendienteAnimarEtapa = true;
  mostrarPantallaPrincipal();
}

function scrollearLineaTiempoAlFinal() {
  const linea = document.querySelector(".linea-tiempo");
  const wrap = document.querySelector(".tabla-anos-wrap");
  const destino = linea || wrap;

  if (!destino) {
    return;
  }

  const activa =
    document.querySelector("tr.etapa-activa") ||
    (wrap && wrap.querySelector("tbody tr:nth-last-child(2)")) ||
    (wrap && wrap.querySelector("tbody tr:last-child"));

  function bajar() {
    if (linea) {
      linea.scrollTop = linea.scrollHeight;
    }
    if (wrap) {
      wrap.scrollTop = wrap.scrollHeight;
    }
    if (activa && typeof activa.scrollIntoView === "function") {
      activa.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  bajar();
  requestAnimationFrame(bajar);
  setTimeout(bajar, 50);
}


function mediaCarrera() {
  // Peak GRAL of career (Copero "MEDIA" / valoración máxima), not arithmetic mean.
  const grales = jugador.historial
    .map(etapa => etapa.gral)
    .filter(valor => typeof valor === "number");

  if (grales.length === 0) {
    return jugador.gral;
  }

  return Math.max.apply(null, grales);
}


function bandasDeLaCarrera() {
  return [...new Set(
    jugador.historial
      .map(etapa => etapa.banda)
      .filter(banda => banda && banda !== "Sin banda")
  )];
}


function nivelLegadoCarrera() {
  // Legacy from career peak (mediaCarrera), not final faded GRAL.
  const pico = mediaCarrera();

  if (pico >= 92) {
    return "LEYENDA DE LA MÚSICA";
  }

  if (pico >= 85) {
    return "ESTRELLA INTERNACIONAL";
  }

  if (pico >= 75) {
    return "REFERENTE NACIONAL";
  }

  if (pico >= 65) {
    return "MÚSICO RECONOCIDO";
  }

  return "MÚSICO DEL UNDER";
}


function mostrarResumenCarrera() {
  const existente = document.querySelector(".resumen-overlay");

  if (existente) {
    existente.remove();
  }

  const bandas = bandasDeLaCarrera();
  let listaBandas = "";

  bandas.forEach(banda => {
    listaBandas += `
      <li class="item-banda">
        ${mostrarLogoBanda(banda, 28)}
        <span>${banda}</span>
      </li>
    `;
  });

  if (bandas.length === 0) {
    listaBandas = "<li>No formaste parte de ninguna banda.</li>";
  }

  const hdrs = headersTimeline();
  const overlay = document.createElement("div");
  overlay.className = "resumen-overlay visible";
  overlay.innerHTML = `
    <div class="resumen-carta">
      <p class="premio-alerta-marca">FIN DE CARRERA</p>
      <h2>${jugador.nombre}</h2>
      <p class="muted legado">${nivelLegadoCarrera()}</p>

      <div class="resumen-media">
        <small>MEDIA</small>
        <strong>${mediaCarrera()}</strong>
        <p class="muted" style="font-size:11px;margin:6px 0 0;letter-spacing:0.06em">mejor de la carrera</p>
      </div>

      <p class="muted" style="font-size:12px;margin:0 0 14px;text-align:center;line-height:1.45">
        ${jugador.shows || 0} ${hdrs.shows} · ${jugador.ovaciones || 0} ${hdrs.ovaciones} · ${jugador.solos || 0} ${hdrs.solos} · ${(jugador.fans || 0).toLocaleString("es-AR")} fans
      </p>

      <div class="resumen-bloque">
        <h3>BANDAS</h3>
        <ul class="lista-limpia resumen-bandas">
          ${listaBandas}
        </ul>
      </div>

      <div class="resumen-bloque">
        <h3>PREMIOS</h3>
        ${renderVitrina(true, 40)}
      </div>

      <button class="btn btn-principal" type="button" onclick="cerrarResumenCarrera()">
        CERRAR
      </button>
    </div>
  `;

  overlay.addEventListener("click", function (evento) {
    if (evento.target === overlay) {
      cerrarResumenCarrera();
    }
  });

  document.body.appendChild(overlay);
}


function cerrarResumenCarrera() {
  const overlay = document.querySelector(".resumen-overlay");

  if (!overlay) {
    return;
  }

  overlay.classList.remove("visible");
  overlay.classList.add("sale");
  setTimeout(function () {
    overlay.remove();
  }, 220);
}


function finalizarCarrera() {
  jugador.carreraTerminada = true;
  guardarPartida();
  mostrarPantallaPrincipal();
}


function elegirBanda(banda) {
  jugador.bandaActual = banda;
  jugador.reputacionBandaActual = "Under";
  jugador.rol = "Titular";

  if (!jugador.bandaOrigen) {
    jugador.bandaOrigen = banda;
    jugador.reputacionOrigen = "Under";
  }

  avanzarBienio();
}


function cambiarBanda(nombre, reputacion) {
  jugador.bandaActual = nombre;
  jugador.reputacionBandaActual = reputacion;
  jugador.fueDespedido = false;
  jugador.rol = "Suplente";

  prepararBienio();
}



function htmlStickersEstilo() {
  const estilo = jugador.estilo || "Rock";
  const packs = {
    Rock: ["🎸", "🥁", "🎤", "🎹", "🤘", "⚡", "🔥", "🎶"],
    Pop: ["🎤", "🎧", "🎹", "💿", "✨", "🌟", "🎵", "💫"],
    Cumbia: ["🪗", "🎺", "🥁", "🎸", "🎉", "🌞", "🔔", "💛"],
    Reggae: ["🎸", "🥁", "🎹", "🌴", "🟢", "☀", "🍀", "🎵"]
  };
  const icons = packs[estilo] || packs.Rock;
  return (
    '<div class="stickers" aria-hidden="true">' +
    icons
      .map(function (icono, i) {
        return (
          '<span class="sticker sticker-' +
          (i + 1) +
          '">' +
          icono +
          "</span>"
        );
      })
      .join("") +
    "</div>"
  );
}

function mostrarPantallaPrincipal() {
  /* cansancio off */
  jugador.cansancio = 0;
  aplicarTemaEstilo(jugador.estilo);

  let contenidoEvento = "";

  if (jugador.carreraTerminada) {
    contenidoEvento = `
      <p>
        <strong>Se terminó la carrera.</strong>
      </p>
      <p class="muted">
        Podés volver a ver el resumen o empezar otra.
      </p>
      <button class="btn" type="button" onclick="mostrarResumenCarrera()">
        VER RESUMEN
      </button>
      <button class="btn btn-principal" type="button" onclick="nuevaCarrera()">NUEVA CARRERA
      </button>
    `;

  } else if (
    jugador.bandaActual === "" &&
    !jugador.fueDespedido
  ) {
    const mezcladas =
      [...obtenerBandasPorReputacion("Under")].sort(
        () => Math.random() - 0.5
      );

    const opciones = mezcladas.slice(0, 3);

    contenidoEvento = `
      <p>
        <strong>
          ¿En qué banda querés comenzar?
        </strong>
      </p>

      <div class="cartas">
        <button class="carta-banda" onclick="elegirBanda('${opciones[0]}')">
          ${mostrarLogoBanda(opciones[0])}
          <span>${opciones[0]}</span>
        </button>

        <button class="carta-banda" onclick="elegirBanda('${opciones[1]}')">
          ${mostrarLogoBanda(opciones[1])}
          <span>${opciones[1]}</span>
        </button>

        <button class="carta-banda" onclick="elegirBanda('${opciones[2]}')">
          ${mostrarLogoBanda(opciones[2])}
          <span>${opciones[2]}</span>
        </button>
      </div>
    `;

  } else if (
    jugador.bandaActual === "" &&
    jugador.fueDespedido
  ) {
    const ofertas = obtenerOfertas();
    const ultimaEtapa =
      jugador.historial[jugador.historial.length - 1];
    const porSeparacion =
      ultimaEtapa && ultimaEtapa.logro === "SEPARACIÓN";
    const porSalida =
      ultimaEtapa && ultimaEtapa.logro === "SALISTE";

    contenidoEvento = `
      <p>
        <strong>
          ${
            porSalida
              ? "Saliste de " +
                jugador.ultimaBandaDespido +
                "."
              : porSeparacion
              ? "La banda se partió. Saliste de " +
                jugador.ultimaBandaDespido +
                "."
              : "Te despidieron de " +
                jugador.ultimaBandaDespido +
                "."
          }
        </strong>
      </p>

      <p class="muted">
        Estas bandas están interesadas en vos:
      </p>

      <div class="cartas">
        ${cartaVolverOrigen()}
    `;

    ofertas.forEach(oferta => {
      if (oferta.nombre === jugador.bandaOrigen) {
        return;
      }

      contenidoEvento += `
        <button class="carta-banda" onclick="cambiarBanda('${oferta.nombre}', '${oferta.reputacion}')">
          ${mostrarLogoBanda(oferta.nombre)}
          <span>
            ${oferta.nombre}
            <small>${oferta.reputacion}</small>
          </span>
        </button>
      `;
    });

    contenidoEvento += `</div>`;

  } else if (jugador.eventoPendiente) {
    const evento = jugador.eventoPendiente;

    contenidoEvento = `
      <h3 class="evento-titulo">${evento.texto}</h3>
      ${evento.historia ? `<p class="evento-historia muted">${evento.historia}</p>` : ""}

      <div class="cartas">
        ${botonOpcionEvento("A", evento.opcionA, false)}
        ${botonOpcionEvento("B", evento.opcionB, true)}
        ${botonOpcionEvento("C", evento.opcionC, true)}
      </div>
    `;

  } else {
    const ofertas = obtenerOfertas();
  
    contenidoEvento = `
      <button class="btn btn-principal" onclick="prepararBienio()">
        CONTINUAR EN ${jugador.bandaActual}
      </button>

      <p>
        <strong>OFERTAS DE OTRAS BANDAS</strong>
      </p>

      <div class="cartas">
        ${cartaVolverOrigen()}
    `;
  
    ofertas.forEach(oferta => {
      if (oferta.nombre === jugador.bandaOrigen) {
        return;
      }

      contenidoEvento += `
        <button class="carta-banda" onclick="cambiarBanda('${oferta.nombre}', '${oferta.reputacion}')">
          ${mostrarLogoBanda(oferta.nombre)}
          <span>
            IR A ${oferta.nombre}
            <small>${oferta.reputacion}</small>
          </span>
        </button>
      `;
    });

    contenidoEvento += `</div>`;
  }

  pintarCuerpo(`
    <div class="app app-carrera">
      ${htmlStickersEstilo()}
      <p class="marca">EL MUSIKO</p>

      <div class="carrera-grid">
        ${renderLineaTiempo()}

        <div class="carrera-main">
          <section class="ficha">
            <div class="ficha-top">
              <div>
                <p class="banda-actual">
                  ${mostrarLogoBanda(jugador.bandaActual, 44)}
                  ${jugador.bandaActual || "Sin banda"}
                </p>
                <h1>${jugador.nombre}</h1>
                <p class="muted">
                  ${jugador.edad} años · ${jugador.fans} fans
                 
                </p>
              </div>

              <p class="gral">
                <small>GRAL</small>
                <strong>${jugador.gral}</strong>
              </p>
            </div>

            <div class="chips">
              <span class="chip">${jugador.nacionalidad}</span>
              <span class="chip">${jugador.estilo}</span>
              <span class="chip">${jugador.instrumento}</span>
              <span class="chip">${jugador.categoria}</span>
              ${
                jugador.bandaActual
                  ? `<span class="chip">${jugador.rol}</span>`
                  : ""
              }
              <span class="chip">${jugador.modo}</span>
            </div>

            <div class="stats">
              <div class="stat">
                <small>SHOWS</small>
                <strong>${jugador.shows}</strong>
              </div>
              <div class="stat">
                <small>OVACIONES</small>
                <strong>${jugador.ovaciones}</strong>
              </div>
              <div class="stat">
                <small>SOLOS</small>
                <strong>${jugador.solos}</strong>
              </div>
            </div>

            <div class="vitrina-mini">
              <h2>VITRINA</h2>
              ${renderVitrina()}
            </div>
          </section>

          <section class="bloque decision">
            <h2>OFERTA / EVENTO</h2>
            ${contenidoEvento}
          </section>
        </div>
      </div>
    </div>
  `, function () {
    guardarPartida();
    mostrarAlertasPremio(function () {
      if (jugador.carreraTerminada) {
        mostrarResumenCarrera();
      }
    });
  });
}