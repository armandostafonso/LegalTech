const amountPattern = '([0-9]+(?:[ .\\u00a0][0-9]{3})*,[0-9]{2})';
const money = value => Number(value.replace(/[ .\u00a0]/g, '').replace(',', ''));
const normalized = value => value.replace(/\s+/g, ' ').trim();

export function analyze(rawPages) {
  const pages = rawPages.map((text, i) => ({
    text: normalized(text),
    number: i + 1,
    ref: /Ref\.\s+([\w-]+)/i.exec(text)?.[1]
  }));
  if (pages.some(page => !page.text)) throw new Error('Há páginas sem texto legível. Esta versão requer um PDF com texto em todas as páginas.');
  const find = re => pages.find(page => re.test(page.text));
  const sentence = find(/fixa-se o valor da causa em/i);
  const defense = find(/fazenda pública.{0,100}contesta/i);
  const hearing = find(/a audiência realizou-se/i);
  const notification = find(/artigo 15\.º,\s*n\.º 2.{0,90}pagamento/i);
  const finality = find(/transitou em julgado/i);
  const beforeDecember = /Ref\.\s+[\w-]+\s*\|\s*\d{2}\/(?:0[1-9]|1[01])\/2026/i;
  if (!pages.every(page => /Documento integralmente fictício/i.test(page.text)) ||
    !defense || !hearing || !sentence || !notification || !finality ||
    !beforeDecember.test(notification.text) ||
    !/custas pela Autoridade Tributária e Aduaneira/i.test(sentence.text) ||
    !/não foi interposto recurso/i.test(finality.text)) {
    throw new Error('O PDF está fora do cenário de teste. Experimenta uma das duas impugnações fictícias disponíveis.');
  }
  const cause = sentence.text.match(new RegExp('valor da causa em ' + amountPattern + '\\s*€', 'i'));
  const assessed = notification.text.match(new RegExp('montante emitido:\\s*' + amountPattern + '\\s*€', 'i'));
  const issued = notification.text.match(/\bDUC\s+([\w-]+),?\s+emitido/i);
  const fee = 10200;
  if (!cause || money(cause[1]) <= 0 || money(cause[1]) > 200000 ||
      !issued || !assessed || money(assessed[1]) !== fee) {
    throw new Error('O valor da causa ou o DUC da AT precisa de conferência antes do cálculo.');
  }
  const payments = new Map();
  const paymentPattern = new RegExp('a operação ([\\w-]+),?[^.]{0,45}confirma o pagamento de ' +
    amountPattern + '\\s*€([^!?]{0,70}) relativo ao (?:documento|DUC) ([\\w-]+)\\.','i');
  for (const page of pages) {
    const match = page.text.match(paymentPattern);
    if (!match || !/estado:\s*liquidado\b/i.test(page.text)) continue;
    const [, id, amount, payer, duc] = match;
    const side = duc === issued[1] && /pela AT\b/i.test(payer) ? 'AT' :
      duc !== issued[1] && /petição inicial/i.test(page.text) ? 'Impugnante' : null;
    if (!side) throw new Error('Foi encontrado um comprovativo que precisa de associação manual.');
    const entry = { id, amount: money(amount), duc, side, page };
    const prior = payments.get(id);
    if (prior && (prior.amount !== entry.amount || prior.duc !== duc || prior.side !== side)) {
      throw new Error('O mesmo identificador de pagamento aparece com valores ou referências diferentes.');
    }
    if (!prior) payments.set(id, entry);
  }
  const subjects = ['Impugnante', 'AT'].map(side => {
    const entries = [...payments.values()].filter(entry => entry.side === side);
    const paid = entries.reduce((sum, entry) => sum + entry.amount, 0);
    return { side, entries, paid, fee, difference: fee - paid };
  });
  return { cause: money(cause[1]), subjects, sentence, notification, finality };
}
