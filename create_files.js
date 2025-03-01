import { readExcelFile, convertJsonToExcel } from './convert_excel.js';
import dayjs from 'dayjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import isBetween from './plugins/isBetween.js';
import { getAll } from './query_sql.js';

dayjs.extend(isBetween);

// Obtener el directorio actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construir la ruta del archivo de Excel
const excelFilePath = path.join(__dirname, 'consulta_2024-2025.xlsx');

const convertTimestampToDate = (timestamp) => {
    return dayjs.unix(timestamp).format('DD/MM/YYYY'); 
}

const data = {
    iss_fuencarral: 'NIVEL 0 IISS FUENCARRAL',
    iss_carabanchel: 'NIVEL 0 IISS CARABANCHEL',
    iss_movilidad: 'NIVEL 0 IISS Bases Y Aparcamientos',
    iss_la_elipa: 'NIVEL 0 IISS LA ELIPA',
    iss_entrevias: 'NIVEL 0 IISS ENTREVIAS',
    iss_pacifico: 'NIVEL 0 IISS',
    iss_sanchinarro: 'NIVEL 0 IISS SANCHINARRO'
}

const getServideskInc = async () => {
    const res = await readExcelFile(excelFilePath)
    const groupedByGrupo = {}; 
  
    if(res.length > 0) {
        res.forEach((item) => {
            const grupo = item.Grupo;
            item.FechaApertura = item.FechaApertura ? convertTimestampToDate(item.FechaApertura) : '';
            item.FechaCierre = item.FechaCierre ? convertTimestampToDate(item.FechaCierre) : '';

             const clave = Object.keys(data).find(key => data[key] === grupo);
          
             if (clave) {
                if (!groupedByGrupo[clave]) {
                    groupedByGrupo[clave] = [];
                }
                groupedByGrupo[clave].push(item);
            }
        });
        return groupedByGrupo;
     }
    }

const getIntegriaInc = async () => {
    const inc = await getAll('tincidencia')
    const movilidad = [];
    const tecnologia = [];

    const dataIntegria = {
        apliMovilidadd: '6.02 APLIC MOVILIDAD',
        etralux: 'MOV ETRALUX',
        siepark: 'MOV SIEPARK'
    }

    inc.forEach((item) => {
        if(item.Grupo) {
            const grupoNormalizado = item.Grupo.trim().toLowerCase();
            const isMovilidad = Object.keys(dataIntegria).some(key => dataIntegria[key].trim().toLowerCase() === grupoNormalizado);
            isMovilidad ? movilidad.push(item) : tecnologia.push(item);
        }
    })

    const integriaInc = { movilidad, tecnologia }
    return integriaInc;
}

const createFileIss = async (openDate, closeDate, columnOrder) => {
    const servideskInc = await getServideskInc();
    const result = [];

    Object.keys(data).forEach(key => {
        const incidents = servideskInc[key];
        if (incidents) {
          
            const keyObject = {
                tratadas: [],
                cerradas: [],
                pendientes: []
            };

            incidents.forEach(incident => {
                const fechaApertura = dayjs(incident.FechaApertura, 'DD/MM/YYYY');
                const fechaCierre = dayjs(incident.FechaCierre, 'DD/MM/YYYY');

                if (fechaApertura.isBetween(openDate, closeDate, null, '[]') && (incident.Estado === 'Abierta' || incident.Estado === 'Cerrada' || incident.Estado === 'Fijada')) {
                    keyObject.tratadas.push(incident);
                }

                if (fechaCierre.isBetween(openDate, closeDate, null, '[]') && incident.Estado === 'Cerrada') {
                    keyObject.tratadas.push(incident);
                    keyObject.cerradas.push(incident);
                }

                if (incident.Estado === 'Abierta' || incident.Estado === 'Fijada' || incident.Estado === 'Resolutor Externo') {
                    keyObject.pendientes.push(incident);
                }
            });

             result.push({ [key]: keyObject });
        }
    });

     const folderName = 'issExcel'
    result.forEach((place) => { 
        convertJsonToExcel(place, columnOrder, folderName)
    })
}


const createFileIntegria = async (openDate, closeDate, columnOrder) => {
    const integriaInc = await getIntegriaInc();
    const result = []
    Object.keys(integriaInc).forEach((item) => {
        const incidents = integriaInc[item]

        const keyObject = {
            tratadas: [],
            cerradas: [],
            pendientes: []
        };

        incidents.forEach((inc) => {
            const fechaApertura = dayjs(inc.FechaApertura, 'D/M/YYYY');
            const fechaCierre = dayjs(inc.FechaCierre, 'D/M/YYYY');

            if (fechaApertura.isBetween(openDate, closeDate, null, '[]') && (inc.Estado === 'Nuevo' || inc.Estado === 'Cerrada' || inc.Estado === 'ASignado')) {
                keyObject.tratadas.push(inc);
            }

            if (fechaCierre.isBetween(openDate, closeDate, null, '[]') && inc.Estado === 'Cerrada') {
                keyObject.tratadas.push(inc);
                keyObject.cerradas.push(inc);
            }

            if (inc.Estado === 'Nuevo' || inc.Estado === 'Asignado') {
                keyObject.pendientes.push(inc);
            }
        });
        result.push({ [item]: keyObject });
       
    })

    const folderName = 'integriaExcel'
    result.forEach((place) => { 
        convertJsonToExcel(place, columnOrder, folderName)
    })
}


// Num_Incidencia	Estado	FechaApertura	FechaCierre	Usuario	Extension	Resumen	Grupo	Tecnico_Asignado	Tipo_Inc	Descripcion_Tipo
const orderServidesk = [
  'Num_Incidencia',
  'Estado',
  'FechaApertura',
  'FechaCierre',
  'Usuario',
  'Extension',
  'Resumen',
  'Grupo',
  'Tecnico_Asignado',
  'Descripcion_Tipo',
  'Tipo_Inc',
];

// Num_Incidencia Estado FechaApertura FechaCierre Usuario Extension Resumen
// Grupo Tecnico_Asignado Descripcion_Tipo Ultima_actuacion Hora_creacion Localizacion Origen
const orderIntegria = [
    'Num_Incidencia',
    'Estado',
    'FechaApertura',
    'FechaCierre',
    'Usuario',
    'Extension',
    'Resumen',
    'Grupo',
    'Tecnico_Asignado',
    'Descripcion_Tipo',
    'Ultima_actuacion', 
    'Hora_creacion', 
    'Localizacion', 
    'Origen'
  ];

 const openDate = dayjs('17/02/2025', 'D/M/YYYY');
 const closeDate = dayjs('23/02/2025', 'D/M/YYYY');

createFileIss(openDate, closeDate, orderServidesk);
createFileIntegria(openDate, closeDate, orderIntegria);