# Contagem procedimental CPA e CPPT

**Data da implementação:** 16 de novembro de 2026  
**Âmbito:** somente prazos expressos em dias, com data inicial introduzida e verificada pelo utilizador.

## Seleção de regime

| Modo | Norma | Contagem implementada | Limites |
| --- | --- | --- | --- |
| Procedimento administrativo | CPA, art. 87.º, als. b), c), f) e g) | Não conta dia do evento inicial; exclui fins de semana, feriados e encerramentos informados; transfere o termo para dia útil | Não implementa exceção de prazo superior a seis meses nem regime especial |
| Procedimento tributário / interposição de impugnação judicial | CPPT, art. 20.º, n.º 1; CC, art. 279.º | Não conta dia do evento inicial; conta todos os dias corridos; transfere o termo se o serviço ou tribunal estiver encerrado | Não determina prazo de impugnação e não cobre efeitos de notificações |
| Atos praticados no processo judicial tributário | CPPT, art. 20.º, n.º 2 | Remissão para CPC, em regra; usar o motor processual geral | Exceções urgentes ou especiais exigem confirmação |

**Uma data processualmente incorreta de citação ou notificação origina sempre uma contagem incorreta.** Nenhum modo determina automaticamente a perfeição do ato.

## Proibições de cálculo automático

1. CPA ou CPPT em meses/anos.
2. Aplicar dilação a prazos CPA ou CPPT sem determinar previamente a norma especial.
3. Incluir três dias úteis subsequentes com multa nos regimes CPA e CPPT, por defeito.
4. Tratar prazos do procedimento tributário como prazos de prática de atos em processo judicial.
5. Considerar férias judiciais como causa de suspensão do prazo do CPPT, art. 20.º, n.º 1, por analogia com o CPC.

## Testes

- **Web:** `regimes.html` tem teste no navegador que compara CPA (10 dias, 16/11/2026 → 30/11/2026), CPPT (10 dias corridos, mesma data → 26/11/2026) e atravessamento das férias judiciais.
- **Desktop:** `regimes.py`, `tests/test_regimes.py` e `tests/test_cronologia.py` testam as mesmas regras e a integração com o relatório.
- **Feriados municipais:** são opcionais e só devem ser aplicados ao serviço concretamente competente.

## Fontes oficiais

- [Artigo 87.º do CPA, Diário da República](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2015-105602322-115721810)
- [Artigo 20.º do CPPT, Portal das Finanças](https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cppt/Pages/cppt20.aspx)
- [Artigo 20.º do CPPT, Diário da República](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1999-34577575-74510824)

A legislação consolidada deve ser confirmada em cada utilização. Estes ensaios técnicos não são validação judicial de um prazo concreto nem certificação jurídica do software.
