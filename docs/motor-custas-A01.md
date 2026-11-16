# Motor de Custas A01 — Caderno jurídico e técnico

**Versão da interface:** 2.0 (experimental, novembro de 2026)  
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

## Benefícios e exigibilidade da taxa de justiça (v1.5)

A versão 1.5 acrescenta um **assistente por obrigação**, com separação deliberada entre o benefício aplicável e o momento do pagamento.

### Artigo 4.º do RCP, isenções

A ficha da parte indica se existe isenção invocada e respectivo fundamento. O assistente apresenta um aviso para confirmar o âmbito, os requisitos materiais, eventuais excepções e a documentação. **Não transforma automaticamente o montante em zero**, mesmo quando o utilizador selecciona Ministério Público, acção popular ou entidade sem fins lucrativos. A fixação efectiva do benefício requer análise jurídica humana.

### Artigo 6.º, n.º 3, redução da taxa a 90%

Para **acções propostas a partir de 1 de dezembro de 2026**, a calculadora permite aplicar a redução prevista na redacção do artigo 6.º, n.º 3, introduzida pelo Decreto-Lei n.º 164/2026, com os seguintes pressupostos cumulativos:
- Parte pessoa singular, declarada como **não representada por mandatário**, e entrega electrónica **facultativa**.
- Todas as peças processuais entregues electronicamente, com confirmação documental.
- Nenhuma isenção ou apoio judiciário impeditivos assinalados.
- Primeira prestação **I-A** criada pela própria calculadora (não se aplicam automaticamente montantes de recursos, incidentes ou obrigações manuais).
- Sem movimentos financeiros já imputados às prestações do impulso, para evitar diferenças retroactivas não reconciliadas.

O cálculo é **90% da taxa original**, o que representa **10% de redução**, não 90% de redução. Quando existe segunda prestação vinculada, ambas são recalculadas em conjunto, para que a soma mantenha o total reduzido e não se duplique a taxa. O valor original é preservado para eventual reposição. Acções anteriores a 1 de dezembro de 2026 ficam bloqueadas **nesta rotina**, exigindo conferência da redacção historicamente aplicável e das regras transitórias.

Exemplo ilustrativo: taxa total de 510 € (5 UC de 102 €). Valor a 90% = **459 €**. Duas prestações de **229,50 €**.

### Artigo 15.º, n.º 1, alínea a), dispensa de pagamento prévio

A verificação de dispensa prévia exige declaração do tipo de entidade pública abrangida, não incidência das matérias excluídas (administrativas contratuais, pré-contratuais ou relações laborais especificadas), data do acto e confirmação do enquadramento. O programa regista uma **anotação sobre a exigibilidade temporal** da obrigação e **não altera a taxa calculada**. A eventual imputação final à parte condenada depende da decisão judicial e do regime temporalmente aplicável, nomeadamente os n.ºs 2 e 3 do artigo 15.º na redacção de 2026.

Um impulso com dispensa prévia impede que a conferência seja apresentada como juridicamente completa, mesmo quando se identifica uma diferença aritmética entre valores declarados e pagos.

### Revalidação e integridade

- Toda a alteração ao perfil da parte que afecte uma obrigação com benefício aplicado obriga a nova verificação documental antes de transferir totais.
- A alteração às condições da entrega electrónica invalida a confirmação anterior da redução.
- A reaplicação de uma redução já validada não produz um segundo desconto.
- O benefício pode ser reposto se não existirem pagamentos/restituições imputados, restaurando o montante original.
- As referências e os valores do relatório mantêm o histórico do fundamento jurídico de cada impulso.

**Atenção:** as verificações são restritivas e não abrangem todos os benefícios legais, hipóteses de isenção, incidentes ou regimes históricos; não substituem a conferência dos autos e a decisão judicial.

## Responsabilidade final e repartição de encargos (v1.6)

A ferramenta dispõe de um **mapa de encargos concretos**, distinto da taxa de justiça devida pelo impulso processual. A base jurídica é a seguinte:

- **CPC, artigo 527.º:** responsabilidade por custas segundo o vencimento, na proporção do decaimento, ou segundo o proveito quando não há vencimento.
- **CPC, artigo 528.º:** situações de litisconsórcio e coligação, que exigem tratamento específico ainda **não automatizado**.
- **CPC, artigo 529.º:** distingue taxa de justiça, encargos e custas de parte.
- **CPC, artigo 532.º:** responsabilização pelos encargos, incluindo o interessado na diligência, proveito, interesses comuns e diligências dilatórias.
- **CPC, artigo 533.º:** custas de parte, que **não são inseridas** na conta da secretaria por este módulo.
- **RCP, artigos 29.º e 30.º:** ocasião e elaboração da conta, de harmonia com a última decisão e por sujeito responsável.

### Operação técnica

1. O utilizador regista um encargo específico e a percentagem atribuída à parte A conforme decisão/fundamento. A parte B recebe automaticamente a percentagem complementar, para um total de 100%.
2. Os valores são calculados em **cêntimos inteiros**. Qualquer cêntimo residual é atribuído à parte B, evitando perdas ou somas superiores ao total.
3. A decisão sobre custas, a data, a responsabilidade e a ausência de duplicação carecem de **confirmação expressa**.
4. O mapa permite criar, apenas por acção explícita, obrigações individuais de encargos para cada parte, identificadas por referência e com origem no mapa.
5. Depois de criadas, essas obrigações entram no livro de obrigações, mas **não constituem pagamentos**. A transferência dos totais devidos à conferência continua a ser separada e substitutiva.
6. Uma obrigação gerada pelo mapa não pode ser retirada isoladamente. O mapa apenas permite desfazer lançamentos quando não existam pagamentos ou restituições associados.
7. A opção de limpar todas as obrigações é bloqueada enquanto existirem encargos lançados a partir do mapa. Os registos são temporários, sem persistência.

### Limites jurídicos expressos

**O mapa não aplica automaticamente uma percentagem de decaimento à taxa de justiça já paga por cada parte.** Não interpreta o dispositivo da sentença, não calcula custas de parte, não determina a incidência de encargos não documentados e não resolve litisconsórcio, coligação, solidariedade ou pluralidade de intervenientes além das partes A e B.

Uma percentagem introduzida pelo utilizador é um dado **declarado e conferido**, não uma conclusão jurídica do motor. O mapa serve para um conjunto de encargos concretamente identificados, não para calcular a totalidade das custas finais do processo.

### Testes

A versão 1.6 inclui casos para montantes repartidos com arredondamento de cêntimos, duplicação de lançamentos, responsabilidades de 100% para uma das partes, conservação dos pagamentos por parte, bloqueio de remoção de obrigações dependentes, desfazer operações e limpeza segura.

## Proposta de conferência por sujeito processual (v1.7)

A versão 1.7 acrescenta uma prévia de conferência **expressamente não oficial**, com os seguintes campos, separadamente para a parte A, a parte B e a rubrica de outras quantias:

- Obrigações processuais registadas, incluindo encargos lançados pelo mapa de responsabilidade;
- Pagamentos líquidos confirmados por parte, ou montantes introduzidos manualmente na ausência de livro de movimentos;
- Diferença aritmética positiva e excesso potencial, sem concluir automaticamente pela existência de dívida ou direito a restituição;
- Data do trânsito em julgado indicada e confirmação de conferência final dos documentos;
- Discriminação dos impulsos processuais, encargos repartidos e fundamento introduzido.

### Bloqueios e advertências

Os montantes são tratados em cêntimos inteiros e a conferência rejeita valores com mais de duas casas decimais.


O programa **assinala a proposta como incompleta** caso faltem obrigações, não estejam sincronizados os totais, existam benefícios sem revalidação, pagamento prévio dispensado, movimentos financeiros pendentes ou não imputados, encargos ainda por lançar, fichas de partes não conferidas, datas em falta, ou divergências entre o quadro e o livro de movimentos.

A prévia pode ser consultada mesmo quando incompleta, **sempre acompanhada da lista de avisos**. Não se altera o resultado para "conta oficial" quando as advertências desaparecem: significa apenas que os controlos internos desta versão não detectaram bloqueios.

### Saídas locais

- Cópia de texto legível com discriminação e advertências.
- Resumo CSV com valores por sujeito e identificação expressa das pendências.
- Ambos são gerados localmente pelo navegador.
- A cópia ou exportação exige prévia actual: quando mudam montantes, movimentos, identificação ou documentos confirmados, o resultado anterior não pode ser reutilizado sem novo cálculo.

**Limitação:** esta proposta não inclui custas de parte, não executa pagamentos, não apura encargos omissos nem substitui o processamento da conta da secretaria nos meios oficiais. Não existe integração com os sistemas CITIUS/SITAF ou serviços de pagamento.

## Reconciliação financeira por impulso (v1.8)

A versão 1.8 acrescenta um mapa de reconciliação que cruza os dados das **obrigações processuais** com **pagamentos e restituições confirmados documentalmente pelo utilizador**, individualmente atribuídos à mesma obrigação.

### Funcionamento

1. Identifica as obrigações criadas para cada sujeito processual e a sua referência.
2. Soma os pagamentos confirmados atribuídos a cada obrigação e subtrai as restituições confirmadas atribuídas à mesma obrigação.
3. Indica, para cada impulso, o valor da obrigação, o pagamento líquido imputado, a diferença aritmética positiva e o excesso potencial.
4. Exibe separadamente o saldo líquido de pagamentos confirmados **sem imputação** e a quantidade de movimentos financeiros **pendentes**.
5. Detecta situações de pagamento líquido negativo, excesso aritmético sobre determinada obrigação, pagamento prévio dispensado e falta de revalidação do benefício.
6. Incorpora o mapa por impulso e as respectivas advertências na proposta de conferência e no resumo CSV. **Não redistribui valores automaticamente** entre partes ou impulsos.
7. A cópia do mapa exige que os movimentos e as obrigações ainda coincidam com os dados da última reconciliação.

### Limites e segurança

- Um pagamento confirmado pela ferramenta é uma **declaração do utilizador**; não constitui consulta ou autenticação de DUC, CITIUS, SITAF ou entidades bancárias.
- Um saldo de pagamento superior a uma obrigação é um **excesso aritmético potencial**, não uma ordem de restituição.
- Um valor inferior ao exigível é uma diferença matemática, **não necessariamente uma dívida vencida**, sobretudo perante isenção, apoio judiciário, dispensa de pagamento prévio ou decisão específica.
- Movimentos pendentes não integram o saldo pago; movimentos sem afectação não são presumidos como pagamento de um impulso específico.
- A reconciliação ocorre localmente e os dados são temporários. Não existem transferências financeiras, acesso a bases judiciais ou arquivo persistente de comprovativos.

## Pluralidade de intervenientes, litisconsórcio e coligação (v1.9)

A versão 1.9 acrescenta um **mapa autónomo multissujeito**, limitado a 12 participantes identificados por referências fictícias. Esta estrutura serve para registar e conferir a repartição de **encargos concretamente identificados**, mantendo-a separada da conta financeira A/B, das taxas de justiça devidas por impulso e dos pagamentos registados.

### Enquadramento jurídico

- **CPC 527.º, n.ºs 1 e 2:** vencimento e decaimento proporcional, ou proveito quando não haja vencimento. O mapa não interpreta autonomamente a sentença.
- **CPC 527.º, n.º 3:** quando a obrigação condenatória é solidária, a solidariedade estende-se às custas. O mapa bloqueia a repartição automática perante solidariedade indicada ou por confirmar.
- **CPC 528.º, n.º 1:** litisconsortes do mesmo lado (vários autores ou vários réus), todos totalmente vencidos, respondem pelas custas em partes iguais. Esta divisão só pode ser seleccionada após confirmação expressa dos pressupostos.
- **CPC 528.º, n.º 2:** transacção de litisconsorte pode determinar redução de 50% do valor das custas. O módulo **não aplica automaticamente** esta redução e bloqueia lançamentos com transacção assinalada ou por verificar.
- **CPC 528.º, n.º 3:** vencimento parcial de litisconsorte exige consideração específica, pelo que só se admitem quotas declaradas como expressamente determinadas na decisão, sem inferir a percentagem.
- **CPC 528.º, n.º 4:** coligação de autores ou réus implica responsabilidade individual nos termos gerais do artigo 527.º, n.º 2. O módulo pode registar quotas expressas e verificadas, mas não aplica divisão igual por mera coligação.
- **CPC 530.º, n.º 4:** no litisconsórcio, o litisconsorte que figure como parte primeira no impulso suporta o pagamento da totalidade da taxa de justiça, sem prejuízo do direito de regresso. **Não é a mesma operação** que repartir os encargos finais.
- **CPC 530.º, n.º 5:** na coligação, os sujeitos aí referidos são responsáveis pela respectiva taxa de justiça.
- **RCP 30.º, n.º 2:** uma conta por cada sujeito processual responsável, abrangendo os elementos legalmente relevantes do processo e apensos. O mapa multissujeito não equivale a essas contas.

### Registo, validações e resultados

O utilizador adiciona cada interveniente e indica posição processual, inclui apenas os intervenientes abrangidos por cada encargo e selecciona um de dois critérios: **quotas percentuais expressas na decisão**, que têm de somar exactamente 100%, ou **partes iguais** quando se verificam os requisitos restritos do artigo 528.º, n.º 1.

A divisão é feita em cêntimos inteiros e conserva sempre o total. Quando a divisão não é exacta, os cêntimos residuais são distribuídos por maior resto e, em caso de igualdade, por ordem de registo dos participantes. Esta é apenas uma regra técnica ilustrativa: eventuais particularidades da decisão judicial prevalecem.

São bloqueados referências repetidas, percentagens inválidas, solidariedade ou transacção por verificar, repartições não confirmadas, retirada de participantes que já integram encargos e montantes acima do limite técnico de 100 milhões de euros. O mapa gera totais por participante, relatório copiável e exportação CSV temporária, com sanitização de células que poderiam ser interpretadas como fórmulas por programas de folha de cálculo.

### Separação dos dois motores

O **mapa multissujeito não altera automaticamente** os campos A/B, as obrigações, o livro de pagamentos ou a proposta anterior. Sempre que existem intervenientes ou repartições no mapa, a proposta A/B apresenta uma advertência expressa de **não integração**, com listagem informativa das repartições. Isto impede que o mesmo encargo seja contabilizado inadvertidamente duas vezes. A junção de contas por vários sujeitos exige ainda modelo de obrigações e conciliação documental mais abrangente.

O módulo não interpreta decisões, não calcula automaticamente solidariedade, transacções ou decaimento parcial, não determina custas de parte e não produz contas oficiais.

## Obrigações e pagamentos individualizados por interveniente (v2.0)

A versão 2.0 acrescenta uma **contabilidade multissujeito autónoma**, para os intervenientes registados no mapa da versão 1.9, preservando a separação face à conta A/B.

### Regras jurídicas estruturantes

- O **artigo 30.º, n.º 2, do RCP** determina a elaboração de uma conta por cada sujeito processual responsável. A ferramenta regista separadamente cada sujeito, mas **não produz contas oficiais**.
- O **artigo 530.º, n.º 4, do CPC** estabelece a obrigação inicial do primeiro litisconsorte quanto à taxa de justiça, sem prejuízo do regresso. Esta obrigação **não se presume idêntica** à responsabilidade final por encargos e não é redistribuída automaticamente.
- O **artigo 530.º, n.º 5, do CPC** prevê a responsabilidade de cada autor, reconvinte, exequente ou requerente pela sua taxa na coligação. Esta análise é confirmada e introduzida manualmente.
- A repartição dos encargos confirmada no mapa do artigo 528.º do CPC só é importada através de acção expressa. Não altera valores da conta A/B nem cria automaticamente pagamentos.

### Modelo de registos

**Obrigações individuais:** por cada pessoa podem ser registadas taxas de justiça, encargos, multas ou outras quantias, com referência única por sujeito, montante em cêntimos, fundamento jurídico/documental e confirmação expressa do utilizador. Não existe tabela de taxas automaticamente inferida para estes sujeitos.

**Importação de encargos repartidos:** cria obrigações individualizadas correspondentes à quota de cada pessoa, conservando exactamente o valor repartido. Bloqueia importações repetidas e a eliminação do encargo de origem enquanto existirem obrigações dependentes.

**Movimentos financeiros:** guia emitida, anulação, pagamento e restituição, com referência e data. Pagamentos e restituições podem ficar pendentes ou ser assinalados como confirmados. Guias emitidas ou anuladas **não constituem pagamentos**. Os movimentos podem ser associados a uma obrigação da própria pessoa, ou ficar sem imputação.

**Reconciliação:** para cada interveniente, o mapa calcula obrigações registadas, saldo líquido de pagamentos confirmados, diferença aritmética positiva, excesso potencial e montantes confirmados sem imputação. Em paralelo, o quadro de obrigações mostra o valor pago por impulso. Não se fazem compensações automáticas entre sujeitos ou entre impulsos.

### Controlos de integridade

- Atribuição de pagamento a obrigação pertencente a outra pessoa é bloqueada. Uma referência de guia, pagamento ou restituição não pode ser reutilizada para obrigações distintas do mesmo sujeito.
- Restituição confirmada exige pagamento confirmado da **mesma pessoa, referência e obrigação**, e não pode exceder o saldo ainda disponível.
- Não se admite retirar um pagamento que sustente uma restituição confirmada, nem uma obrigação com movimentos associados.
- Não é permitido apagar intervenientes, encargos ou mapas quando existam movimentos ou obrigações dependentes.
- São assinalados pagamentos sem imputação, pagamentos ou restituições pendentes e excessos potenciais, sem classificar automaticamente qualquer diferença como dívida vencida.
- O CSV da reconciliação inclui os alertas e é produzido localmente. Os conteúdos são escapados para reduzir o risco de interpretação de texto introduzido como fórmulas.
- Os dados não são armazenados persistentemente pela ferramenta e perdem-se ao recarregar a página.

**Integração deliberadamente limitada:** a contabilidade multissujeito é independente dos totais A/B e a proposta anterior assinala a sua existência. Não se convertem os saldos do novo mapa em parcelas da conta A/B nem se presume que o conjunto das obrigações registadas abranja todas as custas do processo.

**Faltam:** interpretação completa da sentença e dos incidentes, normas temporais e regimes especiais por sujeito, verificação de DUC/comprovativos junto de sistemas oficiais, controlo de custas de parte fora da conta da secretaria, decisão sobre restituições e revisão jurídica independente de exemplos de contas reais devidamente anonimizados.

## Limitações que bloqueiam o uso como conta oficial

- A taxa-base simulada não contempla isenções, reduções, prestações, regimes especiais, custas de recursos e incidentes. As obrigações de recurso ou incidente são valores **manuais**, não calculados automaticamente.
- A selecção de uma alínea de isenção ou modalidade de apoio judiciário **não valida os respectivos requisitos materiais**.
- A ferramenta não lê autos nem comprovativos. Os pagamentos tidos como confirmados são declarados manualmente.
- O programa não determina a responsabilidade por custas nem executa o seu rateio em caso de decaimento.
- Existe um livro experimental de movimentos, mas não existe **conciliação automática documental** com CITIUS/SITAF, sistemas de pagamentos ou extratos oficiais. O estado «confirmado» é declarado pelo utilizador.
- Nem toda a quantia matematicamente positiva é legalmente exigível à parte que a introduziu.
- A aplicação usa memória temporária do navegador, sem envio ou gravação das respostas pelo próprio módulo. O livro perde-se ao actualizar ou fechar a página. Evitar dados identificativos e informação confidencial.
- A ferramenta apresenta, por enquanto, apenas duas fichas individualizadas (A/B), e uma rubrica agregada de outras quantias; não resolve a pluralidade de intervenientes, a solidariedade ou a responsabilidade específica do litisconsórcio.
- Um pagamento não imputado a obrigação específica integra o saldo financeiro por parte, mas não o saldo por impulso. A conferência é assinalada como incompleta se coexistirem obrigações e pagamentos confirmados sem imputação.
- A indicação «verificado» é uma declaração manual, não uma certificação do programa ou de uma autoridade judicial.

## Testes

- Script: `node scripts/test-custas.mjs` (157 casos técnicos na versão 2.0).
- Verificação global da página: `node scripts/validate-site.mjs`.
- Integração contínua: `.github/workflows/custas-tests.yml`.

**A execução destes testes não certifica o resultado jurídico.** A bateria deve ser ampliada com casos históricos e confrontada com decisões de custas e pagamentos de exemplos fictícios.

## Próximas fases

1. Catálogo de versões legais e UC histórica.
2. Motor de prestações com estrutura de **obrigações por impulso**, para impedir duplicações.
3. Validar a contabilidade multissujeito em casos jurídicos reais anonimizados, incluindo regimes especiais, gestão de DUC e eventual integração formal com a conta por sujeito, sem compensações de terceiros.
4. Expandir a triagem de isenção, apoio judiciário, dispensa prévia e reduções para regimes especiais, com fundamentação, efeitos temporais e validação da decisão de benefícios.
5. Repartição de encargos e remanescente conforme condenação e decisões judiciais.
6. Exportação da proposta de conferência, com indicação do grau de certeza e referências legais.
7. Ensaios de regressão funcional e revisão jurídica especializada antes de qualquer utilização em processos reais.

## Fontes oficiais

- [RCP (Decreto-Lei n.º 34/2008, texto consolidado)](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2008-34454975)
- [Decreto-Lei n.º 164/2026](https://diariodarepublica.pt/dr/detalhe/decreto-lei/164-2026-1154555254)
- [Decreto-Lei n.º 86/2018](https://diariodarepublica.pt/dr/detalhe/decreto-lei/86-2018-116809383)
- [Portaria n.º 419-A/2009 (texto consolidado)](https://diariodarepublica.pt/dr/legislacao-consolidada/portaria/2009-116457551)

> A versão consolidada é auxiliar de consulta. Deve confirmar-se sempre a redacção e a vigência dos actos pertinentes.
