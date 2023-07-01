// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the form element and generate button
    var invoiceForm = document.getElementById("invoiceForm");
    var generateBtn = document.getElementById("generateBtn");
  
    // Handle form submission
    invoiceForm.addEventListener("submit", function(event) {
      event.preventDefault();
  
      // Get form values
      var invoiceNumber = document.getElementById("invoiceNumber").value;
      var clientName = document.getElementById("clientName").value;
      var amount = document.getElementById("amount").value;
      var dueDate = document.getElementById("dueDate").value;
  
      // Generate the invoice PDF
      generateInvoice(invoiceNumber, clientName, amount, dueDate);
    });
  
    // Function to generate the invoice PDF
    async function generateInvoice(invoiceNumber, clientName, amount, dueDate) {
      // Retrieve the uploaded logo file
      var logoUpload = document.getElementById("logoUpload");
      var logoFile = logoUpload.files[0];
  
      // Create an invoice object
      var invoice = {
        invoiceNumber: invoiceNumber,
        clientName: clientName,
        amount: amount,
        dueDate: dueDate,
        logoFile: logoFile
      };
  
      // Create a new PDF document
      const pdfDoc = await PDFLib.PDFDocument.create();
      
      // Register the fontkit instance
      const fontkit = await PDFLib.Fontkit.create();
      pdfDoc.registerFontkit(fontkit);
  
      // Set fonts
      const fontBytes = await fetch('fonts/Roboto-Regular.ttf').then((res) => res.arrayBuffer());
      const font = await pdfDoc.embedFont(fontBytes);
  
      // Add a new page to the document
      const page = pdfDoc.addPage();
  
      // Modify the page as per your invoice layout and content
      const { width, height } = page.getSize();
  
      // Header
      page.drawText('INVOICE', {
        x: 50,
        y: height - 50,
        size: 24,
        font: font,
        color: PDFLib.rgb(76 / 255, 175 / 255, 80 / 255),
      });
  
      // Invoice details
      page.drawText(`Invoice Number: ${invoice.invoiceNumber}`, {
        x: 50,
        y: height - 100,
        size: 12,
        font: font,
      });
      page.drawText(`Client Name: ${invoice.clientName}`, {
        x: 50,
        y: height - 120,
        size: 12,
        font: font,
      });
      page.drawText(`Amount: $${invoice.amount}`, {
        x: 50,
        y: height - 140,
        size: 12,
        font: font,
      });
      page.drawText(`Due Date: ${invoice.dueDate}`, {
        x: 50,
        y: height - 160,
        size: 12,
        font: font,
      });
  
      // Embed the logo image
      if (invoice.logoFile) {
        const logoImageBytes = await logoFile.arrayBuffer();
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.15);
        page.drawImage(logoImage, {
          x: width - logoDims.width - 50,
          y: height - logoDims.height - 50,
          width: logoDims.width,
          height: logoDims.height,
        });
      }
  
      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
  
      // Create a download link for the generated PDF
      var downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      downloadLink.download = 'invoice.pdf';
      downloadLink.click();
    }
  });
  