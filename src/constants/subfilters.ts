/**
 * Subfiltros por tipo de gasto (solo frontend)
 * Para "Otros" se usa descripción libre
 */
export const TIPO_SUBFILTERS: Record<string, string[] | null> = {
  Transporte: ["Uber", "Colectivo", "Taxi", "Metro", "Combustible", "Otro"],
  Supermercado: [
    "Verduleria",
    "Carniceria",
    "Panaderia",
    "Pasteleria",
    "Reposteria",
    "Otro",
  ],
  Restaurante: ["Delivery", "Presencial", "Cafetería", "Otro"],
  Servicios: ["Luz", "Gas", "Agua", "Internet", "Teléfono", "Otro"],
  Entretenimiento: ["Cine", "Streaming", "Juegos", "Otro"],
  Salud: ["Farmacia", "Médico", "Otro"],
  Otros: null, // Solo descripción libre
};

export function hasSubfilters(tipoDescripcion: string): boolean {
  return tipoDescripcion in TIPO_SUBFILTERS;
}

export function isOtros(tipoDescripcion: string): boolean {
  return tipoDescripcion === "Otros";
}

export function getSubfilters(tipoDescripcion: string): string[] | null {
  return TIPO_SUBFILTERS[tipoDescripcion] ?? null;
}
