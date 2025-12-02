# Migration Checklist: Upgrading to Discord-Only Auth & Blog Admin Whitelist

This checklist helps you upgrade an existing AWFixer.com installation to the new Discord-only authentication system with blog admin whitelist.

## ⚠️ Important Notes

- **Breaking Change:** Email/password authentication has been removed
- **Access Control:** Blog admin now requires whitelist approval
- **Database Changes:** New tables and columns will be added
- **Downtime:** Brief restart required after migration

## Pre-Migration

### 1. Backup Everything

- [ ] Backup database:
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] Backup `.env.local` file:
  ```bash
  cp .env.local .env.local.backup
  ```

- [ ] Commit all current changes to git:
  ```bash
  git add .
  git commit -m "Pre-migration backup"
  git push
  ```

### 2. Document Current State

- [ ] List all current blog admins (if any):
  ```sql
  SELECT id, email, name FROM "blog-users";
  ```

- [ ] List all current authenticated users:
  ```sql
  SELECT id, email, name, discord_id FROM "user";
  ```

- [ ] Save this information for reference

### 3. Get Discord User IDs

For each person who needs blog admin access:

- [ ] Have them enable Developer Mode in Discord (Settings → Advanced)
- [ ] Have them copy their User ID (right-click profile → Copy User ID)
- [ ] Create a list of Discord IDs for the whitelist

Example format:
```
Admin 1: 123456789012345678 (admin@example.com)
Admin 2: 987654321098765432 (editor@example.com)
```

## Migration Steps

### 4. Pull Latest Code

- [ ] Pull the latest changes:
  ```bash
  git pull origin main
  ```

- [ ] Review changes:
  ```bash
  git log --oneline -10
  git diff HEAD~5 HEAD
  ```

### 5. Install Dependencies

- [ ] Update dependencies:
  ```bash
  pnpm install
  ```

- [ ] Verify installation:
  ```bash
  pnpm list better-auth
  pnpm list @payloadcms/next
  ```

### 6. Update Environment Variables

- [ ] Add `BLOG_ADMIN_WHITELIST` to `.env.local`:
  ```env
  # Add all Discord user IDs (comma-separated, NO SPACES)
  BLOG_ADMIN_WHITELIST=123456789012345678,987654321098765432
  ```

- [ ] Verify all required variables exist:
  ```bash
  # Check for required vars
  grep -E "DISCORD_CLIENT_ID|DISCORD_CLIENT_SECRET|PAYLOAD_SECRET|DATABASE_URL" .env.local
  ```

- [ ] Generate new secrets if missing:
  ```bash
  # BETTER_AUTH_SECRET
  openssl rand -base64 32
  
  # PAYLOAD_SECRET (if needed)
  openssl rand -hex 32
  ```

### 7. Run Database Migration

- [ ] Review migration file:
  ```bash
  cat database/migrations/001_add_blog_admin_whitelist.sql
  ```

- [ ] Test migration on development/staging first:
  ```bash
  # Development database
  psql $DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql
  ```

- [ ] Check for errors in output

- [ ] Verify tables were created:
  ```sql
  \d "user"  -- Should show is_blog_admin column
  \d "blog_admin_whitelist"  -- Should show table structure
  ```

### 8. Verify Database Changes

- [ ] Check user table has new column:
  ```sql
  SELECT column_name, data_type, column_default
  FROM information_schema.columns
  WHERE table_name = 'user' AND column_name = 'is_blog_admin';
  ```

- [ ] Check whitelist table exists:
  ```sql
  SELECT COUNT(*) FROM blog_admin_whitelist;
  ```

- [ ] Check indexes were created:
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename IN ('user', 'blog_admin_whitelist');
  ```

### 9. Optional: Pre-populate Whitelist in Database

Instead of using environment variable, you can add users to the database:

- [ ] Insert initial admins:
  ```sql
  INSERT INTO blog_admin_whitelist (discord_id, added_by, notes)
  VALUES 
    ('123456789012345678', 'migration', 'Primary admin - migrated'),
    ('987654321098765432', 'migration', 'Secondary admin - migrated')
  ON CONFLICT (discord_id) DO NOTHING;
  ```

- [ ] Verify entries:
  ```sql
  SELECT * FROM blog_admin_whitelist;
  ```

## Testing

### 10. Test in Development

- [ ] Start development server:
  ```bash
  pnpm dev
  ```

- [ ] Test authentication flow:
  - [ ] Visit http://localhost:3000
  - [ ] Click sign in (should redirect to Discord)
  - [ ] Complete Discord OAuth
  - [ ] Verify you're signed in

- [ ] Check user record in database:
  ```sql
  SELECT discord_id, email, name, is_blog_admin 
  FROM "user" 
  WHERE email = 'your@email.com';
  ```

- [ ] Test blog admin access:
  - [ ] Visit http://localhost:3000/blog-admin
  - [ ] If whitelisted: Should see Payload admin
  - [ ] If NOT whitelisted: Should see error page with your Discord ID

- [ ] If you see error page:
  - [ ] Copy Discord ID from error page
  - [ ] Add to `BLOG_ADMIN_WHITELIST` in `.env.local`
  - [ ] Restart server
  - [ ] Try again

### 11. Verify API Endpoints

- [ ] Test blog admin auth endpoint:
  ```bash
  curl http://localhost:3000/api/blog-admin-auth
  ```

- [ ] Should return your access status

- [ ] Test better-auth endpoints:
  ```bash
  curl http://localhost:3000/api/auth/session
  ```

### 12. Test Non-Whitelisted User

If possible, have a non-admin user test:

- [ ] Sign in with Discord
- [ ] Try to access /blog-admin
- [ ] Should see "Access Denied" error
- [ ] Error should display their Discord ID

## Production Deployment

### 13. Pre-Deployment Checklist

- [ ] All development tests passed
- [ ] Database migration tested on staging
- [ ] Environment variables documented
- [ ] Discord OAuth redirect URIs updated for production
- [ ] Deployment plan reviewed

### 14. Update Production Environment Variables

In Vercel/Netlify/your host:

- [ ] Add `BLOG_ADMIN_WHITELIST` with production Discord IDs
- [ ] Verify all other variables are set:
  - [ ] `DISCORD_CLIENT_ID` (production Discord app)
  - [ ] `DISCORD_CLIENT_SECRET` (production Discord app)
  - [ ] `PAYLOAD_SECRET`
  - [ ] `BETTER_AUTH_SECRET`
  - [ ] `DATABASE_URL` (production database)
  - [ ] `NEXT_PUBLIC_SERVER_URL` (production domain)

### 15. Run Production Migration

- [ ] Connect to production database:
  ```bash
  psql $PRODUCTION_DATABASE_URL
  ```

- [ ] Run migration:
  ```bash
  psql $PRODUCTION_DATABASE_URL -f database/migrations/001_add_blog_admin_whitelist.sql
  ```

- [ ] Verify success (no errors)

- [ ] Check tables exist in production:
  ```sql
  \dt  -- List all tables
  ```

### 16. Deploy Application

- [ ] Deploy via git push or manual deploy:
  ```bash
  git push production main
  # or use your hosting platform's deployment method
  ```

- [ ] Monitor deployment logs

- [ ] Wait for deployment to complete

### 17. Test Production

- [ ] Visit production URL
- [ ] Test Discord OAuth flow
- [ ] Verify blog admin access works
- [ ] Check non-admin users see error properly
- [ ] Test creating a blog post

### 18. Update Discord Users

- [ ] Notify all users of authentication change
- [ ] Inform them email/password login is removed
- [ ] Instruct them to sign in with Discord

## Post-Migration

### 19. Verify Data Integrity

- [ ] Check all users migrated correctly:
  ```sql
  SELECT 
    COUNT(*) as total_users,
    COUNT(discord_id) as users_with_discord,
    COUNT(CASE WHEN is_blog_admin THEN 1 END) as blog_admins
  FROM "user";
  ```

- [ ] Verify blog posts are accessible:
  ```sql
  SELECT COUNT(*) FROM "blog-posts";
  ```

- [ ] Check sessions are working:
  ```sql
  SELECT COUNT(*) FROM "session" WHERE expires_at > NOW();
  ```

### 20. Monitor for Issues

First 24 hours:

- [ ] Monitor server logs for auth errors
- [ ] Check for failed login attempts
- [ ] Monitor database for connection issues
- [ ] Track user feedback

### 21. Clean Up

After 1 week of successful operation:

- [ ] Remove old backup files (keep at least one)
- [ ] Archive migration documentation
- [ ] Update team documentation with new process

## Rollback Plan (If Needed)

### Emergency Rollback

If critical issues arise:

1. **Revert code:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Restore database (if needed):**
   ```bash
   # Stop application
   # Restore backup
   psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
   ```

3. **Revert environment variables:**
   ```bash
   # Remove BLOG_ADMIN_WHITELIST
   # Restore previous .env.local from backup
   ```

4. **Restart application**

5. **Notify users of temporary rollback**

### Partial Rollback (Keep structure, re-enable old auth)

If you want to keep the new tables but re-enable email/password:

1. In `auth.ts`, change:
   ```typescript
   emailAndPassword: {
     enabled: true,  // Change back to true
   }
   ```

2. Redeploy

3. Both auth methods will work simultaneously

## Success Criteria

Migration is successful when:

- [x] All whitelisted users can access blog admin
- [x] Non-whitelisted users see proper error messages
- [x] Discord OAuth works for all users
- [x] Email/password login is disabled
- [x] Database migration completed without errors
- [x] No data loss occurred
- [x] All blog posts are accessible
- [x] Production site is stable

## Support

If you encounter issues:

1. **Check documentation:**
   - DISCORD_BLOG_ADMIN_SETUP.md
   - QUICKSTART_BLOG_ADMIN.md
   - CHANGES_SUMMARY.md

2. **Review logs:**
   ```bash
   # Server logs
   pnpm dev
   
   # Database logs
   psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
   ```

3. **Common issues:**
   - "Access Denied" → Check Discord ID is in whitelist
   - "Cannot connect" → Verify DATABASE_URL
   - "Invalid redirect" → Check Discord OAuth settings
   - Environment variable not loaded → Restart server

4. **Get help:**
   - Check GitHub issues
   - Contact team lead
   - Review error logs

## Checklist Summary

```
Pre-Migration:     [ ] Backup [ ] Document [ ] Get Discord IDs
Migration:         [ ] Pull code [ ] Install deps [ ] Update env [ ] Run migration
Testing:           [ ] Dev test [ ] API test [ ] User test
Production:        [ ] Pre-deploy [ ] Update vars [ ] Deploy [ ] Test prod
Post-Migration:    [ ] Verify data [ ] Monitor [ ] Clean up
```

**Total Time Estimate:** 1-2 hours for small installations, 3-4 hours for larger deployments

---

**Last Updated:** 2024
**Migration Version:** 1.0.0
**Database Schema Version:** 001