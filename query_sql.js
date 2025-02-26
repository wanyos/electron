import { pool } from "./db/mysql.js";

const getIncResolutor = `SELECT DISTINCT
      I.id_incidencia AS Num_Incidencia,
      S.name AS Estado,
      DATE_FORMAT(I.inicio,"%e/%m/%Y") AS FechaApertura,
      DATE_FORMAT(I.cierre,"%e/%m/%Y") AS FechaCierre,
      U.nombre_real AS Usuario,
      E.telefono AS Extension,
      I.Titulo AS Resumen,
      G.nombre AS Grupo,
      E.nombre_real AS Tecnico_Asignado,
      T.name AS Descripcion_Tipo,
      DATE_FORMAT(I.actualizacion,"%e/%m/%Y") AS "Ultima_actuacion",
      DATE_FORMAT(I.inicio,"%H:%i") AS Hora_creacion,
      R.data AS Localizacion,
      R.id_incident_field AS Origen
FROM tincident_field_data R
LEFT JOIN tincidencia I ON R.id_incident_field IN (98,103,109,114) AND (R.id_incident = I.id_incidencia)
LEFT JOIN tincident_status S ON I.estado = S.id
LEFT JOIN tusuario U ON I.id_creator = U.id_usuario
LEFT JOIN tusuario E ON I.id_usuario = E.id_usuario
LEFT JOIN tgrupo G ON I.id_grupo = G.id_grupo
LEFT JOIN tincident_type T ON I.id_incident_type = T.id
WHERE (I.inicio >= '2024-01-01 00:00:00') AND (I.inicio <'2025-12-31 23:59:59')
ORDER BY I.id_incidencia;`


export const getAll = async (table) => {
  try {
    const [rows] = await pool.query(getIncResolutor)
    return rows
  } catch (err) {
    console.log(err)
  }
}
