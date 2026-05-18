# Colin Control Panel Dashboard

Este é um projeto front-end de monitoramento **completamente separado** do backend do Colin, desenvolvido seguindo as especificações mais avançadas de design HSL/Glassmorphic do **UI/UX Pro Max**.

## 🚀 Funcionalidades Integradas
1. **Envios & Contatos (Aba 1):**
   * Exibição em tempo real do último envio de mensagem gerado pelo Colin para as fazendas (`Jaçanã`, `WS`, `Apolloni` e `Piccini`), consumido dinamicamente da API em produção.
   * Controle visual de status dos números por fazenda com indicadores coloridos inteligentes:
     * 🟢 **Funcionando (Green):** Pronto e operando perfeitamente.
     * 🟡 **Inconsistente (Yellow):** Atenção requerida.
     * 🔴 **Banido (Red):** Número banido temporariamente ou permanentemente.
     * 🔵 **Manutenção (Blue):** Número sob manutenção e auditoria técnica.
   * Botões rápidos de controle que permitem alterar os status e salvá-los de forma persistente através do `localStorage`.

2. **Status da API & Dados (Aba 2):**
   * **Health Check em tempo real:** Realiza testes automáticos nos endpoints da API de produção (`Root`, `/chat/logs`, `/commodities/news`, `/commodities/prices`, `/weather/farm-forecast`) exibindo se estão online (UP) ou offline (DOWN) por meio de LEDs indicadores dinâmicos.
   * **Explorador JSON Integrado:** Visualização e análise instantânea das respostas brutas em JSON dos dados de clima, cotações de commodities cruas e histórico de disparo de relatórios.

---

## 🎨 Paleta de Cores e Estilo (Design System)
Construído com variáveis CSS customizadas no `:root` para extrema flexibilidade de branding e refinamento estético:
*   `--primary`: `#FF7A00` (Laranja Colin vibrante com neon glow)
*   `--bg-dark`: `#090d16` (Fundo profundo com gradientes radiais sofisticados)
*   `--bg-card`: `rgba(17, 25, 40, 0.75)` (Glassmorphism com efeito blur translúcido)
*   `--border-color`: `rgba(255, 255, 255, 0.08)` (Bordas ultrafinas e limpas)

---

## 📂 Estrutura do Projeto Separado
*   `index.html`: Arquivo principal da aplicação contendo estrutura, estilização e lógica javascript de consumo.
*   `README.md`: Este guia completo de documentação.
