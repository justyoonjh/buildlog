# SQLite to PostgreSQL Migration Guide (AWS Ready)

This guide outlines the steps to migrate your application from SQLite (local file) to PostgreSQL (AWS RDS), ensuring scalability and reliability.

## 1. Infrastructure Setup (AWS)
1.  **Create RDS Instance**:
    - Go to AWS Console > RDS > Create Database.
    - Select **PostgreSQL**.
    - Choose "Free Tier" or "Production" based on needs.
    - Configure security groups to allow access from your application server (EC2/Beanstalk/Lambda).
2.  **Get Connection String**:
    - Format: `postgres://username:password@hostname:5432/databasename`
    - Add this to your `.env` file as `DATABASE_URL`.

## 2. Data Migration Strategy
Moving existing data from `database.sqlite` to PostgreSQL.

### Option A: Using `pgloader` (Recommended)
`pgloader` is a powerful tool that automates this process, handling schema differences automatically.
```bash
# Install pgloader (e.g., on Mac/Linux)
brew install pgloader

# Run migration
pgloader sqlite://path/to/database.sqlite postgres://user:pass@host/db
```

### Option B: Custom Script (Node.js)
If you want full control, write a script that:
1.  Reads all rows from SQLite using `better-sqlite3`.
2.  Inserts them into PostgreSQL using `pg` (node-postgres).

## 3. Code Adaptation (Crucial)

### Challenge: Sync vs Async
- **Current (SQLite)**: `better-sqlite3` is **synchronous** (blocking).
- **Future (PostgreSQL)**: `pg` driver is **asynchronous** (non-blocking).

### Required Refactoring
To make the transition smooth, you should refactor your current `server/server-db.js` interface to be **asynchronous** (return Promises) *even while using SQLite*.

**Current:**
```javascript
const user = db.findUserById(id); // Returns object directly
```

**Future-Ready Interface:**
```javascript
const user = await db.findUserById(id); // Returns Promise
```

### Implementation Steps
1.  **Install Driver**: `npm install pg`
2.  **Create New Adapter**: Create `server/server-db-postgres.js`.
3.  **Update Logic**:
    ```javascript
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const findUserById = async (id) => {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0];
    };
    ```
4.  **Switch Adapter**: Update `server-proxy.js` to require the postgres adapter instead of the sqlite one.

## 4. Long-Term Recommendation: ORM (Prisma)
Adopting an ORM like **Prisma** abstracts the database completely.
- **Migration**: Change `provider = "sqlite"` to `provider = "postgresql"` in `schema.prisma`.
- **Code**: No code changes required in your logic (`prisma.user.findUnique(...)` works for both).
- **Recommendation**: Introduce Prisma *before* the migration to make the switch trivial.
