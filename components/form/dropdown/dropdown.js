function setupDropdown(optionMenu, task) {
  const selectBtn = optionMenu.querySelector('.dropdown-btn')
  const options = optionMenu.querySelectorAll('.dropdown-option')
  const sBtnText = optionMenu.querySelector('.dBtn-text')

  selectBtn.addEventListener('click', () => {
    optionMenu.classList.toggle('active')
  })

  options.forEach((option) => {
    option.addEventListener('click', () => {
      const selectedOption = option.querySelector('.option-text').innerText
      sBtnText.innerText = selectedOption
      optionMenu.classList.remove('active')
      console.log(selectedOption);
      // Update task status and move to the corresponding column
      updateTaskStatus(task, selectedOption)

      // Close the modal
      closeModal('open-task-modal')
    })
  })

  // Add a click event listener to close the dropdown-menu when clicking outside
  document.addEventListener('click', function (event) {
    if (
      !selectBtn.contains(event.target) &&
      !optionMenu.contains(event.target)
    ) {
      optionMenu.classList.remove('active')
    }
  })
}
