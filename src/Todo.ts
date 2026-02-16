import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"
import { getTodos, createTodo, updateTodo, deleteTodo as deleteTodoApi } from './api/todos.api';
import type { Todo } from './type/types';

const todosEl = document.querySelector<HTMLUListElement>("#todos")!;
// console.log(todosEl);
const newTodoTitleEl = document.querySelector<HTMLInputElement>("#new-todo-title")!

const newTodoFormEl = document.querySelector<HTMLFormElement>("#new-todo-form")!


let todos: Todo[] = []
let editTodoId: number | string | null = null

const loadTodos = async() => {
    try {
        todos = await getTodos()
        renderTodos()
    } catch (error) {
        Toastify({
            text: "Failed to load todos from server",
            duration: 2000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416s, #ff4b2b)"
            }
        }).showToast()
        console.error(error);
    }
}

const toggleTodo = async(id: number | string, completed: boolean) => {
    try {
        await updateTodo(id, {completed})
        await loadTodos()
    } catch (error) {
         Toastify({
            text: "Failed to update todo",
            duration: 1500,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416s, #ff4b2b)"
            }
        }).showToast()
        console.error(error);
    }
}

const commitEdit = async(
    id: number | string,
    input: HTMLInputElement,
    oldValue: string
) => {
    if(editTodoId !== id) return
    const newTitle = input.value.trim()
    if(newTitle === oldValue){
        input.readOnly = true
        editTodoId = null
        return
    }
    if(newTitle.length < 3) {
        Toastify({
            text: "Title is to short",
            duration: 1500,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416s, #ff4b2b)"
            }
        }).showToast()
        input.value = oldValue
        input.readOnly = true
        editTodoId = null
        return
    }

    try {
        await updateTodo(id, {title: newTitle})
        await loadTodos()
    } catch (error) {
        Toastify({
            text: "Failed to update todo title",
            duration: 1500,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416s, #ff4b2b)"
            }
        }).showToast()
        input.value = oldValue
    }
    finally{
        input.readOnly = true
        editTodoId = null
    }
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
        input.addEventListener("change", (e) => {
            const target = e.currentTarget as HTMLInputElement
            const id = target.dataset.id!
            const completed = target.checked
            toggleTodo(id, completed)
        })
    })

    const deleteBtn = document.querySelectorAll<HTMLButtonElement>(".delete")
    // console.log(deleteBtn);
    const deleteTodo = async(id: number | string) => {
        try {
            await deleteTodoApi(id)
            await loadTodos()
        } catch (error) {
            Toastify({
            text: "Failed to delete todo",
            duration: 1500,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416s, #ff4b2b)"
            }
        }).showToast()
        console.error(error);
        }

    }
    deleteBtn.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id!
            deleteTodo(id)
        })
    })

    const editBtns = document.querySelectorAll<HTMLButtonElement>(".edit")

    // Фнкция которая сохраняет измененнный текст

    // const saveEditTodo = (newTitle: string, id: number): boolean => {
    //     if (newTitle.length < 3) {
    //         Toastify({
    //             text: "title is to short",
    //             duration: 1500,
    //             gravity: "top",
    //             position: "center",
    //             style: {
    //                 background: "linear-gradient(to right, #ff5f6d, #ffc371)"
    //             }
    //         }).showToast()
    //         return false
    //     }
    //     todos = todos.map(todo => todo.id === id ? { ...todo, title: newTitle } : todo)
    //     // console.log(id);

    //     saveTodos()
    //     return true
    // }

    editBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const li = btn.closest("li")!

            const id = li.dataset.id!
            editTodoId = id
            // console.log(id);
            const titleInput = li?.querySelector<HTMLInputElement>(".todo-title")!
            titleInput.readOnly = false
            const oldValue = titleInput.value
            titleInput.focus()
            titleInput.setSelectionRange(titleInput.value.length, titleInput.value.length)

            const onKey = (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                    commitEdit(id, titleInput, oldValue)
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
                // console.log(success);
                commitEdit(id, titleInput, oldValue)
                titleInput.readOnly = true
            }, { once: true })
        })
    })
}

const newTodo = async(e: SubmitEvent) => {
    e.preventDefault()
    const newTodoTitle = newTodoTitleEl.value.trim()

    if (newTodoTitle.length < 3) {
        Toastify({
            text: "Todo is to short, must be at least 3 characters",
            duration: 1500,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416s, #ff4b2b)"
            }
        }).showToast()
        return
    }
    try {
        await createTodo({
            title: newTodoTitle,
            completed: false
        })
        await loadTodos()
        newTodoTitleEl.value = ""
        Toastify({
      text: "✅ Todo successfully created!",
      duration: 1500,
      gravity: "top",
      position: "center",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
    }).showToast();
    } catch (error) {
        Toastify({
            text: "Failed to create Todo",
            duration: 1500,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #ff416s, #ff4b2b)"
            }
        }).showToast()
        console.error(error);
        
    }
}
newTodoFormEl.addEventListener("submit", newTodo)
newTodoTitleEl.addEventListener("keydown", (e) => {
    if(e.key === "Escape") {
        e.preventDefault()
        newTodoTitleEl.value = ""
        newTodoTitleEl.blur()
    }
})

loadTodos()