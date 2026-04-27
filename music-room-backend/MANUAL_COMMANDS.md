# Manual Commands to Run

Since some shell commands couldn't be executed automatically, here are all the commands you need to run manually to complete the setup.

## 1. Install Dependencies

```bash
cd music-room-backend
pnpm install
```

This will install all required packages including:
- NestJS framework
- Prisma ORM
- Socket.IO
- LiveKit SDK
- And all other dependencies

## 2. Install Dev Dependencies (if needed)

```bash
pnpm add -D prisma @types/bcryptjs @types/uuid ts-node
```

## 3. Setup Environment

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://music:music@localhost:5432/music_room?schema=public
WEB_APP_URL=http://localhost:5173
EXTENSION_ORIGIN=chrome-extension://your-extension-id
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
JWT_SECRET=your-jwt-secret-change-in-production-min-32-chars
HOST_SECRET_SIGNING_KEY=your-host-secret-signing-key-change-in-production-min-32-chars
```

## 4. Start PostgreSQL

```bash
docker-compose up -d
```

Verify it's running:

```bash
docker-compose ps
```

You should see `music-room-postgres` with status "Up".

## 5. Generate Prisma Client

```bash
pnpm prisma:generate
```

This generates the Prisma client based on your schema.

## 6. Run Database Migrations

```bash
pnpm prisma:migrate dev --name init
```

This creates all database tables.

## 7. (Optional) Seed Test Data

```bash
pnpm prisma:seed
```

This creates:
- Test users
- A test room (code: TEST01)
- Sample chat messages
- Test credentials: host secret is `test-secret-123`

## 8. Start Development Server

```bash
pnpm dev
```

The server will start on http://localhost:3000

## 9. Verify Installation

Open your browser and visit:

- **Swagger Docs**: http://localhost:3000/api/docs
- **Test Endpoint**: http://localhost:3000/api/rooms/TEST01 (if you seeded data)

## 10. Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

## 11. Lint and Format

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

## 12. Open Prisma Studio (Optional)

To view and edit database data:

```bash
pnpm prisma:studio
```

This opens a GUI at http://localhost:5555

## Production Commands

### Build for Production

```bash
pnpm build
```

### Run Production Migrations

```bash
pnpm prisma:migrate deploy
```

### Start Production Server

```bash
pnpm start:prod
```

### Or with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name music-room-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Docker Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f postgres
```

### Restart Services

```bash
docker-compose restart
```

### Remove All Data (WARNING: Deletes everything)

```bash
docker-compose down -v
```

## Database Commands

### Create a New Migration

```bash
pnpm prisma:migrate dev --name your_migration_name
```

### Reset Database (WARNING: Deletes all data)

```bash
pnpm prisma migrate reset
```

### View Database

```bash
pnpm prisma:studio
```

### Generate Prisma Client (after schema changes)

```bash
pnpm prisma:generate
```

## Testing Commands

### Run Specific Test File

```bash
pnpm test src/common/utils/crypto.spec.ts
```

### Run Tests with Debugging

```bash
pnpm test:debug
```

### Run E2E Tests

```bash
pnpm test:e2e
```

## Troubleshooting Commands

### Check Node Version

```bash
node --version
```

Should be 18.0.0 or higher.

### Check pnpm Version

```bash
pnpm --version
```

Should be 8.0.0 or higher.

### Check Docker

```bash
docker --version
docker-compose --version
```

### Check PostgreSQL Connection

```bash
docker exec -it music-room-postgres psql -U music -d music_room
```

Then try:
```sql
\dt  -- List tables
\q   -- Quit
```

### View Application Logs

When running with PM2:

```bash
pm2 logs music-room-api
```

### Check Port Usage

```bash
# On macOS/Linux
lsof -i :3000

# On Windows
netstat -ano | findstr :3000
```

## Quick Test API

### Create a Room

```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Room"}'
```

### Get Room Info

```bash
curl http://localhost:3000/api/rooms/TEST01
```

### Create Guest User

```bash
curl -X POST http://localhost:3000/api/users/guest \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test User"}'
```

### Join Room

```bash
curl -X POST http://localhost:3000/api/rooms/TEST01/join \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test Listener"}'
```

## Environment-Specific Commands

### Development

```bash
# Start with hot reload
pnpm dev

# Start with debug mode
pnpm start:debug
```

### Production

```bash
# Build
pnpm build

# Start
NODE_ENV=production pnpm start:prod
```

### Testing

```bash
# Set test environment
NODE_ENV=test pnpm test
```

## Cleanup Commands

### Remove node_modules

```bash
rm -rf node_modules
pnpm install
```

### Clean Build

```bash
rm -rf dist
pnpm build
```

### Reset Everything (Nuclear Option)

```bash
# Stop and remove Docker containers
docker-compose down -v

# Remove node_modules
rm -rf node_modules

# Remove build artifacts
rm -rf dist

# Reinstall
pnpm install

# Regenerate Prisma
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate dev

# Seed data
pnpm prisma:seed

# Start fresh
pnpm dev
```

## Summary of Essential Commands

For a fresh setup, run these in order:

```bash
# 1. Install
cd music-room-backend
pnpm install

# 2. Environment
cp .env.example .env
# Edit .env with your values

# 3. Database
docker-compose up -d
pnpm prisma:generate
pnpm prisma:migrate dev --name init

# 4. (Optional) Test data
pnpm prisma:seed

# 5. Start
pnpm dev

# 6. Test
pnpm test
```

## Next Steps

After running these commands:

1. ✅ Verify server is running at http://localhost:3000
2. ✅ Check Swagger docs at http://localhost:3000/api/docs
3. ✅ Test creating a room via API or Swagger
4. ✅ Review the API documentation in `docs/API.md`
5. ✅ Read the architecture docs in `docs/ARCHITECTURE.md`
6. ✅ Check the deployment checklist in `CHECKLIST.md`

## Getting Help

If you encounter issues:

1. Check the terminal output for error messages
2. Review the logs: `docker-compose logs postgres`
3. Verify environment variables in `.env`
4. Check that all services are running: `docker-compose ps`
5. Review the troubleshooting section in `docs/SETUP.md`

## Success Indicators

You'll know everything is working when:

- ✅ `pnpm dev` starts without errors
- ✅ You can access http://localhost:3000/api/docs
- ✅ You can create a room via Swagger UI
- ✅ Tests pass with `pnpm test`
- ✅ Database has tables (check with `pnpm prisma:studio`)

Happy coding! 🚀
