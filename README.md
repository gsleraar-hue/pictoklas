# PictoClass

PictoClass is a Chrome extension for teachers of newcomer students (in the Netherlands: ISK, NT2 or "taalklas").
With one click the teacher puts a large pictogram on the screen – *listen*, *look*, *be quiet*, *raise your hand*,
*work together*, *put your phone away* and 19 more – with the word and its pronunciation in the student's home
language next to the Dutch word. Students hear their own language first and then the Dutch instruction.

The user interface is in Dutch, because the extension is made for Dutch classrooms.

## Features

- Large pictogram cards on any web page, also in presentation (fullscreen) mode; drag to move, drag the corner or Ctrl+scroll to resize.
- Every language row is a pair: home language ▶ | Dutch, plus ▶▶ to play both in a row.
- Type a short sentence in the bubble: it becomes a card with the Dutch sentence and its translation, spoken in the home language and in Dutch.
- Choose a female or male voice; used for every language the computer has such a voice for.
- No preparation: pick the student's language on a card and PictoClass looks up the translation and a pronunciation by itself.
- A floating **bubble** on top of the page to pick pictograms. **✎ Aanpassen** (edit) in the bubble chooses which pictograms and languages are used and whether the bubble shows on every site.
- Also reachable from the toolbar icon, the context menu and keyboard shortcuts (Alt+Shift+P, Alt+Shift+O, Alt+Shift+X).
- 27 languages, including Arabic, Tigrinya, Ukrainian, Turkish, Polish, Persian, Pashto and Somali.
- Export/import of the word set (JSON) to share with colleagues. No account; everything stays in the browser.

## Where words and sounds come from

| What | Source, in order |
| --- | --- |
| Translation | Google Translate (`translate.googleapis.com`, from a fixed English gloss per pictogram), then MyMemory |
| Pronunciation | the teacher's own recording (microphone, on the word editor page), then Google Translate speech (`translate_tts`), then the computer voice (`chrome.tts`) |

Recordings are stored as data URLs in `chrome.storage.local`, so they play instantly and offline afterwards.
Google speech is not available for every language (e.g. Tigrinya, Somali, Persian, Pashto, Kurdish). For those, a student or colleague can record the word once on the word editor page;
the grey play button on a card links straight there. Note that the Google endpoints used are free but not officially documented.

## Install for development

1. Open `chrome://extensions` and switch on **Developer mode**.
2. Click **Load unpacked** and choose this folder.
3. On first install the empty board opens with the bubble in edit mode.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 |
| `picto.js` | Pictograms (as SVG shapes), languages, SVG builder – shared by all pages |
| `overlay.js` | Cards and bubble, in a closed shadow DOM on the page |
| `background.js` | Service worker: injecting, context menu, playback, bubble registration |
| `auto.js` | Automatic translation and pronunciation lookup (also for typed sentences) |
| `voices.js` | Tells male and female system voices apart by their names |
| `offscreen.*` | Plays audio for the service worker |
| `popup.*`, `options.*`, `bord.*`, `grant.*` | Toolbar popup, word editor, empty board, permission window |
| `store/` | Chrome Web Store images and the pages used to render them |
| `privacy.html` | Privacy policy (Dutch), published with GitHub Pages |

## Building the Web Store package

Run `maak-zip.cmd` (Windows) to create `store/pictoclass-<version>.zip` with only the extension files.

## Privacy

PictoClass collects no personal data. Only the fixed pictogram words are sent to the translation and pronunciation services.
Privacy policy: https://gsleraar-hue.github.io/pictoklas/privacy.html
