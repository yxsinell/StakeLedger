'use client';

import type { FormEvent } from 'react';
import type { z } from 'zod';
import type { CatalogEntityType } from '@/lib/catalog/schemas';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CatalogEntityTypeSchema,
  CatalogItemResponseSchema,
  CatalogManualRequestSchema,
} from '@/lib/catalog/schemas';

type CatalogItem = z.infer<typeof CatalogItemResponseSchema>['item'];

interface ManualEntryFormProps {
  open: boolean
  initialQuery: string
  initialType: CatalogEntityType
  onOpenChange: (open: boolean) => void
  onCreated: (item: CatalogItem) => void
}

export function ManualEntryForm({
  open,
  initialQuery,
  initialType,
  onOpenChange,
  onCreated,
}: ManualEntryFormProps) {
  const [rawText, setRawText] = useState(initialQuery);
  const [type, setType] = useState<string>(initialType);
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) { return; }
    setRawText(initialQuery);
    setType(initialType);
    setCountry('');
    setError('');
    setSubmitting(false);
    return () => requestController.current?.abort();
  }, [initialQuery, initialType, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!rawText.trim()) {
      setError('Introduce un nombre para continuar');
      return;
    }

    if (!CatalogEntityTypeSchema.safeParse(type).success) {
      setError('Selecciona un tipo válido');
      return;
    }

    const request = CatalogManualRequestSchema.safeParse({
      rawText,
      type,
      country,
    });
    if (!request.success) {
      setError(request.error.issues[0]?.path[0] === 'type'
        ? 'Selecciona un tipo válido'
        : 'Revisa los datos antes de continuar');
      return;
    }

    setSubmitting(true);
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const response = await fetch('/api/catalog/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.data),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const apiError = payload && typeof payload === 'object' && 'error' in payload
          ? String(payload.error)
          : 'No se ha podido guardar la entrada manual.';
        setError(apiError);
        return;
      }

      const parsed = CatalogItemResponseSchema.safeParse(payload);
      if (!parsed.success) {
        setError('La respuesta del catálogo no es válida. Inténtalo de nuevo.');
        return;
      }

      if (controller.signal.aborted) { return; }
      onCreated(parsed.data.item);
      onOpenChange(false);
    }
    catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') { return; }
      setError('No se ha podido conectar con el catálogo. Inténtalo de nuevo.');
    }
    finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir entrada manual</DialogTitle>
          <DialogDescription>
            Guarda el dato como manual para poder identificarlo y normalizarlo más adelante.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" data-testid="manualEntryForm" onSubmit={(event) => { void handleSubmit(event); }}>
          <div className="space-y-2">
            <Label htmlFor="manual-raw-text">Nombre</Label>
            <Input
              id="manual-raw-text"
              data-testid="manual_raw_text_input"
              value={rawText}
              maxLength={100}
              onChange={event => setRawText(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-type">Tipo</Label>
            <select
              id="manual-type"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid="manual_type_select"
              disabled
              value={type}
              onChange={event => setType(event.target.value)}
            >
              <option value="team">Equipo</option>
              <option value="competition">Competición</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-country">País (opcional)</Label>
            <Input
              id="manual-country"
              data-testid="manual_country_input"
              value={country}
              maxLength={100}
              onChange={event => setCountry(event.target.value)}
            />
          </div>
          {error
            ? (
                <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" data-testid="manual_entry_error" role="alert">
                  {error}
                </p>
              )
            : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button data-testid="submit_manual_entry_button" disabled={submitting} type="submit">
              {submitting ? 'Guardando…' : 'Guardar entrada'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
