# 📋 Board – Hibiscus Backend

> O Hibiscus é um conjunto de frontend e backend, facilmente hospedável na Render e Vercel, que oferece uma interface unificada para interação com APIs de LLMs. Este board documenta o backend, responsável por autenticação, segurança e integração com os serviços.

## 🗂 Epics

> Grandes blocos de funcionalidades.

1. **EPIC-1** – Autenticação e Segurança

2. **EPIC-2** – Quick Chat


---

## 📝 User Stories

> Formato: _Como [tipo de usuário], quero [ação], para [benefício]_

| ID     | Epic   | User Story                                                                                  | Critérios de Aceitação                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Status | Prioridade | Story Points | Título                                |
| ------ | ------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | ------------ | ------------------------------------- |
| US-001 | EPIC-1 | Como **usuário**, quero **fazer login com usuário e senha** para **acessar o client web**   | - Criar endpoint `POST /auth`- Validar credenciais via `.env`<br><br>- Autenticação via token JWT com Refresh Token<br><br>- Criar endpoint `POST /auth/refresh`                                                                                                                                                                                                                                                                                                                                                                         | New    | Alta       | 5            | Implementar login com usuário e senha |
| US-002 | EPIC-1 | Como **usuário**, quero **proteger meu acesso com token 2FA** para **assegurar meu client** | - Definir segredo 2FA via `.env`<br><br>- Gerar QR Code ou chave para configuração<br><br>- Validar token no login após autenticação básica<br><br>- Adicionar campo 2FA opcional no login, retornando erro específico quando usuário correto mas enviado sem 2FA<br><br>- Adicionar condicional de ativação ou desativação do 2FA no `.env`                                                                                                                                                                                             | New    | Alta       | 5            | Implementar autenticação 2FA          |
| US-003 | EPIC-2 | Como **usuário**, quero **iniciar um chat** para **falar com uma LLM**                      | - Criar endpoint `POST /chat/quick-chat`<br><br>- Endpoint deve receber os parâmetros: array de mensagens, usar stream, usar truncation, usar tools, temperatura, modelo da OpenAI e prompt de sistema<br><br>- Caso não sejam enviados esses parâmetros (apenas o array de mensagens é obrigatório; enviar vazio se não houver conversas), usar valores padrão do `.env`. Caso não existam, retornar erro<br><br>- Em caso de erro no endpoint da API da OpenAI, retornar o erro da API com a descrição baseada na documentação oficial | New    | Alta       | 2            | Implementar quick chat                |

> 💡 **Commits e PRs**: Sempre incluir o ID da story no título. Ex.: `feat: US-001 - implementa login com usuário e senha`

---

## 📌 Board – Fluxo de Trabalho

> Etapas do processo, simulando um Kanban com colunas.

### 🆕 New

- US-001 – Implementar login com usuário e senha

- US-002 – Implementar autenticação 2FA

- US-003 – Implementar quick chat


### 🔍 Refinamento

- _(vazio no momento)_


### 📥 Backlog

- _(vazio no momento)_


### 🛠 Doing

- _(vazio no momento)_


### 📤 Pull Request / Peer Review

- _(vazio no momento)_


### ✅ Done

- _(vazio no momento)_


---

## 🔍 Observações

- Limite de WIP (Work in Progress): máximo de 2 stories em "Doing" simultaneamente.

- Revisões de PR simuladas mesmo em projeto solo (self-review com checklist).

- Commits e PRs sempre vinculados a uma User Story.