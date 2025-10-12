import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const isCompatiblePlatform = Platform.OS !== 'web';
let db = null;

if (isCompatiblePlatform) {
  db = SQLite.openDatabaseSync('uleamapp.db');
}

// ========== OPERACIONES TRANSCRIPCIONES ==========

export const guardarTranscripcion = (textoTranscrito, duracionAudio, precisionIA) => {
  if (!isCompatiblePlatform || !db) return null;
  
  try {
    const result = db.runSync(
      'INSERT INTO transcripciones (texto_transcrito, duracion_audio, precision_ia) VALUES (?, ?, ?)',
      [textoTranscrito, duracionAudio, precisionIA]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.log('Error al guardar transcripción:', error);
    return null;
  }
};

export const obtenerTranscripciones = () => {
  if (!isCompatiblePlatform || !db) return [];
  
  try {
    return db.getAllSync('SELECT * FROM transcripciones ORDER BY fecha_creacion DESC');
  } catch (error) {
    console.log('Error al obtener transcripciones:', error);
    return [];
  }
};

export const eliminarTranscripcion = (id) => {
  if (!isCompatiblePlatform || !db) return false;
  
  try {
    db.runSync('DELETE FROM transcripciones WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.log('Error al eliminar transcripción:', error);
    return false;
  }
};

// ========== OPERACIONES NOTIFICACIONES ==========

export const crearNotificacion = (mensaje, tipo = 'sistema') => {
  if (!isCompatiblePlatform || !db) return null;
  
  try {
    const result = db.runSync(
      'INSERT INTO notificaciones (mensaje, tipo) VALUES (?, ?)',
      [mensaje, tipo]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.log('Error al crear notificación:', error);
    return null;
  }
};

export const obtenerNotificaciones = () => {
  if (!isCompatiblePlatform || !db) return [];
  
  try {
    return db.getAllSync('SELECT * FROM notificaciones ORDER BY fecha_creacion DESC');
  } catch (error) {
    console.log('Error al obtener notificaciones:', error);
    return [];
  }
};

export const marcarNotificacionLeida = (id) => {
  if (!isCompatiblePlatform || !db) return false;
  
  try {
    db.runSync('UPDATE notificaciones SET leida = 1 WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.log('Error al marcar notificación:', error);
    return false;
  }
};

// ========== OPERACIONES CONFIGURACIONES ==========

export const guardarConfiguracion = (clave, valor) => {
  if (!isCompatiblePlatform || !db) return false;
  
  try {
    db.runSync(
      'INSERT OR REPLACE INTO configuraciones (clave, valor) VALUES (?, ?)',
      [clave, valor]
    );
    return true;
  } catch (error) {
    console.log('Error al guardar configuración:', error);
    return false;
  }
};

export const obtenerConfiguracion = (clave) => {
  if (!isCompatiblePlatform || !db) return null;
  
  try {
    const result = db.getFirstSync('SELECT valor FROM configuraciones WHERE clave = ?', [clave]);
    return result ? result.valor : null;
  } catch (error) {
    console.log('Error al obtener configuración:', error);
    return null;
  }
};

// ========== OPERACIONES DE ADMINISTRACIÓN ==========

export const limpiarBaseDatos = () => {
  if (!isCompatiblePlatform || !db) return false;
  
  try {
    db.runSync('DELETE FROM transcripciones');
    db.runSync('DELETE FROM notificaciones');
    db.runSync('DELETE FROM configuraciones');
    console.log('Base de datos limpiada correctamente');
    return true;
  } catch (error) {
    console.log('Error al limpiar base de datos:', error);
    return false;
  }
};