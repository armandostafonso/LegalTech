# Lex Watch — vigilância de metadados legislativos

**Versão inicial:** 16 de novembro de 2026.

Esta funcionalidade acrescenta à [Lex Audit](../lex-monitor.html) uma rotina de conferência de *metadados de atualização* publicados nas páginas de legislação consolidada do Diário da República.

## Funcionamento

- O GitHub Actions [Lex Watch](https://github.com/armandostafonso/LegalTech/actions/workflows/lex-watch.yml) executa-se semanalmente à segunda-feira, pelas 08:17 UTC (sujeito à disponibilidade e às regras do GitHub), ou manualmente por `workflow_dispatch`.
- Consulta sete páginas oficiais constantes de `rules/lex-baseline.json`: CPTA, CPPT, CPC, CPA, RCP, LOSJ e LTFP.
- Tenta localizar a expressão «Data da última alteração» no texto publicado. Se não conseguir obtê-la, apresenta **fonte indisponível** ou **metadados não localizados**; **não conclui** que não houve alterações.
- Se a data observada for posterior à linha de base, cria um **pedido de revisão jurídica** nas *Issues* do repositório, salvo se já existir uma issue com o mesmo título.
- Publica um artefacto Markdown de auditoria `legaltech-lex-watch` com a data observada e o estado de cada fonte. O relatório não contém dados de processos.
- Não altera o motor de custas, o Cita-Check, os roteiros ou qualquer regra jurídica automaticamente.

## Limitações jurídicas importantes

A **data de última alteração do diploma não é uma prova da redação de todos os artigos em vigor**. Por exemplo, uma alteração legislativa pode ter sido publicada, mas só produzir efeitos em data futura; nesse dia, o campo «Data da última alteração» pode permanecer inalterado. O monitor pode não detetar normas transitórias, retificações e alterações em legislação avulsa. A ausência de alertas não comprova atualidade da ferramenta.

Também depende da disponibilidade técnica das páginas do Diário da República e da possibilidade de ler os metadados em HTML. Uma alteração de estrutura da página pode impedir a extração, situação que deve ser encarada como falha de verificação.

## Procedimento quando surgir uma issue

1. Consultar a fonte oficial, identificar diploma modificativo e artigos efetivamente afetados.
2. Confirmar entrada em vigor, aplicação no tempo e alterações de remissões.
3. Comparar com os roteiros e regras do sistema e verificar se há testes jurídicos suficientes.
4. Atualizar `rules/lex-baseline.json` **apenas depois de concluir a revisão**.
5. Registar a fundamentação e resultados dos testes antes de fechar a issue.

A linha de base de 16-11-2026 foi recolhida de páginas de legislação consolidada; é um indicador documental e não certificação jurídica.

## Segurança

O processo só faz pedidos HTTP de leitura a páginas públicas e usa o token do próprio repositório para criar issues, quando necessário. O conteúdo de nenhuma conversa, ficheiro ou processo judicial é usado na tarefa. A rotina não executa comandos recebidos dos sítios consultados.

A verificação do *parser* e do catálogo pode ser executada sem rede com `node scripts/lex-watch.mjs --self-test`.
