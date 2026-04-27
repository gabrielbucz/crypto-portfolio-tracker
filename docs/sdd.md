# Software Design Document (SDD)

## Visão Geral
O sistema CryptoTracker tem como objetivo exibir informações em tempo real sobre criptomoedas, permitindo que usuários acompanhem preços, variações percentuais e adicionem ativos ao seu portfólio de forma simples e rápida.

## Paleta de Cores
- Primary: #0D6EFD (azul principal utilizado em botões e destaque)
- Background: #F8F9FA (fundo geral da aplicação)
- Card Background: #FFFFFF (fundo dos cards)
- Text Primary: #212529 (texto principal)
- Text Secondary: #6C757D (texto secundário)
- Success: #198754 (valores positivos)
- Danger: #DC3545 (valores negativos)

## Tipografia
- Fonte principal: Arial, sans-serif
- Títulos:
  - H1: 32px, negrito
- Subtítulos:
  - 20px, semi-negrito
- Texto padrão:
  - 16px, regular

## Componentes

### Navbar
- Fundo: cor primária (#0D6EFD)
- Texto: branco
- Itens de navegação: Home, Favoritos, Portfólio

### Card de Criptomoeda
- Fundo: branco
- Borda: cinza claro
- Conteúdo:
  - Nome da criptomoeda
  - Sigla (ex: BTC, ETH)
  - Variação percentual
    - Verde para valores positivos
    - Vermelho para valores negativos
  - Preço atual
  - Botão "Adicionar"

### Botão Primário
- Cor de fundo: #0D6EFD
- Cor do texto: branco
- Borda arredondada
- Comportamento: mudança visual ao passar o mouse (hover)

## Layout
- Estrutura em grid responsivo
- Cards organizados em linhas
- Espaçamento interno padrão: 16px
- Margens externas: 24px
- Alinhamento centralizado para conteúdo principal

## Regras de Comportamento
- Valores positivos devem ser exibidos em verde
- Valores negativos devem ser exibidos em vermelho
- Botões devem apresentar efeito visual ao passar o mouse
- Interface deve ser responsiva para diferentes tamanhos de tela