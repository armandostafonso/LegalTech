# Conta de custas em seis passos · Manual do assistente

**Endereço:** [custas-6-passos.html](../custas-6-passos.html)  
**Documentação de base:** *Como fazer a conta em seis passos*, Centro de Formação da Direção-Geral da Administração da Justiça, documento facultado pelo utilizador (62 páginas).  
**Âmbito:** ferramenta experimental de conferência assistida; **não é o Sistema de Custas Judiciais (SCJ), nem emite contas oficiais.**

## Percurso e correspondência com o guia

| Etapa | Verificação | Base no guia |
|---|---|---|
| 1. Seleção da informação relevante | Verificar a eventual dispensa de conta, partes e benefícios, pluralidade de sujeitos, espécie e valor da acção, ano, UC e documentos | Páginas 4–17 |
| 2. Responsabilidade | Identificar os sujeitos responsáveis, a decisão judicial e as proporções fixadas | Páginas 19–22 |
| 3. Processo autónomo e taxa de justiça | Registar cada acção, recurso, incidente ou procedimento, base tributável, ano da UC, tabela e valor | Páginas 24–37 |
| 4. Encargos e outros pagamentos | Distinguir encargos, adiantamentos do IGFEJ, outros pagamentos e movimentos de guia/pagamento/restituição | Páginas 44–50 |
| 5. Multas, penalidades e coimas | Identificar responsável, despacho e valor por liquidar, com indicação de regimes específicos | Páginas 52–56 |
| 6. Finalização | Apurar saldos individualizados, eventuais custas prováveis e adiantamentos, advertências e relatório não oficial | Páginas 58–59 |

A estrutura e os termos acompanham o guia; as opções e validações informáticas são uma implementação auxiliar e **não são validação jurídica independente**.

## Como trabalhar

1. Na etapa 1, indica apenas o ano da acção e o valor fixado. A UC é sugerida para anos históricos confirmados. Cada recurso ou incidente tem o seu próprio ano no passo 3; a aplicabilidade temporal deve ser verificada autonomamente.
2. Na etapa 2, regista ou edita os intervenientes e o teor da decisão em matéria de custas. A distribuição percentual é meramente informativa, não sendo utilizada para criar débitos de taxa automaticamente.
3. No passo 3, cria um registo por processo autónomo e impulso processual. A sugestão automática está limitada à aritmética da Tabela I-A até 275 000 € e **não substitui** a análise de benefícios, dispensa da segunda prestação, remanescente ou regime temporal.
4. No passo 4, regista encargos e movimentos financeiros. Uma guia emitida ou anulada não é um pagamento confirmado. Só pagamentos e restituições confirmados são considerados nos saldos; as restituições são verificadas por referência e interveniente.
5. No passo 5, acrescenta as sanções que efectivamente devam ser objecto da conta, após conferir o despacho. Coimas e multas penais podem requerer liquidação em formulários específicos.
6. No passo 6, confirma os autos, gera a síntese por responsável, revê os avisos, e copia ou imprime o relatório. **O registo oficial continua a efectuar-se no sistema competente.**

Cada etapa dispõe de uma **checklist recolhível** com os pontos a verificar. Na primeira etapa, quando a dispensa de conta e o respectivo pressuposto estejam assinalados, existe ainda uma **minuta auxiliar de termo de dispensa**, baseada no artigo 7.º-A da Portaria n.º 419-A/2009; o utilizador deve completar a identificação dos autos e rever a fundamentação antes de a utilizar.

## Guardar e retomar sem transmissão

O botão **Guardar trabalho (.json)** descarrega um ficheiro com os registos e a etapa actual. O botão **Retomar trabalho guardado** lê esse ficheiro no próprio navegador; não é feita sincronização pelo módulo.

O ficheiro pode conter dados processuais ou pessoais que o utilizador tenha introduzido. **Não utilizar dados confidenciais num teste público, nem publicar, enviar ou deixar desprotegido um ficheiro de trabalho.** Se o ficheiro não for guardado, a informação perde-se ao actualizar ou fechar a página.

Antes de importar, os dados são conferidos com um esquema estrito: versão conhecida, dimensão limitada, intervenientes existentes, identificadores únicos, montantes válidos, ausência de restituições confirmadas acima dos pagamentos e impossibilidade de anulação sem a guia de origem. Ficheiros inválidos são rejeitados.

A remoção de um interveniente com movimentos, taxas ou encargos associados é bloqueada. A remoção de pagamentos não pode deixar restituições confirmadas sem cobertura.

## Limites de validade jurídica

- **Dispensa de conta:** a selecção é declarativa; confirmar os pressupostos do artigo 29.º do RCP e documentar o processo, conforme o artigo 7.º-A da Portaria n.º 419-A/2009.
- **Taxa de justiça:** os montantes individuais são introduzidos pelo utilizador, salvo uma sugestão aritmética condicionada da Tabela I-A. Não são apuradas automaticamente todas as Tabelas I/II, os regimes históricos ou as reduções.
- **Responsabilidade:** os pagamentos e as obrigações são agregados por responsável, sem compensar excessos entre pessoas distintas. As diferenças apresentadas não representam necessariamente dívida vencida, conta final ou direito a restituição.
- **Pagamentos:** o estado «Comprovado» é assinalado pelo utilizador. A ferramenta não consulta DUC, SCJ, CITIUS/SITAF, extractos ou sistemas de pagamento.
- **Contas específicas:** matérias penais, contraordenacionais, processos tributários e outras espécies podem exigir cálculos e formulários próprios, ainda não completos neste assistente.
- **Segurança e privacidade:** não há backend de contas ou upload de processos. Não existe certificação de segurança para tratamento de dados judiciais reais.

## Testes

- `node scripts/test-custas-6-passos.mjs`: **31 testes** do núcleo, cálculos, validação de projectos JSON e integridade de referências.
- `node scripts/test-custas-browser.mjs`: percurso no Chromium, incluindo registo de taxa, pagamento, finalização, bloqueio de remoção de interveniente, guarda/retoma e rejeição de ficheiro inválido.
- `node scripts/validate-site.mjs`: sintaxe e integridade estrutural do HTML, scripts e ligações do site.

Estes testes validam operações técnicas, **não a correcção das contas em casos judiciais reais**.
