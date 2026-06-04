# TaskFlow API Reference

Base URL: `http://localhost:3001/api`

All request and response bodies use **JSON**. All timestamps are **ISO 8601** strings.

---

## Data Model

### Task Object

```json
{
  "id":          "uuid-v4 string",
  "title":       "string (1–200 chars)",
  "description": "string | null",
  "dueDate":     "ISO date string (YYYY-MM-DD) | null",
  "completed":   false,
  "position":    42,
  "createdAt":   "2024-06-01T10:00:00.000Z",
  "updatedAt":   "2024-06-01T10:00:00.000Z"
}
```

---

## Endpoints

### `GET /api/health`

Returns server status.

**Response `200`**
```json
{ "status": "ok", "timestamp": "2024-06-01T10:00:00.000Z" }
```

---

### `GET /api/tasks`

Returns all tasks (filtered/searched) plus aggregate summary counts.

**Query Parameters**

| Param    | Type   | Default | Description                                    |
|----------|--------|---------|------------------------------------------------|
| `status` | string | `all`   | Filter: `all` \| `active` \| `completed`       |
| `search` | string | `""`    | Case-insensitive title substring search        |

**Response `200`**
```json
{
  "tasks": [ /* Task[] sorted by createdAt DESC */ ],
  "summary": {
    "active":    3,
    "completed": 1,
    "total":     4
  }
}
```

> Note: `summary` always reflects **all tasks**, regardless of `status` or `search` filters.

---

### `GET /api/tasks/:id`

Returns a single task.

**Response `200`** – Task object  
**Response `404`**
```json
{ "error": "Task not found" }
```

---

### `POST /api/tasks`

Creates a new task.

**Request Body**
```json
{
  "title":       "Buy groceries",        // required
  "description": "Milk, eggs, bread",    // optional
  "dueDate":     "2024-06-15"            // optional, YYYY-MM-DD
}
```

**Response `201`** – Created Task object  
**Response `400`**
```json
{ "errors": ["title is required and cannot be empty"] }
```

---

### `PATCH /api/tasks/:id`

Partially updates a task. Only include fields you want to change.

**Request Body** (all fields optional)
```json
{
  "title":       "Updated title",
  "description": "Updated description",
  "dueDate":     "2024-07-01",
  "completed":   true
}
```

**Response `200`** – Updated Task object  
**Response `400`**
```json
{ "errors": ["title cannot be empty"] }
```
**Response `404`**
```json
{ "error": "Task not found" }
```

---

### `DELETE /api/tasks/:id`

Permanently deletes a task.

**Response `204`** – No content  
**Response `404`**
```json
{ "error": "Task not found" }
```

---

### `PATCH /api/tasks/bulk/reorder`

Updates position values for multiple tasks (used after drag-and-drop reorder).

**Request Body**
```json
{
  "order": [
    { "id": "uuid-1", "position": 0 },
    { "id": "uuid-2", "position": 1 },
    { "id": "uuid-3", "position": 2 }
  ]
}
```

**Response `200`**
```json
{ "success": true }
```
**Response `400`**
```json
{ "error": "order must be an array" }
```

---

## Error Format

All errors return a JSON body. Validation errors use the `errors` array; other errors use `error` string.

```json
{ "errors": ["field-level messages"] }
{ "error":  "single message" }
```

## HTTP Status Codes

| Code | Meaning                          |
|------|----------------------------------|
| 200  | OK                               |
| 201  | Created                          |
| 204  | No Content (successful delete)   |
| 400  | Bad Request (validation error)   |
| 404  | Not Found                        |
| 500  | Internal Server Error            |
