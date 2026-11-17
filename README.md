# LegalTech Suite

Suite integrada de ferramentas jurídicas práticas em português de Portugal. Projeto estático publicado em GitHub Pages.

**Identidade:** LegalTech Suite é a marca da plataforma. Os módulos preservam os seus nomes funcionais, endereços e algoritmos. A identidade visual usa `assets/brand.css`, `assets/legaltech-mark.svg` e `assets/theme.js`, com modos claro e escuro. O nome comercial ainda carece de pesquisa de anterioridade de marca no INPI/EUIPO.

## Ferramentas

| Ferramenta | Ficheiro | Finalidade |
|---|---|---|
| Início | `index.html` | Catálogo e pesquisa das ferramentas |
| Anonimizador | `anonimizador.html` | Anonimização assistida de PDF, com revisão humana obrigatória |
| Cita-Check | `citacheck.html` | Simulação de citações, notificações e prazos, com cota proposta |
| Minutas | `minutas.html` | Rascunhos de cotas, certidões, notificações e ofícios |
| Roteiros | `roteiros.html` | Checklists operacionais de secretaria |
| LegalTech Check | `expediente.html` | Conferência formal de seis tipos de expediente, sem dados processuais |
| Fontes normativas | `fontes.html` | Inventário da base jurídica dos nove roteiros TAF, com conferência manual sem persistência |
| **LegalTech Flow** | `flow.html` | Preparação e conferência de tarefas de secretaria, relatório TXT/RTF sem execução automática |
| Assistant | `assistant.html` | Sugestão determinística de tarefas a conferir em instruções judiciais |
| Notify | `notify.html` | Checklists e rascunhos genéricos de citações e notificações |
| Hearing | `hearing.html` | Rascunhos editáveis de atas e diligências com exportação RTF |
| Compare | `compare.html` | Comparação local de linhas de duas versões de texto |
| Remessas | `remessas.html` | Conferência de remessas e anexos com relatório editável |
| Appeals | `appeals.html` | Conferência orientadora de recursos CPTA e CPPT, sem cálculo automático |
| PA | `pa.html` | Extração local de datas de texto ou PDF com camada de texto (sem OCR), com página de origem e limites de processamento |
| Termos | `termos.html` | Registo auxiliar de termo previamente conferido, rascunho de cota e ICS |
| Lex Audit | `lex-monitor.html` | Registo manual e temporário de revisões normativas; não faz vigilância automática |
| Privacy Check | `privacy-check.html` | Detetor por padrões de identificadores em texto, não anonimização certificada |
| Auditor despacho/minuta | `audit-despacho.html` | Sinais textuais de omissão entre instrução e rascunho |
| Mapa TAF | `mapa-taf.html` | Navegação visual pelas fases dos nove roteiros processuais |
| Tramitação TAF | `tramitação-taf.html` | Nove roteiros: intimações, ações, impugnações, cautelares, recursos, pré-contratual e reclamações OEF |
| Prazos CPA e CPPT | `regimes.html` | Contagem auxiliar em dias com regras dos artigos 87.º CPA e 20.º/1 CPPT |
| Conferência de custas (A01) | `custas.html` | Taxas, encargos, contas individualizadas multissujeito, benefícios e reconciliação financeira |
| Privacidade | `privacidade.html` | Informação sobre limites, dependências e tratamento local |
| Agenda local | `agenda.html` | Datas previamente conferidas, exportação ICS e CSV, sem armazenamento persistente |

A Tramitação TAF reúne [33 fichas por fase](docs/fichas-taf.md), com cautelas, atos dependentes de despacho e ligação às minutas. As verificações são temporárias. A [Agenda local](agenda.html) permite exportar eventos genéricos em ICS e CSV, mas não calcula prazos nem guarda dados após recarga. As [minutas](minutas.html) podem ser editadas diretamente e exportadas em TXT ou RTF para Word/Pages. O [acesso em iPad/iPhone](instalar.html) pode ser acrescentado ao ecrã principal, mas o acesso à Internet continua necessário para obter conteúdo e dependências atualizados.

**Atenção:** não são instrumentos oficiais e não substituem despacho, verificação dos autos ou enquadramento legal. Não se deve utilizar um cálculo sem confirmar as normas concretamente aplicáveis.

O módulo A01 está na versão experimental 2.0, agora com uma **página principal simplificada (`custas.html`)**: valor da causa fixado na decisão, taxa da petição inicial, contestação apresentada ou não apresentada, pagamento total (com discriminação facultativa por prestações), multas e incidentes opcionais identificados e tabela de conferência para impressão. Se não há contestação, não é criada taxa por esse impulso. **O motor técnico foi integralmente preservado em `custas-tecnico.html`**, com as regras e controlos anteriores. Calcula taxas-base da Tabela I-A/I-B com pressupostos verificados, prestações I-A e remanescente condicionado. Regista obrigações, pagamentos e fichas das partes; distingue isenção, apoio judiciário, redução a 90% e dispensa de pagamento prévio. Acrescenta um mapa de repartição de encargos individuais por decisão judicial, sem redistribuir automaticamente as taxas de justiça nem calcular custas de parte. A reconciliação por impulso distingue pagamentos confirmados, restituições, movimentos pendentes, excessos potenciais e pagamentos sem imputação. O mapa multissujeito acrescenta repartição fundamentada de encargos entre até 12 intervenientes, com quotas expressas e divisão igual condicionada pelo artigo 528.º, n.º 1, do CPC. A versão 2.0 permite registar obrigações, guias, pagamentos e restituições por interveniente, importar encargos repartidos e reconciliar diferenças e pagamentos sem imputação. O mapa mantém-se autónomo face à conta A/B e bloqueia automatismos perante solidariedade e transacção. A prévia de conferência por sujeito permite copiar a discriminação e exportar um resumo CSV com bloqueios expressos, não sendo uma conta oficial. Não recebe PDFs nem emite conta oficial. Exige verificação da versão do RCP, do regime de cada parte, das reduções, remanescente e pagamentos. Não introduzir dados confidenciais. Especificação: [Guia da conta simples](docs/conta-simples-A01.md) e [Caderno jurídico e técnico A01](docs/motor-custas-A01.md).

**Núcleo de prazos Web/Windows:** [arquitetura comum de cálculo CPC/CPA/CPPT](docs/prazo-core.md) e [contrato de paridade](docs/paridade-web-desktop.md). As interfaces utilizam núcleos JS/Python correspondentes, com 324 cenários sintéticos e manifesto dos cinco ficheiros de configuração e teste. A comparação remota entre repositórios requer autorização para aceder ao Desktop privado. Não constitui certificação jurídica.

## LegalTech Flow

A versão 1.0 do LegalTech Flow introduz um roteiro de preparação e conferência de oito tipos de atos de secretaria, com alertas por palavras-chave, verificação manual e relatório editável em TXT/RTF. Não interpreta juridicamente despachos, não executa atos, não transfere dados automaticamente para outros módulos e não comunica com IA externa. Os formulários são efémeros. Limites e testes em docs/flow.md. Os testes automáticos de contrato e de navegação em Chromium/WebKit não equivalem a certificação jurídica.

## Módulos especializados

Foram acrescentados doze módulos de apoio à produtividade, com [matriz de funcionalidades, riscos e limites](docs/modulos-especializados.md). Os módulos não utilizam IA externa, não consultam processos judiciais nem decidem qual o ato processual juridicamente devido. O Assistant identifica padrões predefinidos do texto; a comparação e o Privacy Check são heurísticos; o Lex Audit regista verificações manuais. Não colocar dados reais de processos em equipamentos não autorizados.

## Testes de qualidade

O módulo A01 dispõe de **169 testes técnicos de regressão** do motor técnico, **27 testes da conta simples** em `scripts/test-custas.mjs` e de **6 cenários sintéticos completos** em `scripts/test-custas-cenarios.mjs`, com dados auditáveis em `scripts/fixtures/custas-a01-cenarios.json`. Inclui também um teste de interface em Chromium (`scripts/test-custas-browser.mjs`), configurado no GitHub Actions. A execução efectiva do navegador e do workflow deve ser confirmada nos respectivos logs. Estes testes não certificam a interpretação jurídica nem os resultados em processos reais.


O GitHub Actions executa os 228 casos CPC (`scripts/citacheck-regression.mjs`) e 96 casos CPA/CPPT (`scripts/regimes-parity.mjs`), além da bateria `scripts/next-smoke.mjs` para os doze módulos especializados, além das verificações de estrutura, de contrato do calendário e da Tramitação TAF, de navegação, de modo Claro-Escuro e acessibilidade WCAG A/AA nas ferramentas principais, de privacidade e de regressão do Cita-Check. A auditoria isolada do anonimizador usa PDFs fictícios com duas páginas e documentos mistos sem texto.

**A aprovação destes testes não constitui certificação jurídica, auditoria de privacidade independente ou garantia de utilização offline.**

## Segurança e privacidade

- Minutas e roteiros são executados localmente no browser; os conteúdos não são enviados para servidores por estas ferramentas.
- O anonimizador carrega bibliotecas/modelos externos quando necessário. O tratamento documental decorre no browser, mas a descarregabilidade dos recursos depende da ligação à Internet.
- A ocultação visual de informação em PDF não dispensa validação. Confirmar todas as páginas, pesquisa/cópia de texto, metadados e eventual informação residual.
- PDFs sem camada de texto não são tratados por OCR no anonimizador atual.
- Não usar documentos reais com dados pessoais em testes públicos ou issues.

## Organização

O código das duas ferramentas anteriores foi preservado em `backups/2026-11-16/`.

O motor de cálculo do Cita-Check atual continua integrado em `citacheck.html` e **não foi reescrito nesta renovação**. Os respetivos resultados exigem testes jurídicos de regressão antes de alterar a lógica.

A aplicação de Windows é um projeto independente, em outro repositório.

## Testes de custas A01

Executar `node scripts/test-custas.mjs` para verificar escalões, remanescente, artigo 14.º-A, regras transitórias, perfis de intervenientes e conferência separada por parte. O ficheiro `.github/workflows/custas-tests.yml` executa estes testes e a validação do site em pushes e pull requests pertinentes. São testes técnicos e não certificam a interpretação jurídica. O módulo continua experimental e não emite conta oficial.

## Validação

A workflow `Verificar LegalTech` executa `node scripts/validate-site.mjs` para validar sintaxe dos scripts embebidos, identificadores HTML duplicados e referências a recursos locais. Este teste técnico **não certifica a correção jurídica dos resultados nem a segurança da anonimização**.

## Próximas melhorias

1. Testes jurídicos de regressão de prazos, férias judiciais e dilações, com casos validados.
2. Auditoria técnica da anonimização, incluindo inspeção do PDF de saída.
3. Acessibilidade e testes de utilização em telemóveis.
4. Documentação de versões legais e de alterações às regras de cálculo.

## Desenvolvimento

Editar apenas os ficheiros necessários e executar `node scripts/validate-site.mjs` antes de publicar. A página é estática e não requer servidor. Para testes manuais, usar ficheiros fictícios sem dados identificativos.

**Data da reorganização:** 16 de novembro de 2026.
