# Hero banner images

Drop your homepage carousel images in this folder.

## Naming

- `banner1.jpg`, `banner2.jpg`, `banner3.jpg` — to match the references in `src/pages/Home.jsx`
- Rename or add more by editing the `heroSlides` array in `Home.jsx`

## Recommended size

- **Aspect ratio**: 21:9 (wide cinema) or 16:7 — e.g. 2100×900 px
- **Format**: JPG (smaller) or WebP (best); PNG only if you need transparency
- **File size**: under 300 KB each (compress at tinypng.com or squoosh.app)

## How they are loaded

These files are served by Vite directly at:

  http://localhost:5173/images/hero/banner1.jpg

No build step needed — just drop a file and refresh the browser.

## Fallback

If a file is missing, the carousel automatically shows a colored gradient slide
instead of breaking, so the page never looks empty.
