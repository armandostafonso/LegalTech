# Auditoria do anonimizador de PDF

**Data de revisão técnica:** 16-11-2026

## Medidas implementadas

- A conversão integral de páginas em imagem está **ativada por predefinição**.
- Para o modo de tarja apenas visual, que preserva o texto de origem no PDF, é exigida confirmação explícita e apresentado um alerta.
- Se uma ou mais páginas não tiverem camada de texto analisável, a operação é interrompida, para não produzir uma falsa sensação de anonimização.
- No modo de conversão em imagem, após gerar o PDF, a ferramenta reabre o resultado, confirma o número de páginas e verifica que não existe texto extraível; se encontrar texto, bloqueia a descarga.
- O resultado continua a exigir **revisão visual humana**, pois as deteções automáticas podem falhar.

## Limitações importantes

1. **Não existe OCR.** Documentos digitalizados ou páginas sem texto não são automaticamente analisados.
2. A verificação de texto extraível não garante que o conteúdo visível esteja completamente anonimizado. Podem subsistir nomes em imagens, assinaturas, QR codes, matrículas ou informações manuscritas.
3. Metadados de ficheiros externos, anexos embebidos e elementos gráficos exigem avaliação específica. A criação de um novo PDF apenas com imagens reduz exposição por estrutura, mas não é, por si só, uma auditoria de privacidade.
4. Bibliotecas e modelos podem ser descarregados de serviços externos. Nunca assumir um ambiente isolado ou sem comunicação de rede.
5. O mapa de correspondência entre etiquetas e valores originais é **sensível**. Não deve ser enviado junto com o PDF anonimizado.

## Plano de testes funcionais pendentes (ficheiros exclusivamente fictícios)

- [x] Ensaio automatizado com duas páginas fictícias, termo inventado em ambas, exportação em imagem e confirmação de ausência de texto extraível.
- [x] Ensaio com PDF misto fictício (uma página textual e uma página sem camada de texto), com bloqueio de exportação.
- [x] Verificação de nome genérico do PDF exportado e limpeza do conteúdo de sessão.
- [ ] Testes com NIF fictícios em várias posições, fontes não usuais, anotações e formulários.
- [x] PDF de duas páginas com uma página sem camada de texto; deve ser bloqueado (ensaio sintético).
- [ ] PDF com dados sensíveis em cabeçalho, rodapé, tabelas e orientação horizontal.
- [ ] PDF com texto rotacionado, fontes incorporadas e letras sobrepostas.
- [ ] PDF com anotações, comentários, anexos e marcadores.
- [ ] PDF com nomes e endereços não reconhecidos: verificar a ausência de falso sentimento de segurança.
- [ ] PDF sem deteções: não deve ser gerado documento com alegação de anonimização.
- [ ] Modo sem rasterização: exigir confirmação explícita e exibir aviso inequívoco.
- [ ] PDF encriptado e ficheiro corrompido: erro controlado, sem descarga.
- [ ] Ensaios em Edge no Windows e Safari em iOS/iPadOS.

## Testes executáveis

- Testes gerais: `node scripts/browser-smoke.mjs`.
- Ensaio real do PDF fictício: `node scripts/pdf-integration.mjs` (necessita de Playwright/Chromium e bibliotecas remotas).
- Automação GitHub: [Auditoria de PDF fictício](../.github/workflows/auditoria-pdf.yml).

Os ensaios atuais comprovam que **um documento sintético de duas páginas**, após rasterização, não manteve camada de texto extraível e que um documento misto sem texto foi bloqueado. Não constitui validação de anonimização de qualquer documento real.

## Critérios para utilização institucional

Não afirmar que a ferramenta garante anonimização irreversível sem auditoria técnica independente, análise de proteção de dados e validação das políticas do organismo. Utilizar primeiro material de teste, nunca autos reais não autorizados.
