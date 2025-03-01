import odbc from 'odbc';

async function testSQLServerConnection() {
  const connectionOptions = [
    // Opción 1: Básica con autenticación SQL
    {
      name: "SQL básica",
      connectionString: "DRIVER={SQL Server};SERVER=moncau2;DATABASE=mdb;UID=CA;PWD=Cartago01;"
    },
    
    // Opción 2: Con puerto específico
    {
      name: "Con puerto específico",
      connectionString: "DRIVER={SQL Server};SERVER=moncau2,1433;DATABASE=mdb;UID=CA;PWD=Cartago01;"
    },
    
    // Opción 3: Autenticación Windows
    {
      name: "Autenticación Windows",
      connectionString: "DRIVER={SQL Server};SERVER=moncau2;DATABASE=mdb;Trusted_Connection=yes;"
    },
    
    // Opción 4: Nombre de instancia
    {
      name: "Con nombre de instancia",
      connectionString: "DRIVER={SQL Server};SERVER=moncau2\\SQLEXPRESS;DATABASE=mdb;UID=CA;PWD=Cartago01;"
    },
    
    // Opción 5: Driver legacy específico
    {
      name: "Driver legacy específico",
      connectionString: "DRIVER={SQL Server Native Client 10.0};SERVER=moncau2;DATABASE=mdb;UID=CA;PWD=Cartago01;"
    }
  ];
  
  console.log("=== Iniciando pruebas sistemáticas de conexión ===");
  
  for (const option of connectionOptions) {
    try {
      console.log(`\nProbando opción: ${option.name}`);
      console.log(`String de conexión: ${option.connectionString}`);
      
      const connection = await odbc.connect(option.connectionString);
      console.log(`✅ ÉXITO con opción: ${option.name}`);
      
      // Probar una consulta simple
      try {
        const result = await connection.query("SELECT 1 AS test");
        console.log("Consulta exitosa:", result);
        
        // Si la primera consulta funciona, intentar la consulta real
        try {
          const data = await connection.query("SELECT TOP 5 * FROM call_req");
          console.log("Datos recuperados:", data);
        } catch (queryErr) {
          console.log("Error en consulta a la tabla:", queryErr.message);
        }
      } catch (queryErr) {
        console.log("Error en consulta simple:", queryErr.message);
      }
      
      await connection.close();
      return; // Salir si encontramos una conexión exitosa
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      if (error.odbcErrors) {
        error.odbcErrors.forEach(err => {
          console.log(`   Estado: ${err.state}, Código: ${err.code}`);
          console.log(`   Mensaje: ${err.message}`);
        });
      }
    }
  }
  
  console.log("\n=== Todas las opciones fallaron ===");
}

// Ejecutar las pruebas
testSQLServerConnection().catch(err => {
  console.error("Error general en las pruebas:", err);
});

// import { connect } from "odbc";

// async function connectToSQL() {
//     try {
//       // Cadena de conexión (ajusta los valores!)
//       const connectionString = 
//         "Driver={ODBC Driver SQL Server};" + // Nombre exacto del driver
//         "Server=moncau2;" + // Ej: localhost, 192.168.1.100, nombre_instancia
//         "Database=mdb;" +
//         "UID=CA;" +
//         "PWD=Cartago01;" +
//         "TrustServerCertificate=yes;";
  
//       // Conectar
//       const connection = await connect(connectionString);
//       console.log("¡Conexión exitosa!");

//       const query = `
//       SELECT TOP 5 
//         inc.ref_num AS Num_Incidencia, 
//         est.sym AS Estado, 
//         inc.open_date AS FechaApertura, 
//         inc.summary AS Resumen 
//       FROM call_req AS inc
//       LEFT JOIN cr_stat AS est ON inc.status = est.code
//       ORDER BY inc.ref_num;
//     `;
  
//       // Ejecutar consulta
//       const result = await connection.query(query);
//       console.log(result);
  
//       // Cerrar conexión
//       await connection.close();
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   }
  
//   connectToSQL();