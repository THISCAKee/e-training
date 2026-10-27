# Podcast administration

Extend the existing ADMIN workspace with a Podcasts tab. Store title, description, normalized YouTube video ID, display order and publication state in a dedicated Podcast table. ADMIN can list, create, edit and delete episodes; ORG_ADMIN and learners cannot access these operations. Public page reads published episodes ordered by order then newest ID.

A separate table follows existing Prisma/MySQL conventions and supports durable administration. Reusing Course would introduce enrollment semantics; a file-backed editor is unsuitable for deployed instances. Use the dedicated table without adding dependencies. Validate all input on the server, reject non-YouTube URLs, confirm deletion and show actionable loading/error feedback.
