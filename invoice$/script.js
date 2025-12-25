// === CONFIG ===
const GOOGLE_DRIVE_FOLDER_ID = "1joq5uw5Qq_Qt_BE4fm-dqOtJ64dIVOC2";
const VALTOWN_TOKEN_URL = "https://krazyykrunal--a701dafe5a3611f09f24f69ea79377d9.web.val.run";

// === STORAGE KEYS ===
const STORAGE_KEYS = {
  clientName: 'invoice_client_name',
  clientAddress: 'invoice_client_address',
  invoiceType: 'invoice_type',
  clientSelect: 'invoice_client_select',
  contentType: 'invoice_content_type',
  currency: 'invoice_currency',
  toggleSow: 'invoice_toggle_sow',
  saveToCloud: 'invoice_save_to_cloud',
  poNumber: 'invoice_po_number',
  items: 'invoice_items',
  sow: 'invoice_sow'
};

let hasLoadedSow = false;

// === SAVE/LOAD FUNCTIONS ===
function saveToStorage() {
  localStorage.setItem(STORAGE_KEYS.clientName, document.getElementById('client-name').innerText.trim());
  localStorage.setItem(STORAGE_KEYS.clientAddress, document.getElementById('client-address').innerText.trim());
  localStorage.setItem(STORAGE_KEYS.invoiceType, document.getElementById('invoice-type').value);
  localStorage.setItem(STORAGE_KEYS.clientSelect, document.getElementById('client-select').value);
  localStorage.setItem(STORAGE_KEYS.contentType, document.getElementById('content-type').value);
  localStorage.setItem(STORAGE_KEYS.currency, document.getElementById('currency-select').value);
  localStorage.setItem(STORAGE_KEYS.toggleSow, document.getElementById('toggle-sow').checked);
  localStorage.setItem(STORAGE_KEYS.saveToCloud, document.getElementById('save-to-cloud').checked);
  localStorage.setItem(STORAGE_KEYS.poNumber, document.getElementById('po-number').value);

  const items = [];
  document.querySelectorAll('#items-body tr').forEach(row => {
    const textareas = row.querySelectorAll('textarea');
    const item = textareas[0].value;
    const service = textareas[1].value;
    const rate = row.querySelector('input').value;
    items.push({ item, service, rate });
  });
  localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));

  const sow = Array.from(document.querySelectorAll('#sow-list li')).map(li => li.innerText.trim());
  localStorage.setItem(STORAGE_KEYS.sow, JSON.stringify(sow));
}

function loadFromStorage() {
  const clientName = localStorage.getItem(STORAGE_KEYS.clientName);
  if (clientName) document.getElementById('client-name').innerText = clientName;

  const clientAddress = localStorage.getItem(STORAGE_KEYS.clientAddress);
  if (clientAddress) document.getElementById('client-address').innerText = clientAddress;

  const invoiceType = localStorage.getItem(STORAGE_KEYS.invoiceType);
  if (invoiceType) document.getElementById('invoice-type').value = invoiceType;

  const clientSelect = localStorage.getItem(STORAGE_KEYS.clientSelect);
  if (clientSelect) document.getElementById('client-select').value = clientSelect;

  const contentType = localStorage.getItem(STORAGE_KEYS.contentType);
  if (contentType) document.getElementById('content-type').value = contentType;

  const currency = localStorage.getItem(STORAGE_KEYS.currency);
  if (currency) document.getElementById('currency-select').value = currency;

  const toggleSow = localStorage.getItem(STORAGE_KEYS.toggleSow);
  if (toggleSow !== null) document.getElementById('toggle-sow').checked = toggleSow === 'true';

  const saveToCloud = localStorage.getItem(STORAGE_KEYS.saveToCloud);
  if (saveToCloud !== null) document.getElementById('save-to-cloud').checked = saveToCloud === 'true';

  const poNumber = localStorage.getItem(STORAGE_KEYS.poNumber);
  if (poNumber) document.getElementById('po-number').value = poNumber;

  const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.items) || '[]');
  items.forEach(itemData => {
    addRow(itemData);
  });

  const sow = JSON.parse(localStorage.getItem(STORAGE_KEYS.sow) || '[]');
  if (sow.length > 0) {
    const sowList = document.getElementById('sow-list');
    sowList.innerHTML = '';
    sow.forEach(text => {
      const li = document.createElement('li');
      li.innerText = text;
      sowList.appendChild(li);
    });
    hasLoadedSow = true;
  }
}

// === DATE SETUP ===
const today = new Date();
document.getElementById("invoice-date").innerText = formatFancyDate(today);

function formatFancyDate(date) {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th';

  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
}

// === CURRENCY MAP ===
const currencyMap = {
  INR: { symbol: "₹", code: "INR" },
  USD: { symbol: "$", code: "USD" },
  EUR: { symbol: "€", code: "EUR" },
  GBP: { symbol: "£", code: "GBP" }
};
const currencySelect = document.getElementById("currency-select");

// === GENERATE INVOICE NO ===
function generateInvoiceNo() {
  const today = new Date();
  const dd = today.getDate().toString().padStart(2, '0');
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const yy = today.getFullYear().toString().slice(-2);

  const firstItemInput = document.querySelector('#items-body textarea');
  let initials = 'XXX';

  if (firstItemInput && firstItemInput.value.trim().length > 0) {
    const words = firstItemInput.value.trim().toUpperCase().split(/\s+/);
    const letters = words.map(word => word.charAt(0)).slice(0, 3);
    while (letters.length < 3) letters.push('X');
    initials = letters.join('');
  }

  const prefix = document.getElementById("invoice-type").value === "proforma" ? "PROINV" : "INV";
  const invoiceNo = `${prefix}${dd}${mm}${yy}${initials}`;
  document.getElementById("invoice-no").innerText = invoiceNo;
  return invoiceNo;
}

// === CALCULATE SUBTOTAL ===
function calculateSubtotal() {
  const rows = document.querySelectorAll("#items-body tr");
  let subtotal = 0;

  rows.forEach(row => {
    const rateInput = row.querySelector(".rate");
    const rate = parseFloat(rateInput.value || 0);
    subtotal += rate;
    row.querySelector(".amount").innerText = rate.toFixed(2);
  });

  const curr = currencySelect.value;
  document.getElementById("subtotal-currency").innerText = currencyMap[curr].symbol;
  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  return subtotal;
}

// === ADD ROW ===
function addRow(itemData = {}) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><textarea placeholder="Item name">${itemData.item || ''}</textarea></td>
    <td><textarea placeholder="Service description">${itemData.service || ''}</textarea></td>
    <td><input type="number" value="${itemData.rate || 0}" class="rate"></td>
    <td class="amount">0.00</td>
    <td><button class="delete-row">🗑</button></td>
  `;

  document.getElementById("items-body").appendChild(row);

  row.querySelector(".rate").addEventListener("input", () => {
    calculateSubtotal();
    saveToStorage();
  });
  row.querySelectorAll('textarea').forEach(ta => ta.addEventListener('input', saveToStorage));
  row.querySelector(".delete-row").addEventListener("click", () => {
    row.remove();
    calculateSubtotal();
    generateInvoiceNo();
    saveToStorage();
  });

  generateInvoiceNo();
  calculateSubtotal();
}

document.getElementById("add-row").addEventListener("click", () => {
  addRow();
  saveToStorage();
});

// === EVENT LISTENERS FOR STORAGE ===
document.getElementById('client-name').addEventListener('input', saveToStorage);
document.getElementById('client-address').addEventListener('input', saveToStorage);
document.getElementById('invoice-type').addEventListener('change', () => {
  updateConditionalSections();
  saveToStorage();
});
document.getElementById('client-select').addEventListener('change', () => {
  updateConditionalSections();
  saveToStorage();
});
document.getElementById('content-type').addEventListener('change', () => {
  updateSOWContent();
  saveToStorage();
});
document.getElementById('currency-select').addEventListener('change', () => {
  updateCurrencyDisplay();
  calculateSubtotal();
  saveToStorage();
});
document.getElementById('toggle-sow').addEventListener('change', () => {
  updateSOWVisibility();
  saveToStorage();
});
document.getElementById('save-to-cloud').addEventListener('change', saveToStorage);
document.getElementById('po-number').addEventListener('input', saveToStorage);
document.getElementById('sow-list').addEventListener('input', saveToStorage);

// === RESET BUTTON ===
document.getElementById('reset-default').addEventListener('click', () => {
  localStorage.clear();
  location.reload();
});

// === FETCH DRIVE TOKEN (with caching) ===
let cachedToken = null;
let tokenExpiry = 0;

async function getGoogleDriveToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }
  const res = await fetch(VALTOWN_TOKEN_URL);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000; // minus 1 min buffer
  return cachedToken;
}

// === DOWNLOAD + UPLOAD ===
document.getElementById("download").addEventListener("click", async () => {
  const saveToCloud = document.getElementById("save-to-cloud").checked;
  const invoiceNo = generateInvoiceNo();
  const fileName = `Invoice_${invoiceNo}.pdf`;

  // ===== STEP 1: Google Drive upload (html2pdf only for this) =====
  if (saveToCloud) {
    // Clone invoice for PDF
    const invoiceClone = document.querySelector('.invoice-container').cloneNode(true);

    const configSection = invoiceClone.querySelector('.config');
    if (configSection) configSection.remove();

    invoiceClone.querySelectorAll("#add-row, #download, #save-to-cloud, button.delete-row")
      .forEach(el => el.remove());

    invoiceClone.querySelectorAll('textarea').forEach(textarea => {
      const div = document.createElement('div');
      div.textContent = textarea.value;
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      textarea.replaceWith(div);
    });

    invoiceClone.querySelectorAll('[contenteditable="true"]').forEach(editable => {
      const div = document.createElement('div');
      div.textContent = editable.innerText;
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      editable.replaceWith(div);
    });

    invoiceClone.querySelectorAll('input').forEach(input => {
      const div = document.createElement('div');
      div.textContent = input.value || input.placeholder || "";
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      input.replaceWith(div);
    });

    invoiceClone.querySelectorAll('select').forEach(select => {
      const span = document.createElement('span');
      span.textContent = select.options[select.selectedIndex]?.text || "";
      select.replaceWith(span);
    });

    invoiceClone.style.background = "#fff";
    invoiceClone.style.boxShadow = "none";
    invoiceClone.style.margin = "0";
    invoiceClone.style.maxWidth = "100%";
    invoiceClone.style.padding = "20px";

    try {
      const pdfBlob = await html2pdf()
        .from(invoiceClone)
        .set({
          margin: 10,
          filename: fileName,
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .output('blob');

      const form = new FormData();
      form.append("file", pdfBlob, fileName);
      form.append("filename", fileName);

      const uploadRes = await fetch(
        "https://krazyykrunal--a701dafe5a3611f09f24f69ea79377d9.web.val.run",
        { method: "POST", body: form }
      );

      const result = await uploadRes.json();
      if (result.id) {
        alert(`Uploaded to Google Drive ✅`);
      } else {
        alert("Upload failed ❌");
        console.error(result);
      }
    } catch (err) {
      console.error("Google Drive upload error:", err);
      alert("Error uploading invoice ❌");
    }
  }

  // ===== STEP 2: Local Print (old sharp & selectable style) =====
  const uiElements = document.querySelectorAll(
    ".config, #add-row, #download, #save-to-cloud, button.delete-row"
  );
  uiElements.forEach(el => el.style.display = "none");

  const editableEls = document.querySelectorAll(".editable");
  editableEls.forEach(el => {
    el.dataset.originalBorder = el.style.border;
    el.style.border = "none";
    el.style.background = "none";
    el.style.padding = "0";
  });

  const invoiceElement = document.querySelector('.invoice-container');
  const originalBodyBg = document.body.style.background;
  const originalInvoiceShadow = invoiceElement.style.boxShadow;
  const originalInvoiceMargin = invoiceElement.style.margin;

  document.body.style.background = "#fff";
  invoiceElement.style.boxShadow = "none";
  invoiceElement.style.margin = "0";
  invoiceElement.style.maxWidth = "100%";
  invoiceElement.style.padding = "20px";

  document.title = `Invoice_${invoiceNo}`;
  window.print();

  // Restore styles after print
  document.body.style.background = originalBodyBg;
  invoiceElement.style.boxShadow = originalInvoiceShadow;
  invoiceElement.style.margin = originalInvoiceMargin;
  invoiceElement.style.maxWidth = "";
  invoiceElement.style.padding = "";

  uiElements.forEach(el => el.style.display = "");
  editableEls.forEach(el => {
    el.style.border = el.dataset.originalBorder || "";
    el.style.background = "";
    el.style.padding = "";
  });
});


// === CONDITIONAL DISPLAY LOGIC ===
const invoiceTypeEl = document.getElementById("invoice-type");
const clientSelect = document.getElementById("client-select");
const noteSection = document.getElementById("note-section");
const poSection = document.getElementById("po-number-section");

function updateConditionalSections() {
  const type = invoiceTypeEl.value;
  const client = clientSelect.value;
  generateInvoiceNo();

  noteSection.style.display = type === "proforma" ? "block" : "none";
  const shouldShowPO = type === "standard" && client === "snap";
  poSection.style.display = shouldShowPO ? "block" : "none";

  document.body.classList.toggle('hide-po', !shouldShowPO);
  document.body.classList.toggle('proforma', type === "proforma");
}

invoiceTypeEl.addEventListener("change", updateConditionalSections);
clientSelect.addEventListener("change", updateConditionalSections);

// === SOW TOGGLE ===
const sowToggle = document.getElementById("toggle-sow");
const sowSection = document.getElementById("sow-section");

function updateSOWVisibility() {
  sowSection.style.display = sowToggle.checked ? "block" : "none";
  document.body.classList.toggle("hide-sow", !sowToggle.checked);
}
sowToggle.addEventListener("change", updateSOWVisibility);

// === SOW CONTENT ===
const sowTemplates = {
  lens: [
    "Conceptualization and custom design of immersive Snapchat Lens for World Music Day",
    "Asset creation, integration, optimization and final deployment",
    "Lens link: https://www.snapchat.com/unlock/?type=SNAPCODE&uuid=b2e753138b3e4f328094501298a951dc&metadata=01"
  ],
  meetup: [
    "Conceptualization, branding, and theme planning for the community event",
    "Venue coordination, equipment setup, and guest experience management",
    "Event link (Bevy): https://bevy.com/community-event"
  ]
};

function updateSOWContent() {
  const contentType = document.getElementById("content-type").value;
  const sowList = document.getElementById("sow-list");
  sowList.innerHTML = "";
  (sowTemplates[contentType] || []).forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = item;
    sowList.appendChild(li);
  });
}
document.getElementById("content-type").addEventListener("change", updateSOWContent);

// === CURRENCY DISPLAY ===
function updateCurrencyDisplay() {
  const curr = currencySelect.value;
  document.getElementById("currency-symbol-rate").innerText = curr;
  document.getElementById("currency-symbol-amt").innerText = curr;
  document.getElementById("subtotal-currency").innerText = currencyMap[curr].symbol;
}
currencySelect.addEventListener("change", () => {
  updateCurrencyDisplay();
  calculateSubtotal();
});

// === INIT ===
loadFromStorage();
if (!hasLoadedSow) updateSOWContent();
generateInvoiceNo();
updateConditionalSections();
updateSOWVisibility();
updateCurrencyDisplay();
calculateSubtotal();
