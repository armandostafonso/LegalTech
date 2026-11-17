# LegalTech Flow — Guia técnico e de segurança

**Versão:** 1.0 · 17 de novembro de 2026  
**Estado:** apoio experimental à preparação e conferência de atos, sem certificação jurídica.

## Objetivo

Disponibilizar uma sequência simples de preparação, conferência e exportação de um roteiro para atos de secretaria: notificações, citações, ofícios, certidões, conclusões, remessas, diligências e outros atos.

O utilizador seleciona o tipo, pode escrever um resumo desidentificado, indicar uma data já confirmada e acrescentar notas. O programa apresenta verificações genéricas e específicas, acrescentando alertas textuais sobre algumas expressões. O utilizador pode assinalar as verificações e exportar o relatório em TXT ou RTF, ou copiá-lo.

Os alertas são regras determinísticas de palavras-chave. **Não são interpretação de despachos, decisões automáticas ou reconhecimento de normas legais.** Não há execução no CITIUS, envio de expedientes, cálculo de prazos, consulta de legislação ou tratamento de PDFs.

## Segurança e privacidade

- flow.html, assets/flow.js, assets/flow-core.js e assets/flow.css são servidos como recursos estáticos do mesmo repositório, sem bibliotecas externas específicas.
- Os módulos Flow não fazem pedidos HTTP com o conteúdo do utilizador e não usam armazenamento local, cookies ou servidores para dados de tarefas. O controlador comum de aparência pode guardar **apenas a preferência do tema**.
- O conteúdo do formulário e do relatório existe apenas na memória da página durante a sessão. «Limpar sessão» apaga os campos; fechar ou recarregar a página descarta os dados da aplicação (sem impedir mecanismos de restauro de formulários do próprio navegador ou ficheiros exportados).
- Ao copiar ou exportar, o conteúdo pode ficar na área de transferência, num ficheiro ou noutro serviço. Cabe ao utilizador obedecer às regras institucionais e de proteção de dados.
- Não introduzir dados de processos reais em dispositivos não autorizados. Utilizar exemplos fictícios, anonimizados ou dados expressamente autorizados.
- As ligações a outras ferramentas **não transferem automaticamente dados**. Abrem módulos autónomos.

## Limitações operacionais

- A seleção de «Notificação» ou «Citação» é feita pelo utilizador e **não significa que a lei ou o despacho exija o ato**.
- Uma palavra «urgente» apenas cria um alerta para verificar o regime concreto; **não reduz prazos**.
- A data introduzida é uma anotação do utilizador; não é calculada ou validada juridicamente.
- As caixas assinaladas representam verificações declaradas, não atos cumpridos nem certificação legal.
- O relatório pode ser editado manualmente. Para não substituir texto editado, novas marcas só o atualizam automaticamente enquanto não existirem edições diretas; «Recriar relatório» volta a gerar o documento.
- Não há passagem automática de campos para Cita-Check, Notify ou Docs, nem armazenamento persistente de projetos.

## Testes

- Executar node scripts/flow-contract.mjs para testar os contratos do núcleo, a tipologia, limites, datas, alertas textuais e ausência de rede/persistência.
- Executar node scripts/flow-browser.mjs para testar a interface em Chromium e WebKit, usando dados sintéticos. Requer Playwright e browsers instalados.
- Executar node scripts/validate-site.mjs para validar estrutura HTML, IDs, links e sintaxe.

Estes testes não constituem validação jurídica de todas as modalidades processuais nem auditoria de segurança independente.

## Evoluções planeadas

1. Introduzir fichas de pressupostos por espécie processual, sem inferência automática.
2. Criar passagem consentida e estruturada de dados **não sensíveis** entre ferramentas numa única sessão.
3. Adicionar modelos de expediente revistos por especialistas, com versões normativas.
4. Integrar testes de acessibilidade e revisão jurídico-processual de cada roteiro.
5. Criar edição offline empacotada com verificação de integridade e controlo de dependências.

## Passagem manual entre ferramentas

Após preparar um roteiro, o botão «Copiar contexto para outra ferramenta» compõe um resumo com tipo de ato, etiqueta genérica, instrução desidentificada, notas e verificações assinaladas. A cópia depende de clique explícito; o Flow não envia os dados ao módulo de destino, não os inclui no URL e não os persiste. O utilizador pode abrir uma ferramenta relacionada e colar o resumo onde for adequado. A área de transferência é gerida pelo sistema operativo e pode reter conteúdo. Não usar dados reais confidenciais ou identificativos sem autorização.
