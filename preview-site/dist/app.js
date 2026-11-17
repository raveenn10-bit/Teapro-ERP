const nav = document.querySelector('.nav-wrap')
const menu = document.querySelector('#menu')
const links = document.querySelector('#nav-links')

const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 16)
updateNav()
window.addEventListener('scroll', updateNav, { passive: true })

menu?.addEventListener('click', () => {
  const open = links.classList.toggle('open')
  menu.setAttribute('aria-expanded', String(open))
})
links?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  links.classList.remove('open')
  menu?.setAttribute('aria-expanded', 'false')
}))

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const items = document.querySelectorAll('.reveal')
if (reducedMotion || !('IntersectionObserver' in window)) {
  items.forEach((item) => item.classList.add('visible'))
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })
  items.forEach((item) => observer.observe(item))
}

const paper = document.querySelector('#paper')
document.querySelectorAll('[data-format]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('[data-format]').forEach((tab) => tab.classList.remove('selected'))
  button.classList.add('selected')
  paper.className = 'paper'
  if (button.dataset.format === '58') paper.classList.add('thermal')
  if (button.dataset.format === '80') paper.classList.add('thermal', 'wide')
  if (button.dataset.format === 'a4') paper.classList.add('a4')
}))
