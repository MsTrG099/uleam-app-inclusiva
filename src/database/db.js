import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Verificar si estamos en una plataforma compatible
const isCompatiblePlatform = Platform.OS !== 'web';

let db = null;

if (isCompatiblePlatform) {
  // Nueva sintaxis para expo-sqlite
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
      // Nueva sintaxis síncrona
      db.execSync(`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Base de datos inicializada correctamente');
      resolve();
    } catch (error) {
      console.log('Error al crear tabla:', error);
      reject(error);
    }
  });
};

export default db;