# Calendário normativo partilhado Web / Windows

**Versão de regras:** 2026-11-16

## Implementação efetiva

As duas aplicações usam o mesmo contrato de configuração de calendário, guardado em `rules/calendario.json` em ambos os repositórios.

- **Web:** `assets/calendario.js` fornece os cálculos da data de Páscoa e verifica se uma data pertence a férias judiciais. O simulador utiliza estas funções para contar e identificar férias.
- **Windows:** `main.py` carrega `rules/calendario.json`, inclusive no executável PyInstaller, para identificar férias judiciais e feriados nacionais.
- **Testes:** `scripts/calendar-contract.mjs` confere o objeto JavaScript com o contrato JSON; `tests/shared-cases.json`, `tests/parity-extended.json` e `tests/regimes-parity.json`, com os testes Python do Desktop, verificam 324 cenários técnicos de referência.

## Alcance

A configuração contém os períodos fixos e móveis das férias judiciais e feriados nacionais:

- Férias de Natal: 22 de dezembro a 3 de janeiro;
- Férias de Páscoa: domingo de Ramos a segunda-feira de Páscoa;
- Férias de verão: 16 de julho a 31 de agosto.

Os períodos são conferidos face ao artigo 28.º da LOSJ e ao calendário publicado pela DGAJ.

## Integridade do contrato Web/Windows

Os cinco ficheiros partilhados (dois catálogos e três matrizes de casos sintéticos) têm agora um [manifesto de paridade](paridade-web-desktop.md), verificado independentemente nos dois repositórios. A comparação remota através do GitHub Actions só é efetuada quando há credenciais de leitura para o repositório privado Windows. Sem credenciais, o relatório assinala que a paridade remota não foi verificada.

## Limites

**Existe um núcleo de cálculo com contrato equivalente em JavaScript e Python**, utilizado pelas interfaces, mas não um único ficheiro executável: ver [núcleo de prazos e suas limitações](prazo-core.md). As modalidades específicas de citação continuam na Web, e os três dias úteis com multa são tratados separadamente nas interfaces. Os 324 cenários técnicos não comprovam equivalência geral nem correção jurídica.

Não alterar prazos processuais e efeitos de citação exclusivamente com base em igualdade de testes. É necessário confronto normativo e avaliação de casos reais devidamente autorizados.

## Fontes

- [DGAJ – Calendário judicial para 2026](https://dgaj.justica.gov.pt/Noticias-da-DGAJ/DGAJ-elabora-e-divulga-o-calendario-judicial-para-2026)
- [CPC – artigo 138.º, Diário da República](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2013-34580575-53370775)

O repositório Desktop permanece separado e independente da plataforma Web.
