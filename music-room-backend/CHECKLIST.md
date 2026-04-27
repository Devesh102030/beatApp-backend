# Setup and Deployment Checklist

## Initial Setup

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Docker and Docker Compose installed
- [ ] LiveKit account or self-hosted server

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Generate Prisma client
pnpm prisma:generate

# 5. Run migrations
pnpm prisma:migrate

# 6. (Optional) Seed test data
pnpm prisma:seed

# 7. Start development server
pnpm dev
```

### Verify Installation

- [ ] Server starts without errors
- [ ] Can access http://localhost:3000/api/docs
- [ ] Database connection successful
- [ ] Can create a test room via Swagger

## Environment Configuration

### Required Variables

- [ ] `NODE_ENV` - Set to 'development' or 'production'
- [ ] `PORT` - API server port (default: 3000)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `WEB_APP_URL` - Frontend application URL
- [ ] `EXTENSION_ORIGIN` - Chrome extension origin
- [ ] `LIVEKIT_URL` - LiveKit WebSocket URL
- [ ] `LIVEKIT_API_KEY` - LiveKit API key
- [ ] `LIVEKIT_API_SECRET` - LiveKit API secret
- [ ] `HOST_SECRET_SIGNING_KEY` - Secret key (min 32 chars)

### Optional Variables

- [ ] `JWT_SECRET` - For future authentication (min 32 chars)

## Development Checklist

### Before Committing

- [ ] Code passes linting (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Tests pass (`pnpm test`)
- [ ] No console.logs in production code
- [ ] No hardcoded secrets
- [ ] Environment variables documented

### Testing

- [ ] Unit tests written for new features
- [ ] Integration tests for API endpoints
- [ ] Manual testing completed
- [ ] Error cases handled
- [ ] Edge cases considered

## Production Deployment Checklist

### Pre-Deployment

#### Security
- [ ] Strong `HOST_SECRET_SIGNING_KEY` (32+ random characters)
- [ ] Strong `JWT_SECRET` if using auth (32+ random characters)
- [ ] `NODE_ENV=production` set
- [ ] CORS origins properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled
- [ ] No secrets in code or logs
- [ ] Database credentials secured
- [ ] LiveKit credentials secured

#### Database
- [ ] Production PostgreSQL instance ready
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Migrations tested
- [ ] Indexes optimized

#### Infrastructure
- [ ] Server/hosting platform ready
- [ ] Domain name configured
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Load balancer configured (if needed)

### Deployment Steps

```bash
# 1. Build application
pnpm build

# 2. Run production migrations
pnpm prisma:migrate deploy

# 3. Start production server
pnpm start:prod

# Or with PM2
pm2 start dist/main.js --name music-room-api
pm2 save
```

### Post-Deployment

#### Verification
- [ ] API accessible at production URL
- [ ] Health check endpoint responding
- [ ] Database connectivity verified
- [ ] LiveKit token generation working
- [ ] WebSocket connections working
- [ ] CORS working for web app
- [ ] CORS working for extension
- [ ] Error responses formatted correctly

#### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Performance monitoring set up
- [ ] Database monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Alert notifications configured

#### Documentation
- [ ] API documentation accessible
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Rollback procedure documented
- [ ] Team has access to credentials

## Testing Checklist

### Manual Testing

#### User Flow
- [ ] Create guest user
- [ ] Create room
- [ ] Get room metadata
- [ ] Join room as listener
- [ ] Generate host token (with secret)
- [ ] Generate listener token
- [ ] Send chat message
- [ ] Host heartbeat
- [ ] End room

#### WebSocket Flow
- [ ] Connect to WebSocket
- [ ] Join room via socket
- [ ] Receive room:state event
- [ ] Receive member:joined event
- [ ] Receive member:left event
- [ ] Receive chat:message event
- [ ] Disconnect handling

#### Broadcast Flow
- [ ] Broadcast starting
- [ ] Broadcast live
- [ ] Broadcast stopped
- [ ] Room state updates correctly
- [ ] Listeners notified

#### Error Cases
- [ ] Invalid room code
- [ ] Invalid host secret
- [ ] Room already ended
- [ ] User not found
- [ ] Validation errors
- [ ] Rate limiting

### Automated Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code coverage > 70%

## Performance Checklist

### Database
- [ ] Queries optimized
- [ ] Indexes created
- [ ] Connection pooling configured
- [ ] Query performance monitored

### API
- [ ] Response times < 200ms (p95)
- [ ] Rate limiting working
- [ ] No N+1 queries
- [ ] Pagination implemented where needed

### WebSocket
- [ ] Connection handling efficient
- [ ] Room broadcasting optimized
- [ ] Disconnect cleanup working
- [ ] Memory leaks checked

## Security Audit Checklist

### Authentication & Authorization
- [ ] Host secrets properly hashed
- [ ] Timing-safe comparisons used
- [ ] Host-only endpoints protected
- [ ] Token expiration configured

### Input Validation
- [ ] All inputs validated
- [ ] SQL injection prevented (Prisma)
- [ ] XSS prevention (sanitization)
- [ ] CSRF protection (if needed)

### Network Security
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Security headers set (Helmet)
- [ ] Rate limiting active

### Data Security
- [ ] Secrets not logged
- [ ] Tokens not logged
- [ ] Database credentials secured
- [ ] Environment variables secured

## Maintenance Checklist

### Regular Tasks

#### Daily
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Check uptime status

#### Weekly
- [ ] Review security alerts
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Update dependencies (if needed)

#### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database cleanup
- [ ] Backup verification
- [ ] Documentation updates

### Incident Response

#### When Issues Occur
1. [ ] Check application logs
2. [ ] Check database status
3. [ ] Check external services (LiveKit)
4. [ ] Review recent deployments
5. [ ] Check monitoring alerts
6. [ ] Document the issue
7. [ ] Implement fix
8. [ ] Verify fix in staging
9. [ ] Deploy to production
10. [ ] Post-mortem analysis

## Scaling Checklist

### When to Scale

- [ ] Response times degrading
- [ ] CPU usage consistently high
- [ ] Memory usage consistently high
- [ ] Database connections maxed
- [ ] WebSocket connections maxed

### Scaling Steps

#### Vertical Scaling
- [ ] Increase server resources
- [ ] Increase database resources
- [ ] Optimize queries
- [ ] Add caching

#### Horizontal Scaling
- [ ] Implement Redis state store
- [ ] Configure load balancer
- [ ] Enable sticky sessions
- [ ] Test multi-instance setup
- [ ] Monitor distributed state

## Documentation Checklist

### Required Documentation
- [ ] README.md complete
- [ ] API.md complete
- [ ] SETUP.md complete
- [ ] ARCHITECTURE.md complete
- [ ] Environment variables documented
- [ ] Deployment process documented

### Code Documentation
- [ ] Complex functions commented
- [ ] Interfaces documented
- [ ] DTOs have descriptions
- [ ] Swagger annotations complete

## Acceptance Criteria

All items must be checked before considering the backend complete:

### Core Functionality
- [x] Can create rooms
- [x] Can join rooms
- [x] Can generate LiveKit tokens
- [x] Host tokens require secret
- [x] Listener tokens work without secret
- [x] Room status transitions work
- [x] WebSocket events work
- [x] Chat messages work
- [x] Broadcast flow works

### Technical Requirements
- [x] TypeScript
- [x] NestJS framework
- [x] PostgreSQL database
- [x] Prisma ORM
- [x] Socket.IO
- [x] LiveKit SDK
- [x] Input validation
- [x] Error handling
- [x] Security measures
- [x] Docker Compose
- [x] Tests included

### Architecture
- [x] Modular structure
- [x] Separation of concerns
- [x] State store abstraction
- [x] Redis-ready design
- [x] Clean DTOs
- [x] Testable services

### Documentation
- [x] README
- [x] API docs
- [x] Setup guide
- [x] Architecture docs
- [x] Code comments

## Final Verification

Before going live:

```bash
# 1. Run all tests
pnpm test

# 2. Build for production
pnpm build

# 3. Check for vulnerabilities
pnpm audit

# 4. Verify environment
node -e "console.log(process.env.NODE_ENV)"

# 5. Test production build locally
NODE_ENV=production pnpm start:prod
```

- [ ] All tests pass
- [ ] Build succeeds
- [ ] No critical vulnerabilities
- [ ] Production environment verified
- [ ] Application starts successfully

## Success! 🎉

Your Music Room backend is ready for production!
