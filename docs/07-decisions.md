# Decisões — Aedon

## Interação contextual do editor

- Data: 2026-09-26.
- Estado: solicitada pelo usuário, implementada e validada localmente.
- Fonte: pedido atual do usuário e imagem de referência do Canva.
- Decisão: seleção de cada elemento exibe contorno, alças e ações no próprio canvas; arrastar o selecionado move diretamente, sem alternar um modo global. O painel lateral permanece opcional para ajustes finos.
- Justificativa: o fluxo anterior exigia procurar um controle distante do objeto e confundia edição de elemento com edição de seção.
- Impacto: `Canvas.tsx`, `ElementSelection.tsx`, `PropertiesPanel.tsx`, `EditorShell.tsx`, `layout.ts` e documentação de tokens.
- Aprovação adicional: não necessária para a implementação local solicitada; publicação não autorizada por este registro.

## Interface simplificada do editor

- Data: 2026-10-29.
- Estado: solicitada pelo usuário, implementada e validada localmente (typecheck, build e teste no navegador).
- Decisão: o editor segue um modelo único — clicar no site seleciona algo e o painel direito mostra só o que se aplica à seleção (nada: ajustes do site; seção: conteúdo e cores; elemento: cor, com posição e tamanho recolhidos).
- Mudanças: barra única no topo (projeto, página, desfazer/refazer, tela, prévia, exportar, conta); páginas em seletor com menu por linha; barra de seção fora do preview; clique seleciona só texto, imagem e botão (wrappers selecionam a seção); biblioteca em 2 abas (Adicionar, Seções) com presets em destaque; página vazia oferece presets; dashboard com card clicável e menu "⋯"; exclusões com diálogo de confirmação.
- Removido por redundância: faixa de abas de página, menu "…" do topo, seletor de fundo solto no canvas, barra "Seção" dentro do preview, abas Seção/Elemento/Tipografia/Preços, navegação em 3 níveis da biblioteca.
- Pendência: dividir `PropertiesPanel`, `SectionLibrary` e `Canvas` em arquivos menores; publicação não solicitada.

## Reconstrução da interface (Entropy + terceira cor)

- Data: 2026-10-29.
- Estado: aprovada pelo usuário no Figma (estilo) e na escolha de cor; implementada e validada localmente.
- Fonte: pedido do usuário para refazer tudo, desenhar antes no Figma e se basear nos assets de kinetics.colorion.co; paleta da Entropy mantida; terceira cor escolhida: ciano gelo `#3ccfe0`, trocada depois por creme `#e8d9bc` (já usado nos vídeos da empresa; o preto e branco ficava monótono).
- Decisão: interface grafite com linguagem visual do Kinetics (Archivo, mono, pílulas com borda física) e cores da Entropy; terceira cor reservada à interação no editor; logo novo em ink. Interação: barra contextual única no topo do canvas, coluna com Adicionar/Páginas/Camadas/Estilo, "+ Adicionar seção" entre blocos, gaveta "Editar conteúdo" sob demanda, criação de site com modelo.
- Substitui: decisões "Interação contextual do editor" e "Interface simplificada do editor" acima.
- Pendências: reimportar no Figma as telas com a paleta final (limite do plano Starter do Figma MCP atingido); dividir `ContentDrawer.tsx` (campos herdados do antigo painel de propriedades).
