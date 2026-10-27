# Podcast page

Approved direction: a public `/podcasts` page with a YouTube player and episode list, linked from the existing Podcast microphone control on the homepage. Reuse the site's blue, white and gray styling; support mobile and keyboard navigation.

Approaches: reuse course lessons (mixes independent content with enrollment), create a dedicated database/admin system (outside requested scope), or use a typed episode catalog and dedicated page (chosen implementation). No dependencies or schema changes.

Episodes contain title, description and YouTube video ID. No actual episode URLs have been supplied: show an honest empty state until content is added. Do not publish unrelated sample videos. Selecting an episode replaces the player; offer a YouTube fallback link. No autoplay.
