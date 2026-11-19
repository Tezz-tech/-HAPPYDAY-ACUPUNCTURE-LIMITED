// Vercel serverless entry for the API. The implementation lives in backend/. Vercel treats every JavaScript file
// inside a top-level api/ folder as its own function, so only this file is kept here.
export { default } from '../backend/index.js';
