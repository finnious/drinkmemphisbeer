# Contributors: how a pitch becomes a page

Public pitch page: https://www.drinkmemphisbeer.com/write-for-us/ (pitches go to will@drinkmemphisbeer.com).
Rules every piece follows: https://www.drinkmemphisbeer.com/editorial-standards/

## 1. Pitch → yes
Will replies within about a week. On a yes, agree on angle, length (usually 600–1,200 words), kind
(`feature`, `profile`, `guide`, `essay`, `interview`) and a target date. Ask about conflicts of interest.

## 2. Add the contributor (once per person)
Create `src/content/authors/<first-last>.md`:

```md
---
name: Jane Doe
role: Contributor            # or "Photographer", "Contributing editor"
bio: One or two sentences, third person, Memphis-specific.
avatar: /images/authors/jane-doe-400.webp   # square, ~400px, their own photo, with permission
location: Cooper-Young
joined: 2026-12-01
links:
  x: janedoe                 # handle only
  instagram: janedoe
  website: https://janedoe.com
---

Longer bio for their author page.
```

Their author page appears at `/authors/<slug>/` (hidden from search until their first piece is live)
and on `/authors/`. Will's profile stays at `/about/` (slug `will-finney`).

## 3. The story
Contributors draft wherever they like (Google Doc, email). The editor converts it to
`src/content/stories/<slug>.md`:

```md
---
title: Why Memphis needs more lagers
description: One sentence, 120–155 characters, used for search and sharing.
author: jane-doe
coAuthors: []                # e.g. [will-finney]
kind: profile
date: 2026-12-10
breweries: [hampline]        # brewery slugs the story covers
sources:
  - title: Interview with ..., Dec. 3, 2026
    url: https://...
draft: true                  # remove to publish
---
```

`draft: true` keeps it off the live site; the contributor can review a preview build. Remove it to publish.
The Stories menu item appears automatically once the first story is published.

News posts take an optional `author:` too (defaults to Will). For reporting help on an existing
brewery, beer or Beyond Beer page, add `contributors: [jane-doe]`; the page then credits
"With reporting by Jane Doe" and it shows on their author page.

## 4. Publish
`python3 scripts/og-cards.py && npm run build`, commit, push. Bylines, author schema (Person),
share cards, sitemap and dates are all automatic.

## Rules that don't bend
- Only Will sets Pour Scores and Tap Water Test verdicts. Contributors' opinions are theirs, in their stories.
- Every factual claim has a source in `sources`.
- Conflicts of interest are disclosed on the page.
- Contributors are currently unpaid; they keep ownership and grant us the right to publish.
