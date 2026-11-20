# Fieldwork 10x30 + Blue Book

Guia prático de aquisição de clientes para web design de conversão, com trilha de execução de 30 dias, CRM e diagnóstico de oportunidades por nicho.

## Como usar

1. Abra `index.html` e escolha **Começar meu primeiro diagnóstico**.
2. No Blue Book, selecione um nicho e avalie o caminho do visitante. O **Diagnóstico rápido** vem primeiro; a **Auditoria completa** é opcional.
3. Registre observações reproduzíveis. Para resultados comerciais, diferencie fatos, hipóteses e dados medidos.
4. Gere o relatório, copie uma abordagem comercial editável ou leve o diagnóstico escolhido ao CRM.
5. Continue pela trilha e consulte as lições do Blue Book sempre que precisar executar uma técnica.

Os dados são armazenados no navegador (`localStorage`). A passagem de um diagnóstico ao CRM depende de uma seleção explícita. O site é estático e não envia diagnósticos para um servidor.

## Organização

- `index.html`: painel, trilha, ofertas e CRM.
- `bluebook.html`: biblioteca e estudos aplicados.
- `bluebook-upgrades.js`: conteúdo e lições práticas do Blue Book.
- `conversion-audit.js`: auditoria progressiva, dez nichos, relatórios e integração com CRM.
- `fieldwork-design.css` e `conversion-audit.css`: estilos e responsividade.
- `index-enhance.js`: navegação e continuidade entre Blue Book e CRM.

## Testar

```bash
npm install
npm test
python3 -m http.server 8877
```

Na versão servida, abrir `http://localhost:8877/` e `http://localhost:8877/bluebook.html` em larguras de 360, 390, 768 e 1280 pixels. Para automação com navegador compatível, executar `npx playwright install chromium` uma vez e depois `npm run test:browser` enquanto o servidor estiver ativo. Em ambientes com Chromium do sistema, a variável `FIELDWORK_CHROMIUM_PATH` permite informar seu executável.

Os testes cobrem diagnóstico rápido e completo, armazenamento, migração de registros anteriores, recomendação prudente quando faltam provas, evidências visuais opcionais e passagem ao CRM. Uma auditoria heurística não comprova aumento de vendas: isso exige métricas e validação com o cliente.
