'use client';

import { Info } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function QuickActionsPanel() {
  return (
    <section
      className="grid gap-4 lg:grid-cols-2"
      data-testid="quickActionsPanel"
    >
      <Card className="surface-grid">
        <CardHeader className="space-y-3">
          <Badge variant="secondary">Control operativo</Badge>
          <CardTitle>Crear bank base</CardTitle>
          <CardDescription>
            Configura el bank con sus bolsillos y reglas de riesgo. Solo demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="create_bank_button">Nuevo bank</Button>
            </DialogTrigger>
            <DialogContent data-testid="createBankDialog">
              <DialogHeader>
                <DialogTitle>Nuevo bank principal</DialogTitle>
                <DialogDescription>
                  Define el nombre, la moneda y el perfil de stake.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bank-name">Nombre del bank</Label>
                  <Input id="bank-name" data-testid="bank_name_input" />
                </div>
                <div className="grid gap-2">
                  <Label>Moneda operativa</Label>
                  <Select>
                    <SelectTrigger data-testid="bank_currency_select">
                      <SelectValue placeholder="Selecciona moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="ars">ARS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Perfil de stake</Label>
                  <RadioGroup
                    defaultValue="moderado"
                    className="grid gap-2"
                    data-testid="stake_profile_radio"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="conservador" id="stake-cons" />
                      <Label htmlFor="stake-cons">Conservador</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="moderado" id="stake-mod" />
                      <Label htmlFor="stake-mod">Moderado</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="agresivo" id="stake-agr" />
                      <Label htmlFor="stake-agr">Agresivo</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-card/70 px-4 py-3">
                  <div>
                    <Label htmlFor="risk-switch">Cortafuegos de riesgo</Label>
                    <p className="text-xs text-muted-foreground">
                      Bloquea cuotas suicidas automaticamente.
                    </p>
                  </div>
                  <Switch id="risk-switch" data-testid="risk_switch" />
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="seed-check" data-testid="seed_checkbox" />
                  <Label htmlFor="seed-check">
                    Registrar saldo inicial de cash, bonus y freebet
                  </Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas internas</Label>
                  <Textarea id="notes" data-testid="bank_notes_textarea" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid="stake_info_trigger"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      El stake 0-20 usa cap 40% sobre cash disponible.
                    </PopoverContent>
                  </Popover>
                  Criterios de stake calculado en cada ticket.
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
                <Button type="button" data-testid="confirm_bank_button">
                  Crear bank
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="surface-grid">
        <CardHeader className="space-y-3">
          <Badge>Registro rapido</Badge>
          <CardTitle>Nuevo ticket express</CardTitle>
          <CardDescription>
            Carga un ticket con mix de fondos y cuota sugerida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" data-testid="open_ticket_sheet">
                Abrir sheet
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Ticket rapido</SheetTitle>
                <SheetDescription>
                  Demo visual: sin envio real a backend.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event">Evento</Label>
                  <Input id="event" data-testid="event_input" />
                </div>
                <div className="grid gap-2">
                  <Label>Tipo de ticket</Label>
                  <Select>
                    <SelectTrigger data-testid="ticket_type_select">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="combo">Combinada</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stake">Stake sugerido</Label>
                  <Input id="stake" data-testid="stake_input" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="odds">Cuota</Label>
                  <Input id="odds" data-testid="odds_input" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card/70 px-4 py-3">
                <div>
                  <Label htmlFor="live-switch">Modo live</Label>
                  <p className="text-xs text-muted-foreground">
                    Ajusta limites para apuestas en vivo.
                  </p>
                </div>
                <Switch id="live-switch" data-testid="live_switch" />
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" type="button">
                  Guardar borrador
                </Button>
                <Button type="button" data-testid="submit_ticket_button">
                  Registrar ticket
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>
    </section>
  );
}
