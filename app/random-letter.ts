import PDFDocument from 'pdfkit';
import faker from 'faker';
import getStream from 'get-stream';

export const handler = async () => {
  
  const doc = new PDFDocument();
  
  const randomName = process.env.NAME ||faker.name.findName();
  
  doc.text(randomName, { align: 'right' });
  doc.text(faker.address.streetAddress(), { align: 'right' });
  doc.text(faker.address.secondaryAddress(), { align: 'right' });
  doc.text(faker.address.zipCode() + ' ' + faker.address.city(), { align: 'right' });
  doc.moveDown();
  doc.text('Dear ' + randomName + ',');
  doc.moveDown();

  for(let i = 0; i < 3; i++) {
    doc.text(faker.lorem.paragraph());
    doc.moveDown();
  }

  doc.text(faker.name.findName(), { align: 'right' });
  doc.end();
  
  const pdfBuffer = await getStream.buffer(doc);
  const pdfBase64 = pdfBuffer.toString('base64');
  
  const response = {
    statusCode: 200,
    headers: {
      'Content-Length': Buffer.byteLength(pdfBase64),
      'Content-Type': 'application/pdf',
      'Content-disposition': 'attachment;filename=test.pdf'
    },
    isBase64Encoded: true,
    body: pdfBase64
  };
  
  return response;
};
