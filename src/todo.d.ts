interface DataTodo {
    id: number;
    text: string;
    isComplete?: boolean;
}

interface DataTodoEdit {
    id: null | number;
    value: string;
}
