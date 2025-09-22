import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const isCompatiblePlatform = Platform.OS !== 'web';
let db = null;

if (isCompatiblePlatform) {
  db = SQLite.openDatabaseSync('uleamapp.db');
}

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (!isCompatiblePlatform) {
      console.log('SQLite no disponible en web');
      resolve();
      return;
    }

    try {
      // Eliminar tabla de prueba anterior
      db.execSync('DROP TABLE IF EXISTS test_table;');

      // Tabla para STT - Conversión de voz a texto
      db.execSync(`
        CREATE TABLE IF NOT EXISTS transcripciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          texto_transcrito TEXT NOT NULL,
          duracion_audio REAL,
          precision_ia REAL,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tabla para notificaciones visuales
      db.execSync(`
        CREATE TABLE IF NOT EXISTS notificaciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mensaje TEXT NOT NULL,
          tipo TEXT DEFAULT 'sistema',
          leida BOOLEAN DEFAULT 0,
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tabla para adaptación de audio personalizada
      db.execSync(`
        CREATE TABLE IF NOT EXISTS configuraciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clave TEXT UNIQUE NOT NULL,
          valor TEXT NOT NULL,
          fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Base de datos configurada: STT, notificaciones visuales y adaptación de audio');
      resolve();
    } catch (error) {
      console.log('Error al crear esquema:', error);
      reject(error);
    }
  });
};

export default db;