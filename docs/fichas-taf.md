# Fichas de tramitação TAF e integração com minutas

**Versão de referência: 16 de novembro de 2026**

## Conteúdo

A ferramenta [Tramitação TAF](../tramitação-taf.html) dispõe de sete roteiros e 25 fases; o catálogo está em `rules/roteiros-taf.json` e as fichas complementares em `rules/fichas-taf.json`.

A ficha de cada fase apresenta: natureza da espécie, atenção jurídica especial, elementos a conferir antes de prosseguir, pressupostos que **não** devem ser presumidos, principais campos relevantes e acesso às fontes. As listas distinguem itens de secretaria e itens que dependem de despacho. O número de itens assinalados não constitui atestação de que o ato foi praticado.

## Utilização

1. Selecionar a espécie e a fase que correspondam ao estado real dos autos.
2. Abrir «Ficha jurídica complementar e preparação de expediente» para consultar pressupostos, elementos relevantes e cautelas.
3. Marcar apenas os factos e atos efetivamente comprovados nos autos ou por registo do sistema.
4. Consultar as fontes legais e conferir o despacho; se a questão depender do juiz, não avançar apenas porque a checklist está completa.
5. Se precisar de minuta, selecionar «Preparar minuta genérica», que abre o gerador sem dados processuais pessoais. Preencher manualmente, conferir com o despacho e rever antes de utilizar.
6. Copiar, exportar TXT ou imprimir a lista de conferência se for útil, **sem dados identificativos**.

As seleções persistem apenas enquanto a página está aberta. O botão «Repor verificações» limpa a fase atual; não existe sincronização com Citius, SITAF, correio ou qualquer servidor de dados.

## Direito transitório da ação administrativa

O Decreto-Lei n.º 164/2026 entra em vigor em **1 de dezembro de 2026**. O artigo 8.º, n.º 3, prevê aplicação das novas redações dos artigos 80.º e 82.º CPTA apenas a ações propostas após a sua entrada em vigor. A ficha permite indicar a data de propositura como **auxiliar de alerta**, não como qualificação automática de outro regime. Consultar a redação vigente e a norma transitória.

[Fonte oficial: Decreto-Lei n.º 164/2026, Diário da República](https://diariodarepublica.pt/dr/detalhe/decreto-lei/164-2026-1154555254)

## Pontos jurídicos de referência

- Intimação para informações e certidões: artigo 107.º do CPTA (citação oficiosa e resposta em dez dias).
- Intimação para proteção de direitos, liberdades e garantias: artigo 110.º do CPTA (despacho liminar e modalidades de tramitação subsequente).
- Impugnação judicial tributária: artigo 110.º do CPPT (notificação do RFP ordenada pelo juiz; contestação em três meses, sem conversão aritmética em noventa dias).
- Providência cautelar administrativa: artigos 116.º, 117.º e 131.º do CPTA (despacho liminar urgente, oposição e eventual decretamento provisório).

## Restrições deliberadas

- Não é um motor de decisão processual nem um assistente de despacho.
- Não calcula automaticamente prazos, efeitos de citação, taxas ou notificações.
- Não lê peças ou processos judiciais.
- Não transporta nomes, números de processo, moradas, documentos ou despachos nos links para minutas.
- **Citação e notificação não são equivalentes**: por isso, ao abrir uma minuta a partir de uma fase de citação, é proposta uma **cota genérica de conferência**, não uma notificação que presuma a citação realizada.
- As referências legais e as contagens exigem confirmação da legislação vigente, nomeadamente de direito transitório e regimes especiais.

## Qualidade

`scripts/taf-contract.mjs` verifica o catálogo e as fichas por espécie e fase. `scripts/browser-smoke.mjs` testa a alteração da fase, progressão, direito transitório e ligação a minutas. Ambos são executados pelo GitHub Actions.

A aprovação dos testes comprova apenas funcionamento técnico dos casos cobertos e não homologa a exatidão jurídica de todas as tramitações.
