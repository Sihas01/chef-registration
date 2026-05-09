# chef-registration

Semester 2 registration form built with Next.js, MySQL, and Prisma.

## Backend setup

1. Install dependencies:

```bash
npm install
```

2. Create a MySQL database:

```sql
CREATE DATABASE chef_registration;
```

3. Create a local `.env` file from `.env.example` and set your MySQL URL:

```bash
DATABASE_URL="mysql://root:password@localhost:3306/chef_registration"
RECEIPT_UPLOAD_DIR="uploads/registration-receipts"
```

4. Apply the SQL migration:

```bash
npm run db:migrate
```

5. Start the app:

```bash
npm run dev
```

The registration API writes form data to the `registrations` SQL table. Uploaded receipts are saved in `RECEIPT_UPLOAD_DIR`, and the database stores the receipt metadata/path.
