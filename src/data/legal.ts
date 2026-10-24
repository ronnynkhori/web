/**
 * Privacy, cookies, accessibility, terms and contact pages. Only what the site
 * itself does is stated as fact; organiser, legal and contact details are
 * [CONTENT REQUIRED] until the LOC supplies them (content-rules.md §6).
 */
import type { Localized } from "@/lib/i18n/config";

export const legalSlugs = ["privacy", "cookies", "accessibility", "terms", "contact"] as const;
export type LegalSlug = (typeof legalSlugs)[number];

export interface LegalSection {
  heading: Localized;
  body: Localized<string[]>;
}

export interface LegalPage {
  title: Localized;
  intro: Localized;
  sections: LegalSection[];
}

type Tri = [en: string, pt: string, fr: string];

const l = ([en, pt, fr]: Tri): Localized => ({ en, pt, fr });

function section(heading: Tri, lines: Tri[]): LegalSection {
  return {
    heading: l(heading),
    body: { en: lines.map((x) => x[0]), pt: lines.map((x) => x[1]), fr: lines.map((x) => x[2]) },
  };
}

const CONTACT_PENDING: Tri = [
  "Contact for these requests: [CONTENT REQUIRED]",
  "Contacto para estes pedidos: [CONTENT REQUIRED]",
  "Contact pour ces demandes : [CONTENT REQUIRED]",
];

export const legalPages: Record<LegalSlug, LegalPage> = {
  privacy: {
    title: l(["Privacy policy", "Política de privacidade", "Politique de confidentialité"]),
    intro: l([
      "What information this website handles and why. The organiser's legal details will be added before launch.",
      "Que informação este site trata e porquê. Os dados legais do organizador serão adicionados antes do lançamento.",
      "Les informations traitées par ce site et pourquoi. Les coordonnées légales de l'organisateur seront ajoutées avant le lancement.",
    ]),
    sections: [
      section(["Who is responsible", "Quem é responsável", "Responsable du traitement"], [
        [
          "This website is run for the Organising Committee of the XIII Jogos Desportivos da CPLP, Angola 2027.",
          "Este site é gerido para o Comité Organizador dos XIII Jogos Desportivos da CPLP, Angola 2027.",
          "Ce site est géré pour le Comité d'organisation local (COL) des Jeux de la Jeunesse de la Région 5 de l'AUSC, Maputo 2026.",
        ],
        [
          "Data controller name and address: [CONTENT REQUIRED]",
          "Nome e morada do responsável pelo tratamento: [CONTENT REQUIRED]",
          "Nom et adresse du responsable du traitement : [CONTENT REQUIRED]",
        ],
      ]),
      section(["What we collect from visitors", "O que recolhemos dos visitantes", "Ce que nous collectons auprès des visiteurs"], [
        [
          "The public site has no visitor accounts, contact forms or newsletter sign-up.",
          "O site público não tem contas de visitante, formulários de contacto nem subscrição de newsletter.",
          "Le site public n'a ni compte visiteur, ni formulaire de contact, ni inscription à une lettre d'information.",
        ],
        [
          "Choices you make (reduced motion, the country you follow) are stored only in your own browser and are never sent to us.",
          "As escolhas que faz (reduzir movimento, o país que segue) ficam guardadas apenas no seu navegador e nunca nos são enviadas.",
          "Vos choix (réduction des animations, pays suivi) sont enregistrés uniquement dans votre navigateur et ne nous sont jamais envoyés.",
        ],
      ]),
      section(["Hosting and performance", "Alojamento e desempenho", "Hébergement et performances"], [
        [
          "Our hosting provider processes technical data such as your IP address to deliver pages and protect the service.",
          "O nosso fornecedor de alojamento trata dados técnicos, como o seu endereço IP, para entregar as páginas e proteger o serviço.",
          "Notre hébergeur traite des données techniques, comme votre adresse IP, pour afficher les pages et protéger le service.",
        ],
        [
          "We measure page speed with Vercel Speed Insights, which collects anonymous performance data and does not use cookies.",
          "Medimos a velocidade das páginas com o Vercel Speed Insights, que recolhe dados de desempenho anónimos e não usa cookies.",
          "Nous mesurons la vitesse des pages avec Vercel Speed Insights, qui collecte des données de performance anonymes sans cookies.",
        ],
      ]),
      section(["Photos of participants", "Fotografias dos participantes", "Photos des participants"], [
        [
          "Photos are published only when consent is recorded in our editorial system, and every photo carries a credit.",
          "As fotografias só são publicadas quando o consentimento está registado no nosso sistema editorial, e todas indicam o autor.",
          "Les photos ne sont publiées que si le consentement est enregistré dans notre système éditorial, et chacune est créditée.",
        ],
        [
          "To ask for a photo to be removed: [CONTENT REQUIRED]",
          "Para pedir a remoção de uma fotografia: [CONTENT REQUIRED]",
          "Pour demander le retrait d'une photo : [CONTENT REQUIRED]",
        ],
      ]),
      section(["Staff accounts", "Contas da equipa", "Comptes du personnel"], [
        [
          "Staff who sign in to the Games Control Room receive a sign-in cookie, and their changes are recorded in an audit log.",
          "A equipa que entra na Sala de Controlo dos Jogos recebe um cookie de sessão, e as suas alterações ficam registadas num histórico de auditoria.",
          "Le personnel qui se connecte à la salle de contrôle des Jeux reçoit un cookie de session, et ses modifications sont consignées dans un journal d'audit.",
        ],
      ]),
      section(["Your rights", "Os seus direitos", "Vos droits"], [
        [
          "Applicable data protection law and how long data is kept: [CONTENT REQUIRED]",
          "Lei de proteção de dados aplicável e prazo de conservação: [CONTENT REQUIRED]",
          "Loi applicable en matière de protection des données et durée de conservation : [CONTENT REQUIRED]",
        ],
        CONTACT_PENDING,
      ]),
    ],
  },

  cookies: {
    title: l(["Cookie notice", "Aviso de cookies", "Politique relative aux cookies"]),
    intro: l([
      "The public website does not set cookies. It keeps a few settings in your browser so the site remembers your choices.",
      "O site público não define cookies. Guarda algumas definições no seu navegador para se lembrar das suas escolhas.",
      "Le site public ne dépose pas de cookies. Il conserve quelques réglages dans votre navigateur pour mémoriser vos choix.",
    ]),
    sections: [
      section(["Settings stored in your browser", "Definições guardadas no navegador", "Réglages enregistrés dans votre navigateur"], [
        ["m26-motion-v2: whether you turned on Reduce motion.", "m26-motion-v2: se ativou Reduzir movimento.", "m26-motion-v2 : si vous avez activé Réduire les animations."],
        ["m26-follow: the country you follow in the live centre.", "m26-follow: o país que segue no centro ao vivo.", "m26-follow : le pays que vous suivez dans le centre en direct."],
        [
          "m26-hero-seen and dismissed notices: kept for this visit only, so the opening animation and closed notices do not repeat.",
          "m26-hero-seen e avisos fechados: guardados apenas durante esta visita, para que a animação inicial e os avisos fechados não se repitam.",
          "m26-hero-seen et avis fermés : conservés pour cette visite uniquement, afin que l'animation d'ouverture et les avis fermés ne se répètent pas.",
        ],
        [
          "None of these are used for tracking. You can clear them at any time in your browser settings.",
          "Nenhuma destas é usada para seguimento. Pode apagá-las a qualquer momento nas definições do navegador.",
          "Aucun de ces réglages ne sert au suivi. Vous pouvez les effacer à tout moment dans les paramètres de votre navigateur.",
        ],
      ]),
      section(["Staff area", "Área da equipa", "Espace du personnel"], [
        [
          "The Games Control Room (staff only) uses a strictly necessary sign-in cookie and a cookie that remembers whether the side menu is open.",
          "A Sala de Controlo dos Jogos (apenas equipa) usa um cookie de sessão estritamente necessário e um cookie que lembra se o menu lateral está aberto.",
          "La salle de contrôle des Jeux (personnel uniquement) utilise un cookie de session strictement nécessaire et un cookie qui mémorise l'ouverture du menu latéral.",
        ],
      ]),
      section(["Changes", "Alterações", "Modifications"], [
        [
          "If audience measurement is added, this notice will be updated and you will be asked before anything is stored.",
          "Se for adicionada medição de audiências, este aviso será atualizado e ser-lhe-á pedido consentimento antes de guardar algo.",
          "Si une mesure d'audience est ajoutée, cette politique sera mise à jour et votre accord sera demandé avant tout enregistrement.",
        ],
      ]),
    ],
  },

  accessibility: {
    title: l(["Accessibility statement", "Declaração de acessibilidade", "Déclaration d'accessibilité"]),
    intro: l([
      "Everyone should be able to follow the Games. This site is built to meet WCAG 2.2 level AA.",
      "Todos devem poder acompanhar os Jogos. Este site foi construído para cumprir as WCAG 2.2, nível AA.",
      "Chacun doit pouvoir suivre les Jeux. Ce site est conçu pour respecter les WCAG 2.2, niveau AA.",
    ]),
    sections: [
      section(["What you can do on this site", "O que pode fazer neste site", "Ce que vous pouvez faire sur ce site"], [
        [
          "Use every part of the site with a keyboard, with a visible focus ring and a link to skip to the main content.",
          "Usar todo o site com o teclado, com um indicador de foco visível e uma ligação para saltar para o conteúdo principal.",
          "Utiliser tout le site au clavier, avec un indicateur de focus visible et un lien pour accéder directement au contenu.",
        ],
        [
          "Turn on Reduce motion in the footer. The site also follows your device's reduced-motion setting.",
          "Ativar Reduzir movimento no rodapé. O site também segue a definição de movimento reduzido do seu dispositivo.",
          "Activer Réduire les animations dans le pied de page. Le site suit aussi le réglage de votre appareil.",
        ],
        [
          "Read the site in English, Portuguese or French.",
          "Ler o site em inglês, português ou francês.",
          "Lire le site en anglais, portugais ou français.",
        ],
        [
          "Follow live scores with a screen reader: score changes are announced, and results and rank changes never rely on colour alone.",
          "Acompanhar os resultados com um leitor de ecrã: as alterações são anunciadas, e os resultados e mudanças de posição nunca dependem só da cor.",
          "Suivre les scores avec un lecteur d'écran : les changements sont annoncés, et les résultats et classements ne reposent jamais sur la seule couleur.",
        ],
      ]),
      section(["Known limitations", "Limitações conhecidas", "Limites connues"], [
        [
          "Some photos are placeholders until official images and their descriptions are supplied.",
          "Algumas fotografias são provisórias até serem fornecidas as imagens oficiais e as suas descrições.",
          "Certaines photos sont provisoires en attendant les images officielles et leurs descriptions.",
        ],
        [
          "Downloadable documents (PDF) are produced by the organisers and may not be fully accessible. Ask us for another format.",
          "Os documentos para transferência (PDF) são produzidos pelos organizadores e podem não ser totalmente acessíveis. Peça-nos outro formato.",
          "Les documents téléchargeables (PDF) sont produits par les organisateurs et peuvent ne pas être entièrement accessibles. Demandez-nous un autre format.",
        ],
      ]),
      section(["How we checked", "Como verificámos", "Comment nous avons vérifié"], [
        [
          "This statement is based on a self-assessment by the website team in October 2026.",
          "Esta declaração baseia-se numa autoavaliação feita pela equipa do site em Outubro de 2026.",
          "Cette déclaration repose sur une auto-évaluation de l'équipe du site en octobre 2026.",
        ],
      ]),
      section(["Tell us about a problem", "Comunique-nos um problema", "Signalez-nous un problème"], [CONTACT_PENDING]),
    ],
  },

  terms: {
    title: l(["Terms of use", "Termos de utilização", "Conditions d'utilisation"]),
    intro: l([
      "The rules for using this website.",
      "As regras de utilização deste site.",
      "Les règles d'utilisation de ce site.",
    ]),
    sections: [
      section(["Information on this site", "Informação neste site", "Informations sur ce site"], [
        [
          "Schedules, venues and results can change. Results shown during competition may be provisional and are marked when corrected.",
          "Horários, recintos e resultados podem mudar. Os resultados mostrados durante a competição podem ser provisórios e são assinalados quando corrigidos.",
          "Les horaires, sites et résultats peuvent changer. Les résultats affichés pendant la compétition peuvent être provisoires et sont signalés lorsqu'ils sont corrigés.",
        ],
        [
          "Official results are those confirmed by the competition officials and the LOC.",
          "Os resultados oficiais são os confirmados pelos oficiais de competição e pelo COL.",
          "Les résultats officiels sont ceux confirmés par les officiels de compétition et le COL.",
        ],
      ]),
      section(["Names, logos and photos", "Nomes, logótipos e fotografias", "Noms, logos et photos"], [
        [
          "The Games name, logo and partner marks belong to their owners and may not be reused without permission.",
          "O nome e o logótipo dos Jogos e as marcas dos parceiros pertencem aos seus proprietários e não podem ser reutilizados sem autorização.",
          "Le nom et le logo des Jeux et les marques des partenaires appartiennent à leurs propriétaires et ne peuvent être réutilisés sans autorisation.",
        ],
        [
          "Terms for reusing photos: [CONTENT REQUIRED]",
          "Condições de reutilização das fotografias: [CONTENT REQUIRED]",
          "Conditions de réutilisation des photos : [CONTENT REQUIRED]",
        ],
      ]),
      section(["Links to other sites", "Ligações para outros sites", "Liens vers d'autres sites"], [
        [
          "Links to other sites, such as maps and partner pages, are provided for convenience. We are not responsible for their content.",
          "As ligações para outros sites, como mapas e páginas de parceiros, são fornecidas por conveniência. Não somos responsáveis pelo seu conteúdo.",
          "Les liens vers d'autres sites, comme les cartes et les pages des partenaires, sont fournis pour information. Nous ne sommes pas responsables de leur contenu.",
        ],
      ]),
      section(["Organiser and governing law", "Organizador e lei aplicável", "Organisateur et droit applicable"], [
        ["Organiser details and governing law: [CONTENT REQUIRED]", "Dados do organizador e lei aplicável: [CONTENT REQUIRED]", "Coordonnées de l'organisateur et droit applicable : [CONTENT REQUIRED]"],
      ]),
    ],
  },

  contact: {
    title: l(["Contact", "Contacto", "Contact"]),
    intro: l([
      "How to reach the XIII CPLP Games organisers.",
      "Como contactar os organizadores dos XIII Jogos da CPLP.",
      "Comment joindre les organisateurs de Maputo 2026.",
    ]),
    sections: [
      section(["Delegations", "Delegações", "Délégations"], [
        [
          "Delegations should use the channels set out in the Competition Delegation Manual.",
          "As delegações devem usar os canais indicados no Manual da Delegação de Competição.",
          "Les délégations doivent utiliser les canaux indiqués dans le Manuel des délégations.",
        ],
      ]),
      section(["General enquiries", "Informações gerais", "Renseignements généraux"], [
        ["Email and phone: [CONTENT REQUIRED]", "Email e telefone: [CONTENT REQUIRED]", "E-mail et téléphone : [CONTENT REQUIRED]"],
      ]),
      section(["Media and accreditation", "Comunicação social e acreditação", "Médias et accréditation"], [
        ["Press office: [CONTENT REQUIRED]", "Gabinete de imprensa: [CONTENT REQUIRED]", "Service de presse : [CONTENT REQUIRED]"],
      ]),
      section(["Safeguarding concerns", "Preocupações de proteção", "Signalements de protection"], [
        ["Safeguarding officer: [CONTENT REQUIRED]", "Responsável pela proteção: [CONTENT REQUIRED]", "Responsable de la protection : [CONTENT REQUIRED]"],
      ]),
      section(["Website and accessibility", "Site e acessibilidade", "Site et accessibilité"], [
        ["Website team: [CONTENT REQUIRED]", "Equipa do site: [CONTENT REQUIRED]", "Équipe du site : [CONTENT REQUIRED]"],
      ]),
    ],
  },
};
