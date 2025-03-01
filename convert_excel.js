import ExcelJS from 'exceljs';
import path from 'node:path';
import fs from 'node:fs'

export const readExcelFile = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1); 
  const jsonData = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Saltar la fila de encabezado
      return;
    }

    const rowData = {};
    row.eachCell((cell, colNumber) => {
      const header = worksheet.getRow(1).getCell(colNumber).value;
      rowData[header] = cell.value;
    });
    jsonData.push(rowData);
  });
  return jsonData;
};


// Ejemplo de uso
// const filePath = './consulta.xlsx';
// const path = 'C:\\Users\\jjrr.13923\\OneDrive - emtmadrid.es\\Escritorio\\consulta_2024-2025.xlsx'
// readExcelFile(path).then(data => {
//   console.log('Data from Excel file:', data);
// });


export const convertJsonToExcel = async (jsonData, columnOrder, folderName) => {
  const excelName = Object.keys(jsonData)[0];
  const categories = Object.keys(jsonData[excelName]);
  const workbook = new ExcelJS.Workbook();

  categories.forEach((incName) => {
    const worksheet = workbook.addWorksheet(`${incName}`);
    const arrayInc = jsonData[excelName][incName];

    if (arrayInc.length > 0) {
      // Usar el orden definido en columnOrder en lugar del orden natural del objeto
      worksheet.columns = columnOrder
        .filter(header => arrayInc[0].hasOwnProperty(header)) // Solo incluir columnas que existan
        .map(header => ({ header, key: header }));

      // Agregar filas manteniendo el orden de las columnas
      arrayInc.forEach(data => {
        // Crear un objeto con solo las propiedades en el orden deseado
        const orderedData = {};
        columnOrder.forEach(key => {
          if (data.hasOwnProperty(key)) {
            orderedData[key] = data[key];
          }
        });
        worksheet.addRow(orderedData);
      });
    }
  });

  // Crear la carpeta si no existe
  const dirPath = path.join(process.cwd(), `${folderName}`);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  const filePath = path.join(dirPath, `${excelName}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  console.log('Excel file created successfully at', filePath);
};
