# Rastreador de Habitos Verdes (PWA)

PT-BR | [EN](README.md)

## Sobre
O Rastreador de Habitos Verdes e um app web gamificado e offline-first que ajuda a criar rotinas sustentaveis. Ele recompensa acoes diarias com pontos, sequencias e badges, enquanto exibe o impacto ambiental gerado.

## Destaques
- PWA offline com persistencia via IndexedDB
- Checklist diario de habitos com pontos e streak
- Badges e niveis para gamificacao
- Dashboard de impacto (CO2, agua, residuos)
- Grafico semanal de completude

## Stack
HTML, CSS e JavaScript puro  
IndexedDB para armazenamento local  
Service Worker + Manifest para uso offline

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
