# Conta simples A01 · LegalTech Suite

**Entrada principal:** [custas.html](../custas.html)  
**Análise de regimes especiais:** [custas-tecnico.html](../custas-tecnico.html)  
**Âmbito:** proposta experimental de conferência da taxa de justiça pelos impulsos da petição inicial e da contestação, em acção administrativa.

## Como utilizar

1. Indicar o **valor da causa fixado na sentença ou decisão relevante** e apenas o **ano de propositura**. A UC desse ano surge automaticamente quando o valor histórico está confirmado; o campo continua editável para conferência documental. No ano de 2009 existiram dois valores (96 € até 19 de Abril e 102 € desde 20 de Abril). Em 2012, a data exacta é indispensável para verificar o regime da Lei n.º 7/2012; em 2026 deve ser verificada a transição de 1 de Dezembro.
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

## Conferência da necessidade de conta e da decisão final

A página inclui uma opção específica para confirmar se **há lugar à elaboração de conta** (artigo 29.º do RCP). As escolhas são: por conferir, há lugar a conta, ou dispensa de conta confirmada. Quando é assinalada dispensa, exige-se um fundamento ou observação. **O programa não conclui automaticamente que há dispensa apenas porque a diferença aritmética é zero.**

A condenação final em custas pode ser assinalada a cargo do autor, da entidade demandada, repartida ou sujeita a regime especial. Se for repartida, são introduzidas as percentagens do autor e da entidade demandada, que devem somar 100%. Estes valores são **informativos** e não distribuem automaticamente taxas de impulso, multas, incidentes ou encargos. A imputação final requer aplicação da decisão judicial e do regime legal.

A conclusão imprimível distingue entre **quadro de conferência** e **conta final da secretaria**, sem presumir dívida vencida nem restituição.

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


## Campo «Ano de propositura» e UC histórica (novembro de 2026)

- A página simples aceita apenas o **ano**, com quatro algarismos, e mostra a **UC ao lado**.
- **2010–2026:** UC de **102,00 €**, preenchida automaticamente, com possibilidade de revisão manual. O valor de 2026 foi mantido pela Lei n.º 73-A/2025, artigo 242.º.
- **2009:** o ano não permite saber qual o valor: eram **96,00 € até 19-04-2009** e **102,00 € desde 20-04-2009**. Não há preenchimento automático; utiliza o módulo técnico com a data exacta.
- **2012:** a data de início da acção é necessária para distinguir a alteração legislativa em vigor desde 29-03-2012; a página simples bloqueia o cálculo sem validação específica.
- **2026:** o valor da UC é conhecido, mas o **ano**, isoladamente, não permite concluir o regime decorrente das alterações previstas para 01-12-2026; o resultado é acompanhado de ressalva.
- **Anos posteriores a 2026:** a UC não é projectada sem fonte legal confirmada; o preenchimento manual carece de verificação.
- O artigo 5.º, n.º 3, do RCP fixa a UC da taxa de justiça em função do início de cada processo autónomo. Recursos e incidentes podem exigir a UC vigente no momento do respectivo início, não necessariamente no ano de propositura da acção principal.

**Fontes:** [RCP consolidado, artigo 5.º](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2008-34454975); [Evolução histórica da UC, Portal da Habitação](https://www.portaldahabitacao.pt/unidade-de-conta-uc); [Guia Prático das Custas Processuais, CEJ](https://cej.justica.gov.pt/LinkClick.aspx?fileticket=mBfuThSKNbM%3D&portalid=30).

## Actualizações recentes

- As rubricas adicionais incluem **recurso, incidente, multa, encargo e outro impulso**. O utilizador introduz o montante, o responsável e o fundamento; não são aplicados automaticamente valores de tabela a recursos.
- O quadro final contém uma **síntese por interveniente**. Um excesso de pagamento de uma parte não abate à diferença positiva de outra. São resultados aritméticos, não certidões de dívida ou de reembolso.
- A regressão técnica do formulário simples cobre os campos de ano e UC, as transições temporais, os recursos opcionais e os saldos sem compensação.
