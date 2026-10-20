# PlanoRoxo ERP - Planejamento e Controle da Produção (PCP)

Sistema web completo, funcional e intuitivo desenvolvido para pequenas empresas, marcenarias, metalúrgicas, confecções e oficinas industriais.

---

## 🚀 Módulos Implementados e Testados

1. **Painel Geral (Dashboard)**
   - Resumo em tempo real de pedidos em aberto, faturamento projetado, ordens de produção em andamento e indicador de ocupação da fábrica.
   - Alertas visuais imediatos para insumos em ponto crítico (estoque mínimo).
   - Atalhos para nova OP, novo pedido e avanço rápido de etapas no chão de fábrica.

2. **Ficha Técnica do Produto (BOM - Bill of Materials)**
   - Cadastro estruturado de produtos acabados com categoria, código SKU, preço de venda e tempo de processo (minutos por unidade).
   - Composição dinâmica de matérias-primas com cálculo instantâneo do Custo Unitário e da Margem Bruta (R$ e %).
   - Modal de inspeção detalhada da ficha técnica com porcentagens de insumos.
   - **Opção de Impressão / Salvar PDF**: impressão individual de ficha técnica por produto ou catálogo completo com instruções operacionais para a bancada e campos de assinatura técnica.

3. **Estoque de Matérias-Primas**
   - Controle de insumos com código SKU, unidade de medida (`un`, `kg`, `g`, `m`, `m²`, `l`, `ml`, `pç`), saldo atual, estoque mínimo de segurança e custo unitário médio.
   - Ajuste rápido de saldo (+ Entrada ou - Saída) com histórico completo de movimentações rastreáveis.
   - Alertas com destaque para itens abaixo do ponto de reposição.
   - **Opção de Impressão de Relatório de Insumos / Almoxarifado**: relatório profissional formatado para folha A4 e PDF com valor total imobilizado em estoque, saldo atual, estoque mínimo, localização, fornecedor e campos de assinatura de conferência física.

4. **Clientes e Fornecedores**
   - Cadastro comercial completo com nome/razão social, nome fantasia, documento (CPF ou CNPJ formatado), e-mail, telefone/WhatsApp e endereço.
   - Classificação por perfil: *Cliente*, *Fornecedor* ou *Ambos*.
   - Filtros rápidos por tipo de parceiro.

5. **Capacidade Produtiva da Fábrica**
   - Configuração da jornada operacional: horas diárias, dias úteis semanais, operadores/bancadas ativas e fator de eficiência (%).
   - Cálculo automático da capacidade líquida disponível (horas/semana e horas/mês) e do nível de ocupação atual pelas ordens ativas.
   - **Simulador de Prazos e Carga**: teste o impacto de qualquer lote na capacidade e obtenha o prazo estimado de entrega antes de fechar a venda com o cliente.
   - Tabela de *Throughput* com capacidade máxima teórica de cada produto.

6. **Pedidos de Venda**
   - Emissão de pedidos com cliente, data de emissão, prazo de entrega, itens múltiplos com cálculo de subtotais e valor global.
   - Status de pedido: *Pendente*, *Confirmado*, *Em Produção*, *Pronto*, *Entregue*, *Cancelado*.
   - **1-Clique para Gerar OPs**: gera automaticamente as Ordens de Produção vinculadas para cada produto do pedido, calculando a data de entrega conforme a capacidade.

7. **Ordens de Produção (OP)**
   - Controle de fabricação com código sequencial, prioridade (*Normal*, *Alta*, *Urgente*), data de início e prazo final calculado.
   - Esteira de 6 estágios operacionais: *1. Preparação* ➔ *2. Corte/Usinagem* ➔ *3. Montagem* ➔ *4. Acabamento* ➔ *5. Qualidade* ➔ *6. Concluído*.
   - **Verificação e Baixa de Estoque**: confere se todos os insumos da receita estão disponíveis no almoxarifado e debita as quantidades em 1 clique.

8. **Persistência e Segurança dos Dados**
   - Armazenamento em `localStorage` com carregamento inicial de dados demonstrativos.
   - Exportação completa do banco de dados em arquivo `.json` (Backup).
   - Importação/Restauração de backups `.json`.
   - Botão de restauração para os dados padrão de fábrica.

---

## 🛠️ Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# 3. Compilar e testar build de produção
npm run build
```

---

## ☁️ Como Publicar na Vercel (Passo a Passo)

Este projeto foi especialmente preparado para publicação na **Vercel** sem erros de build, sem rotas 404 quebradas e sem necessidade de configurar bancos de dados externos:

### 1. Suba o código para o GitHub
```bash
git init
git add .
git commit -m "feat: PlanoRoxo ERP"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

### 2. Importe no painel da Vercel
1. Acesse [vercel.com](https://vercel.com) e entre na sua conta.
2. Clique no botão **"Add New..."** ➔ **"Project"**.
3. Selecione o seu repositório no GitHub e clique em **"Import"**.

### 3. Confirme as configurações de Build
A Vercel detecta automaticamente os valores abaixo:
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (raiz do projeto)
- **Build Command**: `npm run build` (ou `vite build`)
- **Output Directory**: `dist`

### 4. Variáveis de Ambiente
- **Nenhuma variável de ambiente é obrigatória** para o sistema rodar perfeitamente em produção.
- Os dados do ERP permanecem salvos no navegador de cada usuário.

### 5. Finalize o Deploy
Clique no botão **"Deploy"**. Em menos de 1 minuto, a Vercel fornecerá o link seguro `https://seu-projeto.vercel.app`. O arquivo `vercel.json` incluso na raiz cuidará de redirecionar todas as rotas diretamente para a aplicação SPA sem telas em branco.
