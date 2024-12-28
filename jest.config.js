export default {
  testEnvironment: "node", // Entorno para pruebas
  // extensionsToTreatAsEsm: [".js"], // Archivos .js tratados como módulos ES
  // testMatch: ["**/tests/**/*.test.js"], // Ruta para encontrar pruebas
  testMatch: ["**/tests/*/*.test.js"], // Ruta para encontrar pruebas
  setupFiles: ["<rootDir>/tests/setup.js"], // Archivo de configuración inicial
  coverageDirectory: "./coverage", // Directorio para reporte de cobertura
  collectCoverage: true,
  coverageReporters: ["html", "text", "lcov"],
  transform: {}, // Evita el uso de transformadores como Babel para JS puro
  moduleDirectories: ["node_modules", "src"], // Directorios para buscar módulos
};
