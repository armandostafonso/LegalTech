import { analyze } from './rules.mjs';
const get = id => document.getElementById(id);
const status = get('status');
const input = get('pdf');
const buttons = [...document.querySelectorAll('[data-sample]')];
const euro = cents => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(cents / 100);
let documentUrl;
let reader;

function tag(name, value, className) {
  const node = document.createElement(name);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}

function evidence(linkText, page) {
  const link = tag('a', linkText + ' · p. ' + page.number + (page.ref ? ' · ' + page.ref : ''));
  link.href = documentUrl + '#page=' + page.number;
  link.target = '_blank';
  link.rel = 'noopener';
  return link;
}

function render(result) {
  get('open').href = documentUrl;
  const context = get('context');
  context.replaceChildren('Valor da causa: ' + euro(result.cause) + ' · Tabela I-A, primeiro escalão · ',
    evidence('Sentença', result.sentence), ' · ', evidence('Trânsito', result.finality));
  const cards = get('cards');
  cards.replaceChildren();
  for (const subject of result.subjects) {
    const card = tag('article', '', 'card');
    card.append(tag('h3', subject.side === 'AT' ? 'AT · Contestação' : 'Impugnante · Petição inicial'),
      tag('p', 'Taxa apurada: ' + euro(subject.fee) + ' · Pagamentos comprovados: ' + euro(subject.paid)));
    if (subject.side === 'AT') {
      const paragraph = tag('p', '', 'evidence');
      paragraph.append(evidence('Notificação e DUC da AT', result.notification));
      card.append(paragraph);
    }
    if (subject.entries.length) {
      const list = tag('ul', '', 'evidence');
      for (const entry of subject.entries) {
        const item = tag('li', '');
        item.append(evidence(euro(entry.amount) + ' · ' + entry.id, entry.page));
        list.append(item);
      }
      card.append(list);
    }
    const balance = subject.difference > 0
      ? euro(subject.difference) + ' por confirmar no registo oficial. Saldo provisório.'
      : subject.difference < 0 ? euro(-subject.difference) + ' pagos em excesso, sujeito a conferência.'
      : 'Saldo da taxa de justiça: ' + euro(0);
    card.append(tag('p', balance, subject.difference ? 'flag' : ''));
    cards.append(card);
  }
  get('conclusion').textContent = result.subjects.every(subject => subject.difference === 0)
    ? 'Sem quantias em dívida neste cenário. Verificar a dispensa de elaboração da conta (art. 29.º, n.º 1, al. a), do RCP).'
    : 'Confere as verbas assinaladas antes de fechar o saldo.';
  get('results').hidden = false;
}

async function run(name, loadFile) {
  input.disabled = true;
  buttons.forEach(button => { button.disabled = true; });
  get('results').hidden = true;
  status.className = '';
  status.textContent = 'A ler ' + name + '…';
  let pdf;
  try {
    const file = await loadFile();
    if (!reader) {
      reader = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.mjs');
      reader.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.mjs';
    }
    pdf = await reader.getDocument({data: await file.arrayBuffer(), isEvalSupported: false}).promise;
    if (pdf.numPages > 150) throw new Error('Este protótipo suporta PDFs até 150 páginas.');
    const texts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texts.push(content.items.map(item => item.str || '').join(' '));
      page.cleanup();
    }
    const result = analyze(texts);
    if (documentUrl) URL.revokeObjectURL(documentUrl);
    documentUrl = URL.createObjectURL(file);
    render(result);
    status.textContent = name + ' · ' + pdf.numPages + ' páginas lidas.';
  } catch (error) {
    status.className = 'error';
    status.textContent = error.message || 'Não foi possível analisar este PDF.';
  } finally {
    if (pdf) await pdf.destroy().catch(() => {});
    input.disabled = false;
    input.value = '';
    buttons.forEach(button => { button.disabled = false; });
  }
}

input.addEventListener('change', () => {
  const file = input.files[0];
  if (file) void run(file.name, () => file);
});
for (const button of buttons) {
  button.addEventListener('click', () => {
    const name = 'Impugnacao_ficticia_' + button.dataset.sample + '.pdf';
    void run(name, async () => {
      const response = await fetch('./' + name);
      if (!response.ok) throw new Error('Não foi possível carregar o exemplo.');
      return new Blob([await response.arrayBuffer()], {type:'application/pdf'});
    });
  });
}
