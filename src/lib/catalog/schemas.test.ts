import { describe, expect, test } from 'bun:test';

import {
  CatalogAdminListQuerySchema,
  CatalogAliasRequestSchema,
  CatalogCompetitionAdminRequestSchema,
  CatalogEntityTypeSchema,
  CatalogManualRequestSchema,
  CatalogSearchQuerySchema,
  CatalogTeamAdminRequestSchema,
} from './schemas';

describe('CatalogSearchQuerySchema', () => {
  test('trims query and applies pagination defaults', () => {
    expect(CatalogSearchQuerySchema.parse({ q: '  bar  ' })).toEqual({
      q: 'bar',
      limit: 10,
      offset: 0,
    });
  });

  test('enforces query and pagination boundaries', () => {
    expect(CatalogSearchQuerySchema.safeParse({ q: ' a ' }).success).toBe(false);
    expect(CatalogSearchQuerySchema.safeParse({ q: 'a'.repeat(101) }).success).toBe(false);
    expect(CatalogSearchQuerySchema.safeParse({ q: 'bar', limit: 0 }).success).toBe(false);
    expect(CatalogSearchQuerySchema.safeParse({ q: 'bar', limit: 26 }).success).toBe(false);
    expect(CatalogSearchQuerySchema.safeParse({ q: 'bar', offset: -1 }).success).toBe(false);
    expect(CatalogSearchQuerySchema.safeParse({ q: 'bar', offset: 10001 }).success).toBe(false);
  });

  test('normalizes a blank optional admin query to undefined', () => {
    expect(CatalogAdminListQuerySchema.parse({ q: '   ' })).toEqual({
      q: undefined,
      limit: 25,
      offset: 0,
    });
  });

  test('allows admin pages up to 50 items', () => {
    expect(CatalogAdminListQuerySchema.parse({ limit: 50 })).toMatchObject({ limit: 50 });
    expect(CatalogAdminListQuerySchema.safeParse({ limit: 51 }).success).toBe(false);
  });
});

describe('catalog request schemas', () => {
  test('accepts only exact catalog entity types', () => {
    expect(CatalogEntityTypeSchema.safeParse('team').success).toBe(true);
    expect(CatalogEntityTypeSchema.safeParse('competition').success).toBe(true);
    expect(CatalogEntityTypeSchema.safeParse('TEAM').success).toBe(false);
    expect(CatalogEntityTypeSchema.safeParse('league').success).toBe(false);
  });

  test('accepts a manual competition without sport', () => {
    expect(CatalogManualRequestSchema.parse({
      type: 'competition',
      rawText: '  Liga Profesional  ',
      country: '  ',
    })).toEqual({
      type: 'competition',
      rawText: 'Liga Profesional',
      country: undefined,
    });
  });

  test('requires provider and externalId as a pair', () => {
    expect(CatalogTeamAdminRequestSchema.safeParse({
      name: 'Barcelona',
      provider: 'opta',
    }).success).toBe(false);
    expect(CatalogTeamAdminRequestSchema.safeParse({
      name: 'Barcelona',
      externalId: 'OPTA-1',
    }).success).toBe(false);
    expect(CatalogTeamAdminRequestSchema.safeParse({
      name: 'Barcelona',
      provider: ' opta ',
      externalId: ' OPTA-1 ',
    }).success).toBe(true);
  });

  test('accepts an optional alias in atomic admin writes', () => {
    expect(CatalogTeamAdminRequestSchema.parse({
      name: 'Barcelona',
      alias: '  Barça  ',
    })).toMatchObject({ alias: 'Barça' });
  });

  test('requires sport for admin competitions', () => {
    expect(CatalogCompetitionAdminRequestSchema.safeParse({
      name: 'Liga Profesional',
    }).success).toBe(false);
    expect(CatalogCompetitionAdminRequestSchema.safeParse({
      name: 'Liga Profesional',
      sport: 'football',
    }).success).toBe(true);
  });

  test('trims aliases and enforces their boundaries', () => {
    expect(CatalogAliasRequestSchema.parse({ alias: '  LPF  ' })).toEqual({ alias: 'LPF' });
    expect(CatalogAliasRequestSchema.safeParse({ alias: '   ' }).success).toBe(false);
    expect(CatalogAliasRequestSchema.safeParse({ alias: 'a'.repeat(101) }).success).toBe(false);
  });
});
