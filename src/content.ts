export { camisas } from './camisas.js';

// Todo o texto do site fica aqui. Uma fonte unica, sem CMS.
// Trocar copy = editar este arquivo e redeployar.

export const empresa = {
  nome: 'Afirma E-vias',
  razaoSocial: 'Afirma E-vias Engenharia Viária Ltda.',
  cnpj: '05.205.684/0001-81',
  assinatura: 'engenharia viária',
  telefoneCelular: '(41) 98713-7780',
  telefoneFixo: '(41) 3123-8550',
  whatsapp: '5541987137780',
  email: 'comercial@afirmaevias.com.br',
  emailEncarregado: 'privacidade@afirmaevias.com.br',
  linkedin: 'https://www.linkedin.com/company/afirmaeviasengenhariaviaria/',
  instagram: 'https://www.instagram.com/afirmaevias/',
  enderecos: [
    {
      cidade: 'Curitiba',
      uf: 'PR',
      linha1: 'R. Baltazar Carrasco dos Reis, 2345',
      linha2: 'Rebouças — Curitiba/PR, 80230-070',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=R.+Baltazar+Carrasco+dos+Reis%2C+2345%2C+Rebou%C3%A7as%2C+Curitiba%2FPR%2C+80230-070'
    },
    {
      cidade: 'Marília',
      uf: 'SP',
      linha1: 'R. Benedito Alves Delfino, 1527',
      linha2: 'Distrito Industrial — Marília/SP, 17512-043',
      mapsUrl:
        'https://www.google.com/maps/search/?api=1&query=R.+Benedito+Alves+Delfino%2C+1527%2C+Distrito+Industrial%2C+Mar%C3%ADlia%2FSP%2C+17512-043'
    }
  ]
};

export const navegacao = [
  { rotulo: 'A empresa', href: '/afirma-evias' },
  { rotulo: 'Serviços', href: '/servicos' },
  { rotulo: 'Aplicativo', href: '/aplicativo' },
  { rotulo: 'Acreditação', href: '/acreditacao-e-certificacao' },
  { rotulo: 'Integridade', href: '/programa-de-integridade' },
  { rotulo: 'Contato', href: '/contato' }
];

export const indicadores = [
  { valor: '50.000', unidade: 'km', rotulo: 'de obras fiscalizadas' },
  { valor: '10.000', unidade: 'km', rotulo: 'em projetos viários' },
  { valor: '100.000', unidade: 'km', rotulo: 'de levantamentos' },
  { valor: '700', unidade: 'contratos', rotulo: 'concluídos' }
];

export const home = {
  eyebrow: 'Engenharia viária desde 2002',
  titulo: 'Abrindo caminhos,<br>construindo o futuro.',
  chamada:
    'Mais de 20 anos de tradição e inovação em estudos, projetos, supervisão e gerenciamento de obras rodoviárias e urbanas.',
  apoio:
    'Somos movidos pela excelência técnica, inovação e um compromisso inabalável com a qualidade para atender órgãos públicos e empresas privadas.',
  servicosResumo: [
    {
      titulo: 'Supervisão e controle tecnológico',
      texto: 'Fiscalização de obra com laboratório e app próprios, em tempo real.'
    },
    {
      titulo: 'Projetos em BIM',
      texto: 'Rodovias e vias urbanas modeladas do LOD 100 ao LOD 400.'
    },
    {
      titulo: 'Ensaios de laboratório',
      texto: 'Laboratório central de alta performance e unidades móveis em campo.'
    },
    {
      titulo: 'Levantamentos e cadastro',
      texto: 'Fotogrametria georreferenciada, perfilômetro a laser e SIG.'
    }
  ]
};

export const sobre = {
  eyebrow: 'A empresa',
  titulo: 'Duas trajetórias,<br>uma engenharia só.',
  linhaDoTempo: [
    {
      ano: '2002',
      titulo: 'Nasce a Afirma Engenharia',
      texto:
        'Fundada pelo Prof. Mario Henrique Furtado Andrade, marcou presença em grandes projetos de infraestrutura viária por mais de duas décadas. Com sedes em Curitiba, São Paulo e Minas Gerais, construiu reputação sólida em estudos, projetos, supervisão e controle tecnológico de obras rodoviárias, urbanas, aeroportuárias e industriais.'
    },
    {
      ano: '2016',
      titulo: 'Nasce a E-vias',
      texto:
        'Criada em Curitiba/PR, conquistou reconhecimento pela excelência nos ensaios laboratoriais e no controle de qualidade de materiais, com destaque para sua estrutura moderna e laboratórios móveis. Especializou-se em pavimentação asfáltica e tecnologia aplicada à engenharia viária.'
    },
    {
      ano: '2024',
      titulo: 'A fusão',
      texto:
        'Em dezembro de 2024 as duas trajetórias se consolidam na Afirma E-vias, unificando forças, equipes e propósitos. A integração ampliou a capacidade operacional e técnica: rede de laboratórios móveis, laboratório central de alta performance e presença em diferentes estados.'
    },
    {
      ano: 'Hoje',
      titulo: 'Para onde estamos indo',
      texto:
        'A fusão não é um ponto de chegada, mas um novo começo. Seguimos investindo em tecnologia, capacitação contínua e expansão estratégica para desenvolver soluções inteligentes e sustentáveis que contribuam para uma infraestrutura mais segura, eficiente e conectada.'
    }
  ]
};

export const servicos = [
  {
    id: 'supervisao',
    titulo: 'Supervisão e controle tecnológico de obras',
    resumo:
      'Garantimos o cumprimento de normas e a qualidade das obras por meio de supervisão e gestão especializadas. Nossa infraestrutura combina laboratórios de alta precisão e o aplicativo exclusivo Afirma E-vias para controle em tempo real.',
    itens: [
      'Planejamento, programação e controle da execução dos serviços',
      'Controle tecnológico e geométrico e realização de ensaios geotécnicos e de materiais',
      'Assistência técnica e auditoria de obras',
      'Elaboração de planos e sistemas de controle de qualidade',
      'Acompanhamento em tempo real das atividades e resultados',
      'Diagnóstico ágil de não conformidades com emissão de alertas',
      'Dashboards analíticos para visão organizada do banco de dados'
    ]
  },
  {
    id: 'bim',
    titulo: 'Soluções em infraestrutura com tecnologia BIM',
    resumo:
      'Projetos de infraestrutura para rodovias e vias urbanas com metodologia BIM, garantindo precisão, interoperabilidade e controle do ciclo de vida do empreendimento. Usamos Revit, Civil 3D, Navisworks e InfraWorks para modelagem avançada, detecção de interferências e otimização da execução, com detalhamento do LOD 100 ao LOD 400.',
    grupos: [
      {
        titulo: 'Estudos técnicos e viabilidade',
        itens: [
          'Estudo de viabilidade de concessões',
          'Estudos de viabilidade técnica, econômica e ambiental (EVTEA)',
          'Estudos preliminares: topográficos, geológicos, geotécnicos, tráfego, traçado, hidrológicos e ambientais'
        ]
      },
      {
        titulo: 'Projetos executivos',
        itens: [
          'Rodoviários, urbanos e aeroportuários',
          'Implantação, ampliação de capacidade e restauração de pavimentos flexíveis e rígidos'
        ]
      }
    ]
  },
  {
    id: 'consultoria',
    titulo: 'Consultoria técnica especializada',
    resumo:
      'Suporte técnico com foco em auditorias e revisão de projetos, assegurando excelência e mitigação de riscos.',
    itens: [
      'Controle de Qualidade de Projetos (CQP)',
      'Assistência Técnica de Obras (ATO)',
      'Laudos, pareceres e auditorias técnicas',
      'Revisão de especificações e projetos',
      'Avaliação técnica e econômica de alternativas de pavimentação'
    ]
  },
  {
    id: 'laboratorios',
    titulo: 'Laboratórios fixos e móveis',
    resumo:
      'Estruturas completas de controle de qualidade, dimensionadas para cada projeto — no canteiro, na usina ou acompanhando a frente de serviço.',
    grupos: [
      {
        titulo: 'Laboratórios fixos',
        itens: [
          'Estruturas completas para controle de qualidade em usinas de asfalto ou canteiros de obras',
          'Equipamentos dimensionados para as especificidades de cada projeto',
          'Equipe qualificada alinhada aos padrões mais rigorosos'
        ]
      },
      {
        titulo: 'Laboratórios móveis',
        itens: [
          'Pioneiros no desenvolvimento de unidades que acompanham as frentes de trabalho',
          'Análises imediatas no local de aplicação',
          'Decisões mais rápidas e assertivas, com redução de custos e prazos'
        ]
      }
    ]
  },
  {
    id: 'sondagens',
    titulo: 'Sondagens e investigações geotécnicas',
    resumo:
      'Estudos precisos de solo e subsuperfície para embasar decisões de engenharia com segurança.',
    itens: [
      'Sondagem a trado',
      'Sondagem a percussão',
      'Sondagens rotativas e mistas',
      'Poços de inspeção',
      'Prospecção de jazidas',
      'Ensaio de densidade in situ',
      'Ensaio de CBR in situ'
    ]
  },
  {
    id: 'ensaios',
    titulo: 'Ensaios de laboratório',
    resumo:
      'Ensaios de alta complexidade, da caracterização de materiais a projetos avançados de dosagem.',
    grupos: [
      {
        titulo: 'Escopo',
        itens: [
          'Solos e agregados: caracterização e dosagens de camadas granulares',
          'Ligantes asfálticos: investigação de emulsões e ligantes',
          'Misturas asfálticas: densidade, reciclagem e misturas MRAF',
          'Concreto: ensaios de resistência e dosagens',
          'Ensaios especiais: desempenho em misturas asfálticas e estabilizadas'
        ]
      },
      {
        titulo: 'Ensaios especiais',
        itens: [
          'Extração e recuperação de ligante pelo evaporador rotativo — Abson',
          'HWTD — Simulador de tráfego Hamburgo',
          'Módulo de resiliência de solos e misturas asfálticas',
          'Flow Number e Vida de Fadiga',
          'Atendimento ao método de dimensionamento MeDiNa',
          'Projetos de dosagem de camadas de base, sub-base granular',
          'Solo-cimento e Brita Graduada Tratada com Cimento (BGTC)'
        ]
      }
    ]
  },
  {
    id: 'levantamentos',
    titulo: 'Levantamentos de condição funcional, estrutural e segurança',
    resumo:
      'Avaliação do pavimento em serviço com instrumentação de alta resolução.',
    itens: [
      'Condições de superfície por fotogrametria georreferenciada de alta resolução',
      'Irregularidade longitudinal e ATR por perfilômetro a laser',
      'Condições de aderência e segurança (pêndulo britânico e mancha de areia)'
    ]
  },
  {
    id: 'cadastro',
    titulo: 'Cadastro e monitoramento de elementos viários',
    resumo:
      'Gestão detalhada de elementos viários com sistemas integrados para manutenção e controle.',
    itens: [
      'Cadastro georreferenciado e avaliação de OAE, drenagem e OAC, terraplenos, sinalização, faixa de domínio e passivos ambientais',
      'Criação e disponibilização de bancos de dados e relatórios',
      'Implantação de sistemas de informação geográfica e de gerência de pavimentos (SIG)',
      'Retrorrefletância horizontal e vertical de elementos de sinalização viária'
    ]
  }
];

export const aplicativo = {
  eyebrow: 'Aplicativo Afirma E-vias',
  titulo: 'Conectando campo<br>e escritório.',
  chamada:
    'Inovação é o pilar para transformar a forma como a engenharia viária é planejada, executada e monitorada. Nosso aplicativo integra profissionais de campo, backoffice e clientes com transparência e agilidade.',
  recursos: [
    {
      titulo: 'Acompanhamento em tempo real',
      texto: 'Visualize ensaios e atividades diretamente no local, com georreferenciamento.'
    },
    {
      titulo: 'Diagnóstico ágil',
      texto: 'Receba alertas de não conformidades e tome decisões rápidas.'
    },
    {
      titulo: 'Registro e análise automatizados',
      texto:
        'Cadastre laboratoristas, obras e parâmetros de dosagem de concreto asfáltico e MRAF, com cálculo instantâneo dos resultados.'
    },
    {
      titulo: 'Dashboards inteligentes',
      texto: 'Organize, analise e exporte dados em PDF e CSV, gerando relatórios precisos.'
    }
  ],
  fecho:
    'Com o app você tem controle total da obra, acessando informações essenciais de qualquer lugar.'
};

export const acreditacao = {
  eyebrow: 'Acreditação e certificação',
  titulo: 'Compromisso<br>com a excelência.',
  chamada:
    'Nossas certificações e acreditações comprovam a conformidade com os mais altos padrões técnicos e regulatórios, garantindo segurança, eficiência e confiabilidade em cada projeto.',
  iso9001: {
    titulo: 'ISO 9001',
    texto:
      'A ISO 9001 é a norma internacional que define os requisitos para um Sistema de Gestão da Qualidade eficiente. Ela garante que a empresa atenda às expectativas dos clientes e melhore continuamente seus processos internos. Nossa certificação reflete o compromisso com a excelência, a satisfação do cliente e a melhoria contínua.',
    link: '/documentos/certificado-iso-9001.pdf',
    linkRotulo: 'Certificado de registro (PDF)'
  },
  politicaQualidade:
    'A Afirma E-vias está comprometida em fornecer soluções de engenharia, controle tecnológico e ensaios laboratoriais com imparcialidade e competência técnica. Buscamos sempre a satisfação dos clientes, atendendo aos requisitos aplicáveis das partes interessadas por meio do cumprimento das normas ABNT NBR ISO/IEC 17025 e ABNT NBR ISO 9001, garantindo uma operação consistente.',
  politicaQualidadeNota:
    'Nota: a acreditação ISO/IEC 17025 encontra-se temporariamente suspensa em razão da mudança de endereço. O Sistema de Gestão da Qualidade segue integralmente aplicado. Veja o comunicado completo ao final desta página.',
  missao:
    'Desenvolver soluções inovadoras e integradas de engenharia viária, impulsionando a eficiência, a qualidade e os resultados dos nossos clientes.',
  visao:
    'Ser a referência em engenharia viária na América Latina, reconhecida pela excelência, inovação e compromisso com a qualidade.',
  valores: [
    { titulo: 'Ética e integridade', texto: 'Agir com transparência e responsabilidade em todas as relações.' },
    { titulo: 'Melhoria contínua', texto: 'Buscar constantemente a excelência em processos, produtos e serviços.' },
    { titulo: 'Compromisso com a qualidade', texto: 'Atuar com rigor técnico e excelência.' },
    { titulo: 'Inovação', texto: 'Estimular a criatividade e aplicar tecnologias que transformem o setor viário.' },
    { titulo: 'Valorização das pessoas', texto: 'Reconhecer, desenvolver e respeitar talentos internos e parceiros.' },
    { titulo: 'Sustentabilidade', texto: 'Atuar de forma consciente, respeitando o meio ambiente e as gerações futuras.' },
    { titulo: 'Comunicação clara', texto: 'Promover diálogo aberto e direcionamento para a eficácia nos objetivos.' }
  ],
  comunicado17025: {
    titulo: 'ISO/IEC 17025 — comunicado aos clientes e parceiros',
    paragrafos: [
      'A Afirma E-vias informa que está em processo de mudança para um novo endereço, visando a modernização de nossas instalações e a contínua melhoria do atendimento.',
      'Em conformidade com os requisitos da CGCRE (Inmetro) e da norma ABNT NBR ISO/IEC 17025, nossa acreditação encontra-se temporariamente suspensa em virtude da alteração de endereço físico, aguardando a avaliação técnica das novas instalações pelo órgão acreditador.'
    ],
    durante: [
      'Os relatórios de ensaio serão emitidos sem o símbolo da acreditação.',
      'Os serviços realizados não serão considerados acreditados até a formalização da nova extensão de endereço pela CGCRE.',
      'Mantemos integralmente o Sistema de Gestão da Qualidade, o rigor técnico e a competência da equipe, garantindo a confiabilidade dos resultados entregues.'
    ],
    fecho:
      'Esta é uma etapa normativa prevista e necessária para assegurar a integridade do processo de acreditação. Assim que a avaliação das novas instalações for concluída e a suspensão levantada, faremos um novo comunicado.'
  }
};

export const notaMarcas =
  'Revit, Civil 3D, Navisworks e InfraWorks são marcas da Autodesk, Inc. MeDiNa é método do DNIT/IPR. As demais marcas citadas pertencem aos respectivos titulares. A menção é descritiva e não indica parceria, patrocínio ou representação.';

export const integridade = {
  eyebrow: 'Programa de integridade',
  titulo: 'Ética e transparência<br>são a base de tudo.',
  chamada:
    'Nosso Programa de Integridade garante relações responsáveis e alinhadas às melhores práticas.',
  compliance: {
    titulo: 'Compliance',
    texto:
      'Nosso programa de Compliance garante que todas as práticas empresariais sigam os mais altos padrões éticos e as diretrizes da Lei Anticorrupção (Lei 12.846/2013). Com um Código de Ética e Conduta bem definido, alinhamos posturas e comportamentos a valores que reforçam nosso compromisso com clientes, fornecedores e agentes públicos.',
    link: '/documentos/codigo-de-etica-e-conduta.pdf',
    linkRotulo: 'Ler o código na íntegra (PDF)'
  },
  canal: {
    titulo: 'Canal de denúncias',
    texto:
      'Para garantir um ambiente ético e transparente, disponibilizamos um canal de denúncia anônimo e seguro, operado por uma empresa independente. Se identificar qualquer situação que viole nossos princípios de ética, integridade ou conduta, esse é o meio para relatar com total confidencialidade.',
    email: 'afirmaevias@denuncieonline.com.br',
    telefone: '0800 591 2420',
    url: 'https://denuncieonline.azurewebsites.net/CDs/AE/AE.html'
  },
  categoriasRelato: [
    'Conduta ética',
    'Assédio ou discriminação',
    'Conflito de interesses',
    'Fraude ou corrupção',
    'Segurança do trabalho',
    'Meio ambiente',
    'Outro'
  ]
};

export const vagas = {
  eyebrow: 'Trabalhe com a gente',
  titulo: 'Engenharia se faz<br>com gente boa.',
  chamada:
    'Se você quer trabalhar com obra de verdade, laboratório de ponta e tecnologia própria, manda seu currículo. A gente lê todos.',
  areas: [
    'Engenharia de projetos',
    'Supervisão e fiscalização de obras',
    'Laboratório e controle tecnológico',
    'Topografia e levantamentos',
    'BIM e modelagem',
    'Tecnologia da informação',
    'Administrativo e financeiro',
    'Estágio'
  ]
};

// -------------------------------------------------------------------- LGPD
export const privacidade = {
  atualizadoEm: '25 de agosto de 2026',
  versao: '1.0',
  secoes: [
    {
      titulo: 'Quem somos e a quem esta política se aplica',
      paragrafos: [
        'A Afirma E-vias Engenharia Viária Ltda., inscrita no CNPJ sob o nº 05.205.684/0001-81, com sede na R. Baltazar Carrasco dos Reis, 2345, Rebouças, Curitiba/PR, é a controladora dos dados pessoais tratados por meio deste site, nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD).',
        'Esta política se aplica a qualquer pessoa que acesse www.afirmaevias.com.br, preencha um de nossos formulários ou se comunique conosco pelos canais aqui indicados. Ela não se aplica a sistemas internos de clientes, que possuem contratos e políticas próprias.'
      ]
    },
    {
      titulo: 'Quais dados coletamos',
      lista: [
        'Dados de contato que você digita nos formulários: nome, sobrenome, e-mail, telefone, empresa e o conteúdo da mensagem.',
        'Currículo enviado na página Trabalhe com a gente, incluindo os dados que você optar por incluir no arquivo.',
        'Dados de requisição de titular: nome, e-mail e, quando necessário para confirmar sua identidade, número de documento.',
        'Relatos de integridade, que podem ser enviados de forma totalmente anônima.',
        'Dados técnicos de navegação: endereço IP, agente de usuário, páginas visitadas e data e hora do acesso.',
        'Registro do seu consentimento de cookies, guardado como prova de escolha.'
      ],
      paragrafos: [
        'Não coletamos dados pessoais sensíveis por meio deste site e pedimos que você não os inclua em mensagens ou currículos.'
      ]
    },
    {
      titulo: 'Por que tratamos seus dados e com qual base legal',
      lista: [
        'Responder contatos comerciais e enviar propostas — execução de procedimentos preliminares a contrato (art. 7º, V).',
        'Avaliar candidaturas em processos seletivos — execução de procedimentos preliminares a contrato (art. 7º, V).',
        'Atender requisições de titulares e comprovar conformidade — cumprimento de obrigação legal (art. 7º, II).',
        'Apurar relatos de integridade — legítimo interesse na manutenção do programa de compliance (art. 7º, IX).',
        'Manter o site seguro e funcional e prevenir fraudes — legítimo interesse (art. 7º, IX).',
        'Cookies analíticos e de marketing — consentimento (art. 7º, I), revogável a qualquer momento.'
      ]
    },
    {
      titulo: 'Com quem compartilhamos',
      paragrafos: [
        'Não vendemos dados pessoais. Compartilhamos apenas o necessário com: provedores de infraestrutura e hospedagem que operam sob contrato de tratamento; a empresa independente que opera nosso canal de denúncias; e autoridades públicas, quando houver requisição legal.',
        'Nossos servidores de aplicação e banco de dados podem estar localizados fora do Brasil. Nessas hipóteses, a transferência internacional observa o art. 33 da LGPD e é acompanhada de cláusulas contratuais de proteção.'
      ]
    },
    {
      titulo: 'Por quanto tempo guardamos',
      lista: [
        'Contatos comerciais: 24 meses após o último contato.',
        'Currículos: 12 meses, salvo se você pedir a exclusão antes.',
        'Requisições de titular e registros de consentimento: 5 anos, para prova de conformidade.',
        'Relatos de integridade: pelo prazo da apuração e mais 5 anos.',
        'Logs de acesso: 6 meses, conforme o Marco Civil da Internet.'
      ]
    },
    {
      titulo: 'Seus direitos como titular',
      paragrafos: [
        'A LGPD garante que você confirme a existência de tratamento, acesse seus dados, corrija dados incompletos ou desatualizados, solicite anonimização, bloqueio ou eliminação, peça a portabilidade, revogue o consentimento, obtenha informação sobre compartilhamentos e se oponha a tratamentos feitos com base no legítimo interesse.',
        'Para exercer qualquer um desses direitos use o Portal do titular. Respondemos em até 15 dias e você recebe um protocolo para acompanhar.'
      ]
    },
    {
      titulo: 'Segurança',
      paragrafos: [
        'Adotamos medidas técnicas e administrativas compatíveis com a natureza dos dados: tráfego cifrado por TLS, senhas armazenadas com hash, acesso ao painel administrativo restrito e registrado em trilha de auditoria, e princípio do menor privilégio para a equipe.',
        'Em caso de incidente de segurança com risco relevante, comunicaremos você e a ANPD nos prazos legais.'
      ]
    },
    {
      titulo: 'Encarregado pelo tratamento de dados (DPO)',
      paragrafos: [
        'Dúvidas, pedidos e reclamações podem ser encaminhados ao nosso Encarregado pelo e-mail privacidade@afirmaevias.com.br ou pelo telefone (41) 3123-8550.'
      ]
    },
    {
      titulo: 'Alterações desta política',
      paragrafos: [
        'Podemos atualizar esta política para refletir mudanças legais ou operacionais. A versão vigente e a data da última atualização ficam sempre indicadas no topo desta página. Mudanças relevantes serão avisadas no site.'
      ]
    }
  ]
};

export const cookies = {
  categorias: [
    {
      chave: 'necessarios',
      titulo: 'Necessários',
      texto:
        'Mantêm o site funcionando: sessão, segurança do formulário e memória da sua escolha de cookies. Não podem ser desligados.',
      obrigatorio: true
    },
    {
      chave: 'analiticos',
      titulo: 'Analíticos',
      texto:
        'Medem páginas visitadas e origem do acesso para entendermos o que é útil. Dados agregados, sem identificar você.',
      obrigatorio: false
    },
    {
      chave: 'marketing',
      titulo: 'Marketing',
      texto:
        'Permitem medir campanhas e mostrar conteúdo da Afirma E-vias em outras plataformas.',
      obrigatorio: false
    }
  ]
};

export const tiposSolicitacaoLgpd = [
  { valor: 'confirmacao', rotulo: 'Confirmar se vocês tratam meus dados' },
  { valor: 'acesso', rotulo: 'Acessar os dados que vocês têm sobre mim' },
  { valor: 'correcao', rotulo: 'Corrigir dados incompletos ou errados' },
  { valor: 'eliminacao', rotulo: 'Eliminar meus dados' },
  { valor: 'portabilidade', rotulo: 'Receber meus dados em formato portável' },
  { valor: 'revogacao', rotulo: 'Revogar um consentimento que dei' },
  { valor: 'oposicao', rotulo: 'Me opor a um tratamento' },
  { valor: 'compartilhamento', rotulo: 'Saber com quem meus dados foram compartilhados' }
];

export const termos = {
  atualizadoEm: '25 de agosto de 2026',
  secoes: [
    {
      titulo: 'Uso do site',
      paragrafos: [
        'Este site é mantido pela Afirma E-vias para apresentar a empresa, seus serviços e canais de relacionamento. Ao navegar, você concorda com estes termos e com a Política de Privacidade.',
        'É vedado usar o site para fins ilícitos, tentar obter acesso não autorizado a áreas restritas, ou aplicar mecanismos automatizados que degradem a disponibilidade do serviço.'
      ]
    },
    {
      titulo: 'Conteúdo e propriedade intelectual',
      paragrafos: [
        'Marca, logotipo, textos, imagens e materiais técnicos publicados aqui pertencem à Afirma E-vias ou a seus licenciadores. A reprodução depende de autorização prévia por escrito.',
        'Informações técnicas divulgadas neste site têm caráter institucional e não substituem projeto, laudo ou parecer específico assinado por profissional habilitado.'
      ]
    },
    {
      titulo: 'Disponibilidade',
      paragrafos: [
        'Trabalhamos para manter o site no ar, mas ele pode ficar indisponível por manutenção ou por fatores fora do nosso controle. Não há garantia de disponibilidade ininterrupta.'
      ]
    },
    {
      titulo: 'Foro',
      paragrafos: [
        'Estes termos são regidos pela lei brasileira. Fica eleito o foro da comarca de Curitiba/PR para dirimir controvérsias.'
      ]
    }
  ]
};
