# Motor de Custas A01 — Caderno jurídico e técnico

**Versão da interface:** 1.4 (experimental, novembro de 2026)  
**Espécie:** acção administrativa (CPTA)  
**Página:** `custas.html`

## Âmbito efectivamente implementado

1. Identificação da acção, valor da causa e objecto.
2. Consulta orientadora dos escalões da Tabela I-A até €275.000.
3. Simulação **separada** do remanescente, por coluna A/B/C, com indicação de decisão judicial e termo da instrução.
4. Triagem dos casos de não pagamento de segunda prestação previstos nas alíneas c) a f) do artigo 14.º-A do RCP.
5. Verificação do marco de 1 de dezembro de 2026 quanto à data do acto e da propositura da acção.
6. Fichas dos intervenientes A/B, com posição processual, entidade, isenção invocada, apoio judiciário, excepção à dispensa de pagamento prévio, condenação final e indicação de conferência documental.
7. Livro de movimentos financeiros **temporário**, com guias emitidas, anulações, pagamentos e restituições. Apenas movimentos financeiros confirmados pelo utilizador alteram os saldos; movimentos pendentes não entram no valor pago.
8. Transferência explícita dos pagamentos líquidos confirmados para a conferência, separada por parte. A emissão e a anulação de guias não constituem pagamento.
9. Validação de referências duplicadas por parte, tipo, data e valor; restrições à anulação sem guia correspondente e à restituição superior ao pagamento confirmado da mesma referência.
10. Conferência aritmética de valores devidos **introduzidos manualmente**, sem compensar quantias de partes diferentes.
11. Registo **manual de obrigações por impulso processual**, com parte responsável, tipo (petição, contestação, segunda prestação, recurso, incidente, remanescente e encargos), referência única por parte, montante em cêntimos e fundamento jurídico declarado pelo utilizador.
12. **Afectação facultativa dos movimentos financeiros** a obrigações da mesma parte, para apuramento de pagamento imputado e diferença por impulso. O pagamento confirmado continua a contar uma única vez no saldo da parte.
13. Transferência explícita **por substituição**, nunca por soma, dos totais das obrigações para a conferência, com detecção de duplicações e bloqueio da remoção de obrigações a que estejam associados movimentos.
14. Relatório copiável/imprimível com obrigações, movimentos, montantes e advertências. Alterar movimentos ou obrigações invalida o relatório anterior.

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
| Dispensa de elaboração da conta | RCP 29.º/1/a) e Portaria n.º 419-A/2009, 7.º-A | Apenas indicação para verificação humana; pressupostos têm de ficar documentados nos autos |
| Conta por sujeito processual | RCP 30.º/2 | Conferência separada por sujeito, sem compensação de valores de terceiros |

**Regra temporal essencial:** o Decreto-Lei n.º 164/2026, de 6 de agosto, entra em vigor em **01-12-2026**. O seu artigo 8.º regula a aplicação a processos pendentes e excepciona, entre outras, a nova redacção do artigo 6.º do RCP, aplicável apenas a acções posteriores à entrada em vigor.

**Regra de separação:** as custas de parte não entram no cálculo da conta da secretaria. O programa não as soma às quantias a conferir.

## Cálculo controlado da taxa-base (v1.2)

A interface contém uma calculadora autónoma **limitada** à taxa-base dos impulsos «petição inicial», «contestação» (coluna I-A) e «recurso» (coluna I-B). A partir da versão 1.3, a obrigação criada para I-A corresponde **apenas à primeira de duas prestações iguais**, e não ao total da taxa da Tabela I-A. Os treze escalões da Tabela I do RCP foram conferidos no texto legal aplicável desde **29 de março de 2012**. A unidade de conta processual é introduzida e confirmada pelo utilizador, atendendo à regra do artigo 5.º do RCP.

- Escalões da coluna I-A: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14 e 16 UC.
- Coluna I-B: metade dos valores da coluna A para os mesmos escalões.
- **Regra crucial do artigo 13.º, n.º 2:** em I-A, a taxa total é normalmente paga em duas prestações iguais. Exemplificando, 5 UC × 102 € = 510 € no total, ou 255 € por prestação. A calculadora regista primeiro 255 €, nunca 510 € como se fosse uma única prestação inicial.
- Acima de **275.000 €**, o programa limita o cálculo da taxa-base a 275.000 € e **não inclui o remanescente**.
- Acções anteriores a **29-03-2012** ficam bloqueadas para exigir enquadramento histórico específico.
- O cálculo **não determina** automaticamente a segunda prestação, o montante final da conta, as isenções, as reduções ou o regime de pagamento diferido.
- Uma obrigação calculada só é criada após confirmação expressa dos pressupostos pelo utilizador. Se a ficha da parte declarar isenção, apoio judiciário ou possível dispensa prévia, a criação fica bloqueada.
- As obrigações são criadas com referência única por parte; o mesmo impulso não é duplicado e os totais devidos continuam a ser transferidos **por substituição**.

### Referências para validação

- RCP, artigos 5.º, 6.º, 11.º e Tabela I.
- Lei n.º 7/2012, de 13 de fevereiro (vigência da tabela a partir de 29 de março de 2012).
- Decreto-Lei n.º 164/2026, artigos 8.º e 9.º: o novo artigo 6.º do RCP aplica-se apenas a acções propostas após 01-12-2026.

A data de propositura da acção não resolve isoladamente todas as regras transitórias, pelo que o cálculo fica sujeito a confirmação jurídica.

## Segunda prestação e remanescente (v1.4)

**Segunda prestação:** o programa procura uma obrigação de primeira prestação I-A gerada pela calculadora e calcula a segunda com base na diferença para o total da taxa. A segunda é criada com identificação própria e referência explícita ao impulso inicial, sem duplicação, após:
- Verificar as hipóteses do artigo 14.º-A, designadamente as alíneas b), c), d), e) e f).
- Confirmar que as condições de dispensa não se verificam e que a parte não beneficia de isenção ou apoio judiciário incompatível com o lançamento automático.
- Confirmar a data, os requisitos de notificação e o regime jurídico temporal.
- Confirmar expressamente a exigibilidade. O programa não calcula multas do artigo 14.º, n.º 3.

**Remanescente:** acima de 275.000 €, o utilizador pode registar uma obrigação com fundamento no artigo 6.º, n.ºs 7 e 8, e Tabela I, depois de verificar a conclusão da instrução, dispensa judicial total/parcial, repartição final e UC. A ferramenta calcula um remanescente teórico a partir dos blocos de 25.000 € ou fracção, mas **não o atribui automaticamente à parte vencida**, nem interpreta por si o despacho judicial. A percentagem que subsiste após a dispensa deve ser confirmada documentalmente.

**Limitações:** processos históricos e situações transitórias excepcionais podem implicar valores diferentes entre a primeira e a segunda prestações. Só são vinculadas automaticamente prestações geradas e validadas na calculadora. Não se impõem taxas devidas por impulsos para os quais o programa não tenha regime legal validado; nesses casos continuam disponíveis os registos manuais.

## Limitações que bloqueiam o uso como conta oficial

- A taxa-base simulada não contempla isenções, reduções, prestações, regimes especiais, custas de recursos e incidentes. As obrigações de recurso ou incidente são valores **manuais**, não calculados automaticamente.
- A selecção de uma alínea de isenção ou modalidade de apoio judiciário **não valida os respectivos requisitos materiais**.
- A ferramenta não lê autos nem comprovativos. Os pagamentos tidos como confirmados são declarados manualmente.
- O programa não determina a responsabilidade por custas nem executa o seu rateio em caso de decaimento.
- Existe um livro experimental de movimentos, mas não existe **conciliação automática documental** com CITIUS/SITAF, sistemas de pagamentos ou extratos oficiais. O estado «confirmado» é declarado pelo utilizador.
- Nem toda a quantia matematicamente positiva é legalmente exigível à parte que a introduziu.
- A aplicação usa memória temporária do navegador, sem envio ou gravação das respostas pelo próprio módulo. O livro perde-se ao actualizar ou fechar a página. Evitar dados identificativos e informação confidencial.
- A ferramenta apresenta, por enquanto, apenas duas fichas individualizadas (A/B), e uma rubrica agregada de outras quantias; não resolve a pluralidade de intervenientes.
- Um pagamento não imputado a obrigação específica integra o saldo financeiro por parte, mas não o saldo por impulso. A conferência é assinalada como incompleta se coexistirem obrigações e pagamentos confirmados sem imputação.
- A indicação «verificado» é uma declaração manual, não uma certificação do programa ou de uma autoridade judicial.

## Testes

- Script: `node scripts/test-custas.mjs` (59 casos técnicos na versão 1.4).
- Verificação global da página: `node scripts/validate-site.mjs`.
- Integração contínua: `.github/workflows/custas-tests.yml`.

**A execução destes testes não certifica o resultado jurídico.** A bateria deve ser ampliada com casos históricos e confrontada com decisões de custas e pagamentos de exemplos fictícios.

## Próximas fases

1. Catálogo de versões legais e UC histórica.
2. Motor de prestações com estrutura de **obrigações por impulso**, para impedir duplicações.
3. Evoluir a ligação entre movimentos e impulsos para várias partes, classificação do pagamento e conciliação documental segura.
4. Regimes de isenção, apoio judiciário, dispensa prévia e reduções, com fundamentação e controlo de efeitos temporais.
5. Repartição de encargos e remanescente conforme condenação e decisões judiciais.
6. Exportação da proposta de conferência, com indicação do grau de certeza e referências legais.
7. Ensaios de regressão funcional e revisão jurídica especializada antes de qualquer utilização em processos reais.

## Fontes oficiais

- [RCP (Decreto-Lei n.º 34/2008, texto consolidado)](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2008-34454975)
- [Decreto-Lei n.º 164/2026](https://diariodarepublica.pt/dr/detalhe/decreto-lei/164-2026-1154555254)
- [Decreto-Lei n.º 86/2018](https://diariodarepublica.pt/dr/detalhe/decreto-lei/86-2018-116809383)
- [Portaria n.º 419-A/2009 (texto consolidado)](https://diariodarepublica.pt/dr/legislacao-consolidada/portaria/2009-116457551)

> A versão consolidada é auxiliar de consulta. Deve confirmar-se sempre a redacção e a vigência dos actos pertinentes.
