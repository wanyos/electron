import { readExcelFile, convertJsonToExcel } from './convert_excel.js';
import dayjs from 'dayjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import isBetween from './plugins/isBetween.js';

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

const convert = async () => {
    const res = await readExcelFile(excelFilePath)
    const groupedByGrupo = {}; 
  
    if(res.length > 0) {
        res.forEach((item) => {
            const grupo = item.Grupo;
            item.FechaApertura = item.FechaApertura ? convertTimestampToDate(item.FechaApertura) : '';
            item.FechaCierre = item.FechaCierre ? convertTimestampToDate(item.FechaCierre) : '';
            item.Ultima_actuacion = item.Ultima_actuacion ? convertTimestampToDate(item.Ultima_actuacion) : '';
            item.Hora_creacion = item.Hora_creacion ? convertTimestampToDate(item.Hora_creacion) : '';

            // console.log('fecha cierre', item.fechaCierre)

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
//    const grupoEspecifico = 'iss_fuencarral';
//    if (groupedByGrupo[grupoEspecifico]) {
//        console.log(`Grupo ${grupoEspecifico}:`, groupedByGrupo[grupoEspecifico]);
//    } else {
//        console.log(`Grupo ${grupoEspecifico} no encontrado.`);
//    }
    }

const createFile = async (openDate, closeDate) => {
    const servideskInc = await convert();
    const result = [];

    Object.keys(data).forEach(key => {
        const incidents = servideskInc[key];
        if (incidents) {
            // console.log('incidents', incidents)
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
                }

                if (fechaCierre.isBetween(openDate, closeDate, null, '[]') && incident.Estado === 'Cerrada') {
                    keyObject.cerradas.push(incident);
                }

                if (incident.Estado === 'Abierta' || incident.Estado === 'Fijada' || incident.Estado === 'Resolutor Externo') {
                    // console.log('incidents pendiente', incident)
                    keyObject.pendientes.push(incident);
                }
            });

             result.push({ [key]: keyObject });

        }
    });

    // console.log(result);
    // console.log(result[0])

    // convertJsonToExcel(result[0])

    result.forEach((place) => { 
        convertJsonToExcel(place)
    })





}




const openDate = dayjs('17/02/2025', 'DD/MM/YYYY');
const closeDate = dayjs('23/02/2025', 'DD/MM/YYYY');
createFile(openDate, closeDate);