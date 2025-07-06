// Set date
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

// Generate invoice number
function generateInvoiceNo() {
  const dd = today.getDate().toString().padStart(2, '0');
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const yy = today.getFullYear().toString().slice(-2);

  const firstItemInput = document.querySelector('#items-body input[type="text"]');
  let initials = 'XXX';

  if (firstItemInput && firstItemInput.value.trim().length > 0) {
    const words = firstItemInput.value.trim().toUpperCase().split(/\s+/);

    if (words.length === 1 && words[0].length >= 3) {
      initials = words[0].slice(0, 3); // Use first 3 letters of the word
    } else {
      const letters = words.slice(0, 3).map(word => word[0]);
      while (letters.length < 3) {
        letters.push('X');
      }
      initials = letters.join('');
    }
  }

  const invoiceNo = `PROINV${dd}${mm}${yy}${initials}`;
  document.getElementById("invoice-no").innerText = invoiceNo;
  return invoiceNo;
}

// Calculate subtotal
function calculateSubtotal() {
  const rows = document.querySelectorAll("#items-body tr");
  let subtotal = 0;

  rows.forEach(row => {
    const rate = parseFloat(row.querySelector(".rate").value || 0);
    subtotal += rate;
    row.querySelector(".amount").innerText = rate.toFixed(2);
  });

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  return subtotal;
}

// Add row
document.getElementById("add-row").addEventListener("click", () => {
  const row = document.createElement("tr");

  row.innerHTML = `
  <td><textarea placeholder="Item name" oninput="generateInvoiceNo()"></textarea></td>
  <td><textarea placeholder="Service description"></textarea></td>
  <td><input type="number" value="0" class="rate"></td>
  <td class="amount">0.00</td>
  <td><button onclick="this.parentNode.parentNode.remove(); calculateSubtotal(); generateInvoiceNo();">🗑</button></td>
`;

  document.getElementById("items-body").appendChild(row);

  row.querySelector(".rate").addEventListener("input", () => {
    calculateSubtotal();
  });

  generateInvoiceNo();
  calculateSubtotal();
});

// Download and save to Valtown
document.getElementById("download").addEventListener("click", async () => {
      const saveToCloud = document.getElementById("save-to-cloud").checked;

  const invoiceType = document.getElementById("invoice-type").value;
  const clientName = document.getElementById("client-name").innerText.trim();
  const clientAddress = document.getElementById("client-address").innerText.trim();

  const poSection = document.getElementById("po-number-section");
  const poNumber = poSection.style.display !== "none"
    ? document.getElementById("po-number").value.trim()
    : null;

  const rows = document.querySelectorAll("#items-body tr");
  const items = [];
  rows.forEach(row => {
    const item = row.cells[0].querySelector("input")?.value.trim();
    const service = row.cells[1].querySelector("input")?.value.trim();
    const rate = parseFloat(row.cells[2].querySelector("input")?.value || 0);

    if (item && service) {
      items.push({ item, service, rate });
    }
  });

  const subtotal = calculateSubtotal();
  const invoiceNo = generateInvoiceNo();
  const dateFormatted = formatFancyDate(today);

  const noteVisible = noteSection.style.display !== "none";
  const sowVisible = sowSection.style.display !== "none";
  const sowItems = [];

  if (sowVisible) {
    document.querySelectorAll("#sow-list li").forEach(li => {
      const text = li.innerText.trim();
      if (text) sowItems.push(text);
    });
  }

  const payload = {
    invoiceType,
    invoiceNo,
    date: dateFormatted,
    client: {
      name: clientName,
      address: clientAddress
    },
    poNumber: poNumber || null,
    items,
    subtotal,
    note: noteVisible,
    sow: sowItems
  };
if(saveToCloud){
  try {
    const res = await fetch("https://krazyykrunal--a701dafe5a3611f09f24f69ea79377d9.web.val.run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      alert("Invoice saved to Valtown ✅");
    } else {
      alert("Failed to save invoice to Valtown ❌");
    }
  } catch (err) {
    console.error("Valtown save error:", err);
    alert("Error saving invoice to Valtown ❌");
  }
}

  // Proceed to print
  document.title = `Invoice_${invoiceNo}`;
  window.print();
});

// Conditional display logic
const invoiceType = document.getElementById("invoice-type");
const clientSelect = document.getElementById("client-select");
const noteSection = document.getElementById("note-section");
const poSection = document.getElementById("po-number-section");

function updateConditionalSections() {
  const type = invoiceType.value;
  const client = clientSelect.value;

  noteSection.style.display = type === "proforma" ? "block" : "none";

  const shouldShowPO = type === "standard" && client === "snap";
  poSection.style.display = shouldShowPO ? "block" : "none";

  // Add/remove print visibility class
  document.body.classList.toggle('hide-po', !shouldShowPO);
  document.body.classList.toggle('proforma', type === "proforma");
}

invoiceType.addEventListener("change", updateConditionalSections);
clientSelect.addEventListener("change", updateConditionalSections);

// SOW toggle
const sowToggle = document.getElementById("toggle-sow");
const sowSection = document.getElementById("sow-section");

function updateSOWVisibility() {
  const isVisible = sowToggle.checked;
  sowSection.style.display = isVisible ? "block" : "none";
  document.body.classList.toggle("hide-sow", !isVisible);
}

sowToggle.addEventListener("change", updateSOWVisibility);

// Initial runs
generateInvoiceNo();
updateConditionalSections();
updateSOWVisibility();
calculateSubtotal();
