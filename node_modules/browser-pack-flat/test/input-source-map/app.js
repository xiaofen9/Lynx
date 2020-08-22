import dep from "./dep"
import html from 'bel'

document.body.appendChild(html`
  <section class="mw7 center">
	 <h2 class="athelas ph3 ph0-l">News</h2>
	 <article class="pv4 bt bb b--black-10 ph3 ph0-l">
		<div class="flex flex-column flex-row-ns">
		  <div class="w-100 w-60-ns pr3-ns order-2 order-1-ns">
			 <h1 class="f3 athelas mt0 lh-title">${dep('title')}</h1>
			 <p class="f5 f4-l lh-copy athelas">
				${dep('excerpt')}
			 </p>
		  </div>
		  <div class="pl3-ns order-1 order-2-ns mb4 mb0-ns w-100 w-40-ns">
			 <img src="http://mrmrs.github.io/photos/cpu.jpg" class="db" alt="Photo of a dimly lit room with a computer interface terminal.">
		  </div>
		</div>
		<p class="f6 lh-copy gray mv0">By <span class="ttu">${dep('author')}</span></p>
		<time class="f6 db gray">${dep('timestamp')}</time>
	 </article>
  </section>
`)
