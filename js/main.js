const currentBoard = document.querySelector('.currentBoard')
const boardList = document.querySelector('.board-list')
const playGround = document.querySelector('#playGround')

const getDataFromJsonFile = async () => {
  try {
    const response = await fetch('../../js/data.json')
    const data = await response.json()
    setDataToStorage(data)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

getDataFromJsonFile()

function setDataToStorage(data) {
  try {
    const jsonData = JSON.stringify(data)
    localStorage.setItem('data', jsonData)
    console.log('Data successfully set to localStorage.')
  } catch (error) {
    console.log('Error:', error)
  }
}

let reloadFlag = Boolean

function getDataFromStorage() {
  try {
    const jsonData = localStorage.getItem('data')
    !jsonData ? (reloadFlag = true) : false
    return jsonData ? JSON.parse(jsonData) : null
  } catch (error) {
    console.log('Error:', error)
    return null
  }
}

function reloadOnce() {
  if (reloadFlag) {
    window.location.reload()
    reloadFlag = false
  }
}

const currentData = getDataFromStorage()

function getBoardName(boardId) {
  const selectedBoard = currentData.boards.find((board) => board.id === boardId)

  currentBoard.textContent = selectedBoard?.name
}

function renderBoard(boardId) {
  const numberOfCreatedBoards = document.querySelector('.numberOfCreatedBoards')
  numberOfCreatedBoards.textContent = `All boards (${currentData.boards.length})`

  getBoardName(boardId)

  if (currentData.boards.length === 0) {
    boardId = currentData.boards[0].id
  }
  // Find the board by ID
  const board = currentData.boards.find((board) => board.id === boardId)
  currentData.selectedBoard = boardId
  const isBoardRendered = document.getElementById(board?.id)

  // Update the board list (assuming boardList is a valid reference)
  boardList.innerHTML = generateBoardNames(currentData)

  // Render the selected board only if it's not already rendered
  if (!isBoardRendered) {
    // Assuming playGround is a valid reference
    playGround.innerHTML = generateBoard(board)
    playGround.appendChild(createNewColumnElementBtn())

    // Update the selected board in currentData
    currentData.selectedBoard = board.id
    currentData.selectedColumn = board.columns[0]
    // Highlight the active link in the board list

    const newColumnButtons = document.querySelectorAll('.new-column')

    if (newColumnButtons.length > 0) {
      newColumnButtons.forEach((newColumnButton) => {
        newColumnButton.addEventListener('click', (e) => {
          e.preventDefault()
          openModal('edit-board-modal')
        })
      })
    } else {
      console.error('No elements found with class ".new-column"')
    }

    const boardLinks = document.querySelectorAll('.board__link')

    boardLinks.forEach((link) => {
      link.classList.remove('active')
      if (link.getAttribute('data-board-id') === board.id) {
        link.classList.add('active')
      }
    })
  }
  cardJS()
}

function renderStatus(status) {
  console.log(status)
  return `
    <li class="dropdown-option cursor-pointer p-3 hover:bg-content-color duration-200">
      <span class="option-text font-medium text-[13px] leading-[23px] text-[#828FA3]">
        ${status}
      </span>
    </li>
    `
}
function generateRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function renderTaskCard(task) {
  return `
      <div
        id="${task.id}"
        modal-id="${task.id}"
        status="${task.status}"
        class="card select-none toggle-modal-button bg-content-color w-280 h-fit py-6 px-4 rounded-lg font-bold shadow-sh-color shadow-sm hover:cursor-pointer hover:text-primary-color subpixel-antialiased"
        onclick="openTaskModal('${task.id}')"
      >
      <span class="hidden task-description">${task.description}</span>
      <span class="hidden subtasks-json">${JSON.stringify(task.subtasks)}</span>
        <p class="card__title text-color capitalize">${task.title}</p>
        <p class="card__status text-slate-500">${
          task.subtasks.filter((subtask) => subtask.isCompleted).length
        } of ${task.subtasks.length} substasks</p>
      </div>
    `
}

function openTaskModal(taskId) {
  const task = findTaskById(taskId)
  let selectedBoard = currentData.selectedBoard
  const statusValues = extractStatusValues(currentData, selectedBoard)
  const dropdownOptions = statusValues.map(renderStatus).join('')
  const dropdownElement = document?.querySelector('.dropdown-options')

  if (dropdownElement) {
    dropdownElement.innerHTML = dropdownOptions
  }

  if (task) {
    const modalHtml = tasksModal(task, dropdownElement, statusValues)
    openModal('open-task-modal', currentData.selectedBoard)
    const taskModal = document.getElementById('open-task-modal')
    taskModal.innerHTML = modalHtml
    setupDropdown(taskModal.querySelector('.dropdown-menu'), task)
  }
}

function deleteTask(taskId) {
  // Find the board and column that contain the task
  for (const board of currentData.boards) {
    for (const column of board.columns) {
      const taskIndex = column.tasks.findIndex((task) => task.id === taskId)
      if (taskIndex !== -1) {
        // Remove the task from the column
        column.tasks.splice(taskIndex, 1)

        // If the column becomes empty, remove the column
        if (column.tasks.length === 0) {
          const columnIndex = board.columns.indexOf(column)
          board.columns.splice(columnIndex, 1)
        }

        // If the board becomes empty, remove the board
        if (board.columns.length === 0) {
          const boardIndex = currentData.boards.indexOf(board)
          currentData.boards.splice(boardIndex, 1)
        }
        closeModal('open-task-modal')

        // Assuming you have a function to update the UI after deletion
        renderBoard(renderBoard.selectedBoard)

        // Exit the function once the task is deleted
        return
      }
    }
  }

  // Log a message if the task is not found (for debugging purposes)
  console.warn(`Task with ID ${taskId} not found.`)
}

function editModal(task) {
  const titleInput = document.getElementById('edit-task-title')
  const descriptionInput = document.getElementById('edit-task-description')
  titleInput.value = task.title
  descriptionInput.value = task.description
}

function editTask(taskId) {
  const task = findTaskById(taskId)
  editModal(task)
  closeModal('open-task-modal')
  openModal('edit-task-modal')
  const saveChangesButton = document.getElementById('save-changes-button')
  saveChangesButton.addEventListener('click', () => {
    saveChanges(task)
  })
}

function saveChanges(task) {
  const titleInput = document.getElementById('edit-task-title')
  const descriptionInput = document.getElementById('edit-task-description')

  task.title = titleInput.value
  task.description = descriptionInput.value
  renderBoard(currentData.selectedBoard)
  closeModal('edit-task-modal')
}

function tasksModal(task, dropdownElement, statusValues) {
  const taskName = task.title
  const taskDescription = task.description
    ? task?.description
    : 'No description available'
  const subtasksCount = task.subtasks.length
  const completedSubtasksCount = task.subtasks.filter(
    (subtask) => subtask.isCompleted,
  ).length

  const subtasksWithIds = task.subtasks.map((subtask) => {
    subtask.id = generateUniqueIdByTitle(subtask.title) // Update subtask ID in currentData
    return subtask
  })

  // Update currentData with modified subtasks
  const board = currentData.boards.find((board) =>
    board.columns
      .flatMap((column) => column.tasks)
      .flatMap((t) => t.subtasks)
      .some((s) => s.id === task.subtasks[0].id),
  )

  if (board) {
    const column = board.columns.find((column) =>
      column.tasks.some((t) => t.subtasks[0].id === task.subtasks[0].id),
    )

    if (column) {
      const taskToUpdate = column.tasks.find(
        (t) => t.subtasks[0].id === task.subtasks[0].id,
      )

      if (taskToUpdate) {
        taskToUpdate.subtasks = subtasksWithIds
      }
    }
  }

  const subtasksHtml = subtasksWithIds
    .map((subtask) => renderSubtask(subtask))
    .join('')

  const modalHtml = `
    <div class="h-full">
      <div class="flex items-center gap-4 justify-between mb-6">
        <button class="edit-task rounded-full w-full text-center py-4 font-bold cursor-pointer transition duration-200 ease-in-out text-[13px] leading-6 outline-none text-primary-color dark:bg-white bg-[#635fc71a] hover:bg-[#635FC740]" onclick="editTask('${
          task.id
        }')">Edit Task</button>
        <button class="delete-task font-bold text-white bg-danger-color hover:opacity-80 duration-100 rounded-full w-full p-4" onclick="deleteTask('${
          task.id
        }')">Delete Task</button>
      </div>
  
      <div>
        <h3 class="text-color text-[18px] font-bold">${taskName}</h3>
      </div>
      <div class="mt-6 text-[#828FA3] font-bold tracking-wide text-[13px]">${taskDescription}</div>
      <div class="relative form-label flex flex-col gap-2 text-gray-color font-plus-jakarta-sans font-bold text-[12px] leading-5">
        <h3>Subtasks (${completedSubtasksCount} of ${subtasksCount})</h3>
        <div class="subtasks mt-6 flex flex-col bg-page-color">
          ${subtasksHtml}
        </div>
  
        <div class="dropdown">
          <div class="dropdown-menu relative w-full">
            <div class="dropdown-btn status min-w-full w-full justify-between flex items-center px-4 py-2 rounded border focus:outline-none active:border-[#635FC7] group">
              <span class="dBtn-text m-0 text-gray-color cursor-pointer transition duration-400 ease-in-out text-[13px] leading-6">${
                task.status
              }</span>
              <span class="dropdown-sign">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M0.79834 1.54858L5.49682 6.24707L10.1953 1.54858" stroke="#635FC7" stroke-width="2"/>
                </svg>
              </span>
            </div>
            ${dropdownElement ? dropdownElement.outerHTML : ''}
          </div>
        </div>
      </div>
    </div>
  `
  // Get the dropdown options
  const dropdownOptions = statusValues.map(renderStatus).join('')

  // Set up the dropdown for the task modal
  const dropdownMenu = dropdownElement.querySelector('.dropdown-menu')
  if (dropdownMenu) {
    dropdownMenu.innerHTML = dropdownOptions
    setupDropdown(dropdownMenu, task)
  }

  return modalHtml
}

function updateTaskStatus(task, newStatus) {
  // Update the task status in currentData
  const board = currentData.boards.find((board) =>
    board.columns
      .flatMap((column) => column.tasks)
      .some((t) => t.subtasks[0].id === task.subtasks[0].id),
  )

  if (board) {
    const column = board.columns.find((column) =>
      column.tasks.some((t) => t.subtasks[0].id === task.subtasks[0].id),
    )

    if (column) {
      const taskToUpdate = column.tasks.find(
        (t) => t.subtasks[0].id === task.subtasks[0].id,
      )

      if (taskToUpdate) {
        console.log(
          `Updating task status from ${taskToUpdate.status} to ${newStatus}`,
        )
        taskToUpdate.status = newStatus
      }
    }
  }
}

function toggleSubtaskCompleted(subtaskId) {
  const subtask = findSubtaskById(subtaskId)
  if (subtask) {
    subtask.isCompleted = !subtask.isCompleted

    const taskContainingSubtask = findTaskContainingSubtask(subtask)

    if (taskContainingSubtask) {
      // Find the column containing the task in the data structure
      const columnContainingTask = findColumnContainingTask(
        taskContainingSubtask,
      )

      if (columnContainingTask) {
        // Find the board containing the column in the data structure
        const boardContainingColumn =
          findBoardContainingColumn(columnContainingTask)

        if (boardContainingColumn) {
          const boardIndex = currentData.boards.findIndex(
            (board) => board === boardContainingColumn,
          )
          const columnIndex = boardContainingColumn.columns.findIndex(
            (column) => column === columnContainingTask,
          )
          const taskIndex = columnContainingTask.tasks.findIndex(
            (task) => task === taskContainingSubtask,
          )
          currentData.boards[boardIndex].columns[columnIndex].tasks[taskIndex] =
            taskContainingSubtask
          updateSubtaskUI(subtask)
        }
      }
    }
  }
  updateSubtaskUI(subtask)
  renderBoard(currentData.selectedBoard)
}

// Function to find the task containing a subtask
function findTaskContainingSubtask(subtask) {
  for (const board of currentData.boards) {
    for (const column of board.columns) {
      for (const task of column.tasks) {
        if (task.subtasks.includes(subtask)) {
          return task
        }
      }
    }
  }
  return null
}

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

// Function to find the board containing a column
function findBoardContainingColumn(column) {
  for (const board of currentData.boards) {
    if (board.columns.includes(column)) {
      return board
    }
  }
  return null
}

function updateSubtaskUI(subtask) {
  const checkbox = document.getElementById(subtask.id)
  if (checkbox) {
    checkbox.checked = subtask.isCompleted
  }
}

function findSubtaskById(subtaskId) {
  return currentData.boards
    .flatMap((board) => board.columns)
    .flatMap((column) => column.tasks)
    .flatMap((task) => task.subtasks)
    .find((subtask) => subtask.id === subtaskId)
}

function findTaskById(taskId) {
  for (const board of currentData.boards) {
    for (const column of board.columns) {
      const task = column.tasks.find((task) => task.id === taskId)
      if (task) {
        return task
      }
    }
  }
  return null // Task not found
}

function generateUniqueIdByTitle(title) {
  const hash = title
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  return `subtask-${hash}`
}

function renderSubtask(subtask) {
  // Generate HTML for each subtask
  return `
      <div class="chechbox-content flex items-center text-color p-3 gap-4 cursor-pointer relative hover:bg-[635fc740] hover:transition duration-200 active:ease-in" onclick="toggleSubtaskCompleted('${
        subtask.id
      }')">
        <i class="icon-tick checkbox-icon absolute top-4 text-white left-4 scale-1 duration-150"></i>
        <input
          type="checkbox"
          id="${subtask.id}"
          class="checkbox-input relative h-4 w-4 bg-white bg-text-color rounded-[2px] appearance-none border-[1px] border-solid border-[rgba(130, 143, 163, 0.25)] cursor-pointer checked:bg-primary-color rounded-[2px]"
          ${subtask.isCompleted ? 'checked' : ''}
        />
        <label
          for="${subtask.id}"
          class="text-color pointer-events-none cursor-pointer w-full font-bold text-[12px] leading-normal"
        >${subtask.title}</label>
      </div>
    `
}

// xotlik bor bu data localstoragega saalangandan keyin render qilishi kerak qaytadan
function renderColumn(column) {
  const tasksHtml = column.tasks.map((task) => renderTaskCard(task)).join('')
  return `
      <div class="column w-[280px] relative h-full text-color flex flex-col items-start gap-5">
        <h3 class="column__header text-[#828fa3] flex items-center gap-3">
          <span class="w-4 h-4 bg-[${generateRandomColor()}] rounded-full"></span>
          <span class="tracking-widest text-sm font-bold column-name">${
            column.name
          } (${column.tasks.length})</span>
        </h3>
          ${tasksHtml}
      </div>
    `
}

// xotlik bor bu data localstoragega saalangandan keyin render qilishi kerak qaytadan
function renderBoardsName(board) {
  console.log( board );
  return `
      <li>
        <button 
          data-board-id="${board.id}"
          class="btn board__link w-full flex items-center gap-4 text-[#828fa3] rounded-r-full text-left font-plus-jakarta-sans font-bold cursor-pointer transition duration-200 ease-in-out text-[15px] focus:outline-none hover:bg-btn-hover-color hover:text-primary-color md:mr-6 p-[10px] md:py-4 px-6"
          role="button"
        >
          <i class="icon-layout"></i>
          <span>${board.name}</span>
        </button>
      </li>
    `
}

// think about it )!
function generateBoardNames(currentData) {
  return currentData.boards.map((board) => renderBoardsName(board)).join('')
}

function addBoard() {
  
}
 
// console.log(generateBoardNames(currentData));

function generateBoard(board) {
  if (!board || !board.columns) {
    console.error('Invalid board data:', board)
    return '' // Return an empty string or handle the error appropriately
  }
  playGround.setAttribute('board-id', `${board.id}`)
  return board.columns.map((column) => renderColumn(column)).join('')
}

boardList.addEventListener('click', (event) => {
  event.preventDefault()
  const targetLink = event.target.closest('.board__link')
  if (targetLink) {
    const boardId = targetLink.getAttribute('data-board-id')
    renderBoard(boardId)
  }
})

boardList.innerHTML = generateBoardNames(currentData)

if (currentData && currentData.boards.length > 0) {
  const initialBoardId = currentData.boards[0].id
  renderBoard(initialBoardId)
}

function createNewColumnElementBtn() {
  const divElement = document.createElement('button')
  divElement.setAttribute(
    'class',
    'toggle-modal-button w-280 new-column h-fit mt-10 flex rounded-md bg-gradient-primary cursor-pointer items-center content-center overflow-visible mb-48 bg-gradient-to-br from-[#995eb40a] to-[#723b8883]',
  )
  divElement.setAttribute('id', 'newColumn')
  divElement.setAttribute('modal-id', 'edit-board-modal')
  const spanElement = document.createElement('span')
  spanElement.setAttribute(
    'class',
    'text-color text-center text-slate-500 capitalize text-2xl',
  )

  spanElement.innerHTML =
    '<span class="text-3xl text-center">+</span> New Column'
  divElement.appendChild(spanElement)

  return divElement
}

// think about it )!
function generateColumnDataFromDOM() {
  const columns = []
  const columnContainer = document.querySelector('#playGround')

  columnContainer
    .querySelectorAll('.column')
    .forEach((columnElement, columnIndex) => {
      const column = {
        name: columnElement.querySelector('.column-name').textContent,
        tasks: [],
      }

      columnElement
        .querySelectorAll('.card')
        .forEach((taskElement, taskIndex) => {
          const task = {
            id: taskElement.getAttribute('id'),
            title: taskElement.querySelector('.card__title').textContent,
            description:
              taskElement.querySelector('.task-description').textContent,
            status: taskElement.getAttribute('status'), // Use the column name as the initial task status
            subtasks: JSON.parse(
              taskElement.querySelector('.subtasks-json').textContent,
            ),
          }
          column.tasks.push(task)
        })

      columns.push(column)
    })

  return columns
}

function renderColumnsByActiveBoard(
  currentData,
  boardId,
  newColumns,
) {
  const foundBoard = currentData.boards.find((board) => board.id === boardId)

  if (foundBoard) {
    const selectedBoardIndex = currentData.boards.indexOf(foundBoard)
    currentData.boards[selectedBoardIndex].columns = newColumns
  } else {
    console.error('Board not found.')
  }
}

function saveDOM() {
  const currentBoard = document
    .querySelector('#playGround')
    .getAttribute('board-id')
    renderColumnsByActiveBoard(
    currentData,
    currentBoard,
    generateColumnDataFromDOM(),
  )

  setDataToStorage(currentData)
}
saveDOM()