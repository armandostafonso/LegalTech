# Verificação jurídica do Cita-Check

**Estado:** testes de regressão técnica, não homologação ou certificação jurídica.

## Fontes normativas de controlo (consulta em 16-11-2026)

- [CPC, artigo 138.º](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2013-34580575-53370775): continuidade dos prazos, suspensão nas férias judiciais, exceções dos prazos de pelo menos seis meses e processos urgentes, transferência de termo.
- [Código Civil, artigo 279.º](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075-49784875): contagem e termo em dias, meses e anos.
- [Diário da República, férias judiciais](https://diariodarepublica.pt/dr/lexionario/termo/ferias-judiciais): 22 de dezembro a 3 de janeiro, domingo de Ramos a segunda-feira de Páscoa e 16 de julho a 31 de agosto.

**Nota:** a legislação consolidada e a descrição de regras gerais não bastam, por si, para validar regimes especiais; confirmar CPC/CPPT/CPTA/CPA, jurisprudência e despacho aplicáveis.

## Cenários incluídos na regressão automática

| Situação de ensaio | Data | Resultado esperado |
|---|---|---|
| 10 dias, urgente, sem férias | 16-11-2026 | 26-11-2026 |
| 2 dias, normal, início em véspera das férias de verão | 15-07-2026 | 02-09-2026 |
| 2 dias, urgente, atravessa início das férias | 15-07-2026 | 17-07-2026 |
| 1 mês, desde 31 de janeiro (sem dia 31 em fevereiro, domingo) | 31-01-2027 | 01-03-2027 |
| 6 meses (não suspende nas férias), termo num domingo | 15-05-2026 | 16-11-2026 |
| 1 ano | 16-11-2026 | 16-11-2027 |
| Singular eletrónica sem consulta | disponibilização em 16-11-2026 | sem data de citação confirmada |
| Singular eletrónica com consulta | consulta em 18-11-2026 | citação em 18-11-2026 |
| Singular eletrónica, consulta depois de 30 dias, sem confirmação de citação por outro meio | — | sem data confirmada |
| Consulta anterior à disponibilização | — | deve ser rejeitada |
| Prazo zero | — | deve ser rejeitado |

Executar: `node scripts/citacheck-regression.mjs` (após instalar Playwright).

## Cenários ainda a validar antes de rever o motor

1. Dilações de citações pessoais, postais e eletrónicas, nomeadamente possíveis cumulações e a data a partir da qual se conta.
2. Notificações eletrónicas de mandatários e presunções de receção, incluindo transferências para dias úteis.
3. Consulta da citação coletiva dentro/fora do período de 8 dias, dilação e ausência de consulta.
4. Processos da jurisdição tributária, sobretudo em processos urgentes e modalidades próprias do CPPT.
5. Prazos em meses inferiores a seis meses que atravessem férias judiciais; exigem enquadramento específico do método de suspensão.
6. Prazos fixados em dias cuja duração seja igual ou superior a seis meses (distinção entre período legal e aproximação aritmética).
7. Terceiros dias úteis subsequentes, despesas e eventual aplicabilidade do art. 139.º do CPC.
8. Feriados municipais, tolerâncias de ponto e encerramentos excecionais, quando aplicáveis ao tribunal.
9. Alterações legislativas posteriores à última conferência normativa.

**Regra de desenvolvimento:** não alterar o motor jurídico para fazer passar um teste sem confrontar o resultado com a norma e o caso de referência. O resultado de cada teste deve ter revisão humana e data de validação.
