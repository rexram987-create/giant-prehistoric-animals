# Approved site update — 16 October 2026

Purpose: improve the existing Hebrew encyclopedia for mobile reading and installation without replacing its static architecture or visual design.

1. Reconcile Paraceratherium's duplicate discovery text; qualify the Palaeoloxodon record claim; replace Argentavis's secondary source with its primary flight study and align the measurements with that study. Display real source titles. Keep broader scientific review explicitly ongoing.
2. Use hash routes (#animal/id/tab), browser back/forward, reload restoration, and persistent display preferences. Preserve ordinary links for sharing. Close the drawer with Escape, trap focus, restore focus, make home controls semantic, and provide accessible tab states. Load surviving entries when one fails and expose a retry control.
3. Add Hebrew RTL web manifest, original elephant icons (192/512/maskable), install/help UI, and a versioned service worker. Precache the complete local catalog atomically, serve a complete cached version of documents/data/static resources until the owner accepts an available update, exclude external sources, and offer update activation explicitly.
4. Verify routing, partial loading, keyboard behavior, install lifecycle and service-worker offline/update behavior with Node tests; check the Vercel preview through the browser; update README and open a PR.

Review focus: all-nine-animal precache completeness; no mixed old/new assets while an update waits; hash validation; safe links; failures and storage denial; real-device Android install must still be confirmed by the owner.

Execution: inline on feat/pwa-accessibility-science. The user approved all audit recommendations. Follow-up approval is reserved for review of concrete changes, not intermediate design artifacts.
