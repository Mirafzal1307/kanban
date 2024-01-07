'use strict'

document.addEventListener('DOMContentLoaded', function () {
  const sidebarRevealer = document.querySelector('.sidebar-revealer')
  const hideSidebar = document.querySelector('.sidebar-hider')
  const sidebar = document.querySelector('.sidebar')
  const sidebarOpenerIcon = document.querySelector('.sidebarOpenerIcon')
  const blocker = document.querySelector('.blocker')

  //  Available boards
  const createdBoards = ['platform']

  // Show number of created boards

  // =============//

  // change theme manually via theme-toggler
  document
    .querySelector('.theme-toggler')
    .addEventListener('click', function () {
      const whiteSquare = document.querySelector('.theme-toggler .bg-white')
      whiteSquare.classList.toggle('translate-x-4')
    })

  //===========//

  // WHEN hideSidebar icon ,in the sidebar, is clicked,
  // sidebar disappears and sidebar-revealer eye-icon appears
  hideSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('disAppearNow')
    sidebarRevealer.classList.toggle('appear')
  })

  // WHEN sidebar-revealer eye-icon is clicked,
  //   sidebar-revealer icon disappears and sidebar appears
  sidebarRevealer.addEventListener('click', () => {
    sidebarRevealer.classList.remove('appear')
    sidebar.classList.remove('disAppearNow')
  })

  // =====// Mobile Device

  // WHEN the icon in the header, sidebarOpenerIcon, is clicked
  // sidebar appears in mobile devices and blocker gets activated
  sidebarOpenerIcon.addEventListener('click', function () {
    sidebarOpenerIcon.classList.toggle('rotated')
    blocker.classList.toggle('active')
    sidebar.classList.toggle('active')
    hideSidebar.classList.toggle('hidden')
  })

  window.addEventListener('resize', function () {
    // If the window width is greater than or equal to 768px, hide the sidebar
    if (window.innerWidth >= 768) {
      sidebar.classList.toggle('hidden')
      blocker.classList.remove('active')
      sidebar.classList.remove('active')
      hideSidebar.classList.remove('hidden')
    }
  })

  // When blocker is clicked sidebar and blocker disappear
  blocker.addEventListener('click', () => {
    document.body.classList.remove('block')
    sidebarOpenerIcon.classList.remove('rotated')
    blocker.classList.remove('active')
    sidebar.classList.remove('active')
    hideSidebar.classList.remove('hidden')
  })
})
