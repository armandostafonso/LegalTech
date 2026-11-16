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
| Tramitação TAF | `tramitação-taf.html` | Nove roteiros: intimações, ações, impugnações, cautelares, recursos, pré-contratual e reclamações OEF |
| Prazos CPA e CPPT | `regimes.html` | Contagem auxiliar em dias com regras dos artigos 87.º CPA e 20.º/1 CPPT |
| Conferência de custas (A01) | `custas.html` | Conferência manual de taxas e pagamentos, sem cálculo jurídico automático |
| Privacidade | `privacidade.html` | Informação sobre limites, dependências e tratamento local |
| Agenda local | `agenda.html` | Datas previamente conferidas, exportação ICS e CSV, sem armazenamento persistente |

A Tramitação TAF reúne [33 fichas por fase](docs/fichas-taf.md), com cautelas, atos dependentes de despacho e ligação às minutas. As verificações são temporárias. A [Agenda local](agenda.html) permite exportar eventos genéricos em ICS e CSV, mas não calcula prazos nem guarda dados após recarga. As [minutas](minutas.html) podem ser editadas diretamente e exportadas em TXT ou RTF para Word/Pages. O [acesso em iPad/iPhone](instalar.html) pode ser acrescentado ao ecrã principal, mas o acesso à Internet continua necessário para obter conteúdo e dependências atualizados.

**Atenção:** não são instrumentos oficiais e não substituem despacho, verificação dos autos ou enquadramento legal. Não se deve utilizar um cálculo sem confirmar as normas concretamente aplicáveis.

O módulo A01 é experimental: contém apenas simulações orientadoras da Tabela I e conferência aritmética dos montantes indicados, além de fichas de intervenientes (isenções, apoio judiciário e dispensa de pagamento prévio). Não recebe PDFs nem emite conta oficial. Exige verificação da versão do RCP, do regime de cada parte, das reduções, remanescente e pagamentos. Não introduzir dados confidenciais. Especificação: [Caderno jurídico e técnico A01](docs/motor-custas-A01.md).

## Testes de qualidade

O GitHub Actions executa verificações de estrutura, de contrato do calendário e da Tramitação TAF, de navegação, de modo Claro-Escuro e acessibilidade WCAG A/AA nas ferramentas principais, de privacidade e de regressão do Cita-Check. A auditoria isolada do anonimizador usa PDFs fictícios com duas páginas e documentos mistos sem texto.

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
