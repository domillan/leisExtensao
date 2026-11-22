export const BASE_URL = 'https://portaldalegislacao.presidencia.gov.br/';
export const CACHE_VERSION = 'legis_v1_';
export const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

export const INDEX_PAGES = {
  lei: 'pages/leis-ordinarias.html',
  lc: 'pages/leis-complementares.html',
  decreto: 'pages/decretos.html',
  dl: 'pages/decretos-leis.html',
  mp: 'pages/medidas-provisorias.html',
  ec: 'ccivil_03/constituicao/emendas/emc/quadro_emc.htm',
  ld: 'pages/leis-delegadas.html',
  codigos: 'pages/codigos.html',
  estatutos: 'pages/estatutos.html'
};

export const TYPE_LABELS = {
  auto: 'Automático',
  lei: 'Lei Ordinária',
  lc: 'Lei Complementar',
  decreto: 'Decreto',
  dl: 'Decreto-Lei',
  mp: 'Medida Provisória',
  ec: 'Emenda Constitucional',
  ld: 'Lei Delegada'
};

// ============================================================================
// Decodificação HTML e Normalização de Texto (sem DOMParser)
// ============================================================================

const HTML_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  ordm: 'º',
  ordf: 'ª',
  deg: '°',
  ndash: '-',
  mdash: '-',
  acute: '',
  cedil: '',
  aacute: 'á', Aacute: 'Á',
  agrave: 'à', Agrave: 'À',
  acirc: 'â', Acirc: 'Â',
  atilde: 'ã', Atilde: 'Ã',
  auml: 'ä', Auml: 'Ä',
  eacute: 'é', Eacute: 'É',
  egrave: 'è', Egrave: 'È',
  ecirc: 'ê', Ecirc: 'Ê',
  iacute: 'í', Iacute: 'Í',
  igrave: 'ì', Igrave: 'Ì',
  icirc: 'î', Icirc: 'Î',
  oacute: 'ó', Oacute: 'Ó',
  ograve: 'ò', Ograve: 'Ò',
  ocirc: 'ô', Ocirc: 'Ô',
  otilde: 'õ', Otilde: 'Õ',
  uacute: 'ú', Uacute: 'Ú',
  ugrave: 'ù', Ugrave: 'Ù',
  ucirc: 'û', Ucirc: 'Û',
  uuml: 'ü', Uuml: 'Ü',
  ccedil: 'ç', Ccedil: 'Ç',
  ntilde: 'ñ', Ntilde: 'Ñ'
};

const STOPWORDS = new Set([
  'a', 'as', 'o', 'os', 'e', 'de', 'da', 'das', 'do', 'dos',
  'em', 'na', 'nas', 'no', 'nos', 'por', 'para', 'com', 'sem', 'ao', 'aos'
]);

export function decodeHtml(rawHtml) {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&([a-zA-Z]+);/g, (full, name) => {
      if (Object.prototype.hasOwnProperty.call(HTML_ENTITIES, name)) {
        return HTML_ENTITIES[name];
      }
      return full;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeTextForSearch(str) {
  return stripAccents(str || '')
    .toLowerCase()
    .replace(/\bacessar\b/g, ' ')
    .replace(/[^a-z0-9\s.\-\/º°ª]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAliasKey(str) {
  return stripAccents(str || '')
    .toLowerCase()
    .replace(/\bacessar\b/g, ' ')
    .replace(/[-–—_/.,;:()[\]"'“”«»º°ª]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSignificantTokens(normStr) {
  if (!normStr) return [];
  const raw = normStr.split(' ').filter(Boolean);
  const filtered = raw.filter((t) => !STOPWORDS.has(t));
  return filtered.length > 0 ? filtered : raw;
}

export function expandYear(rawYear) {
  if (rawYear == null) return null;
  const cleaned = String(rawYear).replace(/\s+/g, '');
  const n = parseInt(cleaned, 10);
  if (Number.isNaN(n)) return null;
  if (cleaned.length === 4) return n;
  if (cleaned.length <= 2) {
    return n <= 29 ? 2000 + n : 1900 + n;
  }
  return null;
}

export function normalizeActNumber(rawNum, isMP = false) {
  if (!rawNum) return null;
  const compact = String(rawNum)
    .replace(/\s+/g, '')
    .replace(/\./g, '')
    .toUpperCase();

  if (isMP) {
    const mpMatch = compact.match(/^(\d+)(?:-(\d+))?$/);
    if (!mpMatch) return null;
    const base = String(parseInt(mpMatch[1], 10));
    const edition = mpMatch[2] ? parseInt(mpMatch[2], 10) : null;
    return {
      canonical: edition != null ? `${base}-${edition}` : base,
      base,
      numericBase: parseInt(base, 10),
      edition
    };
  }

  const m = compact.match(/^(\d+)(?:-?([A-Z]))?$/);
  if (!m) return null;
  const base = String(parseInt(m[1], 10));
  const suffix = m[2] || '';
  return {
    canonical: suffix ? `${base}-${suffix}` : base,
    base,
    numericBase: parseInt(base, 10),
    suffix
  };
}

// ============================================================================
// Extração de Dispositivo Legal (#id) e Norma Associada
// ============================================================================

const ORDINAIS_MAP = {
  primeiro: '1',
  '1o': '1',
  segundo: '2',
  '2o': '2',
  terceiro: '3',
  '3o': '3',
  quarto: '4',
  '4o': '4',
  quinto: '5',
  '5o': '5',
  sexto: '6',
  '6o': '6',
  setimo: '7',
  sétimo: '7',
  '7o': '7',
  oitavo: '8',
  '8o': '8',
  nono: '9',
  '9o': '9',
  decimo: '10',
  décimo: '10',
  '10o': '10'
};

const SIGLAS_PREFIXO = [
  'CF',
  'CRFB',
  'CONSTITUICAO',
  'CONSTITUIÇÃO',
  'CPC',
  'CC',
  'CP',
  'CPP',
  'CLT',
  'CDC',
  'CTN',
  'CTB',
  'ECA',
  'LEP',
  'LINDB',
  'LOMAN',
  'LAI',
  'LGPD'
];

const ESPECIE_NORMATIVA_PURA_REGEX = /^(?:lei(?:\s+ordin[aá]ria|\s+complementar|\s+delegada)?|decreto(?:[-\s]*lei)?|medida\s+provis[oó]ria|emenda\s+constitucional|l\.?\s*c\.?p?\.?|l\.?\s*d\.?|d\.?\s*l\.?|e\.?\s*c\.?|m\.?\s*p\.?v?\.?|dec\.?)(?:\s*(?:n[º°oª.]*|num\.?|n[úu]mero\.?))?\s*$/i;

const CITACAO_DIRETA_ESPECIE_NUMERO_REGEX = /^(?:lei(?:\s+ordin[aá]ria|\s+complementar|\s+delegada)?|decreto(?:[-\s]*lei)?|medida\s+provis[oó]ria|emenda\s+constitucional|l\.?\s*c\.?p?\.?|l\.?\s*d\.?|d\.?\s*l\.?|e\.?\s*c\.?|m\.?\s*p\.?v?\.?|dec\.?)\s*(?:n[º°oª.]*\s*)?\d[\d.\s]*\d(?:\s*(?:\/|\bde\b|-)\s*\d{2,4})?\s*$/i;

const ATO_NAO_LEGISLACAO_REGEX = /\b(?:s[úu]mula(?:s)?|ac[óo]rd[ãa]o(?:s)?|jurisprud[êe]ncia|recurso\s+especial|resp|re|agravo|tema(?:s)?|repercuss[ãa]o\s+geral|portaria(?:s)?|resolu[çc][ãa]o(?:oes|ões)?|instru[çc][ãa]o\s+normativa|of[íi]cio|circular|parecer(?:es)?)\b/i;

function normalizarNumeroArtigo(numStr) {
  return String(numStr || '').replace(/\./g, '').trim();
}

function extrairParagrafo(texto) {
  if (/par[áa]gra[fd]o\s+[úu]nico\b/i.test(texto)) {
    return 'p';
  }

  // Suporta parágrafos com número e letra opcional (ex.: "§ 3º-A", "§ 3-A", "parágrafo 3º-A")
  const numDepois = texto.match(
    /(?:§+|par[áa]gra[fd]o(?:s)?)\s*(\d+)\s*(?:[ºª°])?(?:\s*[-–—]\s*([a-zA-Z])\b|\s+([a-zA-Z])(?=$|[\s,.;:()]))?/i
  );
  if (numDepois) {
    const rawLetra = numDepois[2] || numDepois[3] || '';
    const ignorarLetras = new Set(['a', 'o', 'e']);
    const letra =
      rawLetra && (numDepois[2] || !ignorarLetras.has(rawLetra.toLowerCase()))
        ? rawLetra.toLowerCase()
        : '';
    return `§${numDepois[1]}${letra}`;
  }

  const ordinalAntes = texto.match(
    /\b(\d+[ºª°]?|primeiro|segundo|terceiro|quarto|quinto|sexto|s[ée]timo|oitavo|nono|d[ée]cimo)\s+par[áa]gra[fd]o\b/i
  );
  if (ordinalAntes) {
    const raw = ordinalAntes[1]
      .toLowerCase()
      .replace(/[ºª°]/g, '');
    const numero = /^\d+$/.test(raw) ? raw : ORDINAIS_MAP[raw];
    if (numero) {
      return `§${numero}`;
    }
  }

  return '';
}

function isolarPrimeiroArtigo(corpoDispositivo) {
  let texto = String(corpoDispositivo || '').trim();

  // Substitui "arts.", "arts", "artigos" por "art." sem depender de \b após ponto
  texto = texto.replace(/\b(?:arts\.?|artigos)(?=$|[\s,.;:()0-9])/gi, 'art.');

  const primeiroArtMatch = texto.match(
    /^([\s\S]*?\b(?:art\.?|artigo)\s*\d+(?:\.\d+)?\s*(?:[ºª°])?(?:\s*[-–—]\s*[a-zA-Z]\b)?)([\s\S]*)$/i
  );

  if (primeiroArtMatch) {
    const cabecalhoPrimeiroArt = primeiroArtMatch[1];
    let resto = primeiroArtMatch[2];

    resto = resto.replace(
      /^(.*?)(?:\s*(?:,|;|\be\b|\ba\b|\bat[ée]\b|\/|-|–|—)\s*(?:arts?\.?|artigos?)?\s*\d+(?:\.\d+)?\s*(?:[ºª°])?(?:\s*[-–—]\s*[a-zA-Z]\b)?(?:[\s,;]+.*)?)$/i,
      '$1'
    );

    return `${cabecalhoPrimeiroArt}${resto}`.trim();
  }

  const semPrefixoMatch = texto.match(
    /^(\s*\d+(?:\.\d+)?\s*(?:[ºª°])?(?:\s*[-–—]\s*[a-zA-Z]\b)?)([\s\S]*)$/i
  );
  if (semPrefixoMatch) {
    const cabecalho = semPrefixoMatch[1];
    let resto = semPrefixoMatch[2];
    resto = resto.replace(
      /^(.*?)(?:\s*(?:,|;|\be\b|\ba\b|\bat[ée]\b|\/|-|–|—)\s*\d+(?:\.\d+)?\s*(?:[ºª°])?(?:\s*[-–—]\s*[a-zA-Z]\b)?(?:[\s,;]+.*)?)$/i,
      '$1'
    );
    return `${cabecalho}${resto}`.trim();
  }

  return texto;
}

function extrairInciso(texto) {
  const explicito = texto.match(
    /\binc(?:iso|\.)?\s+([IVXLCDM]+)\b/i
  );
  if (explicito) {
    return explicito[1].toLowerCase();
  }

  // Remove artigo e parágrafo (inclusive com letra, ex.: "§ 1º-I" ou "§ 3º-A") para não confundir letra com inciso
  const semArtigoEParagrafo = texto
    .replace(
      /\b(?:arts?\.?|artigos?)\s*\d+(?:\.\d+)?\s*(?:[ºª°])?\s*(?:[-–—]?\s*[a-zA-Z])?/i,
      ''
    )
    .replace(
      /(?:§+|par[áa]gra[fd]o(?:s)?)\s*\d+\s*(?:[ºª°])?\s*(?:[-–—]?\s*[a-zA-Z])?/i,
      ''
    );

  const preposicoesIgnoradas = new Set([
    'a', 'o', 'e', 'em', 'de', 'da', 'do', 'das', 'dos', 'na', 'no', 'nas', 'nos'
  ]);
  const tokens = semArtigoEParagrafo.split(/[\s,()'“”]+/);
  const romanoToken = tokens.find((tok) => {
    const clean = tok.toLowerCase();
    if (!clean || preposicoesIgnoradas.has(clean)) return false;
    return /^(?:m{0,3})(?:cm|cd|d?c{0,3})(?:xc|xl|l?x{0,3})(?:ix|iv|v?i{0,3})$/.test(clean);
  });

  return romanoToken ? romanoToken.toLowerCase() : '';
}

function extrairAlinea(texto) {
  const explicita = texto.match(/\bal[íi]nea\s*["'“”]?([a-z])["'“”]?\b/i);
  if (explicita) {
    return explicita[1].toLowerCase();
  }

  const entreAspas = texto.match(/["'“”]([a-z])["'“”]/i);
  if (entreAspas) {
    return entreAspas[1].toLowerCase();
  }

  return '';
}

export function montarIdHtml(corpoDispositivo) {
  const corpoNormalizado = isolarPrimeiroArtigo(corpoDispositivo);

  const artMatch =
    corpoNormalizado.match(
      /\b(?:arts?\.?|artigos?)\s*(\d+(?:\.\d+)?)\s*(?:[ºª°])?(?:\s*[-–—]\s*([a-zA-Z])\b|\s+([a-zA-Z])(?=$|[\s,.;:()]))?/i
    ) ||
    corpoNormalizado.match(
      /^\s*(\d+(?:\.\d+)?)\s*(?:[ºª°])?(?:\s*[-–—]\s*([a-zA-Z])\b|\s+([a-zA-Z])(?=$|[\s,.;:()]))?/i
    );

  if (!artMatch) return null;

  const numeroArt = normalizarNumeroArtigo(artMatch[1]);
  const rawLetra = artMatch[2] || artMatch[3] || '';
  const ignorarLetras = new Set(['a', 'o', 'e']);
  const letraArt =
    rawLetra && (artMatch[2] || !ignorarLetras.has(rawLetra.toLowerCase()))
      ? rawLetra.toLowerCase()
      : '';
  const idArtigo = `art${numeroArt}${letraArt}`;

  const idParagrafo = extrairParagrafo(corpoNormalizado);
  const idInciso = extrairInciso(corpoNormalizado);
  const idAlinea = extrairAlinea(corpoNormalizado);

  return `${idArtigo}${idParagrafo}${idInciso}${idAlinea}`;
}

export function separarLeiEId(texto) {
  const trimmed = String(texto || '').trim();
  if (!trimmed) {
    return { entrada: '', idHtml: null, leiTexto: null, isUnsupportedAct: false };
  }

  const temArtigoExplicito = /\b(?:arts?\.?|artigos?)\s*\d+/i.test(trimmed);
  if (!temArtigoExplicito && ATO_NAO_LEGISLACAO_REGEX.test(trimmed)) {
    return {
      entrada: trimmed,
      idHtml: null,
      leiTexto: null,
      isUnsupportedAct: true
    };
  }

  // Caso 1: Começa com sigla de lei antes do dispositivo (ex.: "CF 5º, II", "eca 122")
  const prefixoRegex = new RegExp(
    `^(${SIGLAS_PREFIXO.join('|')})\\b[,\\s]+(.+)$`,
    'i'
  );
  const matchPrefixo = trimmed.match(prefixoRegex);
  if (matchPrefixo) {
    return {
      entrada: trimmed,
      idHtml: montarIdHtml(matchPrefixo[2].trim()),
      leiTexto: matchPrefixo[1].trim(),
      isUnsupportedAct: false
    };
  }

  // Caso 2: Possui "art.", "arts.", "artigo" ou "artigos" em qualquer posição
  const artPosMatch = trimmed.match(
    /\b(?:arts?\.?|artigos?)\s*\d+(?:\.\d+)?\s*(?:[ºª°])?(?:\s*[-–—]\s*[a-zA-Z]\b)?/i
  );

  if (artPosMatch) {
    const inicioArtigo = artPosMatch.index;
    const fimArtigo = inicioArtigo + artPosMatch[0].length;
    const antesDoArtigo = trimmed.slice(0, inicioArtigo).trim();
    const duranteEDepoisDoArtigo = trimmed.slice(inicioArtigo).trim();
    const antesEDuranteArtigo = trimmed.slice(0, fimArtigo);
    const depoisDoArtigo = trimmed.slice(fimArtigo);

    // 2A: Norma vem ANTES do "art."/"arts." (ex.: "Lei 8.245/1991, art. 39")
    if (antesDoArtigo) {
      const leiAntes = antesDoArtigo.replace(/[,;:\-–—]+$/, '').trim();
      if (leiAntes.length >= 2) {
        const idHtml = montarIdHtml(duranteEDepoisDoArtigo);
        if (idHtml) {
          return {
            entrada: trimmed,
            idHtml,
            leiTexto: leiAntes,
            isUnsupportedAct: false
          };
        }
      }
    }

    // 2B: Norma vem APÓS o dispositivo introduzida por preposição
    const prepLeiMatch = depoisDoArtigo.match(
      /^(.*?)\s*\b(?:do|da|de|dos|das|no|na)\s+(.+)$/i
    );

    if (prepLeiMatch) {
      const complementoDispositivo = prepLeiMatch[1];
      const leiTexto = prepLeiMatch[2].trim();
      const corpoCompleto = `${antesEDuranteArtigo}${complementoDispositivo}`;

      return {
        entrada: trimmed,
        idHtml: montarIdHtml(corpoCompleto),
        leiTexto,
        isUnsupportedAct: false
      };
    }

    // 2C: Norma separada por vírgula no final (ex.: "art. 14, parágrafo único, CPC")
    const virgulaMatch = depoisDoArtigo.match(/^(.*),\s*([^,]+)$/);
    if (virgulaMatch) {
      const possivelLei = virgulaMatch[2].trim();
      const ehSiglaConhecida = new RegExp(
        `^(?:${SIGLAS_PREFIXO.join('|')})$`,
        'i'
      ).test(possivelLei);
      const pareceLei =
        ehSiglaConhecida ||
        /\b(?:lei|c[óo]digo|constitui[çc][aã]o|decreto|estatuto)\b/i.test(
          possivelLei
        );

      if (pareceLei) {
        const corpoCompleto = `${antesEDuranteArtigo}${virgulaMatch[1]}`;
        return {
          entrada: trimmed,
          idHtml: montarIdHtml(corpoCompleto),
          leiTexto: possivelLei,
          isUnsupportedAct: false
        };
      }
    }

    return {
      entrada: trimmed,
      idHtml: montarIdHtml(trimmed),
      leiTexto: null,
      isUnsupportedAct: false
    };
  }

  // Caso 3: Começa pelo número do dispositivo (sem "art.") e termina com sigla conhecida (ex.: "122 eca")
  const sufixoSiglaRegex = new RegExp(
    `^(\\d+(?:\\.\\d+)?\\s*(?:[ºª°])?(?:\\s*[-–—]\\s*[a-zA-Z]\\b)?(?:[\\s,;]+.+?)?)[\\s,;]+(${SIGLAS_PREFIXO.join('|')})$`,
    'i'
  );
  const matchSufixoSigla = trimmed.match(sufixoSiglaRegex);
  if (matchSufixoSigla) {
    const corpoDispositivo = matchSufixoSigla[1].trim();
    const idHtml = montarIdHtml(corpoDispositivo);
    if (idHtml) {
      return {
        entrada: trimmed,
        idHtml,
        leiTexto: matchSufixoSigla[2].trim(),
        isUnsupportedAct: false
      };
    }
  }

  // Caso 4: Nome ou apelido de norma seguido do número do dispositivo no final (ex.: "lei de drogas 23")
  const nomeSeguidoDispositivoRegex = /^([^\d]+?)[,\s]+(\d+(?:\.\d+)?\s*(?:[ºª°])?(?:\s*[-–—]\s*[a-zA-Z]\b)?(?:[\s,;]+.*)?)$/i;
  const matchNomeDispositivo = trimmed.match(nomeSeguidoDispositivoRegex);
  if (matchNomeDispositivo) {
    const candidatoLei = matchNomeDispositivo[1].trim();
    const candidatoDispositivo = matchNomeDispositivo[2].trim();

    const ehEspeciePura = ESPECIE_NORMATIVA_PURA_REGEX.test(`${candidatoLei} `);
    const ehAnoIsolado = /^(?:18\d{2}|19\d{2}|20\d{2})$/.test(candidatoDispositivo);

    if (!ehEspeciePura && !ehAnoIsolado && candidatoLei.length >= 2) {
      const idHtml = montarIdHtml(candidatoDispositivo);
      if (idHtml) {
        return {
          entrada: trimmed,
          idHtml,
          leiTexto: candidatoLei,
          isUnsupportedAct: false
        };
      }
    }
  }

  // Caso 5: Dispositivo sem "art." seguido de preposição e nome da norma (ex.: "23 da lei de drogas")
  const dispositivoPrepNomeRegex = /^(\d+(?:\.\d+)?\s*(?:[ºª°])?(?:\s*[-–—]\s*[a-zA-Z]\b)?(?:[\s,;]+.*?)?)\s+\b(?:do|da|de|dos|das|no|na)\s+(.+)$/i;
  const matchDispPrepNome = trimmed.match(dispositivoPrepNomeRegex);
  if (matchDispPrepNome) {
    const corpoDispositivo = matchDispPrepNome[1].trim();
    const candidatoLei = matchDispPrepNome[2].trim();
    const idHtml = montarIdHtml(corpoDispositivo);
    if (idHtml && candidatoLei.length >= 2) {
      return {
        entrada: trimmed,
        idHtml,
        leiTexto: candidatoLei,
        isUnsupportedAct: false
      };
    }
  }

  return {
    entrada: trimmed,
    idHtml: null,
    leiTexto: null,
    isUnsupportedAct: false
  };
}

function applyProvisionIdToUrl(baseUrl, idHtml) {
  if (!baseUrl) return baseUrl;
  const cleanBase = baseUrl.split('#')[0];
  if (!idHtml) return baseUrl;
  const normalizedId = String(idHtml).replace(/^#+/, '').trim();
  return normalizedId ? `${cleanBase}#${normalizedId}` : cleanBase;
}

// ============================================================================
// Carregamento e Indexação Rápida de normas.json e assuntos.json
// ============================================================================

let normasMemoryCache = null;
let normasIndexCache = null;
let assuntosMemoryCache = null;
let assuntosIndexCache = null;

function buildNormasIndex(normas) {
  const exactMap = new Map();
  const entries = new Array(normas.length);

  for (let i = 0; i < normas.length; i++) {
    const norm = normas[i];
    const titleNorm = normalizeAliasKey(norm.title);
    const titleTokens = extractSignificantTokens(titleNorm);
    const rawAliases = Array.isArray(norm.aliases) ? norm.aliases : [];
    const aliases = [];

    if (titleNorm) {
      let bucket = exactMap.get(titleNorm);
      if (!bucket) {
        bucket = [];
        exactMap.set(titleNorm, bucket);
      }
      bucket.push(norm);
    }

    for (let j = 0; j < rawAliases.length; j++) {
      const rawAl = rawAliases[j];
      const normAl = normalizeAliasKey(rawAl);
      if (!normAl) continue;
      aliases.push({
        raw: rawAl,
        norm: normAl,
        tokens: extractSignificantTokens(normAl)
      });

      let bucket = exactMap.get(normAl);
      if (!bucket) {
        bucket = [];
        exactMap.set(normAl, bucket);
      }
      if (!bucket.includes(norm)) {
        bucket.push(norm);
      }
    }

    entries[i] = {
      norm,
      titleNorm,
      titleTokens,
      aliases
    };
  }

  return { exactMap, entries };
}

function buildAssuntosIndex(assuntos) {
  const exactMap = new Map();
  const invertedIndex = new Map();
  const entries = new Array(assuntos.length);

  for (let i = 0; i < assuntos.length; i++) {
    const assunto = assuntos[i];
    const topico = assunto.topico || '';
    const topicoNorm = normalizeAliasKey(topico);
    const topicoTokens = extractSignificantTokens(topicoNorm);
    const rawAliases = Array.isArray(assunto.alias) ? assunto.alias : [];
    const aliases = [];
    const entryTokenSet = new Set(topicoTokens);

    for (let j = 0; j < rawAliases.length; j++) {
      const rawAl = rawAliases[j];
      const normAl = normalizeAliasKey(rawAl);
      if (!normAl) continue;

      const tokens = extractSignificantTokens(normAl);
      aliases.push({ raw: rawAl, norm: normAl, tokens });

      for (let k = 0; k < tokens.length; k++) {
        entryTokenSet.add(tokens[k]);
      }

      let exactBucket = exactMap.get(normAl);
      if (!exactBucket) {
        exactBucket = [];
        exactMap.set(normAl, exactBucket);
      }
      if (!exactBucket.includes(assunto)) {
        exactBucket.push(assunto);
      }
    }

    for (const tok of entryTokenSet) {
      let postingList = invertedIndex.get(tok);
      if (!postingList) {
        postingList = [];
        invertedIndex.set(tok, postingList);
      }
      postingList.push(i);
    }

    entries[i] = {
      assunto,
      topico,
      topicoNorm,
      topicoTokens,
      aliases
    };
  }

  const vocabulary = Array.from(invertedIndex.keys());
  return { exactMap, invertedIndex, vocabulary, entries };
}

export async function loadNormas() {
  if (Array.isArray(normasMemoryCache)) {
    return normasMemoryCache;
  }

  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    try {
      const url = chrome.runtime.getURL('normas.json');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          normasMemoryCache = data;
          normasIndexCache = buildNormasIndex(data);
          return normasMemoryCache;
        }
      }
    } catch (_) {
      // Se normas.json falhar, segue com busca dinâmica no portal
    }
  }

  return [];
}

async function getNormasIndex() {
  if (!normasIndexCache) {
    const data = await loadNormas();
    if (!normasIndexCache) {
      normasIndexCache = buildNormasIndex(data);
    }
  }
  return normasIndexCache;
}

export async function loadAssuntos() {
  if (Array.isArray(assuntosMemoryCache)) {
    return assuntosMemoryCache;
  }

  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    try {
      const url = chrome.runtime.getURL('assuntos.json');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          assuntosMemoryCache = data;
          assuntosIndexCache = buildAssuntosIndex(data);
          return assuntosMemoryCache;
        }
      }
    } catch (_) {
      // Se assuntos.json não existir ou estiver vazio, segue sem erro
    }
  }

  return [];
}

async function getAssuntosIndex() {
  if (!assuntosIndexCache) {
    const data = await loadAssuntos();
    if (!assuntosIndexCache) {
      assuntosIndexCache = buildAssuntosIndex(data);
    }
  }
  return assuntosIndexCache;
}

export function buildArticleAnchor(artigo) {
  if (artigo == null) return '';
  let value = String(artigo).trim();
  if (!value) return '';

  if (value.includes('/')) {
    value = value.split('/')[0];
  }

  value = value
    .replace(/^art\.?\s*/i, '')
    .replace(/[-–—º°ª.\s]/g, '')
    .toLowerCase()
    .trim();

  return value ? `#art${value}` : '';
}

export function buildIdentifiersSuffix(identificadores) {
  if (identificadores == null) return '';

  const parts = Array.isArray(identificadores)
    ? identificadores.map((v) => (v == null ? '' : String(v).trim())).filter(Boolean)
    : [String(identificadores).trim()].filter(Boolean);

  if (parts.length === 0) return '';
  return parts.join('').replace(/^#+/, '');
}

function appendAnchorToUrl(url, artigo, identificadores = null) {
  if (!url) return url;
  const baseUrl = url.split('#')[0];
  const artAnchor = buildArticleAnchor(artigo);
  const idSuffix = buildIdentifiersSuffix(identificadores);

  if (!artAnchor && !idSuffix) {
    return url;
  }

  if (artAnchor) {
    return `${baseUrl}${artAnchor}${idSuffix}`;
  }

  return `${baseUrl}#${idSuffix}`;
}

function parseRomanToNumber(roman) {
  const s = String(roman || '').trim().toUpperCase();
  if (!s || !/^[IVXLCDM]+$/.test(s)) return null;
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const curr = map[s[i]];
    if (!curr) return null;
    if (curr < prev) total -= curr;
    else total += curr;
    prev = curr;
  }
  return total > 0 ? total : null;
}

function intToRoman(num) {
  const n = parseInt(num, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 3999) return String(num);
  const numerals = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let rem = n;
  let out = '';
  for (const [sym, val] of numerals) {
    while (rem >= val) {
      out += sym;
      rem -= val;
    }
  }
  return out;
}

function normalizeIncisoLabel(rawInc) {
  const v = String(rawInc || '').trim();
  if (!v) return '';
  if (/^\d+$/.test(v)) {
    return intToRoman(parseInt(v, 10));
  }
  return v.toUpperCase();
}

function normalizeAlineaLabel(rawAl) {
  const v = String(rawAl || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .toLowerCase();
  return v ? `'${v}'` : '';
}

export function formatIdentifiersReadable(identificadores) {
  if (identificadores == null) return '';

  const rawJoined = Array.isArray(identificadores)
    ? identificadores.map((v) => (v == null ? '' : String(v).trim())).filter(Boolean).join(' ')
    : String(identificadores).trim();

  let working = rawJoined.replace(/^#+/, '').trim();
  if (!working) return '';

  let paragraphLabel = '';
  let incisoLabel = '';
  let alineaLabel = '';

  const pUnicoStart = working.match(
    /^(?:par(?:agrafo|ágrafo)?\.?\s*unico|p\.?\s*unico|pu|p(?=$|[\s,.;:0-9ivxlcdmIVXLCDM'"]))(.*)$/i
  );
  if (pUnicoStart) {
    const restAfterP = pUnicoStart[1].trim();
    if (/^p$/i.test(working)) {
      return 'parágrafo único';
    }
    if (/^(?:par(?:agrafo|ágrafo)?\.?\s*unico|p\.?\s*unico|pu)/i.test(working)) {
      paragraphLabel = 'parágrafo único';
      working = working.replace(/^(?:par(?:agrafo|ágrafo)?\.?\s*unico|p\.?\s*unico|pu)/i, '').trim();
    } else if (/^p(?=[ivxlcdm])/i.test(working)) {
      paragraphLabel = 'parágrafo único';
      working = working.replace(/^p/i, '').trim();
    } else if (/^p(?:\s+|,)/i.test(working)) {
      paragraphLabel = 'parágrafo único';
      working = restAfterP;
    }
  }

  if (!paragraphLabel) {
    // Suporta parágrafos com número e letra opcional (ex.: "§3a" -> "§ 3º-A", "§ 3º-A" -> "§ 3º-A")
    const paraNumMatch = working.match(
      /^(?:§|par(?:ágrafo|agrafo)?\.?)\s*(\d+)[º°o]?(?:\s*[-–—]?\s*([a-zA-Z]))?/i
    );
    if (paraNumMatch) {
      const numPart = `§ ${parseInt(paraNumMatch[1], 10)}º`;
      const letterPart = paraNumMatch[2] ? `-${paraNumMatch[2].toUpperCase()}` : '';
      paragraphLabel = `${numPart}${letterPart}`;
      working = working.slice(paraNumMatch[0].length).trim();
    }
  }

  working = working.replace(/^[,;\s]+/, '').trim();

  if (working) {
    const explicitAlinea = working.match(/^(?:al(?:ínea|inea)?\.?\s*)?['"]([a-z]{1,2})['"]$/i);
    if (explicitAlinea) {
      alineaLabel = normalizeAlineaLabel(explicitAlinea[1]);
    } else {
      const alPrefixMatch = working.match(/^(?:al(?:ínea|inea)?\.?)\s*['"]?([a-z]{1,2})['"]?$/i);
      if (alPrefixMatch) {
        alineaLabel = normalizeAlineaLabel(alPrefixMatch[1]);
      } else {
        const incPrefixMatch = working.match(/^(?:inc(?:iso)?\.?)\s*([ivxlcdm]+|\d+)(.*)$/i);
        if (incPrefixMatch) {
          incisoLabel = normalizeIncisoLabel(incPrefixMatch[1]);
          const restAl = incPrefixMatch[2]?.trim();
          if (restAl) {
            const alClean = restAl.replace(/^(?:al(?:ínea|inea)?\.?\s*)?['"]?([a-z]{1,2})['"]?$/i, '$1');
            if (/^[a-z]{1,2}$/i.test(alClean)) {
              alineaLabel = normalizeAlineaLabel(alClean);
            }
          }
        } else {
          const compactMatch = working.match(/^([ivxlcdm]+|\d+)(?:[\s,]+|(?=[a-z]$))?([a-z]{1,2})?$/i);
          if (compactMatch) {
            const firstPart = compactMatch[1];
            const secondPart = compactMatch[2];

            if (secondPart) {
              if (/^\d+$/.test(firstPart) || parseRomanToNumber(firstPart) !== null) {
                incisoLabel = normalizeIncisoLabel(firstPart);
                alineaLabel = normalizeAlineaLabel(secondPart);
              } else {
                const fullRoman = `${firstPart}${secondPart}`;
                if (parseRomanToNumber(fullRoman) !== null) {
                  incisoLabel = fullRoman.toUpperCase();
                } else {
                  incisoLabel = normalizeIncisoLabel(firstPart);
                  alineaLabel = normalizeAlineaLabel(secondPart);
                }
              }
            } else {
              if (/^\d+$/.test(firstPart) || parseRomanToNumber(firstPart) !== null) {
                incisoLabel = normalizeIncisoLabel(firstPart);
              } else {
                alineaLabel = normalizeAlineaLabel(firstPart);
              }
            }
          } else {
            const parts = working.split(/[\s,;]+/).filter(Boolean);
            for (const part of parts) {
              if (!incisoLabel && (/^\d+$/.test(part) || parseRomanToNumber(part) !== null)) {
                incisoLabel = normalizeIncisoLabel(part);
              } else if (!alineaLabel) {
                alineaLabel = normalizeAlineaLabel(part);
              }
            }
          }
        }
      }
    }
  }

  return [paragraphLabel, incisoLabel, alineaLabel].filter(Boolean).join(', ');
}

function buildAssuntoDisplayTitle(assunto) {
  const topico = assunto.topico || '';
  const artClean = assunto.artigo
    ? String(assunto.artigo).trim().replace(/^art\.?\s*/i, '')
    : '';
  const artPart = artClean ? `Art. ${artClean}` : '';
  const idReadable = formatIdentifiersReadable(assunto.identificadores);

  const leiPrefix = assunto.lei ? `${assunto.lei}, ` : '';
  const deviceParts = [artPart, idReadable].filter(Boolean);

  if (!leiPrefix && deviceParts.length === 0) {
    return topico;
  }

  return `${topico} (${leiPrefix}${deviceParts.join(', ')})`;
}

// ============================================================================
// Cache em chrome.storage.local (TTL 2h, chave versionada)
// ============================================================================

async function fetchHtmlWithCache(url, forceRefresh = false) {
  const cacheKey = `${CACHE_VERSION}${url}`;

  if (!forceRefresh && typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const stored = await chrome.storage.local.get(cacheKey);
      const entry = stored[cacheKey];
      if (entry && entry.html && (Date.now() - entry.ts) < CACHE_TTL_MS) {
        return entry.html;
      }
    } catch (_) {
      // Continua para fetch direto se storage falhar
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-cache'
  });

  if (!response.ok) {
    throw new Error(`Falha ao acessar o portal (HTTP ${response.status}) em ${url}`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || '';
  let html = '';
  if (/iso-8859-1|windows-1252/i.test(contentType)) {
    html = new TextDecoder('iso-8859-1').decode(buffer);
  } else {
    html = new TextDecoder('utf-8').decode(buffer);
    if (/\uFFFD/.test(html) || /charset\s*=\s*(?:iso-8859-1|windows-1252)/i.test(html)) {
      html = new TextDecoder('iso-8859-1').decode(buffer);
    }
  }

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({
        [cacheKey]: { html, ts: Date.now() }
      });
    } catch (_) {
      // Ignora erro de cota caso ocorra
    }
  }

  return html;
}

export async function clearLegislationCache() {
  normasMemoryCache = null;
  normasIndexCache = null;
  assuntosMemoryCache = null;
  assuntosIndexCache = null;
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return 0;
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter((k) => k.startsWith(CACHE_VERSION));
  if (keys.length > 0) {
    await chrome.storage.local.remove(keys);
  }
  return keys.length;
}

// ============================================================================
// Parser de Páginas de Índice e Páginas de Listagem
// ============================================================================

function extractAllAnchors(html, pageUrl) {
  const anchors = [];
  const regex = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const rawHref = (match[1] ?? match[2] ?? match[3] ?? '').trim();
    if (!rawHref || rawHref.startsWith('#') || /^(?:javascript|mailto):/i.test(rawHref)) {
      continue;
    }
    let resolvedUrl;
    try {
      resolvedUrl = new URL(rawHref, pageUrl).href;
    } catch (_) {
      continue;
    }
    const text = decodeHtml(match[4]);
    if (!text) continue;
    anchors.push({ href: rawHref, url: resolvedUrl, text });
  }
  return anchors;
}

function parsePeriodRange(text, url) {
  const clean = text.replace(/\s+/g, ' ').trim();

  const singleYear = clean.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
  const rangeMatch = clean.match(/\b(18\d{2}|19\d{2}|20\d{2})\s*(?:a|ate|até|-|–|\/)\s*(18\d{2}|19\d{2}|20\d{2})\b/i);
  if (rangeMatch) {
    return {
      minYear: parseInt(rangeMatch[1], 10),
      maxYear: parseInt(rangeMatch[2], 10),
      label: clean,
      url,
      isSingleYear: parseInt(rangeMatch[1], 10) === parseInt(rangeMatch[2], 10)
    };
  }

  const beforeMatch = clean.match(/anteriores?\s+a\s+(18\d{2}|19\d{2}|20\d{2})/i);
  if (beforeMatch) {
    return {
      minYear: 1800,
      maxYear: parseInt(beforeMatch[1], 10) - 1,
      label: clean,
      url,
      isSingleYear: false
    };
  }

  if (singleYear && /^\D*\d{4}\D*$/.test(clean)) {
    const y = parseInt(singleYear[1], 10);
    return {
      minYear: y,
      maxYear: y,
      label: clean,
      url,
      isSingleYear: true
    };
  }

  const urlRange = url.match(/(18\d{2}|19\d{2}|20\d{2})[-_a](18\d{2}|19\d{2}|20\d{2})/);
  if (urlRange) {
    return {
      minYear: parseInt(urlRange[1], 10),
      maxYear: parseInt(urlRange[2], 10),
      label: clean || `${urlRange[1]} a ${urlRange[2]}`,
      url,
      isSingleYear: false
    };
  }
  const urlYear = url.match(/[-_/](18\d{2}|19\d{2}|20\d{2})\.html?$/i);
  if (urlYear) {
    const y = parseInt(urlYear[1], 10);
    return {
      minYear: y,
      maxYear: y,
      label: clean || String(y),
      url,
      isSingleYear: true
    };
  }

  return {
    minYear: null,
    maxYear: null,
    label: clean || url,
    url,
    isSingleYear: false
  };
}

async function getSubpagesFromIndex(type) {
  const indexRel = INDEX_PAGES[type];
  const indexUrl = new URL(indexRel, BASE_URL).href;
  const html = await fetchHtmlWithCache(indexUrl);
  const anchors = extractAllAnchors(html, indexUrl);

  const seen = new Set();
  const pages = [];

  for (const a of anchors) {
    if (a.url === indexUrl) continue;
    const isSubpage = /\/pages\/(?:anos\/|leis-|decretos-|medidas-)/i.test(a.url) ||
      /\b(18\d{2}|19\d{2}|20\d{2}|anteriores)\b/i.test(a.text);
    if (!isSubpage) continue;
    if (/\/pages\/(?:codigos|estatutos|leis-ordinarias|leis-complementares|decretos|decretos-leis|medidas-provisorias|leis-delegadas)\.html$/i.test(a.url)) {
      continue;
    }
    if (seen.has(a.url)) continue;
    seen.add(a.url);
    pages.push(parsePeriodRange(a.text, a.url));
  }

  return pages;
}

export function parseActFromAnchor(anchor, expectedType) {
  if (/\/pages\//i.test(anchor.url)) {
    return null;
  }

  if (/^(?:arts?\.?|artigos?|vide|ver|revogad[oa]|alterad[oa])(?=$|[\s,.;:()0-9])/i.test(anchor.text)) {
    return null;
  }

  const isMP = expectedType === 'mp';

  const prefixRegex = /^(?:[-–—•]\s*)?(?:(?:lei\s+complementar|lei\s+delegada|decreto[-\s]*lei|medida\s+provis[oó]ria|emenda\s+constitucional|decreto|lei)\s*(?:n[º°o\.]*\s*)?)?/i;
  const withoutPrefix = anchor.text.replace(prefixRegex, '').trim();

  const numPattern = isMP
    ? /^(\d[\d.\s]*\d|\d)(?:\s*-\s*(\d+))?(?=\s*(?:,|de\b|\(|\/|$))/i
    : /^(\d[\d.\s]*\d|\d)(?:\s*-?\s*([A-Za-z]))?(?=\s*(?:,|de\b|\(|\/|$))/i;

  const numMatch = withoutPrefix.match(numPattern);
  if (!numMatch) {
    return null;
  }

  const rawNumPart = `${numMatch[1]}${numMatch[2] ? '-' + numMatch[2] : ''}`;
  const normNum = normalizeActNumber(rawNumPart, isMP);
  if (!normNum) return null;

  const rest = withoutPrefix.slice(numMatch[0].length);
  let year = null;

  const numericDateMatch = rest.match(/\b\d{1,2}\s*[./-]\s*\d{1,2}\s*[./-]\s*(\d\s*\d(?:\s*\d\s*\d)?)\b/);
  if (numericDateMatch) {
    year = expandYear(numericDateMatch[1]);
  }

  if (year == null) {
    const extDateMatch = rest.match(/\bde\s+\d{1,2}[º°o]?\s+de\s+[a-zçãõéíóúâêô]+\s+de\s+(\d\s*\d\s*\d\s*\d)\b/i);
    if (extDateMatch) {
      year = expandYear(extDateMatch[1]);
    }
  }

  if (year == null) {
    const slashYearMatch = rest.match(/(?:\/|\()\s*(18\d{2}|19\d{2}|20\d{2}|\d{2})\s*\)?/);
    if (slashYearMatch) {
      year = expandYear(slashYearMatch[1]);
    }
  }

  if (year == null) {
    const urlYearMatch = anchor.url.match(/\/(?:_ato(\d{4})-\d{4}\/(\d{4})|leis\/(\d{4})|(\d{4}))\//i);
    if (urlYearMatch) {
      year = parseInt(urlYearMatch[2] || urlYearMatch[3] || urlYearMatch[4] || urlYearMatch[1], 10);
    }
  }

  return {
    ...normNum,
    year,
    text: anchor.text,
    url: anchor.url
  };
}

async function parseListingPage(pageUrl, expectedType, periodFilter = null) {
  const html = await fetchHtmlWithCache(pageUrl);
  const anchors = extractAllAnchors(html, pageUrl);
  const acts = [];

  for (const a of anchors) {
    const parsed = parseActFromAnchor(a, expectedType);
    if (!parsed) continue;

    let inPeriod = true;
    if (periodFilter && periodFilter.minYear != null && periodFilter.maxYear != null && parsed.year != null) {
      inPeriod = parsed.year >= periodFilter.minYear && parsed.year <= periodFilter.maxYear;
    }

    acts.push({ ...parsed, inPeriod, sourcePage: pageUrl });
  }

  return acts;
}

// ============================================================================
// Interpretação da Consulta do Usuário
// ============================================================================

export function parseUserQuery(rawInput, selectedType = 'auto') {
  const original = String(rawInput || '').trim();
  if (!original) {
    return { kind: 'empty' };
  }

  const sanitized = original
    .replace(/\bacessar\b/gi, ' ')
    .replace(/^[\s.,;:!?()[\]"'“”«»–—-]+/, '')
    .replace(/^(?:do|da|dos|das|no|na|nos|nas|pelo|pela|pelos|pelas|ao|aos|à|às|de|em)\s+/i, '')
    .replace(/[\s.,;:!?[\]"'“”«»–—-]+$/, '')
    .replace(/[^\p{L}\p{N}\s.\-\/º°ª()]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) {
    return { kind: 'empty' };
  }

  const citacaoDiretaEspecieNumero = CITACAO_DIRETA_ESPECIE_NUMERO_REGEX.test(sanitized);

  if (!citacaoDiretaEspecieNumero) {
    const provisionInfo = separarLeiEId(original);
    if (provisionInfo.isUnsupportedAct) {
      return {
        kind: 'unsupported',
        original
      };
    }
    if (provisionInfo.idHtml && provisionInfo.leiTexto) {
      return {
        kind: 'provision',
        idHtml: provisionInfo.idHtml,
        leiTexto: provisionInfo.leiTexto,
        original
      };
    }
  }

  let detectedType = selectedType !== 'auto' ? selectedType : null;
  let working = sanitized;

  const typePatterns = [
    { type: 'lc', regex: /^(?:lei\s+complementar|l\.?\s*c\.?p?\.?)\s*(?:n[º°oª\.]*\s*)?/i },
    { type: 'ld', regex: /^(?:lei\s+delegada|l\.?\s*d\.?)\s*(?:n[º°oª\.]*\s*)?/i },
    { type: 'dl', regex: /^(?:decreto[-\s]*lei|dec\.?[-\s]*lei|d\.?\s*l\.?)\s*(?:n[º°oª\.]*\s*)?/i },
    { type: 'ec', regex: /^(?:emenda\s+constitucional|e\.?\s*c\.?)\s*(?:n[º°oª\.]*\s*)?/i },
    { type: 'mp', regex: /^(?:medida\s+provis[oó]ria|m\.?\s*p\.?v?\.?)\s*(?:n[º°oª\.]*\s*)?/i },
    { type: 'decreto', regex: /^(?:decreto|dec\.?)\s*(?:n[º°oª\.]*\s*)?/i },
    { type: 'lei', regex: /^(?:lei\s+ordin[aá]ria|lei)\s*(?:n[º°oª\.]*\s*)?/i }
  ];

  for (const item of typePatterns) {
    if (item.regex.test(working)) {
      if (!detectedType) detectedType = item.type;
      working = working.replace(item.regex, '').trim();
      break;
    }
  }

  const fullCitationRegex = /^(\d[\d.\s]*\d|\d)(?:\s*-?\s*([A-Za-z]|\d{1,2}))?\s*,?\s*\bde\s+\d{1,2}(?:[º°o]?\s+de\s+[a-zçãõéíóúâêô]+\s+de|\s*[./-]\s*\d{1,2}\s*[./-])\s*(\d{2}|\d{4})\s*$/i;
  const fullMatch = working.match(fullCitationRegex);
  if (fullMatch) {
    const suffixOrPart2 = fullMatch[2] || '';
    const rawYear = fullMatch[3];
    const rawNumber = suffixOrPart2 ? `${fullMatch[1]}-${suffixOrPart2}` : fullMatch[1];

    const inferredType = detectedType || (/^\d+$/.test(suffixOrPart2) ? 'mp' : 'lei');
    const normNum = normalizeActNumber(rawNumber, inferredType === 'mp');
    const year = expandYear(rawYear);

    if (normNum && year) {
      return {
        kind: 'number',
        type: inferredType,
        explicitType: Boolean(detectedType),
        number: normNum,
        year,
        rawYear2Digits: String(year).slice(-2),
        original
      };
    }
  }

  const numWithYearRegex = /^(\d[\d.\s]*\d|\d)(?:\s*-?\s*([A-Za-z]|\d{1,2}))?\s*(?:\/|\bde\b|\(|\s+)\s*(\d{2}|\d{4})\s*\)?$/i;
  const numMatch = working.match(numWithYearRegex);
  if (numMatch) {
    const suffixOrPart2 = numMatch[2] || '';
    const rawYear = numMatch[3];
    const rawNumber = suffixOrPart2 ? `${numMatch[1]}-${suffixOrPart2}` : numMatch[1];

    const inferredType = detectedType || (/^\d+$/.test(suffixOrPart2) ? 'mp' : 'lei');
    const normNum = normalizeActNumber(rawNumber, inferredType === 'mp');
    const year = expandYear(rawYear);

    if (normNum && year) {
      return {
        kind: 'number',
        type: inferredType,
        explicitType: Boolean(detectedType),
        number: normNum,
        year,
        rawYear2Digits: String(year).slice(-2),
        original
      };
    }
  }

  const numOnlyRegex = /^(\d[\d.\s]*\d|\d)(?:\s*-?\s*([A-Za-z]|\d{1,2}))?$/i;
  const singleNumMatch = working.match(numOnlyRegex);
  if (singleNumMatch) {
    const part1 = singleNumMatch[1];
    const part2 = singleNumMatch[2] || '';

    if (detectedType !== 'mp' && /^\d{2}$/.test(part2)) {
      const effectiveType = detectedType || 'lei';
      const normNum = normalizeActNumber(part1, false);
      const year = expandYear(part2);
      if (normNum && year) {
        return {
          kind: 'number',
          type: effectiveType,
          explicitType: Boolean(detectedType),
          number: normNum,
          year,
          rawYear2Digits: String(year).slice(-2),
          original
        };
      }
    }

    const inferredType = detectedType || (/^\d+$/.test(part2) ? 'mp' : 'lei');
    const rawNumber = part2 ? `${part1}-${part2}` : part1;
    const normNum = normalizeActNumber(rawNumber, inferredType === 'mp');
    if (normNum) {
      return {
        kind: 'number',
        type: inferredType,
        explicitType: Boolean(detectedType) || inferredType === 'mp',
        number: normNum,
        year: null,
        original
      };
    }
  }

  return {
    kind: 'name',
    query: sanitized,
    normalizedQuery: normalizeTextForSearch(sanitized),
    aliasKey: normalizeAliasKey(sanitized),
    original
  };
}

export async function checkSelectionCandidate(rawInput) {
  const text = String(rawInput || '').trim();
  if (!text || text.length < 2 || text.length > 140 || /[\r\n]/.test(text)) {
    return { valid: false };
  }

  const parsed = parseUserQuery(text, 'auto');

  if (parsed.kind === 'unsupported') {
    return { valid: false };
  }

  if (parsed.kind === 'provision') {
    return {
      valid: true,
      label: `Abrir ${parsed.leiTexto} (#${parsed.idHtml})`
    };
  }

  if (parsed.kind === 'number') {
    const hasDot = /\d\.\d/.test(text);
    const numVal = parsed.number.numericBase;

    if (!parsed.explicitType && parsed.year == null && !hasDot && numVal >= 1820 && numVal <= 2035) {
      return { valid: false };
    }

    const typeLabel = TYPE_LABELS[parsed.type] || 'Norma';
    const yearSuffix = parsed.year ? `/${parsed.year}` : '';
    return {
      valid: true,
      label: `Abrir ${typeLabel} ${parsed.number.canonical}${yearSuffix}`
    };
  }

  if (parsed.kind === 'name') {
    const qAliasKey = parsed.aliasKey || normalizeAliasKey(parsed.query);
    if (!qAliasKey || qAliasKey.length < 2) return { valid: false };

    if (qAliasKey === 'lei' || qAliasKey === 'decreto' || qAliasKey === 'codigo' || qAliasKey === 'estatuto') {
      return { valid: false };
    }

    const normasIdx = await getNormasIndex();
    const normHits = normasIdx.exactMap.get(qAliasKey);
    if (normHits && normHits.length > 0) {
      const shortTitle = normHits[0].title.split('(')[0].trim();
      return {
        valid: true,
        label: `Abrir ${shortTitle}`
      };
    }

    const assuntosIdx = await getAssuntosIndex();
    const assuntoHits = assuntosIdx.exactMap.get(qAliasKey);
    if (assuntoHits && assuntoHits.length > 0) {
      const first = assuntoHits[0];
      const artLabel = first.artigo ? ` (Art. ${first.artigo})` : '';
      return {
        valid: true,
        label: `Abrir ${first.lei}${artLabel}`
      };
    }
  }

  return { valid: false };
}

// ============================================================================
// Resolução por Número (Com Ano e Sem Ano / Busca Binária)
// ============================================================================

function matchesActNumber(act, targetNorm, isMP) {
  if (isMP) {
    if (act.base !== targetNorm.base) return false;
    if (targetNorm.edition != null) {
      return act.edition === targetNorm.edition;
    }
    return true;
  }
  return act.canonical === targetNorm.canonical;
}

function pickBestMPMatch(matches, targetNorm) {
  if (matches.length === 0) return null;
  if (targetNorm.edition != null) return matches[0];
  return matches.slice().sort((a, b) => (b.edition || 0) - (a.edition || 0))[0];
}

async function resolveSinglePageType(type, numberNorm, year) {
  const pageUrl = new URL(INDEX_PAGES[type], BASE_URL).href;
  const acts = await parseListingPage(pageUrl, type);
  const isMP = type === 'mp';

  const candidates = acts.filter((a) => {
    if (!matchesActNumber(a, numberNorm, isMP)) return false;
    if (year != null && a.year != null) {
      return a.year === year || String(a.year).slice(-2) === String(year).slice(-2);
    }
    return true;
  });

  if (candidates.length === 1) {
    return { status: 'found', result: candidates[0], fallbackUrl: pageUrl };
  }
  if (candidates.length > 1) {
    if (isMP) {
      return { status: 'found', result: pickBestMPMatch(candidates, numberNorm), fallbackUrl: pageUrl };
    }
    return { status: 'multiple', results: candidates, fallbackUrl: pageUrl };
  }

  return {
    status: 'not_found',
    message: `${TYPE_LABELS[type]} nº ${numberNorm.canonical}${year ? '/' + year : ''} não encontrada na listagem oficial.`,
    fallbackUrl: pageUrl
  };
}

async function resolveWithYear(type, numberNorm, year) {
  if (type === 'lc' || type === 'ld' || type === 'ec') {
    return resolveSinglePageType(type, numberNorm, year);
  }

  const indexUrl = new URL(INDEX_PAGES[type], BASE_URL).href;
  const subpages = await getSubpagesFromIndex(type);
  const isMP = type === 'mp';

  const matchingPages = subpages.filter((p) => {
    if (p.minYear != null && p.maxYear != null) {
      return year >= p.minYear && year <= p.maxYear;
    }
    return false;
  });

  const pagesToInspect = matchingPages.length > 0 ? matchingPages : subpages;

  const found = [];
  for (const page of pagesToInspect) {
    const acts = await parseListingPage(page.url, type, page);
    for (const a of acts) {
      if (!matchesActNumber(a, numberNorm, isMP)) continue;
      if (a.year != null && a.year !== year && String(a.year).slice(-2) !== String(year).slice(-2)) {
        continue;
      }
      found.push({ ...a, periodLabel: page.label });
    }
    if (found.length > 0 && !isMP) break;
  }

  if (found.length > 0) {
    const chosen = isMP ? pickBestMPMatch(found, numberNorm) : found[0];
    return {
      status: 'found',
      result: chosen,
      fallbackUrl: pagesToInspect[0]?.url || indexUrl
    };
  }

  return {
    status: 'not_found',
    message: `${TYPE_LABELS[type]} nº ${numberNorm.canonical}/${year} não localizada na listagem de ${year}.`,
    fallbackUrl: pagesToInspect[0]?.url || indexUrl
  };
}

async function binarySearchAnnualPages(annualPages, type, numberNorm) {
  const sorted = annualPages.slice().sort((a, b) => a.minYear - b.minYear);
  let low = 0;
  let high = sorted.length - 1;
  const targetNum = numberNorm.numericBase;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const page = sorted[mid];
    const acts = await parseListingPage(page.url, type, page);

    const exact = acts.find((a) => matchesActNumber(a, numberNorm, false));
    if (exact) {
      return { status: 'found', result: { ...exact, periodLabel: page.label }, fallbackUrl: page.url };
    }

    const validNums = acts
      .filter((a) => a.inPeriod && a.numericBase > 0)
      .map((a) => a.numericBase);

    if (validNums.length === 0) {
      high = mid - 1;
      continue;
    }

    const minNum = Math.min(...validNums);
    const maxNum = Math.max(...validNums);

    if (targetNum < minNum) {
      high = mid - 1;
    } else if (targetNum > maxNum) {
      low = mid + 1;
    } else {
      return {
        status: 'not_found',
        message: `${TYPE_LABELS[type]} nº ${numberNorm.canonical} não existe na faixa de ${page.label} (${minNum} a ${maxNum}).`,
        fallbackUrl: page.url
      };
    }
  }

  return null;
}

async function resolveWithoutYear(type, numberNorm) {
  if (type === 'lc' || type === 'ld' || type === 'ec') {
    return resolveSinglePageType(type, numberNorm, null);
  }

  const indexUrl = new URL(INDEX_PAGES[type], BASE_URL).href;
  const subpages = await getSubpagesFromIndex(type);

  if (type === 'lei') {
    const annualPages = subpages.filter((p) => p.isSingleYear && p.minYear >= 1960);
    const historicalPages = subpages.filter((p) => !p.isSingleYear || p.minYear < 1960);

    const binResult = await binarySearchAnnualPages(annualPages, 'lei', numberNorm);
    if (binResult) return binResult;

    for (const page of historicalPages) {
      const acts = await parseListingPage(page.url, 'lei', page);
      const match = acts.find((a) => matchesActNumber(a, numberNorm, false));
      if (match) {
        return { status: 'found', result: { ...match, periodLabel: page.label }, fallbackUrl: page.url };
      }
    }

    return {
      status: 'not_found',
      message: `Lei nº ${numberNorm.canonical} não encontrada nas listagens do portal.`,
      fallbackUrl: indexUrl
    };
  }

  if (type === 'decreto') {
    const page1991 = subpages.find((p) => p.isSingleYear && p.minYear === 1991);
    const pages1992Plus = subpages.filter((p) => p.isSingleYear && p.minYear >= 1992);
    const oldPages = subpages.filter((p) => !p.isSingleYear || p.minYear < 1991);

    const matches = [];

    const bin1992 = await binarySearchAnnualPages(pages1992Plus, 'decreto', numberNorm);
    if (bin1992?.status === 'found') {
      matches.push(bin1992.result);
    }

    if (page1991) {
      const acts1991 = await parseListingPage(page1991.url, 'decreto', page1991);
      const m1991 = acts1991.find((a) => matchesActNumber(a, numberNorm, false));
      if (m1991) {
        matches.push({ ...m1991, periodLabel: page1991.label });
      }
    }

    if (matches.length === 1) {
      return { status: 'found', result: matches[0], fallbackUrl: indexUrl };
    }
    if (matches.length > 1) {
      return { status: 'multiple', results: matches, fallbackUrl: indexUrl };
    }

    const candidateOldPages = numberNorm.numericBase > 9000
      ? oldPages.filter((p) => p.maxYear == null || p.maxYear >= 1990)
      : oldPages;

    const batchSize = 4;
    for (let i = 0; i < candidateOldPages.length; i += batchSize) {
      const batch = candidateOldPages.slice(i, i + batchSize);
      const settled = await Promise.allSettled(
        batch.map(async (page) => {
          const acts = await parseListingPage(page.url, 'decreto', page);
          return acts
            .filter((a) => matchesActNumber(a, numberNorm, false))
            .map((a) => ({ ...a, periodLabel: page.label }));
        })
      );

      for (const item of settled) {
        if (item.status === 'fulfilled' && Array.isArray(item.value)) {
          matches.push(...item.value);
        }
      }

      if (matches.length > 0) break;
    }

    if (matches.length === 1) {
      return { status: 'found', result: matches[0], fallbackUrl: indexUrl };
    }
    if (matches.length > 1) {
      return { status: 'multiple', results: matches, fallbackUrl: indexUrl };
    }

    return {
      status: 'not_found',
      message: `Decreto nº ${numberNorm.canonical} não encontrado nas listagens.`,
      fallbackUrl: indexUrl
    };
  }

  if (type === 'dl' || type === 'mp') {
    const isMP = type === 'mp';
    const allMatches = [];

    for (const page of subpages) {
      const acts = await parseListingPage(page.url, type, page);
      const pageHits = acts.filter((a) => matchesActNumber(a, numberNorm, isMP));

      if (pageHits.length > 0) {
        if (isMP && numberNorm.edition == null) {
          const bestInPage = pickBestMPMatch(pageHits, numberNorm);
          allMatches.push({ ...bestInPage, periodLabel: page.label });
        } else {
          for (const h of pageHits) {
            allMatches.push({ ...h, periodLabel: page.label });
          }
        }
      }
    }

    const unique = [];
    const seenUrls = new Set();
    for (const item of allMatches) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        unique.push(item);
      }
    }

    if (unique.length === 1) {
      return { status: 'found', result: unique[0], fallbackUrl: indexUrl };
    }
    if (unique.length > 1) {
      return { status: 'multiple', results: unique, fallbackUrl: indexUrl };
    }

    return {
      status: 'not_found',
      message: `${TYPE_LABELS[type]} nº ${numberNorm.canonical} não encontrada em nenhum período.`,
      fallbackUrl: indexUrl
    };
  }

  return { status: 'not_found', message: 'Tipo de norma não suportado.', fallbackUrl: BASE_URL };
}

// ============================================================================
// Busca Otimizada por Nome / Sigla / Códigos / Estatutos / Apelidos / Assuntos
// ============================================================================

async function loadDynamicCatalog() {
  const catalog = [];
  const sources = [
    { rel: INDEX_PAGES.codigos, category: 'Código (Portal)' },
    { rel: INDEX_PAGES.estatutos, category: 'Estatuto (Portal)' }
  ];

  for (const src of sources) {
    const pageUrl = new URL(src.rel, BASE_URL).href;
    try {
      const html = await fetchHtmlWithCache(pageUrl);
      const anchors = extractAllAnchors(html, pageUrl);
      for (const a of anchors) {
        if (/\/pages\//i.test(a.url)) continue;
        const cleanTitle = a.text.replace(/\bacessar\b/gi, '').replace(/\s+/g, ' ').trim();
        if (cleanTitle.length < 4) continue;
        const aliasKey = normalizeAliasKey(cleanTitle);
        catalog.push({
          title: cleanTitle,
          normalizedTitle: normalizeTextForSearch(cleanTitle),
          aliasKey,
          tokens: extractSignificantTokens(aliasKey),
          url: a.url,
          category: src.category
        });
      }
    } catch (_) {
      // Mantém o catálogo embutido caso a página falhe
    }
  }

  return catalog;
}

let dlRowPrev2 = new Int32Array(64);
let dlRowPrev1 = new Int32Array(64);
let dlRowCurr = new Int32Array(64);

function damerauLevenshtein(a, b) {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  if (lenB + 1 > dlRowCurr.length) {
    const size = Math.max(lenB + 16, dlRowCurr.length * 2);
    dlRowPrev2 = new Int32Array(size);
    dlRowPrev1 = new Int32Array(size);
    dlRowCurr = new Int32Array(size);
  }

  for (let j = 0; j <= lenB; j++) {
    dlRowPrev1[j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    dlRowCurr[0] = i;
    const chA = a.charCodeAt(i - 1);
    const prevChA = i > 1 ? a.charCodeAt(i - 2) : -1;

    for (let j = 1; j <= lenB; j++) {
      const chB = b.charCodeAt(j - 1);
      const cost = chA === chB ? 0 : 1;

      let val = dlRowPrev1[j] + 1;
      const ins = dlRowCurr[j - 1] + 1;
      const sub = dlRowPrev1[j - 1] + cost;
      if (ins < val) val = ins;
      if (sub < val) val = sub;

      if (i > 1 && j > 1 && chA === b.charCodeAt(j - 2) && prevChA === chB) {
        const trans = dlRowPrev2[j - 2] + 1;
        if (trans < val) val = trans;
      }

      dlRowCurr[j] = val;
    }

    const tmp = dlRowPrev2;
    dlRowPrev2 = dlRowPrev1;
    dlRowPrev1 = dlRowCurr;
    dlRowCurr = tmp;
  }

  return dlRowPrev1[lenB];
}

function tokenMatchScore(qToken, tToken) {
  if (qToken === tToken) return 1.0;

  const maxLen = Math.max(qToken.length, tToken.length);
  const minLen = Math.min(qToken.length, tToken.length);

  if (qToken.length >= 3 && tToken.startsWith(qToken)) {
    const base = qToken.length === 3 ? 0.84 : 0.88;
    return base * (qToken.length / tToken.length) + 0.1;
  }

  if (qToken.length >= 4 && tToken.includes(qToken)) {
    return 0.78 * (qToken.length / tToken.length) + 0.12;
  }

  if (maxLen <= 4 || minLen < 4) return 0;
  if (Math.abs(qToken.length - tToken.length) > 2) return 0;

  const dist = damerauLevenshtein(qToken, tToken);
  const allowedEdits = maxLen >= 8 ? 2 : 1;

  if (dist <= allowedEdits) {
    return Math.max(0.75, 1 - (dist / maxLen));
  }

  return 0;
}

function getCachedTokenScore(qToken, tToken, tokenScoreCache) {
  if (qToken === tToken) return 1.0;
  if (!tokenScoreCache) return tokenMatchScore(qToken, tToken);

  let inner = tokenScoreCache.get(qToken);
  if (!inner) {
    inner = new Map();
    tokenScoreCache.set(qToken, inner);
  }
  let cached = inner.get(tToken);
  if (cached === undefined) {
    cached = tokenMatchScore(qToken, tToken);
    inner.set(tToken, cached);
  }
  return cached;
}

function similarityScorePrecomputed(queryNorm, qTokens, targetNorm, tTokens, tokenScoreCache = null) {
  if (!queryNorm || !targetNorm) return 0;
  if (queryNorm === targetNorm) return 1.0;
  if (qTokens.length === 0 || tTokens.length === 0) return 0;

  let matchedSum = 0;
  let matchedCount = 0;
  let firstMatchIndex = Infinity;

  for (let qi = 0; qi < qTokens.length; qi++) {
    const qt = qTokens[qi];
    let bestTokenScore = 0;
    let bestIdx = Infinity;

    for (let ti = 0; ti < tTokens.length; ti++) {
      const s = getCachedTokenScore(qt, tTokens[ti], tokenScoreCache);
      if (s > bestTokenScore) {
        bestTokenScore = s;
        bestIdx = ti;
        if (s === 1.0) break;
      }
    }

    if (bestTokenScore > 0) {
      matchedSum += bestTokenScore;
      matchedCount += 1;
      if (bestIdx < firstMatchIndex) {
        firstMatchIndex = bestIdx;
      }
    }
  }

  if (matchedCount === 0) return 0;

  const startsWithBonus = targetNorm.startsWith(queryNorm)
    ? 0.06
    : (firstMatchIndex === 0 ? 0.03 : 0);
  const lengthProximity = Math.min(queryNorm.length, targetNorm.length) / Math.max(queryNorm.length, targetNorm.length);

  if (matchedCount === qTokens.length) {
    const avgTokenQuality = matchedSum / qTokens.length;
    const coverageRatio = qTokens.length / Math.max(qTokens.length, tTokens.length);
    const rawScore = (0.60 * avgTokenQuality) + (0.24 * coverageRatio) + (0.10 * lengthProximity) + startsWithBonus;
    return Math.min(0.99, rawScore);
  }

  let unionSize = tTokens.length;
  for (let qi = 0; qi < qTokens.length; qi++) {
    if (!tTokens.includes(qTokens[qi])) unionSize += 1;
  }
  const partialScore = ((matchedSum / unionSize) * 0.80) + (0.05 * lengthProximity) + (startsWithBonus * 0.5);
  return Math.min(0.89, partialScore);
}

function similarityScore(queryRaw, targetRaw) {
  const queryNorm = normalizeAliasKey(queryRaw);
  const targetNorm = normalizeAliasKey(targetRaw);
  return similarityScorePrecomputed(
    queryNorm,
    extractSignificantTokens(queryNorm),
    targetNorm,
    extractSignificantTokens(targetNorm)
  );
}

function findCandidateAssuntoIndices(assuntosIdx, qTokens, tokenScoreCache) {
  const candidateSet = new Set();
  const vocab = assuntosIdx.vocabulary;

  for (let qi = 0; qi < qTokens.length; qi++) {
    const qt = qTokens[qi];

    const exactList = assuntosIdx.invertedIndex.get(qt);
    if (exactList) {
      for (let i = 0; i < exactList.length; i++) {
        candidateSet.add(exactList[i]);
      }
    }

    if (qt.length >= 3) {
      for (let vi = 0; vi < vocab.length; vi++) {
        const vt = vocab[vi];
        if (vt === qt) continue;

        const isPrefix = vt.startsWith(qt);
        if (!isPrefix) {
          if (qt.length < 4) continue;
          const isSubstring = vt.includes(qt);
          const isPossibleTypo = vt.length >= 4 && Math.abs(vt.length - qt.length) <= 2;
          if (!isSubstring && !isPossibleTypo) continue;
        }

        const score = getCachedTokenScore(qt, vt, tokenScoreCache);
        if (score > 0) {
          const list = assuntosIdx.invertedIndex.get(vt);
          if (list) {
            for (let i = 0; i < list.length; i++) {
              candidateSet.add(list[i]);
            }
          }
        }
      }
    }
  }

  return candidateSet;
}

async function resolveCatalogEntry(entry) {
  if (entry.url) {
    return {
      title: entry.title,
      url: entry.url,
      category: entry.category
    };
  }
  const resolved = await resolveWithYear(entry.type, normalizeActNumber(entry.number, entry.type === 'mp'), entry.year);
  if (resolved.status === 'found') {
    return {
      title: entry.title,
      url: resolved.result.url,
      category: entry.category
    };
  }
  return null;
}

async function resolveAssuntoEntry(assunto) {
  let baseUrl = assunto.url || null;

  if (!baseUrl && assunto.lei) {
    const leiOutcome = await resolveLegislation(assunto.lei, 'auto', { allowAssuntos: false });

    if (leiOutcome.status === 'found' && leiOutcome.result?.url) {
      baseUrl = leiOutcome.result.url;
    } else if (leiOutcome.status === 'confirm' && leiOutcome.suggestion) {
      baseUrl = await resolvePendingCatalogItem(leiOutcome.suggestion);
    } else if (leiOutcome.status === 'multiple' && leiOutcome.results?.length > 0) {
      baseUrl = await resolvePendingCatalogItem(leiOutcome.results[0]);
    }
  }

  if (!baseUrl) return null;

  const finalUrl = appendAnchorToUrl(baseUrl, assunto.artigo, assunto.identificadores);
  return {
    title: buildAssuntoDisplayTitle(assunto),
    url: finalUrl,
    category: 'Assunto',
    artigo: assunto.artigo || '',
    identificadores: assunto.identificadores || '',
    identificadoresLegiveis: formatIdentifiersReadable(assunto.identificadores)
  };
}

function formatAssuntoPendingItem(assunto) {
  return {
    title: buildAssuntoDisplayTitle(assunto),
    assuntoEntry: assunto,
    category: 'Assunto',
    artigo: assunto.artigo || '',
    identificadores: assunto.identificadores || '',
    identificadoresLegiveis: formatIdentifiersReadable(assunto.identificadores)
  };
}

async function resolveByName(parsedQuery, options = {}) {
  const allowAssuntos = options.allowAssuntos !== false;
  const qAliasKey = parsedQuery.aliasKey || normalizeAliasKey(parsedQuery.query);
  const qTokens = extractSignificantTokens(qAliasKey);

  const [normasIdx, dynamicCatalog, assuntosIdx] = await Promise.all([
    getNormasIndex(),
    loadDynamicCatalog(),
    allowAssuntos ? getAssuntosIndex() : Promise.resolve(null)
  ]);
  const knownNorms = await loadNormas();
  const codigosFallback = new URL(INDEX_PAGES.codigos, BASE_URL).href;

  if (qAliasKey === 'codigo' || qAliasKey === 'codigos') {
    const allCodes = [
      ...knownNorms.filter((n) => (n.category || '').startsWith('Código')),
      ...dynamicCatalog.filter((d) => d.category.startsWith('Código'))
    ];
    const dedup = deduplicateItems(allCodes);
    return {
      status: 'multiple',
      message: 'Termo genérico. Selecione o Código desejado:',
      results: dedup,
      fallbackUrl: codigosFallback
    };
  }

  if (qAliasKey === 'estatuto' || qAliasKey === 'estatutos') {
    const allStatutes = [
      ...knownNorms.filter((n) => (n.category || '').startsWith('Estatuto')),
      ...dynamicCatalog.filter((d) => d.category.startsWith('Estatuto'))
    ];
    const dedup = deduplicateItems(allStatutes);
    return {
      status: 'multiple',
      message: 'Termo genérico. Selecione o Estatuto desejado:',
      results: dedup,
      fallbackUrl: new URL(INDEX_PAGES.estatutos, BASE_URL).href
    };
  }

  const exactNormHits = normasIdx.exactMap.get(qAliasKey);
  if (exactNormHits && exactNormHits.length > 0) {
    const resolved = await resolveCatalogEntry(exactNormHits[0]);
    if (resolved) {
      return { status: 'found', result: resolved, fallbackUrl: codigosFallback };
    }
  }

  const exactDynamic = dynamicCatalog.find((item) => item.aliasKey === qAliasKey);
  if (exactDynamic) {
    return {
      status: 'found',
      result: { title: exactDynamic.title, url: exactDynamic.url, category: exactDynamic.category },
      fallbackUrl: codigosFallback
    };
  }

  if (allowAssuntos && assuntosIdx) {
    const exactAssuntos = assuntosIdx.exactMap.get(qAliasKey) || [];

    if (exactAssuntos.length === 1) {
      const resolvedAssunto = await resolveAssuntoEntry(exactAssuntos[0]);
      if (resolvedAssunto) {
        return { status: 'found', result: resolvedAssunto, fallbackUrl: codigosFallback };
      }
      return {
        status: 'not_found',
        message: `Não foi possível localizar a norma "${exactAssuntos[0].lei}" vinculada ao assunto "${exactAssuntos[0].topico}".`,
        fallbackUrl: codigosFallback
      };
    } else if (exactAssuntos.length > 1) {
      const sortedExactAssuntos = exactAssuntos.slice().sort((a, b) => {
        const scoreA = similarityScore(qAliasKey, a.topico || '');
        const scoreB = similarityScore(qAliasKey, b.topico || '');
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (a.topico || '').length - (b.topico || '').length;
      });

      return {
        status: 'multiple',
        message: `Encontramos ${sortedExactAssuntos.length} assuntos correspondentes a "${parsedQuery.original}":`,
        results: sortedExactAssuntos.map(formatAssuntoPendingItem),
        fallbackUrl: codigosFallback
      };
    }
  }

  const MIN_SIMILARITY = 0.50;
  const tokenScoreCache = new Map();
  const scored = [];

  for (let i = 0; i < normasIdx.entries.length; i++) {
    const entry = normasIdx.entries[i];
    const titleScore = similarityScorePrecomputed(qAliasKey, qTokens, entry.titleNorm, entry.titleTokens, tokenScoreCache);
    let bestScore = titleScore;
    let bestLabelLen = entry.titleNorm.length;

    for (let j = 0; j < entry.aliases.length; j++) {
      const al = entry.aliases[j];
      const s = similarityScorePrecomputed(qAliasKey, qTokens, al.norm, al.tokens, tokenScoreCache);
      if (s > bestScore || (s === bestScore && al.norm.length < bestLabelLen)) {
        bestScore = s;
        bestLabelLen = al.norm.length;
      }
    }

    if (bestScore >= MIN_SIMILARITY) {
      scored.push({
        score: bestScore,
        topicScore: titleScore,
        labelLength: bestLabelLen,
        kind: 'norm',
        item: entry.norm
      });
    }
  }

  for (let i = 0; i < dynamicCatalog.length; i++) {
    const dyn = dynamicCatalog[i];
    const s = similarityScorePrecomputed(qAliasKey, qTokens, dyn.aliasKey, dyn.tokens, tokenScoreCache);
    if (s >= MIN_SIMILARITY) {
      scored.push({
        score: s,
        topicScore: s,
        labelLength: dyn.aliasKey.length,
        kind: 'norm',
        item: dyn
      });
    }
  }

  if (allowAssuntos && assuntosIdx) {
    const candidateIndices = findCandidateAssuntoIndices(assuntosIdx, qTokens, tokenScoreCache);
    for (const idx of candidateIndices) {
      const entry = assuntosIdx.entries[idx];
      const topicScore = similarityScorePrecomputed(qAliasKey, qTokens, entry.topicoNorm, entry.topicoTokens, tokenScoreCache);
      let bestScore = topicScore;
      let bestLabelLen = entry.topicoNorm.length || Infinity;

      for (let j = 0; j < entry.aliases.length; j++) {
        const al = entry.aliases[j];
        const s = similarityScorePrecomputed(qAliasKey, qTokens, al.norm, al.tokens, tokenScoreCache);
        if (s > bestScore || (s === bestScore && al.norm.length < bestLabelLen)) {
          bestScore = s;
          bestLabelLen = al.norm.length;
        }
      }

      if (bestScore >= MIN_SIMILARITY) {
        scored.push({
          score: bestScore,
          topicScore,
          labelLength: bestLabelLen,
          kind: 'assunto',
          item: entry.assunto
        });
      }
    }
  }

  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 1e-6) return b.score - a.score;
    if (Math.abs(b.topicScore - a.topicScore) > 1e-6) return b.topicScore - a.topicScore;
    return a.labelLength - b.labelLength;
  });

  const topCandidates = [];
  const seenKeys = new Set();
  for (let i = 0; i < scored.length; i++) {
    const entry = scored[i];
    const key = entry.kind === 'assunto'
      ? `assunto_${entry.item.id ?? entry.item.topico}_${entry.item.lei}_${entry.item.artigo}`
      : `norm_${normalizeAliasKey(entry.item.title)}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    topCandidates.push(entry);
    if (topCandidates.length >= 10) break;
  }

  if (topCandidates.length === 0) {
    return {
      status: 'not_found',
      message: `Nenhuma norma ou assunto encontrado para "${parsedQuery.original}".`,
      fallbackUrl: codigosFallback
    };
  }

  if (topCandidates.length === 1) {
    const only = topCandidates[0];
    if (only.kind === 'assunto') {
      return {
        status: 'confirm',
        suggestion: formatAssuntoPendingItem(only.item),
        fallbackUrl: codigosFallback
      };
    }

    const resolved = await resolveCatalogEntry(only.item);
    if (resolved) {
      return {
        status: 'confirm',
        suggestion: resolved,
        fallbackUrl: codigosFallback
      };
    }
  }

  const resolvedList = topCandidates.map((c) => {
    if (c.kind === 'assunto') {
      return formatAssuntoPendingItem(c.item);
    }
    if (c.item.url) {
      return {
        title: c.item.title,
        url: c.item.url,
        category: c.item.category
      };
    }
    return {
      title: c.item.title,
      catalogEntry: c.item,
      category: c.item.category
    };
  });

  return {
    status: 'multiple',
    message: `Encontramos ${resolvedList.length} resultados relacionados a "${parsedQuery.original}":`,
    results: resolvedList,
    fallbackUrl: codigosFallback
  };
}

function deduplicateItems(items) {
  const out = [];
  const seen = new Set();
  for (const item of items) {
    const key = normalizeAliasKey(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.url ? { title: item.title, url: item.url, category: item.category } : { title: item.title, catalogEntry: item, category: item.category });
  }
  return out;
}

// ============================================================================
// Ponto de Entrada Principal
// ============================================================================

export async function resolveLegislation(rawInput, selectedType = 'auto', options = {}) {
  const parsed = parseUserQuery(rawInput, selectedType);

  if (parsed.kind === 'empty') {
    return {
      status: 'error',
      message: 'Digite o número, sigla, assunto ou nome de uma norma.',
      fallbackUrl: BASE_URL
    };
  }

  if (parsed.kind === 'unsupported') {
    return {
      status: 'not_found',
      message: `"${parsed.original}" não é uma norma suportada.`,
      fallbackUrl: BASE_URL
    };
  }

  try {
    if (parsed.kind === 'provision') {
      const leiOutcome = await resolveLegislation(parsed.leiTexto, selectedType, {
        ...options,
        allowAssuntos: false
      });

      if (leiOutcome.status === 'found' && leiOutcome.result?.url) {
        return {
          ...leiOutcome,
          result: {
            ...leiOutcome.result,
            title: `${leiOutcome.result.title || parsed.leiTexto} (#${parsed.idHtml})`,
            url: applyProvisionIdToUrl(leiOutcome.result.url, parsed.idHtml)
          }
        };
      }

      if (leiOutcome.status === 'confirm' && leiOutcome.suggestion) {
        const baseUrl = await resolvePendingCatalogItem(leiOutcome.suggestion);
        if (baseUrl) {
          return {
            status: 'found',
            result: {
              title: `${leiOutcome.suggestion.title || parsed.leiTexto} (#${parsed.idHtml})`,
              url: applyProvisionIdToUrl(baseUrl, parsed.idHtml),
              category: leiOutcome.suggestion.category || 'Dispositivo'
            },
            fallbackUrl: leiOutcome.fallbackUrl
          };
        }
      }

      if (leiOutcome.status === 'multiple' && Array.isArray(leiOutcome.results)) {
        return {
          ...leiOutcome,
          results: leiOutcome.results.map((item) => ({
            ...item,
            title: `${item.title || item.text || parsed.leiTexto} (#${parsed.idHtml})`,
            url: item.url ? applyProvisionIdToUrl(item.url, parsed.idHtml) : item.url,
            provisionId: parsed.idHtml
          }))
        };
      }

      return leiOutcome;
    }

    if (parsed.kind === 'name') {
      return await resolveByName(parsed, options);
    }

    if (parsed.year != null) {
      const res = await resolveWithYear(parsed.type, parsed.number, parsed.year);
      if (res.status === 'not_found' && !parsed.explicitType && parsed.type === 'lei') {
        const tryLc = await resolveWithYear('lc', parsed.number, parsed.year);
        if (tryLc.status === 'found') return tryLc;
        const tryDec = await resolveWithYear('decreto', parsed.number, parsed.year);
        if (tryDec.status === 'found') return tryDec;
      }
      return res;
    }

    return await resolveWithoutYear(parsed.type, parsed.number);
  } catch (err) {
    return {
      status: 'error',
      message: err?.message || 'Erro de rede ao consultar o Portal da Legislação.',
      fallbackUrl: BASE_URL
    };
  }
}

export async function resolvePendingCatalogItem(item) {
  let resolvedUrl = null;

  if (item.url) {
    resolvedUrl = item.url;
  } else if (item.assuntoEntry) {
    const resolved = await resolveAssuntoEntry(item.assuntoEntry);
    resolvedUrl = resolved?.url || null;
  } else if (item.catalogEntry) {
    const resolved = await resolveCatalogEntry(item.catalogEntry);
    resolvedUrl = resolved?.url || null;
  }

  if (resolvedUrl && item.provisionId) {
    return applyProvisionIdToUrl(resolvedUrl, item.provisionId);
  }

  return resolvedUrl;
}

// ============================================================================
// Sugestões Rápidas para a Omnibox (Normas + Assuntos via Índice)
// ============================================================================

export async function getOmniboxSuggestions(rawInput, limit = 8) {
  const qAliasKey = normalizeAliasKey(rawInput);
  if (!qAliasKey || qAliasKey.length < 2) return [];

  const qTokens = extractSignificantTokens(qAliasKey);
  const [normasIdx, assuntosIdx] = await Promise.all([getNormasIndex(), getAssuntosIndex()]);
  const tokenScoreCache = new Map();

  const exactMatches = [];
  const candidates = [];

  for (let i = 0; i < normasIdx.entries.length; i++) {
    const entry = normasIdx.entries[i];
    const norm = entry.norm;
    const isExactTitle = entry.titleNorm === qAliasKey;
    const exactAliasObj = entry.aliases.find((al) => al.norm === qAliasKey);

    if (isExactTitle || exactAliasObj) {
      const content = exactAliasObj ? exactAliasObj.raw : norm.title;
      exactMatches.push({
        score: 1.0,
        labelLength: (exactAliasObj ? exactAliasObj.norm : entry.titleNorm).length,
        content,
        title: norm.title,
        tag: norm.category || 'Norma'
      });
      continue;
    }

    let bestScore = entry.titleNorm.includes(qAliasKey)
      ? Math.max(0.65, similarityScorePrecomputed(qAliasKey, qTokens, entry.titleNorm, entry.titleTokens, tokenScoreCache))
      : similarityScorePrecomputed(qAliasKey, qTokens, entry.titleNorm, entry.titleTokens, tokenScoreCache);
    let bestContent = entry.aliases[0]?.raw || norm.title;

    for (let j = 0; j < entry.aliases.length; j++) {
      const al = entry.aliases[j];
      let s = similarityScorePrecomputed(qAliasKey, qTokens, al.norm, al.tokens, tokenScoreCache);
      if (al.norm.startsWith(qAliasKey)) {
        s = Math.max(s, 0.85);
      } else if (al.norm.includes(qAliasKey)) {
        s = Math.max(s, 0.68);
      }
      if (s > bestScore) {
        bestScore = s;
        bestContent = al.raw;
      }
    }

    if (bestScore >= 0.48) {
      candidates.push({
        score: bestScore,
        labelLength: normalizeAliasKey(bestContent).length,
        content: bestContent,
        title: norm.title,
        tag: norm.category || 'Norma'
      });
    }
  }

  const exactAssuntoSet = new Set();
  const exactAssuntosList = assuntosIdx.exactMap.get(qAliasKey) || [];
  for (let i = 0; i < exactAssuntosList.length; i++) {
    const assunto = exactAssuntosList[i];
    exactAssuntoSet.add(assunto);
    const artInfo = assunto.artigo ? `, Art. ${assunto.artigo}` : '';
    const idInfo = formatIdentifiersReadable(assunto.identificadores);
    const tag = `${assunto.lei}${artInfo}${idInfo ? `, ${idInfo}` : ''}`;
    const matchedRaw = (Array.isArray(assunto.alias)
      ? assunto.alias.find((al) => normalizeAliasKey(al) === qAliasKey)
      : null) || assunto.topico || qAliasKey;

    exactMatches.push({
      score: 1.0,
      labelLength: qAliasKey.length,
      content: matchedRaw,
      title: `${assunto.topico || ''} — ${matchedRaw}`,
      tag
    });
  }

  const candidateIndices = findCandidateAssuntoIndices(assuntosIdx, qTokens, tokenScoreCache);
  for (const idx of candidateIndices) {
    const entry = assuntosIdx.entries[idx];
    const assunto = entry.assunto;
    if (exactAssuntoSet.has(assunto)) continue;

    const artInfo = assunto.artigo ? `, Art. ${assunto.artigo}` : '';
    const idInfo = formatIdentifiersReadable(assunto.identificadores);
    const tag = `${assunto.lei}${artInfo}${idInfo ? `, ${idInfo}` : ''}`;

    let bestScore = entry.topicoNorm.startsWith(qAliasKey)
      ? Math.max(0.82, similarityScorePrecomputed(qAliasKey, qTokens, entry.topicoNorm, entry.topicoTokens, tokenScoreCache))
      : (entry.topicoNorm.includes(qAliasKey)
        ? Math.max(0.64, similarityScorePrecomputed(qAliasKey, qTokens, entry.topicoNorm, entry.topicoTokens, tokenScoreCache))
        : similarityScorePrecomputed(qAliasKey, qTokens, entry.topicoNorm, entry.topicoTokens, tokenScoreCache));
    let matchedAlias = entry.aliases[0]?.raw || entry.topico;
    let matchedAliasLen = entry.aliases[0]?.norm.length || entry.topicoNorm.length;

    for (let j = 0; j < entry.aliases.length; j++) {
      const al = entry.aliases[j];
      let s = similarityScorePrecomputed(qAliasKey, qTokens, al.norm, al.tokens, tokenScoreCache);
      if (al.norm.startsWith(qAliasKey)) {
        s = Math.max(s, 0.86);
      } else if (al.norm.includes(qAliasKey)) {
        s = Math.max(s, 0.70);
      }
      if (s > bestScore || (s === bestScore && al.norm.length < matchedAliasLen)) {
        bestScore = s;
        matchedAlias = al.raw;
        matchedAliasLen = al.norm.length;
      }
    }

    if (bestScore >= 0.48) {
      candidates.push({
        score: bestScore,
        labelLength: matchedAliasLen,
        content: matchedAlias,
        title: `${entry.topico} — ${matchedAlias}`,
        tag
      });
    }
  }

  const uniqueExact = [];
  const seenExact = new Set();
  for (let i = 0; i < exactMatches.length; i++) {
    const item = exactMatches[i];
    const key = `${normalizeAliasKey(item.title)}|${item.tag}`;
    if (seenExact.has(key)) continue;
    seenExact.add(key);
    uniqueExact.push(item);
  }

  if (uniqueExact.length === 1) {
    return [uniqueExact[0]];
  }

  const allPool = uniqueExact.length > 0 ? [...uniqueExact, ...candidates] : candidates;
  allPool.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 1e-6) return b.score - a.score;
    return a.labelLength - b.labelLength;
  });

  const unique = [];
  const seen = new Set();
  for (let i = 0; i < allPool.length; i++) {
    const item = allPool[i];
    const key = `${normalizeAliasKey(item.title)}|${item.tag}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= limit) break;
  }

  return unique;
}