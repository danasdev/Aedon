# Aedon — tokens e interação do editor

Design de referência: Figma "Aedon — Nova interface" (https://www.figma.com/design/VnY4Rf30YJigVyu8zpgtEx), página "Nova interface".

## Fundação

- O Aedon é um produto da Entropy e usa a paleta dela, mais uma cor de interação. Os tokens ficam em `src/styles.css` (`:root`):
  - `void` `#0a0a0a` (fundo), `panel` `#121211`, `surface` `#181817`, `surface-2` `#201f1d`, `hairline` `#2e2d2b` (bordas);
  - `ink` `#f5f4f1` (texto), `ink-muted` `#a3a19b`, `faint` `#6b6964` (rótulos);
  - `grain` `#d8cfbd` só nos rótulos `// mono` (eyebrows) e números; `chrome` `#d9d9d6` para um brilho raro;
  - `ion` `#3ccfe0` (ciano gelo) e `ion-deep` `#1a8a99`: **somente** seleção, foco, item ativo e ação principal (~3% da tela). Nunca no logo, em texto corrido ou como decoração.
- Tipografia: Archivo 900 em caixa alta para títulos (`.ae-display`, `.ae-title`), Inter para a interface, JetBrains Mono para rótulos (`.ae-eyebrow` em grain, `.ae-label` em faint).
- Estilo das peças (referência kinetics.colorion.co): botões em pílula com borda inferior "física" (`.ae-btn`, `.ae-btn-primary` com sombra `ion-deep`), chips em mono (`.ae-chip`), cards em leve degradê `panel → surface` com borda fina (`.ae-tile`), controles segmentados (`.ae-seg`).
- Logo: bloco com três barras (as seções de uma página), em `ink` sobre `void` (regra de logo da Entropy). Componente `AedonMark` / `AedonLogo`; favicon em `public/favicon.svg`.
- Movimento: 160 ms para flutuantes, 220 ms para painéis, mola `--spring` no toque dos botões. `prefers-reduced-motion` desliga as entradas.

## Modelo de interação

1. **Clique no que quer mudar.** Clique seleciona texto, imagem ou botão; qualquer outra área seleciona a seção. Esc sobe um nível (elemento → seção → nada).
2. **Uma barra, sempre no topo do canvas** (`ContextToolbar`), fora da página. Muda com a seleção:
   - nada: dica de uso;
   - seção: fundo, **Editar conteúdo**, subir, descer, duplicar, ocultar, excluir;
   - texto/botão: **Editar texto** (edição no lugar), tamanho, negrito, itálico, alinhamento, cor, voltar ao original, voltar à seção;
   - imagem: **Trocar imagem** (enviar ou colar link), tamanho, voltar ao original.
3. **Nada abre ou fecha sozinho.** A coluna da esquerda tem quatro painéis — Adicionar, Páginas, Camadas, Estilo — que só mudam quando clicados. "Editar conteúdo" abre a gaveta da direita (`ContentDrawer`) com os campos da seção em ordem de leitura.
- **"+ Adicionar seção"** aparece entre blocos ao passar o mouse e insere exatamente ali.
- Página vazia mostra páginas prontas (`EmptyPageStart`); "Criar site" no dashboard pede nome e ponto de partida e abre o editor com o modelo aplicado (`?preset=`).
- Ajustes por elemento (posição, tamanho, cor, peso, itálico, alinhamento) ficam em `elementLayout` e são aplicados igual no canvas e no HTML exportado (`elementLayoutCss`).
- Telas estreitas (< 1024 px): painéis e gaveta viram sobreposição.

## Auditoria de interação

- Seleção de texto, imagem, botão e seção; Esc; edição no lugar; troca de imagem.
- Adicionar entre seções, arrastar bloco para o canvas, páginas prontas, criar site com modelo.
- Páginas: criar, renomear, duplicar, tornar inicial, excluir com confirmação e desfazer.
- Foco por teclado visível (anel `ion`) e redução de movimento.
