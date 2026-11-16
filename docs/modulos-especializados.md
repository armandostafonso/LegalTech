# Módulos especializados da LegalTech Suite

**Versão inicial: 16 de novembro de 2026 · 12 módulos novos**

Esta versão aumenta o catálogo público para 21 ferramentas, mantendo o módulo de custas em desenvolvimento separado e sem qualquer alteração aos seus ficheiros ou regras de cálculo.

## Catálogo, funcionamento e limites

| Módulo | Entrada | Resultado | Limite obrigatório |
|---|---|---|---|
| [Assistant](../assistant.html) | Texto curto, autorizado e sem identificadores | Sugestões de tarefas, checklists e ligação a ferramentas | Motor determinístico por expressões; **não interpreta** juridicamente o despacho nem executa atos |
| [Notify](../notify.html) | Seleção da comunicação e do prazo já confirmado | Conferência e rascunho editável | Não determina destinatário, modalidade, prazo ou advertências |
| [Hearing](../hearing.html) | Elementos efetivamente verificados da diligência | Rascunho de ata editável em TXT/RTF | Não presume presenças, depoimentos, despachos, incidentes ou assinaturas |
| [Compare](../compare.html) | Duas versões de texto, até 250 linhas por versão | Linhas acrescentadas/removidas | Não avalia sentido, efeitos ou relevância jurídica |
| [Remessas](../remessas.html) | Tipo de remessa e verificações manuais | Relatório textual | Não certifica despacho ou envio |
| [Appeals](../appeals.html) | Regime administrativo, urgente ou tributário | Checklist com fontes de consulta | Não calcula prazos nem decide admissão, efeito ou subida |
| [PA](../pa.html) | Texto colado ou ficheiro TXT/CSV/MD/JSON até 1,5 MB | Referências cronológicas, CSV e TXT | Não suporta PDF; datas e integridade do PA não são certificadas |
| [Termos](../termos.html) | Datas previamente validadas e pressupostos manuais | Cota editável e evento de calendário | Não calcula automaticamente o termo ou a perfeição da notificação |
| [Lex Audit](../lex-monitor.html) | Data e estado de conferência indicados manualmente | Registo temporário e CSV | **Não monitoriza** nem deteta alterações legislativas automaticamente |
| [Privacy Check](../privacy-check.html) | Texto local autorizado | Indicação de padrões e substituições sugeridas | Não deteta todos os nomes/dados; não torna o documento seguro para divulgação |
| [Auditor de despacho](../audit-despacho.html) | Excerto de instrução e minuta em texto | Sinais de diferenças literais em datas, prazos e tarefas | Não confirma conformidade jurídica e pode falhar omissões |
| [Mapa TAF](../mapa-taf.html) | Seleção da espécie e fase | Visualização dos roteiros e links para as checklists | Não representa o estado real dos autos |

## Privacidade e arquitetura

1. São páginas HTML/JS estáticas alojadas no GitHub Pages, com ficheiros JS e CSS próprios do mesmo repositório.
2. Os scripts destes módulos são locais no navegador e **não fazem pedidos de rede com o conteúdo introduzido**. Abrir fontes legislativas externas é uma ação separada.
3. Nenhum módulo mantém conteúdo no `localStorage`, `sessionStorage`, `IndexedDB` ou numa base de dados; preferências do modo Claro/Escuro são a exceção e não contêm documentos.
4. Os descarregamentos em TXT, CSV, RTF ou ICS são ficheiros locais; quem os importar para outros serviços passa a estar sujeito às regras desses serviços.
5. Não colocar documentos, dados pessoais ou informação sob segredo de justiça em dispositivos ou redes sem autorização institucional. Os resultados não substituem apreciação judicial ou atos certificados.
6. O **anonimizador PDF é uma ferramenta separada** e tem outras dependências e riscos; não presumir que o seu comportamento de rede é igual ao destes módulos.
7. A exportação de textos introduzidos em ferramentas locais pode conter dados pessoais: a ausência de transmissão pela ferramenta não elimina o risco de armazenamento no dispositivo de destino.

## Manutenção e validação

- `assets/next.css` e `assets/next.js` são recursos partilhados de apresentação e exportação.
- `scripts/next-smoke.mjs` exerce os doze módulos num Chromium de testes com dados inteiramente fictícios, incluindo exportações e a ligação do mapa aos roteiros.
- `scripts/validate-site.mjs` valida a estrutura das páginas e sintaxe dos scripts.
- `scripts/a11y-smoke.mjs` verifica problemas graves de acessibilidade WCAG 2.1 A/AA em ecrãs de 390 e 820 px.
- `scripts/privacy-smoke.mjs` verifica ausência de pedidos HTTP(S) efetuados pelas páginas e não persistência após recarga para campos de teste.
- Todos os testes são técnicos, não certificação jurídica nem auditoria de segurança independente.

## Evoluções ainda necessárias

- Ligação à IA externa somente com segurança, autorização e controlo contratual adequados;
- Suporte a PDF/PA complexos, com tratamento local e gestão de metadados;
- Monitorização legislativa real com fonte oficial, distinção de vigência e revisão humana;
- Validação jurídica sistemática de regimes, citações e prazos;
- Testes manuais de Safari/iPadOS e Edge/Windows, auditoria de segurança independente.
