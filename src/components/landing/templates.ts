/**
 * Landing-page mockups shown in the home gallery. Each one is drawn onto a canvas
 * (see templateArt.ts) and mapped onto a floating card. Names are fictional businesses.
 */
export interface ShowcaseTemplate {
  id: string;
  /** Fictional brand shown on the mockup. */
  brand: string;
  /** Segment, shown in the caption. */
  segment: string;
  /** One line shown under the name in the caption. */
  pitch: string;
  domain: string;
  headline: string;
  sub: string;
  cta: string;
  nav: string[];
  photo: string;
  layout: "split" | "full" | "editorial";
  colors: { bg: string; ink: string; muted: string; accent: string; onAccent: string };
  /** CSS font families (loaded on the landing page). */
  fonts: { display: string; body: string; displayWeight: number };
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1400&q=80&auto=format&fit=crop`;

export const SHOWCASE: ShowcaseTemplate[] = [
  {
    id: "moda",
    brand: "NORTE ATELIÊ",
    segment: "Loja de roupas",
    pitch: "Vitrine, coleção e checkout em uma página.",
    domain: "norteatelie.com.br",
    headline: "Peças feitas para durar mais que a estação.",
    sub: "Coleção outono 26 · algodão orgânico, linho e lã fria.",
    cta: "Ver coleção",
    nav: ["Coleção", "Ateliê", "Sacola (2)"],
    photo: unsplash("1490481651871-ab68de25d43d"),
    layout: "split",
    colors: {
      bg: "#F4F1EA",
      ink: "#141311",
      muted: "#6F6A61",
      accent: "#141311",
      onAccent: "#F4F1EA",
    },
    fonts: { display: "Instrument Serif", body: "Inter", displayWeight: 400 },
  },
  {
    id: "perfumaria",
    brand: "Maison Âmbar",
    segment: "Perfumaria",
    pitch: "Fragrâncias apresentadas como peças de luxo.",
    domain: "maisonambar.com",
    headline: "Notas que ficam depois que você sai.",
    sub: "Perfumes autorais · âmbar, oud e flor de laranjeira.",
    cta: "Descobrir fragrâncias",
    nav: ["Fragrâncias", "A casa", "Presentes"],
    photo: unsplash("1588405748880-12d1d2a59f75"),
    layout: "full",
    colors: {
      bg: "#1A120B",
      ink: "#F6E9D4",
      muted: "#C7AE8C",
      accent: "#D8A657",
      onAccent: "#1A120B",
    },
    fonts: { display: "Playfair Display", body: "Inter", displayWeight: 600 },
  },
  {
    id: "restaurante",
    brand: "Osteria do Mar",
    segment: "Restaurante",
    pitch: "Cardápio, reservas e endereço sem fricção.",
    domain: "osteriadomar.com.br",
    headline: "Massa fresca, peixe do dia e vinho natural.",
    sub: "Terça a domingo · reservas para até 12 pessoas.",
    cta: "Reservar mesa",
    nav: ["Cardápio", "Vinhos", "Reservas"],
    photo: unsplash("1414235077428-338989a2e8c0"),
    layout: "editorial",
    colors: {
      bg: "#F7F2EA",
      ink: "#2A1712",
      muted: "#8A6F62",
      accent: "#B5482B",
      onAccent: "#FFF6EE",
    },
    fonts: { display: "Fraunces", body: "Inter", displayWeight: 600 },
  },
  {
    id: "joalheria",
    brand: "Pérola & Ouro",
    segment: "Joalheria",
    pitch: "Close-ups, histórias e atendimento sob medida.",
    domain: "perolaeouro.com.br",
    headline: "Joias para os dias que você quer lembrar.",
    sub: "Pérolas cultivadas e ouro 18k · peças sob encomenda.",
    cta: "Agendar visita",
    nav: ["Coleções", "Noivas", "Atendimento"],
    photo: unsplash("1515562141207-7a88fb7ce338"),
    layout: "split",
    colors: {
      bg: "#FBF8F4",
      ink: "#2B1B1F",
      muted: "#8C7A7E",
      accent: "#7A1F2B",
      onAccent: "#FBF8F4",
    },
    fonts: { display: "Playfair Display", body: "Inter", displayWeight: 500 },
  },
  {
    id: "estetica",
    brand: "Lume Estética",
    segment: "Clínica de estética",
    pitch: "Procedimentos, equipe e agendamento online.",
    domain: "lumeestetica.com.br",
    headline: "Pele cuidada com calma e ciência.",
    sub: "Limpeza profunda, peeling e protocolos personalizados.",
    cta: "Agendar avaliação",
    nav: ["Tratamentos", "Equipe", "Agenda"],
    photo: unsplash("1570172619644-dfd03ed5d881"),
    layout: "editorial",
    colors: {
      bg: "#EEF2EE",
      ink: "#15241D",
      muted: "#5F7468",
      accent: "#2E6B52",
      onAccent: "#EEF2EE",
    },
    fonts: { display: "Fraunces", body: "Inter", displayWeight: 500 },
  },
  {
    id: "arquitetura",
    brand: "Studio Norte",
    segment: "Arquitetura e interiores",
    pitch: "Portfólio que vende o projeto antes da reunião.",
    domain: "studionorte.arq.br",
    headline: "Espaços que contam a sua história.",
    sub: "Projetos residenciais e comerciais do primeiro traço à obra.",
    cta: "Ver projetos",
    nav: ["Projetos", "Serviços", "Contato"],
    photo: unsplash("1618221195710-dd6b41faaea6"),
    layout: "full",
    colors: {
      bg: "#10110F",
      ink: "#F3F1EC",
      muted: "#B9B4A9",
      accent: "#E9E2D3",
      onAccent: "#10110F",
    },
    fonts: { display: "Inter", body: "Inter", displayWeight: 600 },
  },
  {
    id: "cafe",
    brand: "Grão & Brasa",
    segment: "Cafeteria",
    pitch: "Cardápio do dia, cafés especiais e clube de assinatura.",
    domain: "graoebrasa.com.br",
    headline: "Café de origem, torrado aqui toda semana.",
    sub: "Espresso, filtrados e pães de fermentação natural.",
    cta: "Assinar o clube",
    nav: ["Cafés", "Cardápio", "Clube"],
    photo: unsplash("1495474472287-4d71bcdd2085"),
    layout: "split",
    colors: {
      bg: "#2B1A12",
      ink: "#F6E9DC",
      muted: "#C9A98F",
      accent: "#E8894A",
      onAccent: "#2B1A12",
    },
    fonts: { display: "Syne", body: "Inter", displayWeight: 700 },
  },
  {
    id: "academia",
    brand: "PULSO",
    segment: "Academia e estúdio",
    pitch: "Aulas, planos e aula experimental em um clique.",
    domain: "pulsostudio.com.br",
    headline: "Treino forte. Comunidade melhor ainda.",
    sub: "Funcional, força e mobilidade · turmas de até 14 alunos.",
    cta: "Aula experimental",
    nav: ["Aulas", "Planos", "Unidades"],
    photo: unsplash("1534438327276-14e5300c3a48"),
    layout: "full",
    colors: {
      bg: "#0C0D10",
      ink: "#F2F2EE",
      muted: "#A3A6AD",
      accent: "#D7FF3A",
      onAccent: "#0C0D10",
    },
    fonts: { display: "Syne", body: "Inter", displayWeight: 800 },
  },
  {
    id: "brecho",
    brand: "Casa Arara",
    segment: "Brechó e curadoria",
    pitch: "Garimpo com cara de marca e estoque que gira.",
    domain: "casaarara.com.br",
    headline: "Roupas com história, escolhidas a dedo.",
    sub: "Novidades toda sexta · peças únicas e vintage.",
    cta: "Ver novidades",
    nav: ["Novidades", "Feminino", "Masculino"],
    photo: unsplash("1445205170230-053b83016050"),
    layout: "editorial",
    colors: {
      bg: "#F3EBDD",
      ink: "#2A2116",
      muted: "#7E6E57",
      accent: "#2F5D46",
      onAccent: "#F3EBDD",
    },
    fonts: { display: "Instrument Serif", body: "Inter", displayWeight: 400 },
  },
];

/** Google Fonts stylesheet with every family the mockups use. */
export const SHOWCASE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Serif&family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600&family=Syne:wght@700;800&display=swap";
