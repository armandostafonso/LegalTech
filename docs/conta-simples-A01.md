# Conta simples A01 · LegalTech Suite

**Entrada principal:** [custas.html](../custas.html)  
**Análise de regimes especiais:** [custas-tecnico.html](../custas-tecnico.html)  
**Âmbito:** proposta experimental de conferência da taxa de justiça pelos impulsos da petição inicial e da contestação, em acção administrativa.

## Como utilizar

1. Indicar o **valor da causa fixado na sentença ou decisão relevante**, a UC aplicável ao processo e, de preferência, a data de propositura.
2. Na **petição inicial**, inserir simplesmente o **total comprovadamente pago**. Se for necessário, assinalar «Discriminar por prestações» para introduzir separadamente os pagamentos da primeira e da segunda. O total não é somado novamente aos pagamentos discriminados.
3. Na **contestação**, assinalar se a entidade demandada (por exemplo, a Autoridade Tributária) apresentou ou não contestação. Se não contestou, **não é criada taxa de justiça por esse impulso**. Se contestou, indicar o **total pago** (ou discriminar prestações facultativamente) e conferir se há dispensa de pagamento prévio.
4. Se houver **multas ou incidentes**, assinalar a opção e acrescentar cada rubrica, com tipo, identificação, responsável, fundamento legal ou decisão, montante fixado e total pago. A ferramenta não inventa taxas de incidentes nem multas; o utilizador deve conferir a Tabela II e a decisão judicial. Se não houver, esta secção fica fechada.
5. Confirmar se a segunda prestação é **devida, dispensada nos termos do artigo 14.º-A ou ainda não verificada**. Indicar, apenas para referência, o regime de condenação final por custas.
6. Seleccionar **Preparar quadro de conta**. Rever as diferenças e as advertências antes de imprimir ou copiar.

### Exemplo fictício

Acção com valor fixado de **30 000 €**, UC de **102 €**, tabela I-A = **5 UC**, ou seja, **510 €** de taxa-base por impulso, repartidos em duas prestações de **255 €**. Se o autor pagou 255 € de primeira prestação e está confirmada a dispensa legal da segunda, não há diferença aritmética no impulso do autor. Se a entidade demandada não apresentou contestação, a sua taxa por esse impulso é **0 €**. Não se conclui daí qual a responsabilidade final por custas.

## Fundamentação e pressupostos

- **RCP, artigo 6.º, n.º 1:** a taxa de justiça corresponde ao montante devido pelo impulso processual; na falta de regra especial, aplica-se a Tabela I-A.
- **RCP, artigo 11.º:** a base tributável parte do valor da causa, com os acertos constantes da Tabela I.
- **RCP, artigo 13.º, n.º 2:** nos casos da Tabela I-A, a taxa é, em regra, paga em duas prestações de igual valor, ressalvados regimes especiais.
- **RCP, artigos 14.º e 14.º-A:** oportunidade da segunda prestação e situações em que não há lugar ao respectivo pagamento.
- **RCP, artigo 15.º:** regimes de dispensa de pagamento prévio, designadamente os aplicáveis a certas entidades públicas, que **não equivalem à inexistência de taxa por um impulso praticado**.
- **CPC, artigos 529.º e 530.º:** taxa de justiça associada ao impulso, por oposição à responsabilidade final por custas, regida também pelo artigo 527.º.
- **RCP, artigos 29.º e 30.º:** conta final por sujeito processual responsável, de acordo com o julgado.

**Nota temporal:** o Decreto-Lei n.º 164/2026, de 6 de agosto, entra em vigor em 1 de dezembro de 2026, com regras de aplicação no tempo previstas no seu artigo 8.º. A nova redacção do artigo 6.º aplica-se apenas às acções propostas após essa data. A ferramenta rápida não aplica automaticamente isenções, reduções especiais, multas ou actualizações de regimes transitórios.

## O que a conta simples não faz

- Não atribui à AT uma taxa de contestação quando não há contestação.
- Não presume que a ausência de pagamento da AT, tendo contestado, constitua logo uma dívida vencida, sem verificar o artigo 15.º e o regime aplicável.
- Não presume que a segunda prestação seja devida se a situação não tiver sido verificada.
- Não transforma um excesso aritmético em ordem de restituição.
- Não calcula automaticamente remanescente acima de 275 000 €, custas de parte, recursos, taxas de incidentes, multas, encargos ou pluralidade de partes. Multas e incidentes podem ser **registados manualmente**, com montante, pagamento e fundamento; não se presume a sua exigibilidade nem responsabilidade final.
- Não substitui a conta da secretaria nem consulta CITIUS, SITAF ou serviços bancários.

A versão técnica anterior foi **preservada integralmente** na página separada. A versão simples só utiliza dados introduzidos pelo utilizador, sem comunicação com serviços externos e sem arquivo persistente. Não introduzir dados identificativos ou documentos confidenciais em ambientes não autorizados.

## Testes

A conta simples tem testes específicos em \`scripts/test-custas-simple.mjs\`, que cobrem a falta de contestação, os escalões da Tabela I-A, pagamento total ou discriminado, multas e incidentes introduzidos manualmente, dispensas, excesso potencial, regime temporal, validação de montantes e invalidação dos resultados após alterações. Os testes do motor técnico continuam em \`scripts/test-custas.mjs\` e os cenários sintéticos em \`scripts/test-custas-cenarios.mjs\`. O workflow do GitHub Actions inclui ambos.

**Os testes são técnicos e não substituem a validação jurídica de contas reais devidamente anonimizadas.**

## Fontes oficiais

- [Regulamento das Custas Processuais](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2008-34454975)
- [Código de Processo Civil](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2013-34580575)
- [Decreto-Lei n.º 164/2026](https://diariodarepublica.pt/dr/detalhe/decreto-lei/164-2026-1154555254)
