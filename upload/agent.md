# AGENT.md

# Projeto

Nome: **Hevy Web**

Objetivo:
Criar uma aplicação web inspirada no aplicativo Hevy, focada em treinamento de musculação, registro de exercícios e evolução do usuário.

O objetivo não é reinventar o fluxo do aplicativo, mas oferecer praticamente a mesma experiência de uso em ambiente web, utilizando tecnologias modernas.

---

# Objetivos principais

O sistema deve permitir que um usuário consiga:

* Criar treinos
* Criar divisões (ABC, Push Pull Legs, Upper Lower etc.)
* Registrar um treino completo
* Visualizar evolução
* Registrar peso e repetições
* Acompanhar recordes pessoais
* Controlar descanso entre séries
* Consultar biblioteca completa de exercícios
* Ver GIFs/animações de execução
* Utilizar em computador, tablet e celular.

Toda a experiência deve ser extremamente rápida.

---

# Inspiração

A principal referência é o aplicativo **Hevy**.

O layout, UX, organização e fluxo devem seguir a mesma linha.

Sempre que existir dúvida de interface, utilizar o Hevy como referência.

---

# Stack

Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* Shadcn/UI
* Framer Motion
* TanStack Query

Backend

* NestJS

Banco

* PostgreSQL

ORM

* Prisma

Autenticação

* JWT
* Refresh Token

Storage

* Supabase Storage

Deploy

* Docker
* Docker Compose

---

# Arquitetura

Separar claramente:

Frontend

Backend

API

Banco

Nunca misturar regras de negócio no frontend.

Toda regra de cálculo deve existir no backend.

---

# Responsividade

A aplicação deve ser Mobile First.

Também deve funcionar perfeitamente em:

Desktop

Tablet

iPhone

Android

---

# Design

Tema moderno.

Dark Mode como padrão.

Visual inspirado em:

Hevy

Apple Fitness

Notion

Spotify

Muito espaçamento.

Animações suaves.

Pouca poluição visual.

---

# Funcionalidades

## Cadastro

* Login
* Cadastro
* Recuperação de senha
* Perfil

---

## Perfil

Peso

Altura

Sexo

Data de nascimento

Objetivo

Foto

Bio

---

# Exercícios

Criar uma biblioteca completa contendo:

Nome

Grupo muscular

Músculos secundários

Equipamento

Categoria

GIF de execução

Imagem

Descrição

Execução passo a passo

Erros comuns

Dicas

Tipo de equipamento

Nível de dificuldade

---

Cada exercício deverá possuir:

Imagem

GIF

Vídeo (opcional)

---

# Biblioteca de mídia

Todos os exercícios deverão possuir mídia.

Priorizar GIFs.

Caso exista vídeo curto em MP4 também pode ser utilizado.

A arquitetura deve permitir trocar facilmente a origem da mídia futuramente.

---

# Pesquisa

Busca instantânea.

Filtros por:

Grupo muscular

Equipamento

Nome

Categoria

Nível

---

# Criador de treino

O usuário pode criar:

Treino A

Treino B

Treino C

Treino Push

Treino Pull

Treino Legs

Treino Upper

Treino Lower

Treino Full Body

ou qualquer nome personalizado.

---

Cada treino contém:

Lista de exercícios

Ordem

Observações

Descanso padrão

---

# Exercício dentro do treino

Cada exercício possui:

Número de séries

Carga

Repetições

RPE (opcional)

RIR (opcional)

Observações

Tempo de descanso

---

# Durante o treino

Ao iniciar um treino:

Mostrar somente os exercícios.

Interface extremamente limpa.

Cada série pode ser marcada como concluída.

Após concluir uma série:

Iniciar automaticamente um timer de descanso.

---

# Timer

Ao finalizar qualquer série:

Iniciar cronômetro.

Permitir:

Pausar

Reiniciar

Alterar tempo

Silenciar

Vibrar (mobile)

Emitir som ao terminar

Notificação quando finalizar

---

# Histórico

Salvar absolutamente tudo.

Cada treino realizado deve registrar:

Data

Hora

Duração

Carga

Repetições

Volume

Tempo de descanso

Observações

---

# Progressão

Mostrar evolução por exercício.

Gráficos.

Volume semanal.

Volume mensal.

Carga máxima.

Repetições máximas.

Frequência.

---

# Recordes

Mostrar automaticamente:

Maior carga

Maior volume

Maior número de repetições

Maior número de séries

Maior duração

Recordes devem aparecer durante o treino.

Exemplo:

🏆 Novo recorde!

---

# Estatísticas

Dashboard contendo:

Treinos realizados

Dias consecutivos

Volume total

Carga total levantada

Exercício favorito

Grupo muscular mais treinado

Tempo médio de treino

---

# Calendário

Mostrar dias treinados.

Heatmap estilo GitHub.

---

# Favoritos

Favoritar exercícios.

---

# Notas

Adicionar observações por exercício.

---

# Offline

A aplicação deverá funcionar parcialmente offline.

Sincronizar automaticamente quando houver conexão.

---

# Performance

Priorizar velocidade.

Utilizar:

Lazy Loading

Code Splitting

Cache

Prefetch

Virtualização de listas

---

# Banco de exercícios

A estrutura deve permitir importar milhares de exercícios.

Nunca deixar os exercícios hardcoded.

---

# Organização do código

Componentes reutilizáveis.

Hooks separados.

Services separados.

Repositories separados.

Controllers separados.

Nunca duplicar código.

---

# Qualidade

Sempre utilizar:

TypeScript estrito.

ESLint.

Prettier.

Testes unitários.

Testes E2E.

---

# Acessibilidade

Compatível com WCAG.

Suporte a teclado.

ARIA Labels.

Contraste adequado.

---

# Funcionalidades futuras

Sistema social

Seguir amigos

Curtir treinos

Comentários

Compartilhar treino

Importar treino

Exportar treino

QR Code

Aplicativo PWA

Push Notifications

Wear OS

Apple Watch

Integração Health Connect

Integração Apple Health

Integração Garmin

Integração Strava

Integração Fitbit

---

# Estrutura de pastas

/apps
/web

/packages
/ui
/types
/utils
/config

/backend
/src

/prisma

/docker

/docs

---

# Filosofia

Sempre escolher soluções simples.

Evitar dependências desnecessárias.

Código limpo.

Código legível.

Alta performance.

Baixo tempo de carregamento.

Excelente experiência do usuário.

O resultado final deve ser uma aplicação web que ofereça uma experiência equivalente ou superior ao aplicativo Hevy, respeitando boas práticas de engenharia de software, escalabilidade, manutenibilidade e desempenho.
