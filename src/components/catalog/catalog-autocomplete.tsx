'use client';

import type { KeyboardEvent } from 'react';
import type { z } from 'zod';
import type { CatalogEntityType } from '@/lib/catalog/schemas';
import { LoaderCircle, RefreshCw, Search } from 'lucide-react';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CatalogListResponseSchema } from '@/lib/catalog/schemas';
import { cn } from '@/lib/utils';

import { ManualEntryForm } from './manual-entry-form';

type CatalogItem = z.infer<typeof CatalogListResponseSchema>['items'][number];

interface CatalogAutocompleteProps {
  type: CatalogEntityType
  value: string
  onValueChange: (value: string) => void
  onSelect: (item: CatalogItem) => void
}

export function CatalogAutocomplete({ type, value, onValueChange, onSelect }: CatalogAutocompleteProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [manualOpen, setManualOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const selectedValue = useRef<string | null>(null);
  const instanceId = useId();
  const listboxId = `${instanceId}-catalog-suggestions`;
  const activeOptionId = `${instanceId}-catalog-option-active`;
  const trimmedValue = value.trim();

  useEffect(() => {
    setItems([]);
    setActiveIndex(-1);
    setError('');

    if (selectedValue.current === value) {
      selectedValue.current = null;
      setLoading(false);
      setOpen(false);
      return;
    }

    if (trimmedValue.length < 2) {
      setLoading(false);
      setOpen(Boolean(value));
      return;
    }

    const controller = new AbortController();
    const loadSuggestions = async () => {
      setLoading(true);
      setOpen(true);
      try {
        const endpoint = type === 'team' ? 'teams' : 'competitions';
        const response = await fetch(`/api/catalog/${endpoint}?q=${encodeURIComponent(trimmedValue)}`, {
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error('catalog-request-failed');
        }
        const parsed = CatalogListResponseSchema.safeParse(payload);
        if (!parsed.success) {
          throw new Error('catalog-response-invalid');
        }
        if (controller.signal.aborted) { return; }
        setItems(parsed.data.items);
        setActiveIndex(parsed.data.items.length > 0 ? 0 : -1);
      }
      catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') { return; }
        setError('No se han podido cargar las sugerencias. Puedes reintentar o añadir el dato manualmente.');
      }
      finally {
        if (!controller.signal.aborted) { setLoading(false); }
      }
    };
    const timeout = window.setTimeout(() => { void loadSuggestions(); }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [retryKey, trimmedValue, type, value]);

  const chooseItem = (item: CatalogItem) => {
    selectedValue.current = item.name;
    onValueChange(item.name);
    onSelect(item);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || items.length === 0) { return; }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(current => current >= items.length - 1 ? 0 : current + 1);
    }
    else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(current => current <= 0 ? items.length - 1 : current - 1);
    }
    else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) { chooseItem(item); }
    }
  };

  const showPanel = open && Boolean(value);

  return (
    <div className="relative" data-testid="catalogAutocomplete">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          aria-activedescendant={activeIndex >= 0 ? activeOptionId : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showPanel}
          aria-label={type === 'team' ? 'Buscar equipo' : 'Buscar competición'}
          autoComplete="off"
          className="pl-11"
          data-testid="catalog_search_input"
          placeholder={type === 'team' ? 'Busca un equipo' : 'Busca una competición'}
          role="combobox"
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value);
            setOpen(Boolean(event.target.value));
          }}
          onFocus={() => setOpen(Boolean(value))}
          onKeyDown={handleKeyDown}
        />
        {loading ? <LoaderCircle className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-primary" aria-label="Buscando" /> : null}
      </div>

      {showPanel
        ? (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border bg-popover shadow-xl">
              {trimmedValue.length < 2
                ? (
                    <p className="px-4 py-3 text-sm text-muted-foreground" role="status">
                      Escribe al menos 2 caracteres para buscar
                    </p>
                  )
                : null}

              {error
                ? (
                    <div className="space-y-3 p-4" role="alert">
                      <p className="text-sm text-destructive">{error}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setRetryKey(current => current + 1)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {' '}
                          Reintentar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setManualOpen(true)}>Añadir manualmente</Button>
                      </div>
                    </div>
                  )
                : null}

              {!loading && !error && trimmedValue.length >= 2 && items.length === 0
                ? (
                    <div className="space-y-3 p-4" data-testid="catalog_empty_state">
                      <div>
                        <p className="font-medium">No hay coincidencias</p>
                        <p className="text-sm text-muted-foreground">
                          Puedes guardar “
                          {trimmedValue}
                          ” como entrada manual.
                        </p>
                      </div>
                      <Button data-testid="manual_entry_button" size="sm" onClick={() => setManualOpen(true)}>
                        Añadir entrada manual
                      </Button>
                    </div>
                  )
                : null}

              {items.length > 0
                ? (
                    <ul id={listboxId} data-testid="catalog_suggestions_list" role="listbox" aria-label="Sugerencias del catálogo">
                      {items.map((item, index) => (
                        <li
                          id={activeIndex === index ? activeOptionId : undefined}
                          aria-selected={activeIndex === index}
                          className={cn(
                            'cursor-pointer border-b px-4 py-3 last:border-0',
                            activeIndex === index && 'bg-accent text-accent-foreground',
                          )}
                          data-testid="catalog_suggestion_item"
                          key={item.id}
                          role="option"
                          onMouseDown={event => event.preventDefault()}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => chooseItem(item)}
                        >
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.type === 'team' ? 'Equipo' : 'Competición'}
                            {item.country ? ` · ${item.country}` : ''}
                            {item.sport ? ` · ${item.sport}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )
                : null}
            </div>
          )
        : null}

      <ManualEntryForm
        initialQuery={trimmedValue}
        initialType={type}
        open={manualOpen}
        onCreated={(item) => {
          selectedValue.current = item.name;
          onValueChange(item.name);
          onSelect(item);
          setOpen(false);
        }}
        onOpenChange={setManualOpen}
      />
    </div>
  );
}
