import ExcelJS from 'exceljs';
import path from 'node:path';
import fs from 'node:fs'

export const readExcelFile = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1); // Obtener la primera hoja
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

    // console.log('rowdata', rowData)

    jsonData.push(rowData);
  });

  // console.log('Excel file read successfully:', jsonData);
  return jsonData;
};


// Ejemplo de uso
// const filePath = './consulta.xlsx';
// const path = 'C:\\Users\\jjrr.13923\\OneDrive - emtmadrid.es\\Escritorio\\consulta_2024-2025.xlsx'
// readExcelFile(path).then(data => {
//   console.log('Data from Excel file:', data);
// });



export const convertJsonToExcel = async (jsonData) => {
  // console.log('json', jsonData)
  const excelName = Object.keys(jsonData)[0]
  const categories = Object.keys(jsonData[excelName])

  // console.log('name', excelName)
  // console.log('name', categories)
  const workbook = new ExcelJS.Workbook();

  categories.forEach((incName) => { 
    const worksheet = workbook.addWorksheet(`${incName}`);
    const arrayInc = jsonData[excelName][incName]

    if (arrayInc.length > 0) { 
      const headers = Object.keys(arrayInc[0]);
      // console.log('headers', incName, headers)
      worksheet.columns = headers.map(header => ({ header, key: header }));

    arrayInc.forEach(data => {
          worksheet.addRow(data);
      });
    }
  })

    // Crear la carpeta si no existe
    const dirPath = path.join(process.cwd(), 'excels');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const filePath = path.join(dirPath, `${excelName}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    console.log('Excel file created successfully at', filePath);
  };











// export const convertJsonToExcel = async (jsonData) => {
//   const workbook = new ExcelJS.Workbook();

//   // Crear hojas con nombres estáticos
//   const createSheet = (sheetName, data) => {
//     if (data && data.length > 0) {
//       const worksheet = workbook.addWorksheet(sheetName);
//       const headers = Object.keys(data[0]);
//       worksheet.columns = headers.map(header => ({ header, key: header }));

//       data.forEach(item => {
//         worksheet.addRow(item);
//       });
//     }
//   };

//   // Crear hojas para cada array en jsonData
//   createSheet('Abiertas', jsonData.fechaApertura);
//   createSheet('Cerradas', jsonData.fechaAperturaYCierre);
//   createSheet('Vacias', jsonData.fechaCierreNull);

//   // Usar la primera clave para nombrar el archivo
//   const firstKey = Object.keys(jsonData)[0];
//   const filePath = path.join(process.cwd(), `${firstKey}.xlsx`);
//   await workbook.xlsx.writeFile(filePath);
//   console.log('Excel file created successfully at', filePath);
// };




// export const convertJsonToExcel = async (jsonData) => {
//   // console.log('json', jsonData)
//   const excelName = Object.keys(jsonData)[0]
//   const categories = Object.keys(jsonData[excelName])
//   // const firstArray = jsonData[excelName][categories[0]]

//   // console.log('inc', inc)
//   // console.log('name', excelName)
//   // console.log('name', categories)
//   const workbook = new ExcelJS.Workbook();
//   categories.forEach((incName) => { 
//     const worksheet = workbook.addWorksheet(`${incName}`);
//     const arrayInc = jsonData[excelName][incName]

//     if (arrayInc.length > 0) { 
//       const headers = Object.keys(arrayInc[0]);
//       worksheet.columns = headers.map(header => ({ header, key: header }));

//     arrayInc.forEach(data => {
//           worksheet.addRow(data);
//       });
//     }
    
//   })

  
//   const filePath = path.join(process.cwd(), `${excelName}.xlsx`);
//   await workbook.xlsx.writeFile(filePath);
//   console.log('Excel file created successfully at', filePath);

//   // Object.keys(jsonData).forEach((item) => { 
//   //   const data = jsonData[item]
       
//   // })

//   // console.log('keys', keys)
//   // const opened = jsonData.iss_fuencarral.fechaApertura;
//   // const workbook = new ExcelJS.Workbook();
  
//   // const worksheetA = workbook.addWorksheet('Abiertas');
//   // const worksheetC = workbook.addWorksheet('Cerradas');
//   // const worksheetP = workbook.addWorksheet('Pendientes');

//   //   const headers = Object.keys(opened[0]);
//   //   worksheetA.columns = headers.map(header => ({ header, key: header }));
  
//   //   opened.forEach(data => {
//   //     worksheetA.addRow(data);
//   //   });
  
//   //   const firstKey = Object.keys(jsonData)[0];
//   //   const filePath = path.join(process.cwd(), `${firstKey}.xlsx`);
//   //   await workbook.xlsx.writeFile(filePath);
//   //   console.log('Excel file created successfully at', filePath);
  
//     // const buffer = await workbook.xlsx.writeBuffer();
//     // console.log('Excel file created successfully as Buffer');
//     // return buffer;
//   };
  
  // // Ejemplo de uso
  // const exampleJson = [
  //   { id: 1, name: 'John Doe', age: 30 },
  //   { id: 2, name: 'Jane Doe', age: 25 },
  // ];