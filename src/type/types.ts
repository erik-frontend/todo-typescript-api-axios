export interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

export type CreateTodoPayload = Omit<Todo,"id">

export type UpdateTodoPayload = Partial<CreateTodoPayload>