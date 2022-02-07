interface DataTodo {
    _id: string;
    title: string;
    done?: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DataTodoEdit {
    _id: null | string;
    title: string;
}
