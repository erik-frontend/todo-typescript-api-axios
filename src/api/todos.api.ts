import { api } from "./api";
import type {Todo} from "../type/types";

export async function getTodos():Promise<Todo[]> {
    const res = await api.get<Todo[]>("/todos")
    // console.log(res.data);
    return res.data
}

export async function createTodo(payload: Pick<Todo, "title" | "completed">):Promise<Todo>{
    const res = await api.post<Todo>("/todos", payload)
    // console.log(res.data);
    return res.data
}

export async function updateTodo(id: Todo["id"],patch:Partial<Pick<Todo, "title" | "completed">>):Promise<Todo> {
    const res = await api.patch<Todo>(`/todos/${id}`, patch)
    // console.log(res.data);
    return res.data
}

export async function deleteTodo(id: Todo["id"]):Promise<void> {
    await api.delete(`/todos/${id}`)
}
