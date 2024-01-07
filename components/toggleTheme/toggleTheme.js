const THEME_TOGGLER_BUTTON = '.theme-toggler'

const localSTheme = localStorage.getItem('theme')
let themeToSet = localSTheme

if (!localSTheme) {
  themeToSet = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

document.documentElement.setAttribute('data-theme', themeToSet)

function init() {
  const elThemeTogglerButton = document.querySelector(THEME_TOGGLER_BUTTON)

  function switchTheme() {
    const elRoot = document.documentElement
    let dataTheme = elRoot.getAttribute('data-theme')

    let newTheme = dataTheme === 'light' ? 'dark' : 'light'

    elRoot.setAttribute('data-theme', newTheme)

    localStorage.setItem('theme', newTheme)
  }

  if (elThemeTogglerButton) {
    elThemeTogglerButton.addEventListener('click', switchTheme)
  }
}

document.addEventListener('DOMContentLoaded', init)
