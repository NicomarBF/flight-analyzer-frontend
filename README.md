# **Flight Analyzer - Front-end**

## **Descrição Geral**
O front-end do **Flight Analyzer** é uma interface de usuário desenvolvida para interagir com o back-end da aplicação, fornecendo uma experiência intuitiva e funcional para análise de voos. Ele permite que os usuários insiram dados relevantes, como aeroportos de origem e destino e a data/hora do voo, e apresenta os resultados da análise de maneira visualmente organizada e amigável.

A interface foi construída com **React.js** e utiliza o framework de componentes **Ant Design** para estilização e organização. O front-end comunica-se com o back-end por meio de chamadas HTTP assíncronas realizadas com **Axios**.

---

## **Funcionalidades**

### **1. Inputs de Dados**
- **Seleção de Aeroporto de Origem e Destino**: Campo de auto-completar com validação e pesquisa em uma lista pré-definida.
- **Data e Hora do Voo**: Campo de seleção com suporte a horário e formatação específica.

### **2. Botão de Análise**
- Dispara uma requisição para o back-end, enviando os dados do usuário e aguardando o retorno da análise.

### **3. Exibição dos Resultados**
- Apresenta:
  - Melhor companhia aérea recomendada.
  - Probabilidade de atraso no voo.
  - Tempo estimado de voo e atraso (se aplicável).
- Exibição em um card adicional ao lado do card de input.

---

## **Tecnologias Utilizadas**
- **React.js**: Biblioteca principal para construção da interface.
- **Ant Design**: Framework para componentes estilizados e responsivos.
- **Axios**: Para comunicação assíncrona com o back-end.
- **React Testing Library**: Para criação e execução de testes no front-end.

---

## **Arquitetura**

### **Componentização**
Os elementos da interface são organizados em componentes reutilizáveis:
1. **Formulário de Entrada**: Responsável pela coleta de dados do usuário.
2. **Exibição de Resultados**: Card dinâmico que apresenta os resultados retornados pela API.

### **Gestão de Estado**
- **React Hooks**: `useState` e `useEffect` para gerenciar o estado da aplicação e realizar chamadas à API.

### **Fluxo de Dados**
1. Usuário preenche os inputs e clica em "Analisar Voo".
2. Front-end valida os inputs e envia os dados ao back-end.
3. Resultados da análise são exibidos assim que retornam da API.

---

## **Setup e Execução**

### **Pré-requisitos**
- **Node.js**: Para gerenciar o ambiente de desenvolvimento.
- **npm ou yarn**: Para instalar as dependências.

### **Instalação**
1. Clone o repositório do front-end:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd flight-analyzer-frontend
   
2. Clone o repositório do front-end:
   ```bash
   npm install

3. Clone o repositório do front-end:
   ```bash
   npm start

4. Clone o repositório do front-end:
   ```bash
   http://localhost:3000
