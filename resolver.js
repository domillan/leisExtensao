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

/**
 * Catálogo de siglas, constituições, normas revogadas e leis por apelido.
 */
export const KNOWN_NORMS = [
  // Constituição Federal e Históricas
  {
    aliases: ['cf', 'cf 88', 'cf 1988', 'crfb', 'crfb 88', 'constituicao', 'constituicao federal', 'constituicao da republica', 'constituicao da republica federativa do brasil', 'constituicao da republica federativa do brasil de 1988'],
    title: 'Constituição da República Federativa do Brasil de 1988',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/constituicao.htm',
    category: 'Constituição'
  },
  {
    aliases: ['cf 67', 'cf 1967', 'constituicao 1967', 'constituicao de 1967', 'constituicao da republica federativa do brasil de 1967'],
    title: 'Constituição da República Federativa do Brasil de 1967',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/constituicao67.htm',
    category: 'Constituição Revogada'
  },
  {
    aliases: ['cf 69', 'cf 1969', 'ec 1 69', 'ec 1 1969', 'constituicao 1969'],
    title: 'Emenda Constitucional nº 1, de 1969 (Constituição de 1967/69)',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/emendas/emc_anterior1988/emc01-69.htm',
    category: 'Constituição Revogada'
  },
  {
    aliases: ['cf 46', 'cf 1946', 'constituicao 1946', 'constituicao de 1946'],
    title: 'Constituição dos Estados Unidos do Brasil de 1946',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/constituicao46.htm',
    category: 'Constituição Revogada'
  },
  {
    aliases: ['cf 37', 'cf 1937', 'constituicao 1937', 'constituicao de 1937'],
    title: 'Constituição dos Estados Unidos do Brasil de 1937',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/constituicao37.htm',
    category: 'Constituição Revogada'
  },
  {
    aliases: ['cf 34', 'cf 1934', 'constituicao 1934', 'constituicao de 1934'],
    title: 'Constituição da República dos Estados Unidos do Brasil de 1934',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/constituicao34.htm',
    category: 'Constituição Revogada'
  },
  {
    aliases: ['cf 1891', 'constituicao 1891', 'constituicao de 1891'],
    title: 'Constituição da República dos Estados Unidos do Brasil de 1891',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/constituicao91.htm',
    category: 'Constituição Revogada'
  },
  {
    aliases: ['cf 1824', 'constituicao 1824', 'constituicao do imperio'],
    title: 'Constituição Política do Império do Brazil de 1824',
    url: 'https://portaldalegislacao.presidencia.gov.br/ccivil_03/constituicao/constituicao24.htm',
    category: 'Constituição Revogada'
  },

  // Códigos Vigentes (Siglas e Nomes Curtos)
  {
    aliases: ['cc', 'cc 2002', 'codigo civil'],
    title: 'Código Civil (Lei nº 10.406/2002)',
    type: 'lei', number: '10406', year: 2002,
    category: 'Código'
  },
  {
    aliases: ['cpc', 'cpc 2015', 'cpc 15', 'codigo de processo civil', 'processo civil'],
    title: 'Código de Processo Civil (Lei nº 13.105/2015)',
    type: 'lei', number: '13105', year: 2015,
    category: 'Código'
  },
  {
    aliases: ['cp', 'codigo penal'],
    title: 'Código Penal (Decreto-Lei nº 2.848/1940)',
    type: 'dl', number: '2848', year: 1940,
    category: 'Código'
  },
  {
    aliases: ['cpp', 'codigo de processo penal', 'processo penal'],
    title: 'Código de Processo Penal (Decreto-Lei nº 3.689/1941)',
    type: 'dl', number: '3689', year: 1941,
    category: 'Código'
  },
  {
    aliases: ['clt', 'consolidacao das leis do trabalho'],
    title: 'Consolidação das Leis do Trabalho - CLT (Decreto-Lei nº 5.452/1943)',
    type: 'dl', number: '5452', year: 1943,
    category: 'Código'
  },
  {
    aliases: ['cdc', 'codigo de defesa do consumidor'],
    title: 'Código de Defesa do Consumidor (Lei nº 8.078/1990)',
    type: 'lei', number: '8078', year: 1990,
    category: 'Código'
  },
  {
    aliases: ['ctn', 'codigo tributario nacional'],
    title: 'Código Tributário Nacional (Lei nº 5.172/1966)',
    type: 'lei', number: '5172', year: 1966,
    category: 'Código'
  },
  {
    aliases: ['ctb', 'codigo de transito brasileiro', 'codigo de transito'],
    title: 'Código de Trânsito Brasileiro (Lei nº 9.503/1997)',
    type: 'lei', number: '9503', year: 1997,
    category: 'Código'
  },
  {
    aliases: ['ce', 'codigo eleitoral'],
    title: 'Código Eleitoral (Lei nº 4.737/1965)',
    type: 'lei', number: '4737', year: 1965,
    category: 'Código'
  },
  {
    aliases: ['cpm', 'codigo penal militar'],
    title: 'Código Penal Militar (Decreto-Lei nº 1.001/1969)',
    type: 'dl', number: '1001', year: 1969,
    category: 'Código'
  },
  {
    aliases: ['cppm', 'codigo de processo penal militar'],
    title: 'Código de Processo Penal Militar (Decreto-Lei nº 1.002/1969)',
    type: 'dl', number: '1002', year: 1969,
    category: 'Código'
  },
  {
    aliases: ['cba', 'codigo brasileiro de aeronautica'],
    title: 'Código Brasileiro de Aeronáutica (Lei nº 7.565/1986)',
    type: 'lei', number: '7565', year: 1986,
    category: 'Código'
  },
  {
    aliases: ['codigo florestal'],
    title: 'Código Florestal (Lei nº 12.651/2012)',
    type: 'lei', number: '12651', year: 2012,
    category: 'Código'
  },
  {
    aliases: ['codigo comercial'],
    title: 'Código Comercial (Lei nº 556/1850)',
    type: 'lei', number: '556', year: 1850,
    category: 'Código'
  },

  // Códigos Revogados
  {
    aliases: ['cc 1916', 'cc 16', 'codigo civil de 1916', 'codigo civil 1916', 'cpc 1916'],
    title: 'Código Civil de 1916 (Lei nº 3.071/1916 - Revogado)',
    type: 'lei', number: '3071', year: 1916,
    category: 'Código Revogado'
  },
  {
    aliases: ['cpc 73', 'cpc 1973', 'codigo de processo civil de 1973', 'codigo de processo civil 1973'],
    title: 'Código de Processo Civil de 1973 (Lei nº 5.869/1973 - Revogado)',
    type: 'lei', number: '5869', year: 1973,
    category: 'Código Revogado'
  },
  {
    aliases: ['cpc 39', 'cpc 1939', 'codigo de processo civil de 1939', 'codigo de processo civil 1939'],
    title: 'Código de Processo Civil de 1939 (Decreto-Lei nº 1.608/1939 - Revogado)',
    type: 'dl', number: '1608', year: 1939,
    category: 'Código Revogado'
  },

  // Estatutos Principais
  {
    aliases: ['eca', 'estatuto da crianca e do adolescente'],
    title: 'Estatuto da Criança e do Adolescente - ECA (Lei nº 8.069/1990)',
    type: 'lei', number: '8069', year: 1990,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto do idoso', 'estatuto da pessoa idosa'],
    title: 'Estatuto da Pessoa Idosa (Lei nº 10.741/2003)',
    type: 'lei', number: '10741', year: 2003,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto da cidade'],
    title: 'Estatuto da Cidade (Lei nº 10.257/2001)',
    type: 'lei', number: '10257', year: 2001,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto do desarmamento'],
    title: 'Estatuto do Desarmamento (Lei nº 10.826/2003)',
    type: 'lei', number: '10826', year: 2003,
    category: 'Estatuto'
  },
  {
    aliases: ['eoab', 'estatuto da oab', 'estatuto da advocacia'],
    title: 'Estatuto da Advocacia e da OAB (Lei nº 8.906/1994)',
    type: 'lei', number: '8906', year: 1994,
    category: 'Estatuto'
  },
  {
    aliases: ['lbi', 'estatuto da pessoa com deficiencia', 'lei brasileira de inclusao'],
    title: 'Lei Brasileira de Inclusão / Estatuto da Pessoa com Deficiência (Lei nº 13.146/2015)',
    type: 'lei', number: '13146', year: 2015,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto da igualdade racial'],
    title: 'Estatuto da Igualdade Racial (Lei nº 12.288/2010)',
    type: 'lei', number: '12288', year: 2010,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto da juventude'],
    title: 'Estatuto da Juventude (Lei nº 12.852/2013)',
    type: 'lei', number: '12852', year: 2013,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto da terra'],
    title: 'Estatuto da Terra (Lei nº 4.504/1964)',
    type: 'lei', number: '4504', year: 1964,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto dos militares'],
    title: 'Estatuto dos Militares (Lei nº 6.880/1980)',
    type: 'lei', number: '6880', year: 1980,
    category: 'Estatuto'
  },
  {
    aliases: ['estatuto do servidor', 'regime juridico unico', 'rju', 'lei 8112'],
    title: 'Regime Jurídico dos Servidores Públicos Civis da União (Lei nº 8.112/1990)',
    type: 'lei', number: '8112', year: 1990,
    category: 'Estatuto'
  },

  // Lista Completa de Leis por Apelido / Sigla
  {
    aliases: ['lei das desapropriacoes', 'desapropriacoes'],
    title: 'Lei das Desapropriações (Decreto-Lei nº 3.365/1941)',
    type: 'dl', number: '3365', year: 1941,
    category: 'Apelido'
  },
  {
    aliases: ['lei dos condominios', 'lei das incorporacoes', 'lei dos condominios e incorporacoes imobiliarias'],
    title: 'Lei dos Condomínios e Incorporações Imobiliárias (Lei nº 4.591/1964)',
    type: 'lei', number: '4591', year: 1964,
    category: 'Apelido'
  },
  {
    aliases: ['lrp', 'lei dos registros publicos', 'registros publicos'],
    title: 'Lei dos Registros Públicos (Lei nº 6.015/1973)',
    type: 'lei', number: '6015', year: 1973,
    category: 'Apelido'
  },
  {
    aliases: ['lef', 'lei de execucao fiscal', 'execucao fiscal'],
    title: 'Lei de Execução Fiscal (Lei nº 6.830/1980)',
    type: 'lei', number: '6830', year: 1980,
    category: 'Apelido'
  },
  {
    aliases: ['lep', 'lei de execucao penal', 'execucao penal'],
    title: 'Lei de Execução Penal (Lei nº 7.210/1984)',
    type: 'lei', number: '7210', year: 1984,
    category: 'Apelido'
  },
  {
    aliases: ['lacp', 'lei da acao civil publica', 'acao civil publica'],
    title: 'Lei da Ação Civil Pública (Lei nº 7.347/1985)',
    type: 'lei', number: '7347', year: 1985,
    category: 'Apelido'
  },
  {
    aliases: ['lei da prisao temporaria', 'prisao temporaria'],
    title: 'Lei da Prisão Temporária (Lei nº 7.960/1989)',
    type: 'lei', number: '7960', year: 1989,
    category: 'Apelido'
  },
  {
    aliases: ['lei do bem de familia', 'bem de familia'],
    title: 'Lei do Bem de Família (Lei nº 8.009/1990)',
    type: 'lei', number: '8009', year: 1990,
    category: 'Apelido'
  },
  {
    aliases: ['lei dos crimes hediondos', 'crimes hediondos'],
    title: 'Lei dos Crimes Hediondos (Lei nº 8.072/1990)',
    type: 'lei', number: '8072', year: 1990,
    category: 'Apelido'
  },
  {
    aliases: ['lei dos crimes contra a ordem tributaria', 'crimes contra a ordem tributaria'],
    title: 'Lei dos Crimes contra a Ordem Tributária (Lei nº 8.137/1990)',
    type: 'lei', number: '8137', year: 1990,
    category: 'Apelido'
  },
  {
    aliases: ['lei de custeio da seguridade social', 'lei de custeio'],
    title: 'Lei de Custeio da Seguridade Social (Lei nº 8.212/1991)',
    type: 'lei', number: '8212', year: 1991,
    category: 'Apelido'
  },
  {
    aliases: ['lei de beneficios da previdencia social', 'lei de beneficios'],
    title: 'Lei de Benefícios da Previdência Social (Lei nº 8.213/1991)',
    type: 'lei', number: '8213', year: 1991,
    category: 'Apelido'
  },
  {
    aliases: ['lei do inquilinato', 'inquilinato', 'lei de locacoes'],
    title: 'Lei do Inquilinato (Lei nº 8.245/1991)',
    type: 'lei', number: '8245', year: 1991,
    category: 'Apelido'
  },
  {
    aliases: ['lei da medida cautelar fiscal', 'medida cautelar fiscal'],
    title: 'Lei da Medida Cautelar Fiscal (Lei nº 8.397/1992)',
    type: 'lei', number: '8397', year: 1992,
    category: 'Apelido'
  },
  {
    aliases: ['lia', 'lei de improbidade administrativa', 'improbidade administrativa'],
    title: 'Lei de Improbidade Administrativa (Lei nº 8.429/1992)',
    type: 'lei', number: '8429', year: 1992,
    category: 'Apelido'
  },
  {
    aliases: ['lei de licitacoes antiga', 'antiga lei de licitacoes'],
    title: 'Lei de Licitações de 1993 (Lei nº 8.666/1993)',
    type: 'lei', number: '8666', year: 1993,
    category: 'Apelido'
  },
  {
    aliases: ['lei das concessoes', 'lei das concessoes e permissoes de servicos publicos'],
    title: 'Lei das Concessões e Permissões de Serviços Públicos (Lei nº 8.987/1995)',
    type: 'lei', number: '8987', year: 1995,
    category: 'Apelido'
  },
  {
    aliases: ['lei de alteracoes da legislacao tributaria federal'],
    title: 'Lei de Alterações da Legislação Tributária Federal (Lei nº 8.981/1995)',
    type: 'lei', number: '8981', year: 1995,
    category: 'Apelido'
  },
  {
    aliases: ['jec', 'jecrim', 'lei dos juizados especiais', 'juizados especiais', 'juizados especiais civeis e criminais'],
    title: 'Lei dos Juizados Especiais Cíveis e Criminais (Lei nº 9.099/1995)',
    type: 'lei', number: '9099', year: 1995,
    category: 'Apelido'
  },
  {
    aliases: ['lei do imposto de renda da pessoa fisica', 'irpf'],
    title: 'Lei do Imposto de Renda da Pessoa Física (Lei nº 9.250/1995)',
    type: 'lei', number: '9250', year: 1995,
    category: 'Apelido'
  },
  {
    aliases: ['lei das interceptacoes telefonicas', 'interceptacao telefonica'],
    title: 'Lei das Interceptações Telefônicas (Lei nº 9.296/1996)',
    type: 'lei', number: '9296', year: 1996,
    category: 'Apelido'
  },
  {
    aliases: ['lei kandir'],
    title: 'Lei Kandir - ICMS (Lei Complementar nº 87/1996)',
    type: 'lc', number: '87', year: 1996,
    category: 'Apelido'
  },
  {
    aliases: ['lei da arbitragem', 'arbitragem'],
    title: 'Lei da Arbitragem (Lei nº 9.307/1996)',
    type: 'lei', number: '9307', year: 1996,
    category: 'Apelido'
  },
  {
    aliases: ['ldb', 'lei de diretrizes e bases da educacao'],
    title: 'Lei de Diretrizes e Bases da Educação Nacional - LDB (Lei nº 9.394/1996)',
    type: 'lei', number: '9394', year: 1996,
    category: 'Apelido'
  },
  {
    aliases: ['lei de legislacao tributaria federal e procedimentos fiscais'],
    title: 'Lei de Legislação Tributária Federal e Procedimentos Fiscais (Lei nº 9.430/1996)',
    type: 'lei', number: '9430', year: 1996,
    category: 'Apelido'
  },
  {
    aliases: ['lei dos crimes de tortura', 'lei de tortura'],
    title: 'Lei dos Crimes de Tortura (Lei nº 9.455/1997)',
    type: 'lei', number: '9455', year: 1997,
    category: 'Apelido'
  },
  {
    aliases: ['lei da alienacao fiduciaria', 'alienacao fiduciaria', 'lei da alienacao fiduciaria de imoveis'],
    title: 'Lei da Alienação Fiduciária de Imóveis e do SFI (Lei nº 9.514/1997)',
    type: 'lei', number: '9514', year: 1997,
    category: 'Apelido'
  },
  {
    aliases: ['lei dos crimes ambientais', 'crimes ambientais'],
    title: 'Lei dos Crimes Ambientais (Lei nº 9.605/1998)',
    type: 'lei', number: '9605', year: 1998,
    category: 'Apelido'
  },
  {
    aliases: ['lei de lavagem de dinheiro', 'lavagem de dinheiro'],
    title: 'Lei de Lavagem de Dinheiro (Lei nº 9.613/1998)',
    type: 'lei', number: '9613', year: 1998,
    category: 'Apelido'
  },
  {
    aliases: ['lei de regras do pis e da cofins'],
    title: 'Lei de Regras do PIS e da COFINS (Lei nº 9.718/1998)',
    type: 'lei', number: '9718', year: 1998,
    category: 'Apelido'
  },
  {
    aliases: ['lpaf', 'lei do processo administrativo federal', 'processo administrativo federal', 'lei do processo administrativo'],
    title: 'Lei do Processo Administrativo Federal (Lei nº 9.784/1999)',
    type: 'lei', number: '9784', year: 1999,
    category: 'Apelido'
  },
  {
    aliases: ['lrf', 'lei de responsabilidade fiscal'],
    title: 'Lei de Responsabilidade Fiscal (Lei Complementar nº 101/2000)',
    type: 'lc', number: '101', year: 2000,
    category: 'Apelido'
  },
  {
    aliases: ['jef', 'lei dos juizados especiais federais', 'juizados especiais federais'],
    title: 'Lei dos Juizados Especiais Federais (Lei nº 10.259/2001)',
    type: 'lei', number: '10259', year: 2001,
    category: 'Apelido'
  },
  {
    aliases: ['lindb', 'lei de introducao as normas do direito brasileiro', 'licc'],
    title: 'Lei de Introdução às Normas do Direito Brasileiro - LINDB (Decreto-Lei nº 4.657/1942)',
    type: 'dl', number: '4657', year: 1942,
    category: 'Apelido'
  },
  {
    aliases: ['lei do pis pasep nao cumulativo', 'pis nao cumulativo'],
    title: 'Lei do PIS/PASEP Não Cumulativo (Lei nº 10.637/2002)',
    type: 'lei', number: '10637', year: 2002,
    category: 'Apelido'
  },
  {
    aliases: ['lei da cofins nao cumulativa', 'cofins nao cumulativa'],
    title: 'Lei da COFINS Não Cumulativa (Lei nº 10.833/2003)',
    type: 'lei', number: '10833', year: 2003,
    category: 'Apelido'
  },
  {
    aliases: ['lei das ppp', 'lei das parcerias publico privadas', 'parcerias publico privadas'],
    title: 'Lei das Parcerias Público-Privadas (Lei nº 11.079/2004)',
    type: 'lei', number: '11079', year: 2004,
    category: 'Apelido'
  },
  {
    aliases: ['lei de falencias', 'lei de recuperacao judicial', 'lei de recuperacao judicial e falencias'],
    title: 'Lei de Recuperação Judicial e Falências (Lei nº 11.101/2005)',
    type: 'lei', number: '11101', year: 2005,
    category: 'Apelido'
  },
  {
    aliases: ['lei dos consorcios publicos', 'consorcios publicos'],
    title: 'Lei dos Consórcios Públicos (Lei nº 11.107/2005)',
    type: 'lei', number: '11107', year: 2005,
    category: 'Apelido'
  },
  {
    aliases: ['lmp', 'maria da penha', 'lei maria da penha'],
    title: 'Lei Maria da Penha (Lei nº 11.340/2006)',
    type: 'lei', number: '11340', year: 2006,
    category: 'Apelido'
  },
  {
    aliases: ['lei de drogas', 'lei antidrogas'],
    title: 'Lei de Drogas (Lei nº 11.343/2006)',
    type: 'lei', number: '11343', year: 2006,
    category: 'Apelido'
  },
  {
    aliases: ['lms', 'lei do mandado de seguranca', 'mandado de seguranca'],
    title: 'Lei do Mandado de Segurança (Lei nº 12.016/2009)',
    type: 'lei', number: '12016', year: 2009,
    category: 'Apelido'
  },
  {
    aliases: ['jefaz', 'lei dos juizados especiais da fazenda publica', 'juizados especiais da fazenda publica'],
    title: 'Lei dos Juizados Especiais da Fazenda Pública (Lei nº 12.153/2009)',
    type: 'lei', number: '12153', year: 2009,
    category: 'Apelido'
  },
  {
    aliases: ['lai', 'lei de acesso a informacao', 'acesso a informacao'],
    title: 'Lei de Acesso à Informação - LAI (Lei nº 12.527/2011)',
    type: 'lei', number: '12527', year: 2011,
    category: 'Apelido'
  },
  {
    aliases: ['lei anticorrupcao', 'anticorrupcao'],
    title: 'Lei Anticorrupção (Lei nº 12.846/2013)',
    type: 'lei', number: '12846', year: 2013,
    category: 'Apelido'
  },
  {
    aliases: ['lei das organizacoes criminosas', 'organizacoes criminosas', 'orcrim'],
    title: 'Lei das Organizações Criminosas (Lei nº 12.850/2013)',
    type: 'lei', number: '12850', year: 2013,
    category: 'Apelido'
  },
  {
    aliases: ['mci', 'marco civil da internet', 'marco civil'],
    title: 'Marco Civil da Internet (Lei nº 12.965/2014)',
    type: 'lei', number: '12965', year: 2014,
    category: 'Apelido'
  },
  {
    aliases: ['mrosc', 'marco regulatoria das organizacoes da sociedade civil', 'marco regulatorio das organizacoes da sociedade civil'],
    title: 'Marco Regulatório das Organizações da Sociedade Civil - MROSC (Lei nº 13.019/2014)',
    type: 'lei', number: '13019', year: 2014,
    category: 'Apelido'
  },
  {
    aliases: ['lei da mediacao', 'mediacao'],
    title: 'Lei da Mediação (Lei nº 13.140/2015)',
    type: 'lei', number: '13140', year: 2015,
    category: 'Apelido'
  },
  {
    aliases: ['lei das estatais', 'lei das empresas estatais'],
    title: 'Lei das Empresas Estatais (Lei nº 13.303/2016)',
    type: 'lei', number: '13303', year: 2016,
    category: 'Apelido'
  },
  {
    aliases: ['lei de defesa dos direitos dos usuarios dos servicos publicos', 'codigo de defesa do usuario do servico publico'],
    title: 'Lei de Defesa dos Direitos dos Usuários dos Serviços Públicos (Lei nº 13.460/2017)',
    type: 'lei', number: '13460', year: 2017,
    category: 'Apelido'
  },
  {
    aliases: ['lgpd', 'lei geral de protecao de dados', 'protecao de dados'],
    title: 'Lei Geral de Proteção de Dados Pessoais - LGPD (Lei nº 13.709/2018)',
    type: 'lei', number: '13709', year: 2018,
    category: 'Apelido'
  },
  {
    aliases: ['lei de abuso de autoridade', 'abuso de autoridade'],
    title: 'Lei de Abuso de Autoridade (Lei nº 13.869/2019)',
    type: 'lei', number: '13869', year: 2019,
    category: 'Apelido'
  },
  {
    aliases: ['lei da transacao tributaria', 'transacao tributaria'],
    title: 'Lei da Transação Tributária (Lei nº 13.988/2020)',
    type: 'lei', number: '13988', year: 2020,
    category: 'Apelido'
  },
  {
    aliases: ['lei de licitacoes', 'nova lei de licitacoes', 'lei de licitacoes e contratos', 'lei de licitacoes e contratos administrativos'],
    title: 'Lei de Licitações e Contratos Administrativos (Lei nº 14.133/2021)',
    type: 'lei', number: '14133', year: 2021,
    category: 'Apelido'
  }
];

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

/**
 * Converte ano de 2 ou 4 dígitos em ano completo de 4 dígitos.
 * "99" -> 1999; "02" -> 2002; "26" -> 2026; "30" -> 1930.
 */
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

/**
 * Normaliza o número do ato:
 * - Remove pontos de milhar e espaços internos ("8.2 45" -> "8245")
 * - Uniformiza sufixo alfabético ("4.950A" e "4.950-A" -> "4950-A")
 * - Para MP, separa número base e reedição ("2.200-2" -> base "2200", edition 2)
 */
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

  if (/^(?:art\.?|artigo|vide|ver|revogad[oa]|alterad[oa])\b/i.test(anchor.text)) {
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

  const rawNumPart = isMP
    ? `${numMatch[1]}${numMatch[2] ? '-' + numMatch[2] : ''}`
    : `${numMatch[1]}${numMatch[2] ? '-' + numMatch[2] : ''}`;

  const normNum = normalizeActNumber(rawNumPart, isMP);
  if (!normNum) return null;

  const rest = withoutPrefix.slice(numMatch[0].length);
  let year = null;

  // 1) Data numérica dd.mm.aaaa ou dd.mm.aa (tolerando espaços internos)
  const numericDateMatch = rest.match(/\b\d{1,2}\s*[./-]\s*\d{1,2}\s*[./-]\s*(\d\s*\d(?:\s*\d\s*\d)?)\b/);
  if (numericDateMatch) {
    year = expandYear(numericDateMatch[1]);
  }

  // 2) Data por extenso: "de 10 de novembro de 1999", "de 1º de março de 2001"
  if (year == null) {
    const extDateMatch = rest.match(/\bde\s+\d{1,2}[º°o]?\s+de\s+[a-zçãõéíóúâêô]+\s+de\s+(\d\s*\d\s*\d\s*\d)\b/i);
    if (extDateMatch) {
      year = expandYear(extDateMatch[1]);
    }
  }

  // 3) Barra ou parênteses com ano: "/2023" ou "(1999)"
  if (year == null) {
    const slashYearMatch = rest.match(/(?:\/|\()\s*(18\d{2}|19\d{2}|20\d{2}|\d{2})\s*\)?/);
    if (slashYearMatch) {
      year = expandYear(slashYearMatch[1]);
    }
  }

  // 4) Fallback: ano de 4 dígitos explícito na URL
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

  let detectedType = selectedType !== 'auto' ? selectedType : null;
  let working = sanitized;

  const typePatterns = [
    { type: 'lc', regex: /^(?:lei\s+complementar|l\.?\s*c\.?p?\.?)\s*(?:n[º°o\.]*\s*)?/i },
    { type: 'ld', regex: /^(?:lei\s+delegada|l\.?\s*d\.?)\s*(?:n[º°o\.]*\s*)?/i },
    { type: 'dl', regex: /^(?:decreto[-\s]*lei|dec\.?[-\s]*lei|d\.?\s*l\.?)\s*(?:n[º°o\.]*\s*)?/i },
    { type: 'ec', regex: /^(?:emenda\s+constitucional|e\.?\s*c\.?)\s*(?:n[º°o\.]*\s*)?/i },
    { type: 'mp', regex: /^(?:medida\s+provis[oó]ria|m\.?\s*p\.?v?\.?)\s*(?:n[º°o\.]*\s*)?/i },
    { type: 'decreto', regex: /^(?:decreto|dec\.?)\s*(?:n[º°o\.]*\s*)?/i },
    { type: 'lei', regex: /^(?:lei\s+ordin[aá]ria|lei)\s*(?:n[º°o\.]*\s*)?/i }
  ];

  for (const item of typePatterns) {
    if (item.regex.test(working)) {
      if (!detectedType) detectedType = item.type;
      working = working.replace(item.regex, '').trim();
      break;
    }
  }

  // 1) Citação formal completa com data por extenso ou numérica
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

  // 2) Formatos compactos com ano
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

  // 3) Número sem ano ou formato "9099-95" vs "2.200-2"
  const numOnlyRegex = /^(\d[\d.\s]*\d|\d)(?:\s*-?\s*([A-Za-z]|\d{1,2}))?$/i;
  const singleNumMatch = working.match(numOnlyRegex);
  if (singleNumMatch) {
    const part1 = singleNumMatch[1];
    const part2 = singleNumMatch[2] || '';

    // Se o tipo não for MP e part2 tiver exatamente 2 dígitos (ex.: 9099-95), interpreta como número/ano
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

    // Se part2 for numérico de 1 dígito (ex.: "2.200-2") ou tipo já for MP, trata como Medida Provisória
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

  // 4) Busca por nome / sigla / apelido
  return {
    kind: 'name',
    query: sanitized,
    normalizedQuery: normalizeTextForSearch(sanitized),
    original
  };
}

export function checkSelectionCandidate(rawInput) {
  const text = String(rawInput || '').trim();
  if (!text || text.length < 2 || text.length > 140 || /[\r\n]/.test(text)) {
    return { valid: false };
  }

  const parsed = parseUserQuery(text, 'auto');

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
    const qNorm = parsed.normalizedQuery;
    if (!qNorm || qNorm.length < 2) return { valid: false };

    if (qNorm === 'lei' || qNorm === 'decreto' || qNorm === 'codigo' || qNorm === 'estatuto') {
      return { valid: false };
    }

    for (const norm of KNOWN_NORMS) {
      const exactAlias = norm.aliases.some((al) => normalizeTextForSearch(al) === qNorm);
      const exactTitle = normalizeTextForSearch(norm.title) === qNorm;
      if (exactAlias || exactTitle) {
        const shortTitle = norm.title.split('(')[0].trim();
        return {
          valid: true,
          label: `Abrir ${shortTitle}`
        };
      }
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

    for (const page of oldPages) {
      const acts = await parseListingPage(page.url, 'decreto', page);
      for (const a of acts) {
        if (matchesActNumber(a, numberNorm, false)) {
          matches.push({ ...a, periodLabel: page.label });
        }
      }
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
// Busca por Nome / Sigla / Códigos / Estatutos / Apelidos
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
        catalog.push({
          title: cleanTitle,
          normalizedTitle: normalizeTextForSearch(cleanTitle),
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

function similarityScore(queryNorm, targetNorm) {
  if (!queryNorm || !targetNorm) return 0;
  if (queryNorm === targetNorm) return 1.0;

  const qTokens = queryNorm.split(/\s+/).filter((t) => t.length > 1);
  const tTokens = targetNorm.split(/\s+/).filter((t) => t.length > 1);
  if (qTokens.length === 0 || tTokens.length === 0) return 0;

  const allIncluded = qTokens.every((qt) => tTokens.some((tt) => tt === qt || tt.startsWith(qt)));
  if (allIncluded) {
    const ratio = qTokens.length / tTokens.length;
    return 0.72 + (0.25 * ratio);
  }

  const intersection = qTokens.filter((qt) => tTokens.includes(qt)).length;
  const union = new Set([...qTokens, ...tTokens]).size;
  return intersection / union;
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

async function resolveByName(parsedQuery) {
  const qNorm = parsedQuery.normalizedQuery;
  const dynamicCatalog = await loadDynamicCatalog();
  const codigosFallback = new URL(INDEX_PAGES.codigos, BASE_URL).href;

  if (qNorm === 'codigo' || qNorm === 'codigos') {
    const allCodes = [
      ...KNOWN_NORMS.filter((n) => n.category.startsWith('Código')),
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

  if (qNorm === 'estatuto' || qNorm === 'estatutos') {
    const allStatutes = [
      ...KNOWN_NORMS.filter((n) => n.category.startsWith('Estatuto')),
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

  for (const norm of KNOWN_NORMS) {
    const exactAlias = norm.aliases.some((al) => normalizeTextForSearch(al) === qNorm);
    const exactTitle = normalizeTextForSearch(norm.title) === qNorm;
    if (exactAlias || exactTitle) {
      const resolved = await resolveCatalogEntry(norm);
      if (resolved) {
        return { status: 'found', result: resolved, fallbackUrl: codigosFallback };
      }
    }
  }

  const exactDynamic = dynamicCatalog.find((item) => item.normalizedTitle === qNorm);
  if (exactDynamic) {
    return {
      status: 'found',
      result: { title: exactDynamic.title, url: exactDynamic.url, category: exactDynamic.category },
      fallbackUrl: codigosFallback
    };
  }

  const scored = [];

  for (const norm of KNOWN_NORMS) {
    let bestScore = similarityScore(qNorm, normalizeTextForSearch(norm.title));
    for (const al of norm.aliases) {
      const s = similarityScore(qNorm, normalizeTextForSearch(al));
      if (s > bestScore) bestScore = s;
    }
    if (bestScore >= 0.45) {
      scored.push({ score: bestScore, item: norm });
    }
  }

  for (const dyn of dynamicCatalog) {
    const s = similarityScore(qNorm, dyn.normalizedTitle);
    if (s >= 0.45) {
      scored.push({ score: s, item: dyn });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const topCandidates = [];
  const seenTitles = new Set();
  for (const entry of scored) {
    const key = normalizeTextForSearch(entry.item.title);
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    topCandidates.push(entry);
    if (topCandidates.length >= 10) break;
  }

  if (topCandidates.length === 0) {
    return {
      status: 'not_found',
      message: `Nenhuma norma encontrada para "${parsedQuery.original}".`,
      fallbackUrl: codigosFallback
    };
  }

  if (topCandidates.length === 1 && topCandidates[0].score >= 0.72) {
    const resolved = await resolveCatalogEntry(topCandidates[0].item);
    if (resolved) {
      return {
        status: 'confirm',
        suggestion: resolved,
        fallbackUrl: codigosFallback
      };
    }
  }

  const resolvedList = [];
  for (const c of topCandidates) {
    if (c.item.url) {
      resolvedList.push({
        title: c.item.title,
        url: c.item.url,
        category: c.item.category
      });
    } else {
      resolvedList.push({
        title: c.item.title,
        catalogEntry: c.item,
        category: c.item.category
      });
    }
  }

  if (resolvedList.length === 1) {
    return {
      status: 'confirm',
      suggestion: resolvedList[0],
      fallbackUrl: codigosFallback
    };
  }

  return {
    status: 'multiple',
    message: `Encontramos ${resolvedList.length} normas relacionadas a "${parsedQuery.original}":`,
    results: resolvedList,
    fallbackUrl: codigosFallback
  };
}

function deduplicateItems(items) {
  const out = [];
  const seen = new Set();
  for (const item of items) {
    const key = normalizeTextForSearch(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item.url ? { title: item.title, url: item.url, category: item.category } : { title: item.title, catalogEntry: item, category: item.category });
  }
  return out;
}

// ============================================================================
// Ponto de Entrada Principal
// ============================================================================

export async function resolveLegislation(rawInput, selectedType = 'auto') {
  const parsed = parseUserQuery(rawInput, selectedType);

  if (parsed.kind === 'empty') {
    return {
      status: 'error',
      message: 'Digite o número, sigla ou nome de uma norma.',
      fallbackUrl: BASE_URL
    };
  }

  try {
    if (parsed.kind === 'name') {
      return await resolveByName(parsed);
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
  if (item.url) return item.url;
  if (item.catalogEntry) {
    const resolved = await resolveCatalogEntry(item.catalogEntry);
    return resolved?.url || null;
  }
  return null;
}