# React 19 Documentation

## New Hooks

### useActionState

```typescript
import { useActionState } from 'react';

function ChangeName({ name, setName }) {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await updateName(formData.get("name"));
      if (error) {
        return error;
      }
      redirect("/path");
      return null;
    },
    null,
  );

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>Update</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

### useFormStatus

```typescript
import { useFormStatus } from 'react-dom';

function DesignButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} />
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

### useOptimistic

```typescript
import { useState, useOptimistic } from 'react';
import { saveTodo } from "./server";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (todos, newTodo) => [...todos, newTodo]
  );

  const addTodo = async (formData) => {
    addOptimisticTodo(formData.get("todo"));
    const todo = await saveTodo(formData.get("todo"));
    setTodos(todos => [...todos, todo]);
  };

  return (
    <form action={addTodo}>
      <input name="todo" />
      <button type="submit">Add Todo</button>
      {optimisticTodos.map(todo => <div key={todo}>{todo}</div>)}
    </form>
  );
}
```

### use Hook

```typescript
import { use } from 'react';

async function fetchUser() {
  const response = await fetch('/api/user');
  return response.json();
}

function UserProfile() {
  const user = use(fetchUser());

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## Form Actions

```typescript
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

async function createUserAction(prevState, formData) {
  try {
    await fetch('/user', {
      method: 'POST',
      body: JSON.stringify({ name: formData.get('name') }),
    });
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
  return {
    success: true,
    message: 'User created successfully!',
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button>{pending ? 'Saving...' : 'Save'}</button>;
}

export default function UserForm() {
  const [formState, formAction] = useActionState(createUserAction, null);

  return (
    <form action={formAction}>
      <input name="name" type="text" />
      <SubmitButton />
      {formState?.success === true && (
        <p className="success">{formState?.message}</p>
      )}
      {formState?.success === false && (
        <p className="error">{formState?.message}</p>
      )}
    </form>
  );
}
```

## Resource Preloading

```typescript
import { prefetchDNS, preconnect, preload, preinit } from 'react-dom';

function MyComponent() {
  preinit('https://.../path/to/some/script.js', { as: 'script' });
  preload('https://.../path/to/font.woff', { as: 'font' });
  preload('https://.../path/to/stylesheet.css', { as: 'style' });
  prefetchDNS('https://...');
  preconnect('https://...');
}
```

## Server Components

```typescript
// MyServerComponent.server.jsx
async function MyServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## Improved Hydration Error Messages

React 19 provides better hydration error messages:

```
Uncaught Error: Hydration failed because the server rendered HTML didn't match the client.

This can happen if:
- A server/client branch: if (typeof window !== 'undefined')
- Variable input such as Date.now() or Math.random()
- Date formatting in a user's locale
- External changing data without a snapshot
- Invalid HTML tag nesting
```

## AddToCart Example

```typescript
import { useActionState, useState } from "react";
import { addToCart } from "./actions.js";

function AddToCartForm({ itemID, itemTitle }) {
  const [message, formAction, isPending] = useActionState(addToCart, null);

  return (
    <form action={formAction}>
      <h2>{itemTitle}</h2>
      <input type="hidden" name="itemID" value={itemID} />
      <button type="submit">Add to Cart</button>
      {isPending ? "Loading..." : message}
    </form>
  );
}

export default function App() {
  return (
    <>
      <AddToCartForm itemID="1" itemTitle="JavaScript: The Definitive Guide" />
      <AddToCartForm itemID="2" itemTitle="JavaScript: The Good Parts" />
    </>
  );
}
```
