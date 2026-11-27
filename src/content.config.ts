import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const source = z.object({ title: z.string(), url: z.url() });

// People who write for the site. One file per person in src/content/authors/<slug>.md;
// the file body is their long bio. Will is the founder and the only one who sets Pour Scores.
const authors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    role: z.string(), // "Founder & editor", "Contributor"
    bio: z.string(), // one or two sentences, shown on bylines and author cards
    avatar: z.string().optional(), // path under /public, square, ~400px
    location: z.string().optional(), // "Midtown Memphis"
    joined: z.coerce.date(),
    editor: z.boolean().default(false),
    links: z
      .object({ x: z.string().optional(), instagram: z.string().optional(), linkedin: z.url().optional(), website: z.url().optional() })
      .default({}),
    active: z.boolean().default(true),
  }),
});

// Bylined articles from Will and contributors: features, brewery profiles, guides, essays.
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: reference('authors'),
    coAuthors: z.array(reference('authors')).default([]),
    kind: z.enum(['feature', 'profile', 'guide', 'essay', 'interview']).default('feature'),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    breweries: z.array(reference('breweries')).default([]), // breweries the story covers
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    sources: z.array(source).default([]),
    draft: z.boolean().default(false),
  }),
});

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
      .array(z.object({ label: z.string(), address: z.string(), lat: z.number().optional(), lng: z.number().optional() }))
      .default([]),
    website: z.url().optional(),
    founded: z.number().optional(),
    // Set for anything outside Memphis city limits, e.g. "Collierville, TN". Shown as a Metro tag.
    town: z.string().optional(),
    summary: z.string(),
    contributors: z.array(reference('authors')).default([]), // "With reporting by" credit
    sources: z.array(source).default([]),
  }),
});

// Distilleries and wineries: the "Beyond Beer" section.
const beyond = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/beyond' }),
  schema: z.object({
    name: z.string(),
    kind: z.enum(['distillery', 'winery']),
    status: z.enum(['open', 'closed', 'unverified']),
    verified: z.string().optional(),
    town: z.string().optional(),
    locations: z.array(z.object({ label: z.string(), address: z.string() })).default([]),
    website: z.url().optional(),
    founded: z.number().optional(),
    visit: z.string().optional(), // tours, tastings, what to expect
    summary: z.string(),
    contributors: z.array(reference('authors')).default([]), // "With reporting by" credit
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
    contributors: z.array(reference('authors')).default([]), // "With reporting by" credit
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
    /** ISO date of the next confirmed edition, e.g. "2027-10-02". Enables Event schema. */
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    organizer: z.string().optional(),
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
    author: reference('authors').optional(), // defaults to Will (lib/authors FOUNDER)
    sources: z.array(source).default([]),
  }),
});

export const collections = { authors, stories, breweries, beers, neighborhoods, festivals, news, beyond };
