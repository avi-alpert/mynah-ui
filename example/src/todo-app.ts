import {
    MynahUI,
    ChatItemType,
    ChatItemAction,
    generateUID,
} from '@aws/mynah-ui';

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

const todoItems: TodoItem[] = [];
const todoMessageId = 'todo-list-card';

const buildTodoBody = (): string => {
    const completedCount = todoItems.filter((item) => item.completed).length;
    const totalCount = todoItems.length;

    let body = `### Todo List (${completedCount}/${totalCount} completed)\n\n`;

    if (todoItems.length === 0) {
        body += '_No todos yet. Click "Add Todo" to get started!_';
    } else {
        todoItems.forEach((item) => {
            if (item.completed) {
                body += `- [x] ~~${item.text}~~\n`;
            } else {
                body += `- [ ] ${item.text}\n`;
            }
        });
    }

    return body;
};

const buildTodoButtons = (): Array<{
    id: string;
    text: string;
    icon?: string;
    status?: string;
}> => {
    const buttons: Array<{
        id: string;
        text: string;
        icon?: string;
        status?: string;
    }> = [];

    todoItems.forEach((item) => {
        buttons.push({
            id: `todo-toggle-${item.id}`,
            text: item.completed ? `Undo "${item.text}"` : `Complete "${item.text}"`,
            status: item.completed ? 'clear' : 'success',
        });
        buttons.push({
            id: `todo-delete-${item.id}`,
            text: `Delete "${item.text}"`,
            status: 'error',
        });
    });

    buttons.push({
        id: 'todo-add',
        text: 'Add Todo',
        status: 'info',
    });

    return buttons;
};

let hasRendered = false;

export const renderTodoList = (mynahUI: MynahUI, tabId: string): void => {
    if (!hasRendered) {
        mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: todoMessageId,
            body: buildTodoBody(),
            buttons: buildTodoButtons() as any,
        });
        hasRendered = true;
    } else {
        mynahUI.updateChatAnswerWithMessageId(tabId, todoMessageId, {
            body: buildTodoBody(),
            buttons: buildTodoButtons() as any,
        });
    }
};

export const handleTodoAction = (
    mynahUI: MynahUI,
    tabId: string,
    action: { id: string; text?: string; formItemValues?: Record<string, string> },
): void => {
    if (action.id === 'todo-add') {
        mynahUI.showCustomForm(
            tabId,
            [
                {
                    type: 'textinput',
                    id: 'todo-text',
                    title: 'Todo item',
                    placeholder: 'Enter your todo',
                    mandatory: true,
                    autoFocus: true,
                },
            ],
            [
                {
                    id: 'todo-cancel',
                    text: 'Cancel',
                    status: 'clear',
                    waitMandatoryFormItems: false,
                },
                {
                    id: 'todo-submit',
                    text: 'Add',
                    status: 'main',
                    waitMandatoryFormItems: true,
                },
            ],
            'Add Todo',
        );
        return;
    }

    if (action.id.startsWith('todo-toggle-')) {
        const itemId = action.id.replace('todo-toggle-', '');
        const item = todoItems.find((t) => t.id === itemId);
        if (item != null) {
            item.completed = !item.completed;
        }
        renderTodoList(mynahUI, tabId);
        return;
    }

    if (action.id.startsWith('todo-delete-')) {
        const itemId = action.id.replace('todo-delete-', '');
        const index = todoItems.findIndex((t) => t.id === itemId);
        if (index !== -1) {
            todoItems.splice(index, 1);
        }
        renderTodoList(mynahUI, tabId);
    }
};

export const handleTodoFormSubmit = (
    mynahUI: MynahUI,
    tabId: string,
    action: { id: string; text?: string; formItemValues?: Record<string, string> },
): void => {
    const todoText = action.formItemValues?.['todo-text'];
    if (todoText != null && todoText.trim() !== '') {
        todoItems.push({
            id: generateUID(),
            text: todoText.trim(),
            completed: false,
        });
        renderTodoList(mynahUI, tabId);
    }
};
