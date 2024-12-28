// Mockear o configurar bibliotecas globales
import { jest } from "@jest/globals";

// Configurar una variable global para usar en todas las pruebas
global.__API_URL__ = "http://localhost:8083";

// Simulación de consola limpia para reducir ruido en los logs de pruebas
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
