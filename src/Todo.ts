import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

const todosEl = document.querySelector<HTMLUListElement>("#todos")!;
// console.log(todosEl);
const newTodoTitleEl = document.querySelector<HTMLInputElement>("#new-todo-title")!

const newTodoFormEl = document.querySelector<HTMLFormElement>("#new-todo-form")!

const START_ARRAY = [
    { id: 1, title: "🤓 Learn about TypeScript", completed: true },
    { id: 2, title: "😇 Take over the world", completed: false },
    { id: 3, title: "💰 Profit", completed: false },
    { id: 4, title: "😈 Be nice", completed: true },
]

const jsonTodos = localStorage.getItem("todos");
// console.log(jsonTodos);

let todos: Todo[] = jsonTodos ?
    JSON.parse(jsonTodos)
    : START_ARRAY;

//  console.log(todos);

// let todos: Todo[] = jsonTodos ? JSON.parse(jsonTodos) : []

const saveTodos = () => {
    const jsonTodos = JSON.stringify(todos)
    localStorage.setItem("todos", jsonTodos)
}


const toggleTodo = (id: number) => {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)

    saveTodos()
    renderTodos()
}


const sortTodoByCompleted = (todos: Todo[]): Todo[] => {
    return [...todos].sort((a, b) => {
        return Number(a.completed) - Number(b.completed)
    })
}


/**
* Render todos to DOM
**/
// ✔ map() → делает массив - map создаёт список HTML-элементов
// ✔ join("") → делает строку - join превращает этот список в одну строку
// ✔ innerHTML её вставляет в DOM


const renderTodos = () => {
    if (todos.length === 0) {
        todosEl.innerHTML = `
            <li class="p-4 text-center text-3xl font-bold text-gray-500 italic">
                Todo List is Empty. Add a new Task
            </li>
        `
        return
    }

    const sortedTodos = sortTodoByCompleted(todos)

    todosEl.innerHTML = sortedTodos
        .map((todo) => {
            return `<li class="flex justify-between" data-id="${todo.id}">
                <label>
                    <input type="checkbox"
                        ${todo.completed ? "checked" : ""}
                        data-id="${todo.id}"
                        class="toggle h-5 w-5 cursor-pointer" 
                    />
                    <input 
                        class="${todo.completed ? "line-through text-gray-400" : ""} todo-title"
                        value="${todo.title}"
                        type="text"
                        data-id="${todo.id}"
                        name="text"
                        readOnly
                    />
                </label>
                <div class="flex items-center gap-2">
                    <button class="cursor-pointer edit px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition">
                        Edit
                    </button>
                    <button data-id="${todo.id
                }" class="cursor-pointer delete px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition">
                        Delete
                    </button>
                </div>
            </li>`
        }).join("")
    // search input type checkbox
    const toggleInputs = document.querySelectorAll<HTMLInputElement>(".toggle")
    //    console.log(toggleInputs);
    toggleInputs.forEach(input => {
        input.addEventListener("change", () => {
            const id = Number(input.dataset.id)
            toggleTodo(id)
            // console.log(id);
        })
    })

    const deleteBtn = document.querySelectorAll<HTMLButtonElement>(".delete")
    // console.log(deleteBtn);
    const deleteTodo = (id: number) => {
        todos = todos.filter(todo => todo.id !== id)
        saveTodos()
        renderTodos()
    }
    deleteBtn.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id)
            deleteTodo(id)
        })
    })

    const editBtns = document.querySelectorAll<HTMLButtonElement>(".edit")

    // Фнкция которая сохраняет измененнный текст

    const saveEditTodo = (newTitle: string, id: number): boolean => {
        if (newTitle.length < 3) {
            Toastify({
                text: "title is to short",
                duration: 1500,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #ff5f6d, #ffc371)"
                }
            }).showToast()
            return false
        }
        todos = todos.map(todo => todo.id === id ? { ...todo, title: newTitle } : todo)
        // console.log(id);

        saveTodos()
        return true
    }

    editBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const li = btn.closest("li")!

            const id = Number(li.dataset.id)
            // console.log(id);
            const titleInput = li?.querySelector<HTMLInputElement>(".todo-title")!
            titleInput.readOnly = false
            const oldValue = titleInput.value
            titleInput.focus()
            titleInput.setSelectionRange(titleInput.value.length, titleInput.value.length)

            const success = saveEditTodo(titleInput.value.trim(), id)

            const onKey = (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                    if (!success) titleInput.value = oldValue
                    titleInput.readOnly = true
                    titleInput.removeEventListener("keydown", onKey)
                }
                if (e.key === "Escape") {
                    titleInput.value = oldValue
                    titleInput.readOnly = true
                    titleInput.removeEventListener("keydown", onKey)
                    renderTodos()
                }
            }



            titleInput.addEventListener("keydown", onKey)
            titleInput.addEventListener("blur", () => {
                const success = saveEditTodo(titleInput.value.trim(), id)
                // console.log(success);
                if (!success) titleInput.value = oldValue
                titleInput.readOnly = true
            }, { once: true })
        })
    })
}

const newTodo = (e: SubmitEvent) => {
    e.preventDefault()
    const newTodoTitle = newTodoTitleEl.value.trim()

    if (newTodoTitle.length < 3) {
        alert("That is to short todo, length must be more than 3 characters")
        return
    }

    const maxId = Math.max(0, ...todos.map(todo => todo.id))
    todos.push({
        id: maxId + 1,
        title: newTodoTitle,
        completed: false,
    })
    saveTodos()
    renderTodos()
    newTodoTitleEl.value = ""
    console.log("Greate success", todos);
    Toastify({
        text: "todo successfully created",
        duration: 1500,
        gravity: "top",
        position: "center",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)"
        }
    }).showToast()

}
newTodoFormEl.addEventListener("submit", newTodo)

renderTodos()