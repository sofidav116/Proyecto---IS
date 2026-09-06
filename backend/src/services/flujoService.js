import pool from '../config/db.js';

export const guardarFlujoGenerado = async ({
  nombre,
  propietarioId,
  organizacionId,
  nodos,
  conexiones
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar el registro principal en 'flujos'
    const flujoRes = await client.query(
      `INSERT INTO flujos (nombre, propietario_id, organizacion_id, pasos)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [nombre, propietarioId, organizacionId, nodos.length]
    );
    const flujoId = flujoRes.rows[0].id;

    // 2. Mapear e insertar los nodos en 'nodos_flujo'
    const mapaNodos = new Map();
    for (const nodo of nodos) {
      const nodoRes = await client.query(
        `INSERT INTO nodos_flujo (nodo_key, etiqueta, tipo, orden, posicion_x, posicion_y, flujo_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          nodo.key,
          nodo.etiqueta,
          nodo.tipo || 'paso',
          nodo.orden || 0,
          nodo.x || 0,
          nodo.y || 0,
          flujoId
        ]
      );
      mapaNodos.set(nodo.key, nodoRes.rows[0].id);
    }

    // 3. Insertar las relaciones en 'conexiones_flujo'
    for (const conn of conexiones) {
      const origenId = mapaNodos.get(conn.origenKey);
      const destinoId = mapaNodos.get(conn.destinoKey);

      if (origenId && destinoId) {
        await client.query(
          `INSERT INTO conexiones_flujo (conexion_key, flujo_id, nodo_origen_id, nodo_destino_id, etiqueta)
           VALUES ($1, $2, $3, $4, $5)`,
          [conn.key, flujoId, origenId, destinoId, conn.etiqueta || null]
        );
      }
    }

    await client.query('COMMIT');
    return { success: true, flujoId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al guardar flujo en BD:', error);
    throw error;
  } finally {
    client.release();
  }
};