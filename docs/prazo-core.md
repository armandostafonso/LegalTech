# Núcleo de prazos Cita-Check e Regimes

**Versão de referência:** 2026-11-16

## Arquitetura

O cálculo do termo foi separado da interface de cada aplicação.

| Plataforma | Núcleo | Utilização |
|---|---|---|
| LegalTech Web | `assets/prazo-core.js` | `citacheck.html` (contagem CPC) e `regimes.html` (CPA e CPPT em dias) |
| Cita-Check Desktop Windows | `prazo_core.py` | `main.deadline` (CPC) e `regimes.calculate_days` (CPA e CPPT em dias) |

**Núcleo comum significa contrato e algoritmo de referência equivalentes em duas linguagens.** Não é o mesmo ficheiro executável. A igualdade funcional é fiscalizada por matrizes de casos idênticas, mas não comprovada matematicamente para todos os valores possíveis.

## Entradas e resultados

Entradas comuns: `start`, `amount`, `unit`, `regime`, `urgent`, `delay`, função de abertura do serviço e função que identifica férias judiciais. O calendário nacional e os feriados municipais de referência são provenientes de `rules/calendario.json` e `rules/municipais.json`.

Os núcleos devolvem `end` (termo simulado), `raw` (termo nominal anterior à transferência por encerramento), `suspended` (dias não contados), `regime` e, opcionalmente, `steps` e `transfer` para a cronologia.

O motor **não escolhe a espécie processual, determina a perfeição de citações ou notificações, aplica dilações automaticamente, determina se o processo é urgente ou decide que ato deve ser praticado**. Esses dados dependem do regime, dos autos e da conferência humana.

## Regimes delimitados

- **CPC geral:** simula os termos em dias, meses e anos a partir de data fornecida; suspende dias de férias judiciais no modo não urgente de duração inferior a seis meses e transfere o termo quando o dia não é útil para o serviço. Os prazos mensais que atravessam férias têm método indicativo que exige confirmação jurídica.
- **CPA, artigo 87.º:** apenas prazos em dias, sem dilação nem urgência; exclui dias de encerramento do serviço (fins de semana e feriados identificados), ressalvando exceções legais e disposições especiais.
- **CPPT, artigo 20.º, n.º 1:** apenas prazos em dias no âmbito a que esta disposição se aplica, com contagem contínua e transferência do termo, quando aplicável. **Os atos em processo judicial tributário têm enquadramento diferente, designadamente o artigo 20.º, n.º 2, do CPPT.**

Os três dias úteis subsequentes do artigo 139.º do CPC são calculados pelos módulos de interface quando aplicáveis e **não integram o contrato de termo deste núcleo**. Não presumir que a faculdade de prática do ato com multa se aplica a qualquer espécie de processo ou ato.

## Paridade automatizada

Os mesmos casos sintéticos encontram-se nos repositórios Web e Desktop:

| Matriz | Casos | Abrangência |
|---|---:|---|
| `tests/shared-cases.json` | 12 | CPC geral, férias e feriados |
| `tests/parity-extended.json` | 216 | CPC, dias, meses, anos, urgência, anos bissextos e feriados locais |
| `tests/regimes-parity.json` | 96 | CPA e CPPT em dias |
| **Total** | **324** | **Consistência técnica, não certificação jurídica** |

Na Web, `scripts/prazo-core-contract.mjs` verifica diretamente os 324 casos; `scripts/citacheck-regression.mjs` e `scripts/regimes-parity.mjs` verificam a integração real com a interface. No Desktop, os testes Python verificam o mesmo catálogo e as regras isoladas antes da compilação Windows. O manifesto `rules/parity-manifest.json` fixa a integridade das cinco fontes de referência.

## Limitações remanescentes

1. A versão Web tem modalidades adicionais de citação e um catálogo alargado de municípios, enquanto o Desktop suporta quatro feriados municipais expressos no contrato comum. **A paridade só abrange esses quatro municípios e a opção sem feriado municipal**.
2. A data de perfeição, os efeitos da citação eletrónica, as exceções do CPA/CPPT, as dilações e o direito transitório necessitam de avaliação jurídica por espécie e caso concreto.
3. O método de suspensão nos prazos mensais CPC, de duração inferior a seis meses, precisa de verificação jurisprudencial e doutrinária aprofundada. Não tratar a equivalência técnica como confirmação de correção jurídica.
4. Os cálculos não consideram automaticamente encerramentos extraordinários, feriados municipais não configurados, atos eletrónicos concretos ou normas especiais. A configuração do serviço é fornecida à interface.
5. A igualdade de resultados entre programas pode ocultar um mesmo erro conceptual. Os testes não substituem confrontação com legislação consolidada e revisão especializada.

A atualização de uma regra deve ser feita com registo de fundamento jurídico e casos de teste que reproduzam as situações relevantes, sem alterar automaticamente as outras espécies processuais.

## Privacidade

Os núcleos são funções de cálculo locais. Não contêm operações de rede ou armazenamento de processos. Não se deve introduzir dados identificativos reais em formulários públicos sem autorização institucional e avaliação das dependências e condições do equipamento.
