import { mount } from 'svelte'
// Geist, bundled from the npm package: Vite copies the font files into the
// build, so the page loads them from its own origin rather than a font CDN.
import '@fontsource-variable/geist'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
