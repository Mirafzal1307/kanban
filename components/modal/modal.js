const blocker = document.querySelector('.blocker')
const closeModalButtons = document.querySelectorAll('.close-modal')
const toggleModalButtons = document.querySelectorAll('.toggle-modal-button')
const modals = document.querySelectorAll('.modal')
const overlay = document.querySelector('.overlay')
const createNewBoard = document.querySelector('.createNewBoard')
const createNewTask = document.querySelector('.createNewTask')

const columnInputsWrapper = document.querySelector('.column-inputs-wrapper')
const taskInputsWrapper = document.querySelector('.task-inputs-wrapper')

const addNewColumnButton = document.querySelector('.addNewColumnButton')
const addNewTaskButton = document.querySelector('.addNewTaskButton')

let modalInputs = null
let dropdownOptions = null
let errorMessage = null
let selectedStatus = null
let modal = null

// Function to find the column containing a task
function findColumnContainingTask(task) {
  for (const board of currentData.boards) {
    for (const column of board.columns) {
      if (column.tasks.includes(task)) {
        return column
      }
    }
  }
  return null
}

// Function to find the board containing a task
function findBoardContainingTask(task) {
  for (const board of currentData.boards) {
    for (const column of board.columns) {
      if (column.tasks.includes(task)) {
        return board
      }
    }
  }
  return null
}

addNewColumnButton.addEventListener('click', (e) => {
  e.preventDefault()
  addNewToInputs(columnInputsWrapper) // Add an initial empty column input
})

addNewTaskButton.addEventListener('click', (e) => {
  e.preventDefault()
  addNewToInputs(taskInputsWrapper) // Add an initial empty task input
})

function deleteInput(button) {
  const inputWrapper = button.closest('.relative')
  const inputType = inputWrapper.classList.contains('column-input')
    ? 'column'
    : 'task'

  // Your logic for deleting the input based on the type (column or task)
  if (inputType === 'column') {
    // Delete column logic
    deleteColumn(inputWrapper)
  } else {
    // Delete task logic
    deleteTask(inputWrapper)
  }

  // Optionally, update the board when an input is deleted
  renderBoard(currentData.selectedBoard)
}

function deleteInput(inputElement) {
  const inputWrapper = inputElement.parentElement
  // Check if inputWrapper has children before accessing them
  if (inputWrapper.children.length > 1) {
    inputElement.remove()
    updateModalArrays(inputWrapper)
  } else {
    console.error('Cannot delete the last input element.')
  }
}

function addNewToInputs(inputWrapper) {
  if (inputWrapper) {
    const columnInputHtml = generateInput('')
    inputWrapper.insertAdjacentHTML('beforeend', columnInputHtml)

    // Find the last added input element
    const newInput = inputWrapper.lastElementChild

    // Attach event listener to the delete button
    const deleteButton = newInput.querySelector('.close-btn')
    deleteButton.addEventListener('click', () => {
      deleteInput(newInput)
    })

    updateModalArrays(inputWrapper)
    renderBoard(currentData.selectedBoard)
  } else {
    console.error('Input wrapper is null or undefined.')
  }
}

const addNewColumnEditButton = document.querySelector('.addNewColumnEditButton')

addNewColumnEditButton.addEventListener('click', (e) => {
  e.preventDefault()
  const columnInputsWrapper = document.querySelector(
    '.column-inputs-wrapper-edit',
  ) // Adjust the selector as needed
  addNewToInputs(columnInputsWrapper)
})

function updateModalArrays(inputWrapper) {
  // Clear modalInputs and errorMessage arrays
  modalInputs = []
  errorMessage = []

  // Find the error messages in the new input
  const errorMessages = inputWrapper.querySelectorAll('.input-span')

  // Collect values from all input elements
  const inputElements = inputWrapper.querySelectorAll('.modal-input')
  inputElements.forEach((input, index) => {
    modalInputs.push(input.value)
    errorMessage.push(errorMessages[index]) // Add corresponding error message element
  })
}

function generateInput(input) {
  return `
    <div class="relative flex gap-4 w-full">
      <input
        class="modal-input block bg-transparent w-full px-4 py-2 rounded text-color outline-none cursor-pointer font-medium text-[13px] leading-[23px] border border-input-color focus:border-primary-color active:transition duration-200 active:ease-in"
        type="text"
        placeholder="e.g. Take coffee break"
        value="${input}"
      />
      <button
        type="button"
        class="button icon-close border-transparent bg-transparent duration-200 hover:text-danger-color close-btn"
      >
      </button>
      <span
        class="input-span hidden absolute top-2 right-12 text-[#ea5555] font-medium leading-[23px] not-italic font-plus-jakarta-sans text-[13px]"
        >Can’t be empty</span
      >
    </div>
  `
}

const editBoardButton = document.querySelector('.editBoardButton')

editBoardButton.addEventListener('click', (e) => {
  e.preventDefault()

  // Update modalInputs with the latest values
  const inputWrappers = document.querySelectorAll('.column-inputs-wrapper-edit')
  modalInputs = []
  errorMessage = []
  let hasError = false

  // Validate each input wrapper
  inputWrappers.forEach((inputWrapper) => {
    const inputs = Array.from(inputWrapper.querySelectorAll('.modal-input'))
    const errors = Array.from(inputWrapper.querySelectorAll('.input-span'))

    // Validate boardName (assuming it is the first input element)
    const boardNameInput = inputs[0]

    const boardNameErrorMessage = errors[0]

    if (boardNameInput.value === '') {
      boardNameInput.classList.add('error')
      boardNameErrorMessage.classList.remove('hidden')
      hasError = true
    } else {
      boardNameInput.classList.remove('error')
      boardNameErrorMessage.classList.add('hidden')
    }

    // Validate column names
    for (let index = 1; index < inputs.length; index++) {
      const modalInput = inputs[index]
      const currentErrorMessage = errors[index]

      if (modalInput.value === '') {
        modalInput.classList.add('error')
        currentErrorMessage.classList.remove('hidden')
        hasError = true
      } else {
        modalInput.classList.remove('error')
        currentErrorMessage.classList.add('hidden')
      }
    }

    // Collect values from each input wrapper
    modalInputs.push({
      boardName: boardNameInput.value,
      columnNames: inputs.slice(1).map((input) => input.value),
    })
  })

  if (!hasError) {
    // Call the editBoard function with the board names and column names
    const selectedBoardId = currentData.selectedBoard
    modalInputs.forEach(({ boardName, columnNames }) => {
      editBoard(selectedBoardId, boardName, columnNames)
    })

    // Reset modalInputs and errorMessage
    modalInputs = errorMessage = null

    renderBoard(currentData.selectedBoard)
    // Close the modal
    closeModal('edit-board-modal')
  }
})

function editBoard(selectedBoardId, newBoardName, newColumnNames) {
  // Find the index of the selected board in the currentData array
  const boardIndex = currentData.boards.findIndex(
    (board) => board.id === selectedBoardId,
  )

  console.log(
    'selectedBoardId: ',
    selectedBoardId,
    'newBoardName: ',
    newBoardName,
    'newColumnNames: ',
    newColumnNames,
  )

  // Check if the board is found
  if (boardIndex !== -1) {
    // Update board name
    currentData.boards[boardIndex].name = newBoardName

    // Update existing columns
    const existingColumns = currentData.boards[boardIndex].columns
    existingColumns.forEach((column, index) => {
      if (index < newColumnNames.length) {
        column.name = newColumnNames[index]
      }
    })

    // Add new columns if any
    for (
      let index = existingColumns.length;
      index < newColumnNames.length;
      index++
    ) {
      const newColumn = { name: newColumnNames[index], tasks: [] }
      currentData.boards[boardIndex].columns.push(newColumn)
    }

    // Check for deleted columns
    if (existingColumns.length > newColumnNames.length) {
      const deletedColumns = existingColumns.slice(newColumnNames.length)
      deletedColumns.forEach((deletedColumn) => {
        // Your logic to handle deleted columns
        currentData.boards[boardIndex].columns = currentData.boards[
          boardIndex
        ].columns.filter((column) => column !== deletedColumn)

        console.log('Deleted Column:', deletedColumn)

        renderBoard(currentData.selectedBoard)
        // Here you might want to delete tasks associated with the deleted column, etc.
      })
    }
  } else {
    console.error('Board not found for editing.')
  }
}

// Function to fill the Edit Board modal with selected board data
function fillEditBoardModal() {
  const selectedBoard = currentData.boards.find(
    (board) => board.id === currentData.selectedBoard,
  )

  if (selectedBoard) {
    const boardNameInput = document.querySelector(
      '.column-inputs-wrapper-edit .modal-input',
    )
    const columnInputsWrapper = document.querySelector(
      '.column-inputs-wrapper-edit',
    )

    // Set board name input
    boardNameInput.value = selectedBoard.name

    // Remove existing columns
    const existingColumns = columnInputsWrapper.querySelectorAll('.relative')
    existingColumns.forEach((column) => column.remove())

    // Add existing columns
    selectedBoard.columns.forEach((column) => {
      addNewToInputs(columnInputsWrapper)
      const newInput = columnInputsWrapper.lastElementChild
      const inputs = newInput.querySelectorAll('.modal-input')
      inputs[0].value = column.name
    })
  } else {
    console.error('Selected board not found.')
  }
}

function openModal(modalId) {
  console.log(modalId)
  modal = document.getElementById(modalId)
  console.log(modal)
  // Check if modalInputs and errorMessage are already collected
  if (modalInputs || errorMessage) {
    modalInputs = Array.from(modal.querySelectorAll('.modal-input'))
    errorMessage = Array.from(modal.querySelectorAll('.input-span'))
  }

  // Extract unique status values from the selected board in the currentData object
  const statusValues = extractStatusValues(currentData, currentData.selectedBoard)

  // Populate dropdown options dynamically using the generateStatusToDropdown function
  dropdownOptions = generateDropdownOptions(statusValues)

  // Update the HTML content of the dropdown
  const dropdownElement = modal?.querySelector('.dropdown-options')

  if (dropdownElement) {
    dropdownElement.innerHTML = dropdownOptions.join('')
  }
  if (modalId === 'add-task-modal') {
    const optionMenu = document.querySelector('.dropdown-menu')
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
        statusColumn = selectedOption
        selectedStatus = selectedOption
        optionMenu.classList.remove('active')
      })
    })
    document.querySelectorAll('.dropdown-option').forEach((el) => {
      const dropdownOptionsElement = el.closest('.dropdown-options')
      const temp = el
      const index = Array.from(
        document.querySelectorAll('.dropdown-option'),
      ).indexOf(el)
      dropdownOptionsElement.firstChild = el
    })
  }
  modal.classList.remove('hidden')
  blocker.classList.add('active')
  overlay.classList.remove('hidden')
  overlay.classList.add('flex')
  modal.style.zIndex = '100'

  // Delay the call to renderBoard until after the modal is opened
  setTimeout(() => {
    renderBoard(currentData.selectedBoard)
  }, 0)

  if (modalId === 'edit-board-modal') {
    fillEditBoardModal()
  }
}

// Function to extract unique status values from the selected board columns in the currentData object
function extractStatusValues(currentData, selectedBoard) {
  const uniqueStatusValues = new Set()

  const board = currentData.boards.find((board) => board.id === selectedBoard)
  if (board) {
    board.columns.forEach((column) => {
      uniqueStatusValues.add(column.name) // Add column name to the set
    })
  }

  return Array.from(uniqueStatusValues)
}

// Function to generate dropdown options based on status values
function generateDropdownOptions(statusValues) {
  return statusValues.map(
    (status) => `
    <li
      class="dropdown-option cursor-pointer p-3 hover:bg-content-color duration-200"
    >
      <span
        class="option-text font-medium text-[13px] leading-[23px] text-[#828FA3]"
        >${status}</span
      >
    </li>
  `,
  )
}

function generateUniqueId() {
  // Generate a random number and convert it to a hexadecimal string
  const randomPart = Math.random().toString(16).substring(2)

  // Get the current timestamp and convert it to a hexadecimal string
  const timestampPart = new Date().getTime().toString(16)

  // Combine the random and timestamp parts to create a unique ID
  const uniqueId = `${timestampPart}-${randomPart}`

  return uniqueId
}

function addNewBoard(boardName, boardColumns) {
  // Create a new board object with dynamic columns
  const newBoard = {
    id: generateUniqueId(), // Make sure to implement this function
    name: boardName,
    columns: boardColumns.map((columnName) => ({
      name: columnName,
      tasks: [],
    })),
  }

  // Add the new board to your application or perform any necessary actions
  // For example, you might have an array of boards:
  currentData.boards.push(newBoard)

  // Update your UI or trigger any necessary updates
  closeModal('add-new-board')
  renderBoard(currentData.selectedBoard) // Call renderBoard after adding a new board
}
const cancelButton = document.querySelector('.cancel')

cancelButton.addEventListener('click', (e) => {
  e.preventDefault()
  closeModal('delete-board-modal')
})

const deleteBoardOpen = document.querySelector('.delete-board')
const deleteBoardButton = document.querySelector('.delete-button')

deleteBoardButton.addEventListener('click', (e) => {
  e.preventDefault()
  deleteBoard(currentData.selectedBoard)
  closeModal('delete-board-modal')
})

// Assume you have a function to delete a board by ID
function deleteBoard(boardId) {
  // Implement your logic to delete the board by ID
  // For example:
  const indexToDelete = currentData.boards.findIndex(
    (board) => board.id === boardId,
  )
  if (indexToDelete !== -1) {
    currentData.boards.splice(indexToDelete, 1)
    // You might also want to handle other related data structures or UI updates here
  }

  // Update your UI or trigger any necessary updates
  renderBoard(currentData.selectedBoard) // Call renderBoard after deleting a board
}

// Example usage when deleting a board (replace 'boardIdToDelete' with the actual ID):
// deleteBoard('boardIdToDelete');

createNewBoard.addEventListener('click', (e) => {
  e.preventDefault()

  // Update modalInputs with the latest values
  modalInputs = Array.from(columnInputsWrapper.querySelectorAll('.modal-input'))
  errorMessage = Array.from(columnInputsWrapper.querySelectorAll('.input-span'))
  let hasError = false // Flag to track if there is any error

  // Validate boardName (assuming it is the first input element)
  const boardNameInput = modalInputs[0]
  const boardNameErrorMessage = errorMessage[0]

  if (boardNameInput.value === '') {
    boardNameInput.classList.add('error')
    boardNameErrorMessage.classList.remove('hidden')
    hasError = true // Set the flag to true if there is an error
  } else {
    boardNameInput.classList.remove('error')
    boardNameErrorMessage.classList.add('hidden')
  }

  // Validate column names
  for (let index = 1; index < modalInputs.length; index++) {
    const modalInput = modalInputs[index]
    const currentErrorMessage = errorMessage[index]

    if (modalInput.value === '') {
      modalInput.classList.add('error')
      currentErrorMessage.classList.remove('hidden')
      hasError = true // Set the flag to true if there is an error
    } else {
      modalInput.classList.remove('error')
      currentErrorMessage.classList.add('hidden')
    }
  }

  if (!hasError) {
    // Call the addNewBoard function with the board name and column names
    addNewBoard(
      boardNameInput.value,
      modalInputs.slice(1).map((input) => input.value),
    )

    // Reset modalInputs and errorMessage
    modalInputs = errorMessage = null

    renderBoard(currentData.selectedBoard)
    // Close the modal
    closeModal('add-board-modal')
  }
})

// closeModal function to close modals
const closeModal = (modalId) => {
  modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add('hidden')
    blocker.classList.remove('active')
    overlay.classList.add('hidden')
    modal.style.zIndex = '0'
    overlay.classList.remove('flex')
  }

  // Reset modalInputs and errorMessage
  modalInputs = null
  errorMessage = null
  if (modalId === 'add-task-modal') {
    const optionMenu = document.querySelector('.dropdown-menu')
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
        statusColumn = selectedOption
        selectedStatus = selectedOption
        optionMenu.classList.remove('active')
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

  modal = null
}

toggleModalButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const modalId = button.getAttribute('modal-id')
    openModal(modalId)
  })
})

closeModalButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const modalId = button.parentElement.parentElement.id
    closeModal(modalId)

    modal = null
    modalInputs = null
    errorMessage = null
    selectedStatus = null
  })
})

blocker.addEventListener('click', () => {
  modals.forEach((modal) => {
    modal.classList.add('hidden')
  })
  blocker.classList.add('hidden')
  overlay.classList.add('hidden')
  overlay.classList.remove('flex')
  modal = null
  modalInputs = null
  errorMessage = null
  selectedStatus = null
})
const sidebar = document.querySelector('.sidebar')

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modals.forEach((modal) => {
      modal.classList.add('hidden')
      modal.style.zIndex = '0'
    })
    sidebar.classList.remove('active')
    blocker.classList.remove('active')
    overlay.classList.add('hidden')
    overlay.classList.remove('flex')
  }
})

let hasError = false

createNewTask.addEventListener('click', (e) => {
  e.preventDefault()

  const modalInputs = Array.from(
    taskInputsWrapper.querySelectorAll('.modal-input'),
  )
  const errorMessage = Array.from(
    taskInputsWrapper.querySelectorAll('.input-span'),
  )

  let hasError = false

  // Validate task name input
  const taskNameInput = modalInputs[0]
  const taskNameErrorMessage = errorMessage[0]

  if (taskNameInput.value === '') {
    taskNameInput.classList.add('error')
    taskNameErrorMessage.classList.remove('hidden')
    hasError = true
  } else {
    taskNameInput.classList.remove('error')
    taskNameErrorMessage.classList.add('hidden')
  }

  // Validate other inputs if needed
  for (let index = 1; index < modalInputs.length; index++) {
    const modalInput = modalInputs[index]
    const currentErrorMessage = errorMessage[index]

    if (modalInput.value === '') {
      modalInput.classList.add('error')
      currentErrorMessage?.classList.remove('hidden')
      hasError = true // Set the flag to true if there is an error
    } else {
      modalInput.classList.remove('error')
      currentErrorMessage?.classList.add('hidden')
    }
  }

  // Capture the selected status from dropdown options with class '.dBtn-text'
  const boardIndex = currentData.boards.findIndex(
    (board) => board.id === currentData.selectedBoard,
  )

  const dropdownOptions = currentData.boards[boardIndex].columns.map(
    (column) => column.name,
  )

  if (!hasError) {
    // Use the selected status from the dropdown
    const selectedStatusText = selectedStatus
      ? selectedStatus
      : dropdownOptions[0]

    // Call your addNewTask function with the collected data
    addNewTask(
      taskNameInput.value,
      modalInputs[1].value, // Assuming the second input is the task description
      modalInputs.slice(2).map((input) => input.value), // Assuming the rest are subtasks
      selectedStatusText,
    )

    // Clear modalInputs and errorMessage arrays
    modalInputs.forEach((input) => (input.value = ''))
    errorMessage.forEach((errorSpan) => errorSpan.classList.add('hidden'))

    closeModal('add-task-modal')
  }
})

function addNewTask(taskName, taskDescription, taskSubtasks, status) {
  const newTask = {
    id: generateUniqueId(),
    title: taskName,
    description: taskDescription,
    status: status,
    subtasks: taskSubtasks.map((subtask) => ({
      title: subtask,
      isCompleted: false,
    })),
  }
  const board = currentData.boards.find(
    (board) => board.id === currentData.selectedBoard,
  )

  board.columns.forEach((column) => {
    if (column.name === status) {
      column.tasks.push(newTask)
    }
  })

  renderBoard(currentData.selectedBoard)
}
