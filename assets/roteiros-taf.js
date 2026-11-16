/* Catálogo estático. Fonte: rules/roteiros-taf.json */
window.LegalTechRoteirosTAF = Object.freeze({
  "version": "2026-11-16",
  "status": "Roteiros auxiliares, não constitutivos de despacho ou certificação de prazos.",
  "workflows": [
    {
      "id": "intimacao-informacao",
      "name": "Intimação para informações, consulta ou certidões",
      "jurisdiction": "Administrativa",
      "urgency": "Urgente",
      "basis": [
        {
          "article": "CPTA, artigos 36.º, 104.º a 108.º",
          "url": "https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2002-34464475"
        }
      ],
      "notes": "Artigo 107.º, n.º 1: secretaria promove oficiosamente a citação para responder em dez dias. A adequação do meio de citação e a contagem concreta exigem conferência.",
      "stages": [
        {
          "id": "entrada",
          "name": "Entrada e distribuição",
          "steps": [
            "Conferir espécie processual, identificação das partes e pedido de informação ou certidão.",
            "Registar a urgência processual e verificar a distribuição e o estado dos autos.",
            "Verificar elementos necessários à citação da entidade demandada e de eventuais contrainteressados.",
            "Confirmar se existem despachos ou incidentes que alterem a sequência normal."
          ]
        },
        {
          "id": "citacao",
          "name": "Citação e resposta",
          "steps": [
            "Promover, quando aplicável, a citação oficiosa da entidade demandada e dos contrainteressados (CPTA, art. 107.º/1).",
            "Confirmar as modalidades de citação legalmente admissíveis e os registos eletrónicos ou postais.",
            "Verificar a data de perfeição da citação e o prazo legal de resposta de dez dias, sem presumir a data automaticamente.",
            "Controlar junção da resposta e documentos, com as referências corretas."
          ]
        },
        {
          "id": "decisao",
          "name": "Resposta, prazo e decisão",
          "steps": [
            "Verificar se houve resposta ou decurso do prazo, conforme o regime de contagem aplicável.",
            "Identificar diligências pendentes e pedidos que dependam de apreciação judicial.",
            "Encaminhar os autos segundo a lei e as determinações judiciais, tendo presente a prioridade legal.",
            "Depois da decisão, conferir notificações, prazo de cumprimento fixado e eventuais diligências determinadas."
          ]
        }
      ]
    },
    {
      "id": "intimacao-dlg",
      "name": "Intimação para proteção de direitos, liberdades e garantias",
      "jurisdiction": "Administrativa",
      "urgency": "Urgente",
      "basis": [
        {
          "article": "CPTA, artigos 36.º, 109.º a 111.º",
          "url": "https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2002-34464475"
        }
      ],
      "notes": "Artigo 110.º: despacho liminar com especial urgência; a resposta pode seguir o prazo de sete dias ou tramitação diferente fixada pelo juiz. Não automatizar prazos sem despacho.",
      "stages": [
        {
          "id": "entrada",
          "name": "Distribuição e despacho liminar",
          "steps": [
            "Assinalar a natureza urgente e conferir a distribuição.",
            "Promover conclusão urgente para despacho liminar, em conformidade com o art. 110.º do CPTA.",
            "Não emitir citação antes de verificar o conteúdo do despacho liminar e a tramitação determinada.",
            "Conferir eventual despacho que reduza ou adapte a tramitação."
          ]
        },
        {
          "id": "citacao",
          "name": "Execução do despacho liminar",
          "steps": [
            "Confirmar destinatários e forma de citação segundo o despacho e o regime aplicável.",
            "Verificar se o despacho ordenou prazo de resposta de sete dias ou prazo diferente.",
            "Controlar a perfeição da citação e a eventual audição ou diligência especialmente determinada.",
            "Registar resposta, documentos e eventuais ocorrências urgentes."
          ]
        },
        {
          "id": "decisao",
          "name": "Diligências e decisão",
          "steps": [
            "Verificar cumprimento das diligências ordenadas pelo juiz.",
            "Dar prioridade à apresentação dos autos para decisão conforme a tramitação aplicável.",
            "Conferir notificações e comunicações da decisão.",
            "Verificar eventual recurso, providência ou diligência posterior sem presumir efeito ou prazo."
          ]
        }
      ]
    },
    {
      "id": "intimacao-tributaria",
      "name": "Intimação tributária para consulta de documentos ou certidões",
      "jurisdiction": "Tributária",
      "urgency": "Regime de urgência a conferir com a remissão legal",
      "basis": [
        {
          "article": "CPPT, artigo 146.º; CPTA, artigos 36.º e 104.º a 108.º",
          "url": "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/Cod_download/Documents/CPPT.pdf"
        },
        {
          "article": "CPTA, artigos 104.º a 108.º",
          "url": "https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2002-34464475"
        }
      ],
      "notes": "O artigo 146.º do CPPT remete para as normas do processo nos tribunais administrativos; confirmar a correspondência da espécie, a jurisdição, a urgência e as especialidades aplicáveis antes do movimento.",
      "stages": [
        {
          "id": "entrada",
          "name": "Entrada e enquadramento",
          "steps": [
            "Conferir se o pedido respeita à consulta de documentos, informação ou passagem de certidão em matéria tributária.",
            "Verificar o enquadramento no artigo 146.º do CPPT e a remissão para as normas do CPTA.",
            "Confirmar a espécie processual, a entidade requerida e a eventual existência de contrainteressados.",
            "Assinalar a urgência e quaisquer determinações judiciais específicas."
          ]
        },
        {
          "id": "citacao",
          "name": "Citação e contraditório",
          "steps": [
            "Conferir a aplicabilidade da citação oficiosa prevista no artigo 107.º/1 do CPTA.",
            "Confirmar destinatários, meio de citação, data de perfeição e prazo de resposta.",
            "Verificar se existe despacho que afete a sequência dos atos ou determine diligências adicionais.",
            "Controlar a resposta e a documentação recebida."
          ]
        },
        {
          "id": "decisao",
          "name": "Decisão e cumprimento",
          "steps": [
            "Verificar a resposta ou o decurso do prazo e a existência de diligências pendentes.",
            "Apresentar os autos conforme a tramitação aplicável e os despachos proferidos.",
            "Conferir as notificações e a execução da decisão judicial.",
            "Não presumir sanções, prazos de recurso ou efeitos sem decisão e norma aplicável."
          ]
        }
      ]
    }
  ]
});
