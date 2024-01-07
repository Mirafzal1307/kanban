const getDataFromJsonFile = async () => {
    try {
      const response = await fetch('../../js/data.json')
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  
  getDataFromJsonFile()
  
  const currentBoard = document.querySelector('.currentBoard')
  
  function getBoardName(boardId) {
    const selectedBoard = boardData.boards.find((board) => board.id === boardId)
  
    currentBoard.textContent = selectedBoard?.name
  }
  
  const boardData = fetchData()
  
  const playGround = document.querySelector('#playGround')
  
  const boardList = document.querySelector('.board-list')
  
  function renderBoard(boardId) {
    const numberOfCreatedBoards = document.querySelector('.numberOfCreatedBoards')
    numberOfCreatedBoards.textContent = `All boards (${boardData.boards.length})`
  
    // Check if boardData.boards is an array
    getBoardName(boardId)
  
    if (!Array.isArray(boardData.boards)) {
      console.error('Invalid boardData.boards:', boardData.boards)
      return
    }
  
    // If no boardId is provided, default to the first board in the array
    if (!boardId && boardData.boards.length > 0) {
      boardId = boardData.boards[0].id
    }
    // Find the board by ID
    const board = boardData.boards.find((board) => board.id === boardId)
  
    boardData.selectedBoard = boardId
  
    // Check if the board is found
    if (!board) {
      console.error(`Board with id ${boardId} not found.`)
      return
    }
  
    // Check if board.id is defined and not null
    if (board.id === undefined || board.id === null) {
      console.error('Invalid board ID:', board.id)
      return
    }
  
    const isBoardRendered = document.getElementById(board.id) !== null
  
    // Update the board list (assuming boardList is a valid reference)
    boardList.innerHTML = generateKanbanBoardNames(boardData)
  
    // Render the selected board only if it's not already rendered
    if (!isBoardRendered) {
      // Assuming playGround is a valid reference
      playGround.innerHTML = generateKanbanBoard(board)
  
      playGround.appendChild(createNewColumnElement())
  
      // Update the selected board in boardData
      boardData.selectedBoard = board.id
      boardData.selectedColumn = board.columns[0]
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
  
  function generateUniqueId() {
    return Date.now().toString(36)
  }
  
  function generateStatusToDropdown(status) {
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
  
  function generateTaskCard(task) {
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
          task.subtasks.filter((subtask) => !subtask.isCompleted).length
        } of ${task.subtasks.length} substasks</p>
      </div>
    `
  }
  
  function openTaskModal(taskId) {
    // Find the task with the given ID from boardData
    const task = findTaskById(taskId)
    let selectedBoard = boardData.selectedBoard
  
    const statusValues = extractStatusValues(boardData, selectedBoard)
    const dropdownOptions = statusValues.map(generateStatusToDropdown).join('')
  
    // Update the HTML content of the dropdown
    const dropdownElement = document?.querySelector('.dropdown-options')
  
    if (dropdownElement) {
      dropdownElement.innerHTML = dropdownOptions
    }
  
    // Ensure sBtnText is properly defined here (modify as needed)
    // const sBtnText = document.querySelector('.dBtn-text')
  
    // Open the modal with the task data
    if (task) {
      // Generate the modal HTML
      const modalHtml = generateTaskModal(task, dropdownElement, statusValues)
  
      // Open the modal with the generated HTML
      openModal('open-task-modal', boardData.selectedBoard)
  
      // Update the HTML content of the task modal
      const taskModal = document.getElementById('open-task-modal')
      taskModal.innerHTML = modalHtml
  
      // Set up the dropdown for the task modal
      setupDropdown(taskModal.querySelector('.dropdown-menu'), task)
    }
  }
  
  function deleteTask(taskId) {
    // Find the board and column that contain the task
    for (const board of boardData.boards) {
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
            const boardIndex = boardData.boards.indexOf(board)
            boardData.boards.splice(boardIndex, 1)
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
  
  function populateEditModal(task) {
    // This is a generic example, you should replace it with your actual logic
    const titleInput = document.getElementById('edit-task-title')
    const descriptionInput = document.getElementById('edit-task-description')
  
    // Populate the modal inputs with task details
    titleInput.value = task.title
    descriptionInput.value = task.description
    // ... (populate other fields as needed)
  }
  
  function editTask(taskId) {
    // Find the task by ID
    const task = findTaskById(taskId)
  
    // Populate the edit modal with task details
    populateEditModal(task)
    closeModal('open-task-modal')
    // Open the edit modal
    openModal('edit-task-modal')
  
    // Handle the "Save Changes" button click
    const saveChangesButton = document.getElementById('save-changes-button')
    saveChangesButton.addEventListener('click', () => {
      saveChanges(task)
    })
  }
  
  function saveChanges(task) {
    // Get the updated values from the modal inputs
    const titleInput = document.getElementById('edit-task-title')
    const descriptionInput = document.getElementById('edit-task-description')
  
    // Update the task in the data structure
    task.title = titleInput.value
    task.description = descriptionInput.value
  
    renderBoard(boardData.selectedBoard)
    // Close the edit modal
    closeModal('edit-task-modal')
  }
  
  function generateTaskModal(task, dropdownElement, statusValues) {
    // Extract task details
    const taskName = task.title
    const taskDescription = task.description || 'No description available'
    const subtasksCount = task.subtasks.length
    const completedSubtasksCount = task.subtasks.filter(
      (subtask) => subtask.isCompleted,
    ).length
  
    // Generate unique IDs for subtasks and update boardData
    const subtasksWithIds = task.subtasks.map((subtask) => {
      subtask.id = generateUniqueIdFromTitle(subtask.title) // Update subtask ID in boardData
      return subtask
    })
  
    // Update boardData with modified subtasks
    const board = boardData.boards.find((board) =>
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
  
    // Generate subtasks HTML
    const subtasksHtml = subtasksWithIds
      .map((subtask) => generateSubtaskItem(subtask))
      .join('')
  
    // Modal HTML
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
    const dropdownOptions = statusValues.map(generateStatusToDropdown).join('')
  
    // Set up the dropdown for the task modal
    const dropdownMenu = dropdownElement.querySelector('.dropdown-menu')
    if (dropdownMenu) {
      dropdownMenu.innerHTML = dropdownOptions
      setupDropdown(dropdownMenu, task)
    }
  
    return modalHtml
  }
  
  function updateTaskStatus(task, newStatus) {
    // Update the task status in boardData
    const board = boardData.boards.find((board) =>
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
  
    // Log the current state of the boardData for debugging
    console.log('Updated boardData:', boardData)
  
    // Render the updated board
  }
  
  function toggleSubtaskCompleted(subtaskId) {
    // Find the corresponding subtask in the data structure
    const subtask = findSubtaskById(subtaskId)
  
    // Toggle the isCompleted property
    if (subtask) {
      subtask.isCompleted = !subtask.isCompleted
  
      // Find the task containing the subtask in the data structure
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
            // Update the boardData with the modified structure
            const boardIndex = boardData.boards.findIndex(
              (board) => board === boardContainingColumn,
            )
            const columnIndex = boardContainingColumn.columns.findIndex(
              (column) => column === columnContainingTask,
            )
            const taskIndex = columnContainingTask.tasks.findIndex(
              (task) => task === taskContainingSubtask,
            )
  
            boardData.boards[boardIndex].columns[columnIndex].tasks[taskIndex] =
              taskContainingSubtask
  
            // Update the UI
            updateSubtaskUI(subtask)
          }
        }
      }
    }
  
    // Update the UI to reflect the new state
    updateSubtaskUI(subtask)
  
    // Render the board to reflect the changes
    renderBoard(boardData.selectedBoard)
  }
  
  // Function to find the task containing a subtask
  function findTaskContainingSubtask(subtask) {
    for (const board of boardData.boards) {
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
    for (const board of boardData.boards) {
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
    for (const board of boardData.boards) {
      if (board.columns.includes(column)) {
        return board
      }
    }
    return null
  }
  
  // Update the updateSubtaskUI function
  function updateSubtaskUI(subtask) {
    const checkbox = document.getElementById(subtask.id)
    // Update the checkbox state
    if (checkbox) {
      checkbox.checked = subtask.isCompleted
    }
  
    // You can add additional UI updates here as needed
  }
  
  // Assume you have a function to find a subtask by title
  function findSubtaskById(subtaskId) {
    // Implement your logic to find the subtask by ID in your data structure
    // For example, you can use boardData to find the subtask
    // Replace this with your actual implementation
  
    return boardData.boards
      .flatMap((board) => board.columns)
      .flatMap((column) => column.tasks)
      .flatMap((task) => task.subtasks)
      .find((subtask) => subtask.id === subtaskId)
  }
  
  function findTaskById(taskId) {
    // Loop through boards to find the task with the given ID
    for (const board of boardData.boards) {
      for (const column of board.columns) {
        const task = column.tasks.find((task) => task.id === taskId)
        if (task) {
          return task
        }
      }
    }
    return null // Task not found
  }
  
  function generateUniqueIdFromTitle(title) {
    // Use a hash function or any unique ID generation method based on the title
    // For simplicity, let's use a basic hash function for illustration
    const hash = title
      .split('')
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
    return `subtask-${hash}`
  }
  
  function generateSubtaskItem(subtask) {
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
  
  function generateColumn(column) {
    const tasksHtml = column.tasks.map((task) => generateTaskCard(task)).join('')
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
  
  function generateKanbanBoardName(board) {
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
  
  function generateKanbanBoardNames(boardData) {
    return boardData.boards
      .map((board) => generateKanbanBoardName(board))
      .join('')
  }
  
  function generateKanbanBoard(board) {
    if (!board || !board.columns) {
      console.error('Invalid board data:', board)
      return '' // Return an empty string or handle the error appropriately
    }
  
    playGround.setAttribute('board-id', `${board.id}`)
    return board.columns.map((column) => generateColumn(column)).join('')
  }
  
  boardList.addEventListener('click', (event) => {
    event.preventDefault()
    const targetLink = event.target.closest('.board__link')
    if (targetLink) {
      const boardId = targetLink.getAttribute('data-board-id')
      renderBoard(boardId)
    }
  })
  
  boardList.innerHTML = generateKanbanBoardNames(boardData)
  
  if (boardData && boardData.boards.length > 0) {
    const initialBoardId = boardData.boards[0].id
    renderBoard(initialBoardId)
  }
  
  function createNewColumnElement() {
    // Create div element
    const divElement = document.createElement('button')
  
    // Set class attribute
    divElement.setAttribute(
      'class',
      'toggle-modal-button w-280 new-column h-fit mt-10 flex rounded-md bg-gradient-primary cursor-pointer items-center content-center overflow-visible mb-48 bg-gradient-to-br from-[#995eb40a] to-[#723b8883]',
    )
  
    // Set id attributeadd
    divElement.setAttribute('id', 'newColumn')
  
    // Set modal-id attribute
    divElement.setAttribute('modal-id', 'edit-board-modal')
  
    // Create span element
    const spanElement = document.createElement('span')
  
    // Set class attribute for span
    spanElement.setAttribute(
      'class',
      'text-color text-center text-slate-500 capitalize text-2xl',
    )
  
    // Create inner HTML for span
    spanElement.innerHTML =
      '<span class="text-3xl text-center">+</span> New Column'
  
    // Append span element to div element
    divElement.appendChild(spanElement)
  
    // Return the generated element
    return divElement
  }
  
  function generateColumnDataFromDOM() {
    const columns = []
  
    // Assuming your columns are contained in a container with the class "column-container"
    const columnContainer = document.querySelector('#playGround')
  
    // Iterate through each column in the container
    columnContainer
      .querySelectorAll('.column')
      .forEach((columnElement, columnIndex) => {
        const column = {
          name: columnElement.querySelector('.column-name').textContent,
          tasks: [],
        }
  
        // Iterate through each task in the column
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
  
  function replaceColumnsInSelectedBoardByIdInPlace(
    boardData,
    boardId,
    newColumns,
  ) {
    const foundBoard = boardData.boards.find((board) => board.id === boardId)
  
    if (foundBoard) {
      const selectedBoardIndex = boardData.boards.indexOf(foundBoard)
      boardData.boards[selectedBoardIndex].columns = newColumns
    } else {
      console.error('Board not found.')
    }
  }
  
  // LOCAL STORAGE
  
  function fetchData() {
    try {
      const jsonData = localStorage.getItem('kanban')
      return jsonData ? JSON.parse(jsonData) : null
    } catch (error) {
      console.error('Error fetching data from localStorage:', error)
      return null
    }
  }
  
  function setData(data) {
    try {
      const jsonData = JSON.stringify(data)
      localStorage.setItem('kanban', jsonData)
      console.log('Data successfully set in localStorage.')
    } catch (error) {
      console.error('Error setting data in localStorage:', error)
    }
  }
  
  function saveDOM() {
    const currentBoard = document
      .querySelector('#playGround')
      .getAttribute('board-id')
    replaceColumnsInSelectedBoardByIdInPlace(
      boardData,
      currentBoard,
      generateColumnDataFromDOM(),
    )
    setData(boardData)
  }
  