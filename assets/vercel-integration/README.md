# Vercel integration assets

Gallery images and the logo for the **Create Integration** form at
<https://vercel.com/dashboard/integrations/console>.

Every screenshot is the real product - the studio running against real
generated projects, captured at 1400x788 CSS pixels on a 2x display and placed
in a 1920x1080 frame. Nothing here is a mockup.

| File | Shows |
| --- | --- |
| `01-dashboard.png` | The prompt box, starter prompts, and existing projects |
| `02-editor.png` | The editor: section list, live canvas, copilot |
| `03-section-selected.png` | A selected section and its fields |
| `04-theme.png` | Brand kits and the theme controls |
| `05-deploy.png` | The deploy dialog, with **Continue with Vercel** |
| `06-preview.png` | A generated site as a visitor sees it |
| `logo-512.png` | The brand mark, 512x512, for the Logo field |

Upload the numbered images to **Feature media** in that order. All six are
1920x1080 (16:9) with no alpha channel, which is what the form requires.

The demo account in `01-dashboard.png` uses `demo@example.com`, reserved by
RFC 2606 for documentation, so no routable address is published.

## Regenerating

The capture scripts are not checked in - they were a one-off, and they depend
on a local database seeded with demo projects. To redo these images: run the
studio locally with seeded data, sign in, and screenshot the same six screens
at 16:9. The frames are dark because Vercel renders gallery images against
both light and dark backgrounds.
