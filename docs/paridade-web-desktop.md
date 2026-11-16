# Contrato de paridade Cita-Check Web / Desktop

**Revisão:** 16-11-2026

## Âmbito

Os dois projetos mantêm ficheiros com conteúdo de referência idêntico:

1. `rules/calendario.json` — férias judiciais e feriados nacionais.
2. `rules/municipais.json` — feriados municipais de referência.
3. `tests/shared-cases.json` — 12 casos sintéticos de contagem geral.

Cada repositório possui também o mesmo `rules/parity-manifest.json`, que contém os hashes Git dos três ficheiros. Os testes locais verificam esses valores em cada atualização. No Windows, o verificador normaliza CRLF para LF antes de calcular o hash, porque o Git pode converter fins de linha durante o *checkout*.

**Isto não constitui um motor jurídico comum.** Os algoritmos Web e Python permanecem diferentes, e a igualdade de 12 cenários não comprova equivalência para todos os prazos, meios de comunicação ou casos de direito transitório.

## Repositório Windows privado

O GitHub Actions do repositório Web não recebe automaticamente acesso ao repositório Windows privado. O token padrão do GitHub Actions apenas tem permissões do próprio repositório.

O *workflow* `Paridade Cita-Check Web e Windows` funciona com dois níveis:

- **Sem segredo adicional:** confere localmente o manifesto e escreve no relatório que a paridade remota **não foi verificada**. Não publica os dados do repositório privado nem tenta acesso anónimo.
- **Com o segredo DESKTOP_REPO_TOKEN:** consulta os três ficheiros via API GitHub autenticada e compara os hashes com o manifesto. Falha se não conseguir ler ou detetar diferenças.

Para ativar uma conferência remota efetiva, um administrador do repositório pode criar um *fine-grained personal access token* **apenas de leitura**, limitado a `armandostafonso/Cita-Check-Desktop`, permissão *Contents: Read*, e guardá-lo no repositório Web em *Settings → Secrets and variables → Actions* com o nome `DESKTOP_REPO_TOKEN`.

Não colocar tokens no código, nos ficheiros JSON, em comentários ou nos relatórios. A criação do segredo depende da autorização do titular; não é efetuada automaticamente.

## Testes e limitações

- Web: `node scripts/citacheck-parity.mjs --offline` e `node scripts/citacheck-regression.mjs`.
- Desktop: `python -m unittest discover -s tests -v`.
- Testes jurídicos de campo, critérios de aceitação por espécie processual, exceções e confronto com direito em vigor continuam necessários.
- Antes de atualizar um dos três ficheiros, rever e atualizar conscientemente o contrato **nos dois repositórios**, bem como as expectativas de testes e o manifesto.
- Uma falha de credenciais do repositório privado deve ser apresentada como **impossibilidade de verificar**; nunca como prova de divergência.

## Estado de desenvolvimento

O Desktop v1.1.0 dispõe de instalação Windows e exportação ICS; a Web contém lógica adicional de modalidades de citação. A agenda e os relatórios não têm acesso a autos oficiais. A Conta de Custas é outro projeto dentro da Suite e não faz parte deste controlo.
