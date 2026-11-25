const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const { generateToken, verifyToken } = require('../src/config/jwt');
const bcrypt = require('bcryptjs');

// Suite de Pruebas Unitarias e Integración (Metodología XP - TDD)
test('XP TDD Suite: SIGIU Oaxaca de Juárez', async (t) => {
  
  await t.test('HU-01: El endpoint de diagnóstico /api/v1/health debe responder 200 con metadatos del municipio', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/api/v1/health`);
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.status, 'online');
      assert.strictEqual(body.entity, 'Municipio de Oaxaca de Juárez');
      assert.strictEqual(body.postgis_supported, true);
    } finally {
      server.close();
    }
  });

  await t.test('HU-01: Rutas inexistentes deben retornar error 404 en formato JSON estandarizado', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/api/v1/ruta_que_no_existe`);
      const body = await response.json();

      assert.strictEqual(response.status, 404);
      assert.strictEqual(body.success, false);
      assert.ok(body.message.includes('Ruta no encontrada'));
    } finally {
      server.close();
    }
  });

  await t.test('HU-05: Emisión y validación de tokens JWT Stateless para roles (Admin, Operador, Cuadrilla)', () => {
    const crewPayload = {
      id: '88888888-8888-8888-8888-888888888888',
      email: 'cuadrilla@oaxaca.gob.mx',
      nombre: 'Cuadrilla Centro 01',
      rol: 'Cuadrilla',
    };

    const token = generateToken(crewPayload);
    assert.ok(token);
    assert.strictEqual(typeof token, 'string');

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, crewPayload.id);
    assert.strictEqual(decoded.email, crewPayload.email);
    assert.strictEqual(decoded.rol, 'Cuadrilla');
  });

  await t.test('HU-05: Encriptación segura de contraseñas con bcrypt (Salt rounds = 10)', async () => {
    const rawPassword = 'clave_secreta_oaxaca';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notStrictEqual(rawPassword, hash);
    assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));

    const match = await bcrypt.compare(rawPassword, hash);
    const noMatch = await bcrypt.compare('clave_incorrecta', hash);

    assert.strictEqual(match, true);
    assert.strictEqual(noMatch, false);
  });

  await t.test('HU-06: Validación de coordenadas geográficas en límites válidos WGS84', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/api/v1/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: 'Bache en el centro',
          descripcion: 'Bache de gran tamaño frente al zócalo',
          categoria_id: 1,
          latitud: 'invalid_lat',
          longitud: -96.72,
        }),
      });

      const body = await response.json();
      assert.strictEqual(response.status, 400);
      assert.strictEqual(body.success, false);
      assert.ok(body.message.includes('coordenadas GPS'));
    } finally {
      server.close();
    }
  });

  await t.test('HU-10: Visor Cartográfico GeoJSON FeatureCollection para PostGIS', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/api/v1/reportes/gis/geojson`);
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.type, 'FeatureCollection');
      assert.ok(Array.isArray(body.data.features));
    } finally {
      server.close();
    }
  });

  await t.test('HU-11: Endpoint de Analítica y Rendición de Cuentas devuelve KPIs y balances', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/api/v1/reportes/analitica`);
      const body = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(body.success, true);
      assert.ok(body.data.kpis);
      assert.ok('total_reportes' in body.data.kpis);
      assert.ok('tasa_resolucion_porcentaje' in body.data.kpis);
    } finally {
      server.close();
    }
  });

  await t.test('HU-05: Validación de campos obligatorios en registro ciudadano', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const response = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'A',
          email: 'correo_invalido',
          password: '123',
        }),
      });

      const body = await response.json();
      assert.strictEqual(response.status, 400);
      assert.strictEqual(body.success, false);
    } finally {
      server.close();
    }
  });

});
