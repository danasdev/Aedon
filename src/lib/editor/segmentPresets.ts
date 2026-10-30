import type { PagePreset } from "./presets";
import type { PropMap } from "./types";

/**
 * Ready-made sites for specific businesses, built only from the regular blocks and
 * their editable fields. Brands are fictional; photos are from Unsplash.
 */
const photo = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const links = (...labels: string[]) => labels.map((label) => ({ label, link: "" }));
const images = (...ids: string[]) => ids.map((id) => ({ src: photo(id, 1200) }));

type Colors = { bg: string; textColor: string; accent: string };

/** Section content as written here; list items get their ids when the preset is inserted. */
const c = (sections: object[]) => sections as unknown as PropMap[];

export const SEGMENT_PRESETS: PagePreset[] = [
  (() => {
    const paper: Colors = { bg: "#F4F1EA", textColor: "#141311", accent: "#141311" };
    const deep: Colors = { bg: "#E9E4D9", textColor: "#141311", accent: "#141311" };
    return {
      id: "moda",
      name: "Loja de roupas",
      segment: "Loja de roupas",
      brand: "Norte Ateliê",
      description: "Coleção em destaque, galeria de looks e chamada para a loja.",
      typography: { headingFont: "Instrument Serif", bodyFont: "Inter", headingWeight: 400 },
      sectionIds: [
        "navbar.modern",
        "hero.gradient",
        "gallery.editorial",
        "text.editorial",
        "testimonials.cards",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...paper,
          brand: "Norte Ateliê",
          links: links("Coleção", "Ateliê", "Lojas"),
          ctaText: "Comprar agora",
        },
        {
          ...paper,
          textColor: "#FFFFFF",
          bgImage: photo("1490481651871-ab68de25d43d"),
          bgOverlay: "35",
          glow: "#141311",
          eyebrow: "Coleção outono 26",
          title: "Peças feitas para durar mais que a estação",
          subtitle:
            "Algodão orgânico, linho e lã fria. Costurado em pequenas tiragens, aqui no Brasil.",
          cta: "Ver coleção",
          ctaSecondary: "Nossa história",
          accent: "#FFFFFF",
        },
        {
          ...paper,
          title: "Looks da temporada",
          images: images(
            "1483985988355-763728e1935b",
            "1496747611176-843222e1e57c",
            "1539109136881-3be0616acf4b",
            "1445205170230-053b83016050",
          ),
        },
        {
          ...deep,
          eyebrow: "Do ateliê",
          title: "Menos peças, escolhidas com cuidado.",
          body: "Cada coleção nasce de poucos tecidos e muita prova. A ideia é simples: roupa boa, que combina com o que você já tem e dura anos.",
          caption: "Norte Ateliê — moda lenta desde 2019",
        },
        {
          ...paper,
          title: "Quem veste, volta",
          items: [
            {
              quote: "O caimento da calça de linho é outro nível. Comprei a segunda cor.",
              author: "Beatriz · Recife",
            },
            {
              quote: "Chegou embalado como presente e serviu de primeira.",
              author: "Lucas · São Paulo",
            },
            {
              quote: "Finalmente uma marca que não desbota na terceira lavagem.",
              author: "Ana · Porto Alegre",
            },
          ],
        },
        {
          bg: "#141311",
          textColor: "#F4F1EA",
          accent: "#F4F1EA",
          title: "Frete grátis na primeira compra",
          cta: "Ir para a loja",
        },
        {
          bg: "#141311",
          textColor: "#F4F1EA",
          accent: "#E9E4D9",
          brand: "Norte Ateliê",
          tagline: "Moda lenta, feita aqui.",
          links: links("Coleção", "Trocas", "Contato"),
          copyright: "© 2026 Norte Ateliê",
        },
      ]),
    };
  })(),
  (() => {
    const night: Colors = { bg: "#15100B", textColor: "#F6E9D4", accent: "#D8A657" };
    return {
      id: "perfumaria",
      name: "Perfumaria",
      segment: "Perfumaria",
      brand: "Maison Âmbar",
      description: "Fragrâncias apresentadas como peças de luxo, com notas e galeria.",
      typography: { headingFont: "Playfair Display", bodyFont: "Inter", headingWeight: 500 },
      sectionIds: [
        "navbar.modern",
        "hero.gradient",
        "features.grid",
        "gallery.editorial",
        "text.quote",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...night,
          brand: "Maison Âmbar",
          links: links("Fragrâncias", "A casa", "Presentes"),
          ctaText: "Comprar",
        },
        {
          ...night,
          bgImage: photo("1588405748880-12d1d2a59f75"),
          bgOverlay: "45",
          glow: "#D8A657",
          eyebrow: "Perfumes autorais",
          title: "Notas que ficam depois que você sai",
          subtitle: "Âmbar, oud e flor de laranjeira, compostos em pequenos lotes.",
          cta: "Descobrir fragrâncias",
          ctaSecondary: "Agendar prova",
        },
        {
          ...night,
          bg: "#1D160F",
          title: "Como cada frasco é feito",
          items: [
            {
              icon: "sparkles",
              title: "Matéria-prima nobre",
              desc: "Óleos essenciais de produtores parceiros, rastreados.",
            },
            {
              icon: "heart",
              title: "Feito à mão",
              desc: "Maceração por oito semanas antes do envase.",
            },
            {
              icon: "star",
              title: "Edições numeradas",
              desc: "Cada lote tem no máximo 300 frascos.",
            },
          ],
        },
        {
          ...night,
          title: "A coleção",
          images: images(
            "1615634260167-c8cdede054de",
            "1617897903246-719242758050",
            "1515377905703-c4788e51af15",
            "1588405748880-12d1d2a59f75",
          ),
        },
        {
          ...night,
          bg: "#1D160F",
          quote: "Um perfume não é um cheiro. É uma lembrança que você leva no pulso.",
          author: "Helena Couto, perfumista",
        },
        {
          bg: "#D8A657",
          textColor: "#15100B",
          accent: "#15100B",
          title: "Kit de amostras com 5 fragrâncias",
          cta: "Quero experimentar",
        },
        {
          bg: "#0E0A07",
          textColor: "#F6E9D4",
          accent: "#C7AE8C",
          brand: "Maison Âmbar",
          tagline: "Perfumaria autoral.",
          links: links("Fragrâncias", "Ateliê", "Contato"),
          copyright: "© 2026 Maison Âmbar",
        },
      ]),
    };
  })(),
  (() => {
    const paper: Colors = { bg: "#F7F2EA", textColor: "#2A1712", accent: "#B5482B" };
    return {
      id: "restaurante",
      name: "Restaurante",
      segment: "Restaurante",
      brand: "Osteria do Mar",
      description: "Cardápio em destaque, fotos dos pratos e reservas.",
      typography: { headingFont: "Fraunces", bodyFont: "DM Sans", headingWeight: 600 },
      sectionIds: [
        "navbar.modern",
        "hero.gradient",
        "text.editorial",
        "gallery.masonry",
        "testimonials.cards",
        "faq.accordion",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...paper,
          brand: "Osteria do Mar",
          links: links("Cardápio", "Vinhos", "Endereço"),
          ctaText: "Reservar",
        },
        {
          ...paper,
          textColor: "#FFF6EE",
          accent: "#B5482B",
          bgImage: photo("1517248135467-4c7edcad34c4"),
          bgOverlay: "50",
          glow: "#B5482B",
          eyebrow: "Terça a domingo · desde 2015",
          title: "Massa fresca, peixe do dia e vinho natural",
          subtitle: "Cozinha italiana com o que o mar da costa entrega pela manhã.",
          cta: "Reservar mesa",
          ctaSecondary: "Ver cardápio",
        },
        {
          ...paper,
          eyebrow: "A cozinha",
          title: "O cardápio muda quando o mar muda.",
          body: "Compramos direto de três barcos da região. O que chegar de manhã vira o prato do dia, e a massa é aberta à mão duas vezes por dia.",
          caption: "Chef Marco Alves",
        },
        {
          ...paper,
          bg: "#EFE6D8",
          title: "Da cozinha para a mesa",
          images: images(
            "1414235077428-338989a2e8c0",
            "1504674900247-0877df9cc836",
            "1565299624946-b28f40a0ae38",
            "1551218808-94e220e084d2",
          ),
        },
        {
          ...paper,
          title: "Quem já jantou aqui",
          items: [
            { quote: "O polvo grelhado justifica a viagem.", author: "Revista Sabor" },
            {
              quote: "Atendimento que lembra o seu nome na segunda visita.",
              author: "Camila · cliente",
            },
            { quote: "Carta de vinhos naturais curta e certeira.", author: "Guia Bom Garfo" },
          ],
        },
        {
          ...paper,
          bg: "#EFE6D8",
          title: "Antes de vir",
          items: [
            {
              q: "Precisa reservar?",
              a: "Recomendamos para sexta e sábado. Nos outros dias, há mesas para quem chega.",
            },
            {
              q: "Tem opção vegetariana?",
              a: "Sim, sempre duas massas e uma entrada sem carne nem peixe.",
            },
            { q: "Aceitam grupos?", a: "Até 12 pessoas no salão, com menu fechado sob consulta." },
          ],
        },
        {
          bg: "#B5482B",
          textColor: "#FFF6EE",
          accent: "#FFF6EE",
          title: "Mesas para hoje à noite",
          cta: "Reservar agora",
        },
        {
          bg: "#2A1712",
          textColor: "#F7F2EA",
          accent: "#E7C9B5",
          brand: "Osteria do Mar",
          tagline: "Rua das Pedras, 120 · Porto de Galinhas",
          links: links("Cardápio", "Reservas", "Contato"),
          copyright: "© 2026 Osteria do Mar",
        },
      ]),
    };
  })(),
  (() => {
    const sage: Colors = { bg: "#EEF2EE", textColor: "#15241D", accent: "#2E6B52" };
    return {
      id: "estetica",
      name: "Clínica de estética",
      segment: "Clínica de estética",
      brand: "Lume Estética",
      description: "Tratamentos, equipe, perguntas frequentes e agendamento.",
      typography: { headingFont: "Fraunces", bodyFont: "Manrope", headingWeight: 500 },
      sectionIds: [
        "navbar.modern",
        "hero.split",
        "features.grid",
        "gallery.editorial",
        "faq.accordion",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...sage,
          brand: "Lume Estética",
          links: links("Tratamentos", "Equipe", "Unidade"),
          ctaText: "Agendar",
        },
        {
          ...sage,
          showBadge: true,
          badge: "Avaliação gratuita",
          title: "Pele cuidada com calma e ciência",
          subtitle:
            "Protocolos personalizados de limpeza, peeling e rejuvenescimento, com dermatologista responsável.",
          cta: "Agendar avaliação",
          showSecondaryCta: true,
          ctaSecondary: "Ver tratamentos",
          image: photo("1570172619644-dfd03ed5d881", 1200),
        },
        {
          ...sage,
          bg: "#E3EAE4",
          title: "Tratamentos mais procurados",
          items: [
            {
              icon: "sparkles",
              title: "Limpeza profunda",
              desc: "Extração, máscara calmante e hidratação em 60 minutos.",
            },
            {
              icon: "shield",
              title: "Peeling químico",
              desc: "Uniformiza o tom e reduz manchas com segurança.",
            },
            {
              icon: "heart",
              title: "Drenagem",
              desc: "Alívio de inchaço com técnica manual e aparelhos.",
            },
          ],
        },
        {
          ...sage,
          title: "O espaço",
          images: images(
            "1560750588-73207b1ef5b8",
            "1596755389378-c31d21fd1273",
            "1515377905703-c4788e51af15",
            "1570172619644-dfd03ed5d881",
          ),
        },
        {
          ...sage,
          bg: "#E3EAE4",
          title: "Dúvidas comuns",
          items: [
            {
              q: "A avaliação é mesmo gratuita?",
              a: "Sim. Você conhece a equipe e sai com um plano, sem compromisso.",
            },
            {
              q: "Quanto tempo dura uma sessão?",
              a: "Entre 45 e 90 minutos, conforme o protocolo.",
            },
            {
              q: "Posso remarcar?",
              a: "Pode, com até 24 horas de antecedência, direto pelo WhatsApp.",
            },
          ],
        },
        {
          bg: "#2E6B52",
          textColor: "#EEF2EE",
          accent: "#EEF2EE",
          title: "Sua primeira avaliação é por nossa conta",
          cta: "Agendar pelo WhatsApp",
        },
        {
          bg: "#15241D",
          textColor: "#EEF2EE",
          accent: "#B9CFC2",
          brand: "Lume Estética",
          tagline: "Av. Boa Viagem, 2200 · sala 805",
          links: links("Tratamentos", "Agenda", "Contato"),
          copyright: "© 2026 Lume Estética",
        },
      ]),
    };
  })(),
  (() => {
    const ink: Colors = { bg: "#10110F", textColor: "#F3F1EC", accent: "#E9E2D3" };
    return {
      id: "arquitetura",
      name: "Arquitetura e interiores",
      segment: "Arquitetura e interiores",
      brand: "Studio Norte",
      description: "Portfólio de projetos, processo e contato para orçamento.",
      typography: { headingFont: "Inter Tight", bodyFont: "Inter", headingWeight: 600 },
      sectionIds: [
        "navbar.modern",
        "hero.gradient",
        "gallery.masonry",
        "text.editorial",
        "features.grid",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...ink,
          brand: "Studio Norte",
          links: links("Projetos", "Serviços", "Contato"),
          ctaText: "Pedir orçamento",
        },
        {
          ...ink,
          bgImage: photo("1600585154340-be6161a56a0c"),
          bgOverlay: "45",
          glow: "#E9E2D3",
          eyebrow: "Arquitetura & interiores",
          title: "Espaços que contam a sua história",
          subtitle: "Projetos residenciais e comerciais, do primeiro traço à entrega das chaves.",
          cta: "Ver projetos",
          ctaSecondary: "Agendar conversa",
        },
        {
          ...ink,
          title: "Projetos recentes",
          images: images(
            "1600566753190-17f0baa2a6c3",
            "1600607687939-ce8a6c25118c",
            "1618221195710-dd6b41faaea6",
            "1586023492125-27b2c045efd7",
          ),
        },
        {
          bg: "#F3F1EC",
          textColor: "#10110F",
          accent: "#10110F",
          eyebrow: "Como trabalhamos",
          title: "Escuta primeiro. Desenho depois.",
          body: "Antes de qualquer planta, entendemos a rotina de quem vai viver ou trabalhar no espaço. É daí que saem as decisões que fazem um projeto envelhecer bem.",
          caption: "Arq. Daniela Rocha · CAU A12345-6",
        },
        {
          bg: "#F3F1EC",
          textColor: "#10110F",
          accent: "#10110F",
          title: "Do traço à obra",
          items: [
            {
              icon: "star",
              title: "Estudo",
              desc: "Levantamento, conceito e três opções de layout.",
            },
            {
              icon: "gauge",
              title: "Projeto",
              desc: "Plantas, 3D e memorial de materiais aprovados com você.",
            },
            { icon: "shield", title: "Obra", desc: "Acompanhamento semanal até a entrega." },
          ],
        },
        {
          bg: "#E9E2D3",
          textColor: "#10110F",
          accent: "#10110F",
          title: "Vamos começar o seu projeto?",
          cta: "Pedir orçamento",
        },
        {
          ...ink,
          accent: "#B9B4A9",
          brand: "Studio Norte",
          tagline: "Arquitetura com calma.",
          links: links("Projetos", "Escritório", "Contato"),
          copyright: "© 2026 Studio Norte",
        },
      ]),
    };
  })(),
  (() => {
    const roast: Colors = { bg: "#2B1A12", textColor: "#F6E9DC", accent: "#E8894A" };
    return {
      id: "cafe",
      name: "Cafeteria",
      segment: "Cafeteria",
      brand: "Grão & Brasa",
      description: "Cardápio do dia, cafés especiais e clube de assinatura.",
      typography: { headingFont: "Syne", bodyFont: "DM Sans", headingWeight: 700 },
      sectionIds: [
        "navbar.modern",
        "hero.split",
        "features.grid",
        "gallery.masonry",
        "testimonials.cards",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...roast,
          brand: "Grão & Brasa",
          links: links("Cafés", "Cardápio", "Clube"),
          ctaText: "Assinar",
        },
        {
          ...roast,
          showBadge: true,
          badge: "Torra desta semana",
          title: "Café de origem, torrado aqui toda semana",
          subtitle: "Espresso, filtrados e pães de fermentação natural, de segunda a sábado.",
          cta: "Assinar o clube",
          showSecondaryCta: true,
          ctaSecondary: "Ver cardápio",
          image: photo("1495474472287-4d71bcdd2085", 1200),
        },
        {
          ...roast,
          bg: "#331F15",
          title: "Por que o nosso é diferente",
          items: [
            {
              icon: "star",
              title: "Grãos 86+",
              desc: "Só cafés especiais, comprados direto de pequenos produtores.",
            },
            {
              icon: "zap",
              title: "Torra fresca",
              desc: "Torramos às segundas. Nada fica na prateleira por mais de 15 dias.",
            },
            {
              icon: "heart",
              title: "Feito com calma",
              desc: "Pães longos, bolos do dia e leite de pequenas fazendas.",
            },
          ],
        },
        {
          ...roast,
          title: "Um dia na cafeteria",
          images: images(
            "1509042239860-f550ce710b93",
            "1442512595331-e89e73853f31",
            "1501339847302-ac426a4a7cbb",
            "1447933601403-0c6688de566e",
          ),
        },
        {
          ...roast,
          bg: "#331F15",
          title: "Quem toma, recomenda",
          items: [
            {
              quote: "O melhor coado da cidade, sem frescura.",
              author: "Pedro · cliente desde 2021",
            },
            { quote: "O clube chega toda quinzena e nunca repete.", author: "Marina · assinante" },
            {
              quote: "O pão de fermentação natural acaba às 10h. Chegue cedo.",
              author: "Guia Café da Manhã",
            },
          ],
        },
        {
          bg: "#E8894A",
          textColor: "#2B1A12",
          accent: "#2B1A12",
          title: "250 g de café fresco a cada 15 dias",
          cta: "Assinar o clube",
        },
        {
          bg: "#1E120C",
          textColor: "#F6E9DC",
          accent: "#C9A98F",
          brand: "Grão & Brasa",
          tagline: "Rua do Sol, 45 · aberto às 7h",
          links: links("Cafés", "Clube", "Contato"),
          copyright: "© 2026 Grão & Brasa",
        },
      ]),
    };
  })(),
  (() => {
    const gym: Colors = { bg: "#0C0D10", textColor: "#F2F2EE", accent: "#D7FF3A" };
    return {
      id: "academia",
      name: "Academia e estúdio",
      segment: "Academia e estúdio",
      brand: "Pulso",
      description: "Modalidades, planos e aula experimental.",
      typography: { headingFont: "Syne", bodyFont: "Inter", headingWeight: 800 },
      sectionIds: [
        "navbar.modern",
        "hero.gradient",
        "features.grid",
        "gallery.masonry",
        "testimonials.cards",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...gym,
          brand: "PULSO",
          links: links("Aulas", "Planos", "Unidades"),
          ctaText: "Aula grátis",
        },
        {
          ...gym,
          bgImage: photo("1534438327276-14e5300c3a48"),
          bgOverlay: "55",
          glow: "#D7FF3A",
          eyebrow: "Turmas de até 14 alunos",
          title: "Treino forte. Comunidade melhor ainda.",
          subtitle: "Funcional, força e mobilidade com professor do seu lado o tempo todo.",
          cta: "Marcar aula experimental",
          ctaSecondary: "Ver planos",
          showStats: true,
          stats: [
            { value: "6h–22h", label: "Seg a sáb" },
            { value: "14", label: "Alunos por turma" },
            { value: "3", label: "Unidades" },
          ],
        },
        {
          ...gym,
          bg: "#121318",
          title: "Escolha o seu ritmo",
          items: [
            { icon: "zap", title: "Funcional", desc: "Circuitos de 45 minutos para o corpo todo." },
            {
              icon: "gauge",
              title: "Força",
              desc: "Técnica de levantamento com progressão semanal.",
            },
            { icon: "heart", title: "Mobilidade", desc: "Menos dor nas costas, mais amplitude." },
          ],
        },
        {
          ...gym,
          title: "Por dentro do estúdio",
          images: images(
            "1517836357463-d25dfeac3438",
            "1571019613454-1cb2f99b2d8b",
            "1540497077202-7c8a3999166f",
            "1534438327276-14e5300c3a48",
          ),
        },
        {
          ...gym,
          bg: "#121318",
          title: "Quem treina aqui",
          items: [
            { quote: "Em três meses perdi o medo do agachamento.", author: "Rafaela · aluna" },
            { quote: "A turma pequena faz toda a diferença.", author: "Thiago · aluno" },
            { quote: "Primeira academia em que eu não desisti.", author: "Jéssica · aluna" },
          ],
        },
        {
          bg: "#D7FF3A",
          textColor: "#0C0D10",
          accent: "#0C0D10",
          title: "Sua primeira aula é por nossa conta",
          cta: "Quero treinar",
        },
        {
          bg: "#08090B",
          textColor: "#F2F2EE",
          accent: "#A3A6AD",
          brand: "PULSO",
          tagline: "Treine com quem entende.",
          links: links("Aulas", "Planos", "Contato"),
          copyright: "© 2026 Pulso Studio",
        },
      ]),
    };
  })(),
  (() => {
    const ivory: Colors = { bg: "#FBF8F4", textColor: "#2B1B1F", accent: "#7A1F2B" };
    return {
      id: "joalheria",
      name: "Joalheria",
      segment: "Joalheria",
      brand: "Pérola & Ouro",
      description: "Coleções em close, histórias das peças e atendimento sob medida.",
      typography: { headingFont: "Playfair Display", bodyFont: "Inter", headingWeight: 500 },
      sectionIds: [
        "navbar.modern",
        "hero.split",
        "gallery.editorial",
        "text.quote",
        "features.grid",
        "cta.banner",
        "footer.dark",
      ],
      content: c([
        {
          ...ivory,
          brand: "Pérola & Ouro",
          links: links("Coleções", "Noivas", "Atendimento"),
          ctaText: "Agendar visita",
        },
        {
          ...ivory,
          showBadge: true,
          badge: "Coleção Maré",
          title: "Joias para os dias que você quer lembrar",
          subtitle: "Pérolas cultivadas e ouro 18k, desenhadas e finalizadas à mão.",
          cta: "Ver coleção",
          showSecondaryCta: true,
          ctaSecondary: "Atendimento sob medida",
          image: photo("1515562141207-7a88fb7ce338", 1200),
        },
        {
          ...ivory,
          bg: "#F3EDE6",
          title: "Peças da coleção",
          images: images(
            "1605100804763-247f67b3557e",
            "1611591437281-460bfbe1220a",
            "1599643478518-a784e5dc4c8f",
            "1515562141207-7a88fb7ce338",
          ),
        },
        {
          ...ivory,
          quote: "Uma joia boa não é a mais cara. É a que você não tira mais.",
          author: "Isadora Lins, ourives",
        },
        {
          ...ivory,
          bg: "#F3EDE6",
          title: "Por que escolher a gente",
          items: [
            {
              icon: "shield",
              title: "Garantia vitalícia",
              desc: "Limpeza e ajuste de aro sempre que precisar.",
            },
            { icon: "star", title: "Ouro certificado", desc: "Cada peça acompanha laudo de teor." },
            { icon: "heart", title: "Sob medida", desc: "Alianças e anéis desenhados com você." },
          ],
        },
        {
          bg: "#7A1F2B",
          textColor: "#FBF8F4",
          accent: "#FBF8F4",
          title: "Atendimento com hora marcada",
          cta: "Agendar visita",
        },
        {
          bg: "#2B1B1F",
          textColor: "#FBF8F4",
          accent: "#D9C3C7",
          brand: "Pérola & Ouro",
          tagline: "Joalheria autoral desde 1998.",
          links: links("Coleções", "Noivas", "Contato"),
          copyright: "© 2026 Pérola & Ouro",
        },
      ]),
    };
  })(),
];
