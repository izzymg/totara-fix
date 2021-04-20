# dev.md

The popup is defined as a `page_action` in manifest.json, triggering on URL's matching the correct domain.

Each script start button is hooked into a Javascript event listener under `view/MoodFix.js` which fires messages to the background script `./background.js`

To add features, create another HTML button along with its Javascript hook, send your message through the chrome runtime and add a `case` in the message listener.

The functions defined in `background.js` procedurally inject scripts into the page. If they need to be reused by content scripts or called at the discretion of a function,they're placed under `injected/functions`, which are named functions starting with `MoodFix` by convention, to avoid conflicting with page Javascript. Otherwise anonymous IIFEs [(Immediately Invoked Function Expression)](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) under `injected/iifes` are injected into the page for immediate invocation.