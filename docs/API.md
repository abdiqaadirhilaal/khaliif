# API documentation
Base URL `http://localhost:5000/api`. Success: `{success:true,message,data}`. Error: `{success:false,message}`. Protected routes need `Authorization: Bearer <token>`.
Roles: **SA** super_admin (everything), **M** manager, **S** sales, **C** cashier. Lists accept `page`, `limit`, `q`.

| Method & path | Access | Purpose |
|---|---|---|
| POST /auth/login, GET /auth/me | public / any | Login (rate-limited), current user |
| GET /products, GET /products/:id | public | Published products (no cost, no exact stock) |
| GET /products/manage | M,S,C | All products. Filters: q, category, gender, published |
| POST/PUT/DELETE /products(/:id) | M | Multipart, image field `image` |
| GET /categories; GET /categories/manage | public; M,S | Active / all categories |
| POST/PUT/DELETE /categories(/:id) | M | Multipart, image field `image` |
| GET/POST/PUT/DELETE /containers | M | Total cost auto-calculated, bundle count + expected profit |
| GET/POST/PUT/DELETE /bundles | M | Filters: container, status, category |
| GET /inventory, GET /inventory/transactions, POST /inventory/adjust | M | Stock levels + summary, history, add/remove stock |
| GET/POST/PUT/DELETE /customers, GET /customers/:id/statement | M,S (read: +C) | Customer statement |
| GET /sales, GET /sales/:id, POST /sales | M,S,C | Create sale (stock, invoice, payment, balance, inventory log) |
| GET/POST /payments | M,C | Partial payments applied to oldest invoices or a chosen one |
| GET/POST/PUT/DELETE /expenses | M | Categories: shipping, customs, transport, rent, ... |
| POST /messages | public | Contact form (rate-limited) |
| GET /messages, GET /messages/unread-count, PUT/DELETE /messages/:id | M | Status: unread, read, replied, closed |
| GET /settings | public | Company/website/system settings |
| PUT /settings | M | Multipart: `data` (JSON) + optional `logo` |
| GET/POST/PUT/DELETE /users | SA | User management |
| POST /upload | any staff | Image upload, returns `{url}` |
| GET /notifications | any staff | Low/out of stock, debts, messages, new sales/containers |
| GET /reports/dashboard | M | Cards, 30-day series, top products, stock by category |
| GET /reports/:type | M | types: sales, products, categories, customers, debts, expenses, profit, inventory, containers, bundles. Params: from, to (YYYY-MM-DD), group (day/week/month/year) |

Profit = Revenue - Cost of goods sold - Expenses.
