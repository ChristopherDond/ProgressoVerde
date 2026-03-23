# Rastreador de Habitos Verdes (PWA)

PT-BR | [EN](README.md)

## Sobre
O Rastreador de Habitos Verdes e um app web gamificado e offline-first que ajuda a criar rotinas sustentaveis. Ele recompensa acoes diarias com pontos, sequencias e badges, enquanto exibe o impacto ambiental gerado.

## Novidades
- Experiencia unificada em pagina unica: secoes Home, Badges, Analise e Perfil no mesmo fluxo.
- Navegacao superior fixa com ancoras em rolagem suave e destaque automatico da secao ativa.
- Visual renovado inspirado em dashboards eco-futuristas (cards glassmorphism, glow mais rico e tipografia mais forte).
- Grafico semanal melhorado: agora renderizado em SVG com linha, area e pontos brilhantes.
- Responsividade refinada para tablet/mobile (menu quebrando em linhas, hero adaptavel e lista de habitos reorganizada).

## Destaques
- PWA offline com persistencia via IndexedDB
- Checklist diario de habitos com pontos e streak
- Badges e niveis para gamificacao
- Dashboard de impacto (CO2, agua, residuos)
- Cubo 3D interativo no topo com Three.js
- Grafico semanal de tendencia (linha SVG com glow)
- Navegacao entre secoes em pagina unica

## Stack
HTML, CSS e JavaScript puro  
Three.js (CDN) para a cena 3D do topo  
IndexedDB para armazenamento local  
Service Worker + Manifest para uso offline

## Estrutura do Projeto
- [index.html](index.html): layout principal em pagina unica e ancoras das secoes
- [styles.css](styles.css): tema visual, componentes glass, responsividade e estilo do grafico
- [app.js](app.js): logica IndexedDB, estatisticas/badges, grafico semanal SVG e navegacao suave
- [three-scene.js](three-scene.js): criacao e animacao do cubo 3D
- [sw.js](sw.js): estrategia de cache offline

## Rodando localmente
Use qualquer servidor estatico:

```
python -m http.server 5173
```

Depois acesse `http://localhost:5173`.

## Uso offline
Abra o app uma vez e adicione a tela inicial. Funciona offline e guarda tudo localmente no navegador.

## Dados
Todos os dados ficam no seu dispositivo. Nao ha backend nem API externa.
