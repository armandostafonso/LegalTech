# LegalTech

Ferramentas jurídicas práticas em português de Portugal. Projeto estático publicado em GitHub Pages.

## Ferramentas

| Ferramenta | Ficheiro | Finalidade |
|---|---|---|
| Início | `index.html` | Catálogo e pesquisa das ferramentas |
| Anonimizador | `anonimizador.html` | Anonimização assistida de PDF, com revisão humana obrigatória |
| Cita-Check | `citacheck.html` | Simulação de citações, notificações e prazos, com cota proposta |
| Minutas | `minutas.html` | Rascunhos de cotas, certidões, notificações e ofícios |
| Roteiros | `roteiros.html` | Checklists operacionais de secretaria |
| Prazos CPA e CPPT | `regimes.html` | Contagem auxiliar em dias com regras dos artigos 87.º CPA e 20.º/1 CPPT |
| Conferência de custas (A01) | `custas.html` | Conferência manual de taxas e pagamentos, sem cálculo jurídico automático |
| Privacidade | `privacidade.html` | Informação sobre limites, dependências e tratamento local |

**Atenção:** não são instrumentos oficiais e não substituem despacho, verificação dos autos ou enquadramento legal. Não se deve utilizar um cálculo sem confirmar as normas concretamente aplicáveis.

O módulo A01 é experimental e não recebe PDFs nem calcula taxas legais. Exige que o utilizador determine os valores e confirme a versão do RCP, isenções, reduções, remanescente e pagamentos. Não introduzir dados confidenciais.

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
