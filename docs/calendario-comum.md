# Calendário normativo partilhado Web / Windows

**Versão de regras:** 2026-11-16

## Implementação efetiva

As duas aplicações usam o mesmo contrato de configuração de calendário, guardado em `rules/calendario.json` em ambos os repositórios.

- **Web:** `assets/calendario.js` fornece os cálculos da data de Páscoa e verifica se uma data pertence a férias judiciais. O simulador utiliza estas funções para contar e identificar férias.
- **Windows:** `main.py` carrega `rules/calendario.json`, inclusive no executável PyInstaller, para identificar férias judiciais e feriados nacionais.
- **Testes:** `scripts/calendar-contract.mjs` confere o objeto JavaScript com o contrato JSON; `tests/shared-cases.json` e os testes Python do Desktop verificam resultados de referência.

## Alcance

A configuração contém os períodos fixos e móveis das férias judiciais e feriados nacionais:

- Férias de Natal: 22 de dezembro a 3 de janeiro;
- Férias de Páscoa: domingo de Ramos a segunda-feira de Páscoa;
- Férias de verão: 16 de julho a 31 de agosto.

Os períodos são conferidos face ao artigo 28.º da LOSJ e ao calendário publicado pela DGAJ.

## Limites

**Isto ainda não é um motor de prazos único.** Os cálculos de termo, suspensão, dilação e três dias úteis mantêm implementações próprias em JavaScript e Python, e as regras específicas de citação só existem na versão Web. Os cenários partilhados reduzem divergências, mas não provam equivalência geral.

Não alterar prazos processuais e efeitos de citação exclusivamente com base em igualdade de testes. É necessário confronto normativo e avaliação de casos reais devidamente autorizados.

## Fontes

- [DGAJ – Calendário judicial para 2026](https://dgaj.justica.gov.pt/Noticias-da-DGAJ/DGAJ-elabora-e-divulga-o-calendario-judicial-para-2026)
- [CPC – artigo 138.º, Diário da República](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2013-34580575-53370775)

O repositório Desktop permanece separado e independente da plataforma Web.
