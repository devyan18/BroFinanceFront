import { useState, useCallback } from "react";
import api from "../services/api.service";

export interface TransferInfoWallet {
  name: string;
  color: string;
  cbu: string;
}

export interface PayTransferResult {
  wallets: TransferInfoWallet[];
  monto: number;
  descripcion: string;
  acreedorUsername: string;
}

export function usePayTransferModal(onSuccess?: () => void | Promise<void>) {
  const [open, setOpen] = useState(false);
  const [payCompraIds, setPayCompraIds] = useState<string[]>([]);
  const [result, setResult] = useState<PayTransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState<string | null>(null);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const handlePay = useCallback(
    async (acreedorId: string, compraIds?: string[]) => {
      setPayCompraIds(compraIds ?? []);
      setOpen(true);
      setLoading(true);
      setError(null);
      setResult(null);
      setCopiedCbu(null);
      try {
        const res = await api.payments.getTransferInfo({ acreedorId, compraIds });
        if (res.success && res.data) {
          setResult(res.data);
        } else {
          setError(res.error || "Error al obtener datos");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al obtener datos");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const close = useCallback(() => {
    setOpen(false);
    setResult(null);
    setError(null);
    setPayCompraIds([]);
    setCopiedCbu(null);
  }, []);

  const copyCbu = useCallback((cbu: string) => {
    navigator.clipboard.writeText(cbu);
    setCopiedCbu(cbu);
    setTimeout(() => setCopiedCbu(null), 2000);
  }, []);

  const handleNotifyPayment = useCallback(async () => {
    setNotifyLoading(true);
    try {
      if (payCompraIds.length > 0) {
        await Promise.all(payCompraIds.map((id) => api.compras.requestPayment(id)));
      }
      close();
      await onSuccess?.();
    } finally {
      setNotifyLoading(false);
    }
  }, [payCompraIds, close, onSuccess]);

  return {
    open,
    payCompraIds,
    result,
    error,
    loading,
    copiedCbu,
    notifyLoading,
    handlePay,
    close,
    copyCbu,
    handleNotifyPayment,
  };
}
