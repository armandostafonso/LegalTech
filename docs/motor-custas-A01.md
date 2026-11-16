# Motor de Custas A01 — Caderno jurídico e técnico

**Versão da interface:** 0.9 (experimental, novembro de 2026)  
**Espécie:** acção administrativa (CPTA)  
**Página:** `custas.html`

## Âmbito efectivamente implementado

1. Identificação da acção, valor da causa e objecto.
2. Consulta orientadora dos escalões da Tabela I-A até €275.000.
3. Simulação **separada** do remanescente, por coluna A/B/C, com indicação de decisão judicial e termo da instrução.
4. Triagem dos casos de não pagamento de segunda prestação previstos nas alíneas c) a f) do artigo 14.º-A do RCP.
5. Verificação do marco de 1 de dezembro de 2026 quanto à data do acto e da propositura da acção.
6. Fichas dos intervenientes A/B, com posição processual, entidade, isenção invocada, apoio judiciário, excepção à dispensa de pagamento prévio, condenação final e indicação de conferência documental.
7. Conferência aritmética de valores **introduzidos manualmente**, sem compensar quantias devidas ou pagas de partes diferentes.
8. Relatório de texto copiável e impressão.

## Normas confirmadas e cuidados de aplicação

| Questão | Norma | Tratamento do programa |
|---|---|---|
| Taxa-base por impulso | RCP 6.º/1 e Tabela I, coluna A | Calculadora indicativa; não contabiliza automaticamente |
| Recursos | RCP 6.º/2 e Tabela I, coluna B | Ainda não há motor de recursos |
| Complexidade | RCP 6.º/5 e Tabela I, coluna C | Remanescente pode ser simulado, sem aplicar complexidade automaticamente |
| 2.ª prestação | RCP 14.º e 14.º-A | Triagem de pressupostos, sem fixação da prestação |
| Remanescente | RCP 6.º/7 e 6.º/8 | Simulação isolada e advertências sobre a eventual não exigibilidade |
| Isenções | RCP 4.º | Assinaladas, não presumidas nem convertidas automaticamente em taxa zero |
| Apoio judiciário | Lei n.º 34/2004 | Registo do tipo de benefício; necessita da decisão |
| Pagamento prévio | RCP 15.º/1/a) | Distingue a dispensa prévia das isenções |
| Pagamento posterior | RCP 15.º/2 e 15.º/3 | Triagem dependente da aplicação temporal e da condenação em custas |
| Dispensa de elaboração da conta | RCP 29.º/1/a) | Apenas indicação para verificação humana |

**Regra temporal essencial:** o Decreto-Lei n.º 164/2026, de 6 de agosto, entra em vigor em **01-12-2026**. O seu artigo 8.º regula a aplicação a processos pendentes e excepciona, entre outras, a nova redacção do artigo 6.º do RCP, aplicável apenas a acções posteriores à entrada em vigor.

**Regra de separação:** as custas de parte não entram no cálculo da conta da secretaria. O programa não as soma às quantias a conferir.

## Limitações que bloqueiam o uso como conta oficial

- A taxa-base simulada não contempla isenções, reduções, prestações, regimes especiais, custas de recursos e incidentes.
- A selecção de uma alínea de isenção ou modalidade de apoio judiciário **não valida os respectivos requisitos materiais**.
- A ferramenta não lê autos nem comprovativos. Os pagamentos tidos como confirmados são declarados manualmente.
- O programa não determina a responsabilidade por custas nem executa o seu rateio em caso de decaimento.
- Não existe ainda razão de movimentos DUC, guia emitida, pagamento confirmado, anulação ou reembolso.
- Nem toda a quantia matematicamente positiva é legalmente exigível à parte que a introduziu.
- A aplicação usa memória temporária do navegador, sem envio ou gravação das respostas pelo próprio módulo. Evitar dados identificativos e informação confidencial.

## Testes

- Script: `node scripts/test-custas.mjs`.
- Verificação global da página: `node scripts/validate-site.mjs`.
- Integração contínua: `.github/workflows/custas-tests.yml`.

**A execução destes testes não certifica o resultado jurídico.** A bateria deve ser ampliada com casos históricos e confrontada com decisões de custas e pagamentos de exemplos fictícios.

## Próximas fases

1. Catálogo de versões legais e UC histórica.
2. Motor de prestações com estrutura de **obrigações por impulso**, para impedir duplicações.
3. Livro de movimentos por parte, documento e confirmação de pagamento, com tratamento de anulações e restituições.
4. Regimes de isenção, apoio judiciário, dispensa prévia e reduções, com fundamentação e controlo de efeitos temporais.
5. Repartição de encargos e remanescente conforme condenação e decisões judiciais.
6. Exportação da proposta de conferência, com indicação do grau de certeza e referências legais.
7. Ensaios de regressão funcional e revisão jurídica especializada antes de qualquer utilização em processos reais.

## Fontes oficiais

- [RCP (Decreto-Lei n.º 34/2008, texto consolidado)](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2008-34454975)
- [Decreto-Lei n.º 164/2026](https://diariodarepublica.pt/dr/detalhe/decreto-lei/164-2026-1154555254)
- [Decreto-Lei n.º 86/2018](https://diariodarepublica.pt/dr/detalhe/decreto-lei/86-2018-116809383)

> A versão consolidada é auxiliar de consulta. Deve confirmar-se sempre a redacção e a vigência dos actos pertinentes.
