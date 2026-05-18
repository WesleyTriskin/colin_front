# Tarefas para a API DataAgrin (Backend)

Este documento lista as atualizações necessárias na API DataAgrin, que devem ser implementadas assim que houver acesso à VPN, para integrar 100% o novo Painel DataAgrin.

## 1. Endpoint de Status do Número (Opção 2)
O painel front-end já está preparado para enviar um `POST` toda vez que um botão de status (OK, Instável, Banido, Maint) for clicado. 

**O que precisamos criar:**
- **Rota:** `POST /api_data/v1/farms/status`
- **Payload esperado:**
  ```json
  {
    "farm_key": "gjacana",
    "phone_number": "5511959640107",
    "status": "ban"
  }
  ```
- **Ação no Banco:** O endpoint deve receber esse payload e atualizar a coluna de status na tabela correta (ex: `colin.farm_contacts` ou `colin.farms`) correspondente àquele número/fazenda.

## 2. Tokens de Autenticação (JWT)
O painel atualmente tem os tokens hardcoded para `gjacana` e `fazenda_ws`, mas faltam os das outras fazendas.
- **Ação:** Gerar os tokens definitivos para **Apoloni** e **Piccini** e inseri-los no arquivo `index.html` (na constante `TOKENS`).

## 3. Dados Dinâmicos da Tabela de Fazendas (Wallets)
Atualmente, as carteiras (Wallets Link2Go) estão hardcoded no frontend (`6084` e `6055`).
- **Ação:** Criar um endpoint `GET /api_data/v1/farms` (ou adaptar um existente) que retorne a lista de fazendas ativas, seus respectivos `farm_key`, `wallet_id` e número de telefone principal.
- **Integração:** Assim o front-end poderá montar a barra de botões de fazenda dinamicamente, sempre puxando a carteira real direto do banco de dados.

## 4. Health Check Contínuo e Alertas (Ticker)
O front-end já possui uma barra de letreiro (ticker) que avisa sobre números banidos e endpoints lentos (> 5000ms).
- **Evolução:** Criar um script ou task no backend que faça o ping nos endpoints (ex: `summary_history`, `machine_summary`) a cada 15 ou 30 minutos.
- **Ação no Banco:** Salvar o tempo de resposta em uma tabela de logs/health. Se o tempo for maior que 5000ms, o endpoint pode fornecer essa informação em tempo real para que o letreiro do front-end apenas consuma esses alertas sem precisar "pingar" tudo do navegador do usuário.
