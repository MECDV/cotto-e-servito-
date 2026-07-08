/**
 * Cotto & Servito — Log ordini su Google Sheet
 * ================================================
 * A cosa serve: ogni volta che un cliente completa un ordine sul sito,
 * questo script salva una riga in un Google Sheet, così hai sempre uno
 * storico consultabile anche se l'email di notifica dovesse fallire o
 * finire in spam.
 *
 * COME ATTIVARLO (5 minuti, nessuna competenza di programmazione richiesta):
 *
 * 1. Vai su https://sheets.google.com e crea un nuovo foglio Google vuoto.
 *    Chiamalo per esempio "Ordini Cotto e Servito".
 *
 * 2. Nel foglio, apri il menu Estensioni → Apps Script.
 *
 * 3. Cancella il codice di esempio che trovi e incolla TUTTO il contenuto
 *    di questo file al suo posto.
 *
 * 4. Sostituisci il valore di SHARED_KEY qui sotto con una password a tua
 *    scelta (es. "CottoServito2026!"). Deve essere lunga e difficile da
 *    indovinare: impedisce a estranei di scrivere righe false nel foglio.
 *
 * 5. In alto clicca "Distribuisci" → "Nuova distribuzione" → icona ingranaggio
 *    → tipo "App web". Imposta:
 *      - Esegui come: Me
 *      - Chi ha accesso: Chiunque
 *    Clicca "Distribuisci", autorizza l'accesso quando richiesto (è il tuo
 *    account Google, è sicuro), poi copia l'URL che ti viene mostrato
 *    (inizia con https://script.google.com/macros/s/.../exec).
 *
 * 6. Comunica a Claude (o incolla tu stesso in index.html, cercando
 *    ORDERS_WEBHOOK_URL e ORDERS_WEBHOOK_KEY):
 *      - l'URL copiato al punto 5
 *      - la password scelta al punto 4
 *
 * Fatto: da quel momento ogni ordine comparirà come nuova riga nel foglio.
 */

const SHEET_NAME = 'Ordini';
const SHARED_KEY = 'CAMBIA_QUESTA_CHIAVE'; // ⚠️ sostituisci con una password a tua scelta

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.key !== SHARED_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Data/ora', 'N. Ordine', 'Cliente', 'Telefono', 'Email',
        'Prodotti', 'Totale', 'Consegna', 'Pagamento', 'Note'
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      data.orderNumber  || '',
      data.clientName   || '',
      data.clientPhone  || '',
      data.clientEmail  || '',
      data.items        || '',
      data.total        || '',
      data.deliveryMode || '',
      data.paymentMode  || '',
      data.notes        || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
