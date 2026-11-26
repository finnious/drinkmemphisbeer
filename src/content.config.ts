import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.object({ title: z.string(), url: z.url() });

const breweries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/breweries' }),
  schema: z.object({
    name: z.string(),
    status: z.enum(['open', 'closed', 'changed-hands', 'no-taproom', 'unverified']),
    statusNote: z.string().optional(),
    verified: z.string().optional(), // e.g. "May 2026"
    successor: z.string().optional(), // slug of the brewery that took over
    neighborhood: reference('neighborhoods').optional(),
    alsoIn: z.array(reference('neighborhoods')).default([]),
    locations: z
      .array(z.object({ label: z.string(), address: z.string() }))
      .default([]),
    website: z.url().optional(),
    founded: z.number().optional(),
    summary: z.string(),
    sources: z.array(source).default([]),
  }),
});

const beers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/beers' }),
  schema: z.object({
    name: z.string(),
    brewery: reference('breweries'),
    style: z.string(),
    abv: z.number().optional(),
    ibu: z.number().optional(),
    availability: z.enum(['year-round', 'seasonal', 'limited', 'retired', 'unknown']).default('unknown'),
    description: z.string(),
    // Pour Score is Will's own rating. Never fill this in for him.
    pourScore: z.number().min(0).max(5).optional(),
    tapWaterTest: z.enum(['passes', 'fails']).optional(),
    willsTake: z.string().optional(),
    sources: z.array(source).default([]),
  }),
});

const neighborhoods = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/neighborhoods' }),
  schema: z.object({
    name: z.string(),
    summary: z.string(),
  }),
});

const festivals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/festivals' }),
  schema: z.object({
    name: z.string(),
    when: z.string(),
    where: z.string(),
    summary: z.string(),
    website: z.url().optional(),
    sources: z.array(source).default([]),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    sources: z.array(source).default([]),
  }),
});

export const collections = { breweries, beers, neighborhoods, festivals, news };
