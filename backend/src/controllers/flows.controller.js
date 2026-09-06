import pool from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/flows
// Lista flujos filtrados por la organización del usuario
export const listFlows = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, nombre, estado, tipo, pasos, 
            propietario_id AS "ownerId", 
            organizacion_id AS "organizationId", 
            creado_en AS "fecha"
     FROM flujos 
     WHERE organizacion_id = $1 
     ORDER BY creado_en DESC`,
    [req.user.organizationId]
  );

  res.json({ flows: result.rows });
});

// GET /api/flows/:id
// Obtiene un flujo con sus nodos y conexiones para React Flow
export const getFlow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const flujoRes = await pool.query(
    `SELECT * FROM flujos WHERE id = $1`,
    [id]
  );

  if (flujoRes.rows.length === 0) {
    throw new ApiError(404, "Flujo no encontrado.");
  }

  const flowData = flujoRes.rows[0];

  if (flowData.organizacion_id !== req.user.organizationId) {
    throw new ApiError(403, "Este flujo no pertenece a tu organización.");
  }

  // Obtener nodos
  const nodosRes = await pool.query(
    `SELECT id, nodo_key AS "key", etiqueta, tipo, orden, posicion_x AS "x", posicion_y AS "y" 
     FROM nodos_flujo WHERE flujo_id = $1 ORDER BY orden ASC`,
    [id]
  );

  // Obtener conexiones
  const conexionesRes = await pool.query(
    `SELECT c.conexion_key AS "key", c.etiqueta, 
            no.nodo_key AS "origenKey", nd.nodo_key AS "destinoKey"
     FROM conexiones_flujo c
     JOIN nodos_flujo no ON c.nodo_origen_id = no.id
     JOIN nodos_flujo nd ON c.nodo_destino_id = nd.id
     WHERE c.flujo_id = $1`,
    [id]
  );

  // El frontend (flowLayout.js) espera nodos/edges en el mismo formato "crudo"
  // que produce la IA y que se usa al guardar: { id, label, type } y
  // { id, source, target, label }. Las columnas de la BD usan otros nombres
  // (etiqueta, tipo, origenKey/destinoKey), así que las mapeamos aquí.
  const nodes = nodosRes.rows.map((n) => ({
    id: n.key,
    label: n.etiqueta,
    type: n.tipo,
  }));

  const edges = conexionesRes.rows.map((e) => ({
    id: e.key,
    source: e.origenKey,
    target: e.destinoKey,
    label: e.etiqueta,
  }));

  res.json({
    flow: {
      id: flowData.id,
      nombre: flowData.nombre,
      estado: flowData.estado,
      tipo: flowData.tipo,
      pasos: flowData.pasos,
      ownerId: flowData.propietario_id,
      organizationId: flowData.organizacion_id,
      fecha: flowData.creado_en,
      nodes,
      edges,
    },
  });
});

// POST /api/flows
// Guarda un nuevo flujo junto con sus nodos y aristas en una transacción SQL
export const createFlow = asyncHandler(async (req, res) => {
  const {
    nombre,
    pasos = 0,
    estado = "Borrador",
    nodes = [],
    edges = [],
    tipo = "especifico",
  } = req.body;

  if (!nombre) throw new ApiError(400, "El campo 'nombre' es requerido.");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insertar el flujo
    const flowRes = await client.query(
      `INSERT INTO flujos (nombre, estado, tipo, pasos, propietario_id, organizacion_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, creado_en`,
      [
        nombre,
        estado,
        tipo,
        pasos || nodes.length,
        req.user.id,
        req.user.organizationId,
      ]
    );

    const flowId = flowRes.rows[0].id;
    const creadoEn = flowRes.rows[0].creado_en;

    // 2. Insertar nodos y mapear llaves
    const nodeHashMap = new Map();
    for (const node of nodes) {
      const nodeRes = await client.query(
        `INSERT INTO nodos_flujo (nodo_key, etiqueta, tipo, orden, posicion_x, posicion_y, flujo_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          node.key || node.id,
          node.etiqueta || node.label || "Paso",
          node.tipo || "paso",
          node.orden || 0,
          node.x || node.position?.x || 0,
          node.y || node.position?.y || 0,
          flowId,
        ]
      );
      nodeHashMap.set(node.key || node.id, nodeRes.rows[0].id);
    }

    // 3. Insertar conexiones
    for (const edge of edges) {
      const origenId = nodeHashMap.get(edge.origenKey || edge.source);
      const destinoId = nodeHashMap.get(edge.destinoKey || edge.target);

      if (origenId && destinoId) {
        await client.query(
          `INSERT INTO conexiones_flujo (conexion_key, flujo_id, nodo_origen_id, nodo_destino_id, etiqueta)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            edge.key || edge.id || `conn_${Date.now()}`,
            flowId,
            origenId,
            destinoId,
            edge.etiqueta || edge.label || null,
          ]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      flow: {
        id: flowId,
        nombre,
        pasos: pasos || nodes.length,
        estado,
        tipo,
        ownerId: req.user.id,
        organizationId: req.user.organizationId,
        fecha: creadoEn,
        nodes,
        edges,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// PUT /api/flows/:id
// Actualiza metadatos y reemplaza el esquema de nodos/conexiones
export const updateFlow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, estado, tipo, pasos, nodes, edges } = req.body;

  const checkRes = await pool.query(`SELECT organizacion_id FROM flujos WHERE id = $1`, [id]);
  if (checkRes.rows.length === 0) throw new ApiError(404, "Flujo no encontrado.");
  if (checkRes.rows[0].organizacion_id !== req.user.organizationId) {
    throw new ApiError(403, "Este flujo no pertenece a tu organización.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Actualizar datos del flujo principal
    await client.query(
      `UPDATE flujos 
       SET nombre = COALESCE($1, nombre),
           estado = COALESCE($2, estado),
           tipo = COALESCE($3, tipo),
           pasos = COALESCE($4, pasos)
       WHERE id = $5`,
      [nombre, estado, tipo, pasos, id]
    );

    // Si vienen nuevos nodos, se reemplazan en cascada
    if (nodes && Array.isArray(nodes)) {
      await client.query(`DELETE FROM nodos_flujo WHERE flujo_id = $1`, [id]);

      const nodeHashMap = new Map();
      for (const node of nodes) {
        const nodeRes = await client.query(
          `INSERT INTO nodos_flujo (nodo_key, etiqueta, tipo, orden, posicion_x, posicion_y, flujo_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            node.key || node.id,
            node.etiqueta || node.label || "Paso",
            node.tipo || "paso",
            node.orden || 0,
            node.x || node.position?.x || 0,
            node.y || node.position?.y || 0,
            id,
          ]
        );
        nodeHashMap.set(node.key || node.id, nodeRes.rows[0].id);
      }

      if (edges && Array.isArray(edges)) {
        for (const edge of edges) {
          const origenId = nodeHashMap.get(edge.origenKey || edge.source);
          const destinoId = nodeHashMap.get(edge.destinoKey || edge.target);

          if (origenId && destinoId) {
            await client.query(
              `INSERT INTO conexiones_flujo (conexion_key, flujo_id, nodo_origen_id, nodo_destino_id, etiqueta)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                edge.key || edge.id || `conn_${Date.now()}`,
                id,
                origenId,
                destinoId,
                edge.etiqueta || edge.label || null,
              ]
            );
          }
        }
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Flujo actualizado correctamente.", id });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// DELETE /api/flows/:id
// Borra el flujo (PostgreSQL elimina nodos y conexiones automáticamente vía CASCADE)
export const deleteFlow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `DELETE FROM flujos 
     WHERE id = $1 AND organizacion_id = $2 
     RETURNING id`,
    [id, req.user.organizationId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Flujo no encontrado o no autorizado.");
  }

  res.status(204).send();
});