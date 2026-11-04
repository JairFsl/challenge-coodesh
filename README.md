# English Dictionary 

Aplicativo mobile em React Native para explorar palavras em inglês com rolagem infinita, ver significados, fonética e pronúncia, e salvar favoritos e histórico por usuário, com cache e sincronização offline.

> This is a challenge by [Coodesh](https://coodesh.com/)

## Tecnologias

- **Linguagem:** TypeScript 6
- **Framework:** React Native 0.88 (React Native CLI, nova arquitetura e Hermes), React 19
- **Back-end / DB:** Supabase (Auth com e-mail e senha, Postgres com Row Level Security)
- **Navegação:** React Navigation 7 (abas no topo e stack com modal)
- **Lista virtualizada:** FlashList 2
- **Dados e cache:** TanStack Query 5 com cache persistido
- **Estado global:** Zustand 5
- **Armazenamento local:** AsyncStorage 3
- **Conectividade:** NetInfo
- **HTTP e validação:** axios e zod 4
- **Injeção de dependência:** tsyringe
- **Áudio e voz:** react-native-sound (pronúncia gravada) e @mhpdev/react-native-speech (voz sintetizada nativa)
- **Estilização:** StyleSheet API com tema próprio (claro e escuro)
- **Testes:** Jest, React Native Testing Library 14 e Maestro (E2E)
- **Qualidade:** ESLint e Prettier
- **Gerenciador de pacotes:** Yarn 4 (versionado no repositório)
- **API de dicionário:** [Free Dictionary API](https://dictionaryapi.dev/)
- **Lista de palavras:** [dwyl/english-words](https://github.com/dwyl/english-words/blob/master/words_dictionary.json) (370.100 palavras)

## Como instalar e usar

### Opção 1: APK para Android (recomendada para avaliação)

1. Baixe o APK: **[english-dictionary.apk](https://github.com/JairFsl/challenge-coodesh/releases/latest/download/english-dictionary.apk)**
2. Instale no aparelho ou no emulador, permitindo instalar apps de fontes desconhecidas se o Android pedir. No emulador, basta arrastar o arquivo para a janela.
3. Entre com a conta de teste ou crie uma nova pela tela "Criar conta":

| E-mail | Senha |
|---|---|
| `teste@email.com` | `teste123` |

O APK já aponta para o projeto Supabase usado no desenvolvimento, com as 370 mil palavras carregadas. Ele funciona em celulares e em emuladores (arm64, armeabi-v7a, x86 e x86_64).

### Opção 2: rodar a partir do código

**Pré-requisitos**

- Node.js 22.11 ou superior
- Yarn. Qualquer versão instalada serve: o repositório usa o Yarn 4 que está em `.yarn/releases`.
- **Android:** Android Studio, Android SDK e JDK 17
- **iOS (somente macOS):** Xcode e Ruby com Bundler (para o CocoaPods)
- [Maestro](https://maestro.mobile.dev), apenas para os testes E2E

**Passo a passo**

```bash
git clone https://github.com/JairFsl/challenge-coodesh.git
cd challenge-coodesh
yarn install

cp .env.example .env
# preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY (veja "Configurando o Supabase" abaixo)

# iOS
bundle install
cd ios && bundle exec pod install && cd ..

yarn start          # Metro, em um terminal separado
yarn android        # ou: yarn ios
```

> Se o `pod install` falhar com o Ruby do sistema do macOS (2.6), use o Ruby do Homebrew:
> `PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec pod install`

**Scripts disponíveis**

| Comando | O que faz |
|---|---|
| `yarn start` | Inicia o Metro |
| `yarn android` / `yarn ios` | Compila e abre o app no emulador ou simulador |
| `yarn test` | Testes unitários e de integração (Jest) |
| `yarn typecheck` | Checagem de tipos do TypeScript |
| `yarn lint` | ESLint |
| `yarn format` / `yarn format:check` | Prettier |
| `yarn e2e:ios` / `yarn e2e:android` | Fluxos E2E do Maestro, exceto os de modo offline |
| `yarn e2e:android:offline` | Fluxos E2E em modo avião (exige um APK de release instalado) |
| `yarn seed:words` | Carrega a lista de palavras no Supabase |

**Configurando o Supabase**

Para usar o seu próprio projeto Supabase:

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Rode as migrations de `supabase/migrations/`, em ordem, no **SQL Editor** do painel ou com a CLI do Supabase (`supabase link` e `supabase db push`). Elas criam as tabelas, as políticas de RLS, os índices e o trigger do histórico.
3. Em **Authentication → Sign In / Providers → Email**, desligue **Confirm email**, para que o cadastro já entre no app.
4. Em **Project Settings → API Keys**, copie a URL, a publishable key e a secret key para o `.env`.
5. Rode `yarn seed:words`. O script baixa as 370 mil palavras e insere em lotes; pode ser repetido sem duplicar nada.
6. Remova a secret key do `.env`. Ela só é usada pelo script e nunca vai para o app.

> This is a challenge by [Coodesh](https://coodesh.com/)

---

## Requisitos do desafio

O enunciado original está em [`docs/CHALLENGE.md`](docs/CHALLENGE.md).

| Requisito | Status | Onde |
|---|---|---|
| Lista de palavras com rolagem infinita | ✅ | Aba **Word list**: grade de 3 colunas, páginas de 60 palavras |
| Ver a palavra, os significados e a fonética | ✅ | Modal de detalhe |
| Salvar e remover favoritos | ✅ | Estrela no detalhe; aba **Favorites** |
| Lista de palavras já vistas | ✅ | Aba **History**, da mais recente para a mais antiga |
| Obrigatório 2: cache das requisições | ✅ | Cache do TanStack Query persistido no aparelho |
| Obrigatório 3: seguir o wireframe | ✅ | Abas no topo, grade, card com fonética, player, "Meanings" e Voltar/Próximo |
| Diferencial 1: tocador de áudio | ✅ | Pronúncia gravada com barra de progresso; voz sintetizada como alternativa |
| Diferencial 2: injeção de dependência | ✅ | tsyringe com contratos no domínio |
| Diferencial 3: testes | ✅ | 85 testes no Jest e 8 fluxos E2E no Maestro |
| Diferencial 4: login e dados por usuário | ✅ | Supabase Auth; favoritos e histórico por `user_id`, protegidos por RLS |
| Extra: funcionamento offline | ✅ | Lista e significados já vistos ficam disponíveis; favoritos e histórico sincronizam ao reconectar |

## Decisões técnicas

### React Native CLI em vez de Expo
O projeto usa bibliotecas nativas de áudio e de voz, e o CLI dá controle direto sobre os projetos `ios/` e `android/`. Para facilitar a avaliação sem configurar um ambiente de desenvolvimento, há o APK pronto.

### Supabase como back-end
Supabase cobre autenticação, banco e regras de acesso no plano gratuito, sem servidor próprio.
- **`words`:** a lista de palavras, com a própria palavra como chave primária. Clientes só podem ler.
- **`favorites` e `history`:** chave primária `(user_id, word)`. O `user_id` tem como valor padrão `auth.uid()`, então o app nunca envia o id do usuário.
- **Row Level Security:** cada usuário só lê e altera as próprias linhas. Os privilégios padrão do projeto foram revogados e concedidos só no mínimo necessário.
- **Trigger `history_keep_latest_view`:** mantém sempre a visualização mais recente, para que dados sincronizados com atraso não façam o histórico "voltar no tempo".

### Lista de palavras no banco, com paginação por cursor
A API não tem um endpoint de listagem, e um arquivo de 370 mil palavras dentro do app deixaria o APK pesado. As palavras ficam no Supabase e são paginadas por **cursor** (`word > última_palavra order by word limit 60`), que usa o índice da chave primária e custa o mesmo em qualquer ponto da lista. Paginar com `OFFSET` ficaria mais lento a cada página.

### Cache das requisições (Obrigatório 2)
- As definições da Free Dictionary API ficam no cache do TanStack Query **sem expirar**, porque o significado de uma palavra não muda. Abrir a mesma palavra de novo não faz nova requisição, nem online nem offline.
- O cache é **persistido no AsyncStorage** e sobrevive ao fechamento do app.
- Palavras que a API não conhece (404) também ficam em cache como "não encontrada", para não repetir a requisição.
- Só erros de conexão geram nova tentativa automática; um 404 é tratado como resposta final.

### Validação de chamadas assíncronas
- Todas as requisições HTTP têm timeout (10 s) e são canceladas (`AbortSignal`) quando a tela que as pediu deixa de precisar delas.
- As respostas da API são validadas com zod antes de entrar no app.
- O carregamento de áudio tem limite de 8 s, e a voz sintetizada tem um tempo máximo de segurança, porque alguns motores de voz não avisam o fim da fala.
- Os erros viram tipos do domínio (`NetworkError`, `WordNotFoundError`, `AuthError`...) e são exibidos ao usuário em português, sempre com uma ação possível.

### Pronúncia (Diferencial 1)
- Quando a API fornece um áudio, o app toca a **gravação**, com a barra de progresso do wireframe.
- Sem gravação, sem internet ou se ela falhar, o app usa a **voz sintetizada do próprio aparelho**, que funciona offline. A legenda embaixo do player mostra qual das duas está tocando.

### Injeção de dependência (Diferencial 2)
- O domínio define **contratos**, como `FavoritesRepository` e `AudioPlayer`. A camada de dados os **implementa** com Supabase, axios e bibliotecas nativas.
- Um único arquivo, `src/di/container.ts`, liga cada contrato à sua implementação.
- Telas e casos de uso pedem só o contrato. Nos testes, o contêiner recebe implementações falsas em memória.
- Na prática, isso já foi útil: a biblioteca de voz original (`react-native-tts`) não compilava no Gradle 9 e foi trocada sem mexer em nenhuma tela.

### Sincronização offline
- **Ações locais primeiro:** favoritar ou abrir uma palavra muda a tela na hora e registra a ação numa **fila salva no aparelho**. Para a mesma palavra, só a última ação fica na fila.
- **Quando sincroniza:** ao entrar na conta, quando a internet volta, quando o app volta ao primeiro plano e logo depois de cada ação. Se falhar, tenta de novo depois de 15 s.
- **Ordem e segurança:**
  - A fila é enviada na ordem.
  - Se uma operação falhar, a sincronização para ali, e o restante continua guardado para a próxima tentativa.
  - Todas as operações podem ser reenviadas sem duplicar dados.
- **Cópia do servidor:** depois de enviar, o app baixa os dados do servidor e reaplica por cima o que ainda está pendente. Assim, mudanças feitas em outro aparelho também aparecem.
- **Por usuário:** os dados locais são separados por conta. Alterações pendentes de quem sai da conta ficam guardadas e são enviadas no próximo login dessa mesma conta.
- **Banner:** um banner avisa quando o app está offline e quantas alterações aguardam sincronização.

### Estado e armazenamento
- **TanStack Query:** dados vindos de servidores (lista de palavras e definições).
- **Zustand:** estado do app (sessão, favoritos, histórico e fila de sincronização).
- **AsyncStorage:** persistência de tudo isso, incluindo a sessão do Supabase. Tem integração direta com as três bibliotecas.

## Arquitetura

```
src/
├── core/            Configuração (.env validado), constantes, erros e utilitários
├── domain/          Regras de negócio em TypeScript puro (sem React, Supabase ou código nativo)
│   ├── entities/      Word, User, FavoriteWord, HistoryEntry, PendingOperation
│   ├── repositories/  Contratos de dados
│   ├── services/      Contratos de recursos nativos (AudioPlayer, SpeechService)
│   ├── usecases/      SignIn, SignUp, SignOut, GetWordPage, GetWordDefinition, SyncUserWords
│   ├── sync/          Regras da fila offline e da junção com o servidor
│   └── validation/    Validação de e-mail e senha
├── data/            Implementações: Supabase, Free Dictionary API (axios + zod) e bibliotecas nativas
├── di/              Contêiner de injeção de dependência (tsyringe)
├── presentation/    Telas, componentes, hooks, stores (Zustand), navegação e tema
├── test/            Implementações falsas e providers usados nos testes
└── types/           Tipos do módulo @env

supabase/migrations/   Schema, RLS, índices e trigger
scripts/               Seed da lista de palavras
.maestro/              Fluxos E2E (auth, words, user-words e subfluxos compartilhados)
```

## Testes

| Tipo | Ferramenta | O que cobre |
|---|---|---|
| Unitários e integração | Jest e React Native Testing Library | Regras da fila offline, casos de uso, repositórios (paginação, erros de rede e de servidor), mapeamento da API, player de áudio e voz, hooks, motor de sincronização e telas. 85 testes |
| End-to-end | Maestro | 8 fluxos em iOS e Android: cadastro e login, erros de validação, rolagem infinita, detalhe com pronúncia e Voltar/Próximo, favoritos e histórico vindos do servidor, cache offline da lista e do detalhe, e sincronização de um favorito marcado em modo avião |

Os fluxos offline usam o modo avião do emulador Android e só funcionam com um **APK de release**. A build de debug carrega o JavaScript do Metro, o que não é possível em modo avião.

## Limitações conhecidas

- **Áudio da Free Dictionary API:** durante o desenvolvimento, o servidor de pronúncias da API estava respondendo **502** para todas as palavras. Nesse caso o app usa a voz sintetizada automaticamente. O caminho da gravação foi validado no aparelho com um MP3 público.
- **Palavras sem definição:** muitas palavras da lista não existem na Free Dictionary API (404). O detalhe mostra "Sem definições" e ainda permite ouvir a pronúncia e navegar.
- **Primeiro acesso:** é preciso internet para entrar na conta e carregar as primeiras páginas. Depois disso, o que já foi visto funciona offline.
- **Conflitos entre aparelhos:** se a mesma palavra for favoritada num aparelho e desfavoritada em outro offline, vale a última alteração que **chegar** ao servidor.
- **iOS:** não há build distribuível para iOS. Ele roda a partir do código, no simulador.
- **Assinatura do APK:** o APK de release é assinado com a chave de debug do template do React Native. Isso basta para instlaar diretamente, mas não para publicar numa loja.

> This is a challenge by [Coodesh](https://coodesh.com/)