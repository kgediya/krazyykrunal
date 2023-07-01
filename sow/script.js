// script.js
document.getElementById('sowForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form submission
  
    // Gather form data with formatting
    var projectName = document.getElementById('projectName').innerHTML;
    var projectDescription = document.getElementById('projectDescription').innerHTML;
    var projectDuration = document.getElementById('projectDuration').innerHTML;
    var projectBudget = document.getElementById('projectBudget').innerHTML;
  
    // Generate SOW content
    var sowContent = `
      <h2>Project Details</h2>
      <p><strong>Project Name:</strong> ${projectName}</p>
      <p><strong>Project Description:</strong> ${projectDescription}</p>
      <p><strong>Project Duration:</strong> ${projectDuration}</p>
      <p><strong>Project Budget:</strong> ${projectBudget}</p>
      <!-- Add more SOW details -->
  
      <h2>Services Provided</h2>
      <!-- Add services provided details -->
  
      <h2>Deliverables</h2>
      <!-- Add deliverables details -->
    `;
  
    // Create a new HTML document
    var sowDoc = document.implementation.createHTMLDocument('Scope of Work');
    sowDoc.body.innerHTML = sowContent;
  
    // Generate the PDF file
    var pdfDoc = await PDFLib.PDFDocument.create();
    var page = await pdfDoc.addPage();
    var textContent = sowDoc.documentElement.textContent;
    page.drawText(textContent, { x: 50, y: 50 });
  
    // Generate the PDF file as a Blob
    pdfDoc.save().then(function (pdfData) {
      var pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
  
      // Create a download link
      var downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = 'scope_of_work.pdf';
  
      // Append the download link and trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  });
  