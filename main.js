import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import {setupCounter} from './src/counter.js'
import { setupWorld } from './src/World.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Welcome to our Escape Game!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <div id="three">
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`
//Test von Manuel

setupCounter(document.querySelector('#counter'))
setupWorld(document.getElementById('three'));
