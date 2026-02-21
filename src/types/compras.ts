export interface TipoCompra {
  _id: string;
  descripcion: string;
}

export interface Roommate {
  id: string;
  username: string;
  avatarUrl?: string;
  balance: number;
}

export type EstadoCompra = "pendiente" | "aceptado" | "rechazado" | "pago_pendiente" | "pagado";

export interface Compra {
  _id: string;
  descripcion: string;
  montoTotal: number;
  montoAcreedor: number;
  montoDeudor: number;
  tipo: TipoCompra | string;
  acreedorId: { _id: string; username: string; avatarUrl?: string } | string;
  deudorId: { _id: string; username: string; avatarUrl?: string } | string;
  estado?: EstadoCompra;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompraInput {
  descripcion: string;
  montoTotal: number;
  montoDeudor: number;
  tipo: string;
  deudorId?: string; // Opcional: gasto personal (solo)
}

export interface CreateCompraBatchInput {
  descripcion: string;
  montoTotal: number;
  tipo: string;
  deudores: { deudorId: string; montoDeudor: number }[];
}

export interface UpdateCompraInput {
  descripcion?: string;
  montoTotal?: number;
  tipo?: string;
}

export interface ComprasPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BalanceData {
  roommateId: string;
  totalACobrar: number;
  totalAPagar: number;
  balance: number;
  estado: "te deben" | "debes" | "cuadrado";
}
