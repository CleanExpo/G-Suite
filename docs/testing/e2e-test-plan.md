# End-to-End Testing Plan
## CCW-ERP/CRM System - Modules UNI-171 to UNI-175

**Created:** 2026-01-28
**Status:** In Progress
**Scope:** Integration testing across all 5 core business modules

---

## Executive Summary

This document outlines the comprehensive end-to-end testing strategy for the CCW-ERP/CRM system. The goal is to verify that all modules work together seamlessly and data flows correctly across the entire system.

---

## Test Environment

- **Database:** PostgreSQL with Supabase
- **Auth:** Clerk authentication
- **Framework:** Next.js 16.1.3 with React 19.2.3
- **Build Tool:** Turbopack
- **Test Data:** Will use realistic test scenarios

---

## Module Status

| Module | Code | Status | Backend API | Dashboard UI |
|--------|------|--------|-------------|--------------|
| Core CRM | UNI-171 | ✅ Complete | ✅ | ✅ |
| Inventory | UNI-172 | ✅ Complete | ✅ | ✅ |
| Invoicing | UNI-173 | ✅ Complete | ✅ | ✅ |
| Workflows | UNI-174 | ✅ Complete | ✅ | ✅ |
| Reporting | UNI-175 | ✅ Complete | ✅ | ✅ |

---

## Test Scenarios

### Scenario 1: Complete Sales Cycle (CRM → Invoice → Payment)

**Test Flow:**
1. Create Contact in CRM
2. Create Company and link Contact
3. Create Deal and move through pipeline stages
4. Convert won Deal to Invoice
5. Add Invoice line items
6. Send Invoice to customer
7. Record Payment
8. Verify Invoice status updates to "paid"
9. Check CRM timeline reflects invoice creation
10. Verify Reporting dashboard shows new revenue

**Expected Results:**
- ✅ Contact and Company properly linked
- ✅ Deal progresses through stages
- ✅ Invoice generated with correct customer info
- ✅ Payment recorded and reconciled
- ✅ All financial totals calculate correctly
- ✅ Timeline in CRM shows all interactions

**APIs to Test:**
- POST /api/crm/contacts
- POST /api/crm/companies
- POST /api/crm/deals
- PATCH /api/crm/deals/[id] (stage progression)
- POST /api/invoices
- POST /api/invoices/[id]/payments
- GET /api/stats/crm
- GET /api/stats/invoices

---

### Scenario 2: Inventory → Invoice Flow (Product Sales)

**Test Flow:**
1. Create Product in Inventory
2. Create Warehouse location
3. Adjust stock levels (add inventory)
4. Create Invoice with Product as line item
5. Verify stock levels decrement automatically
6. Check inventory transaction history
7. Verify low stock alerts trigger if applicable
8. Check Reporting for inventory turnover metrics

**Expected Results:**
- ✅ Product created with correct pricing
- ✅ Stock levels tracked accurately
- ✅ Invoice line items link to Products
- ✅ Stock decrements on invoice creation (if configured)
- ✅ Transaction history records all movements
- ✅ Alerts trigger at reorder points
- ✅ Reports show inventory metrics

**APIs to Test:**
- POST /api/inventory/items
- POST /api/inventory/warehouses
- POST /api/inventory/stock/adjust
- POST /api/invoices (with product line items)
- GET /api/inventory/transactions/history
- GET /api/inventory/stock/alerts
- GET /api/stats/inventory

---

### Scenario 3: Workflow Automation (Invoice Approval)

**Test Flow:**
1. Create Workflow Template for "Invoice Approval"
2. Set trigger event as "invoice.created"
3. Configure approval steps (Manager → Director → Finance)
4. Activate template
5. Create high-value Invoice
6. Verify workflow instance created automatically
7. Test approval at each step
8. Test rejection scenario
9. Check SLA deadline tracking
10. Verify notifications sent (if configured)

**Expected Results:**
- ✅ Template created with multiple steps
- ✅ Workflow instance triggers on invoice creation
- ✅ Approval progresses through each step
- ✅ Rejection stops workflow appropriately
- ✅ SLA deadlines calculated correctly
- ✅ Overdue workflows highlighted
- ✅ Comments captured at each approval

**APIs to Test:**
- POST /api/workflows/templates
- POST /api/workflows/templates/[id]/toggle
- POST /api/invoices (triggers workflow)
- GET /api/workflows/instances
- POST /api/workflows/instances/[id]/approve
- GET /api/workflows/notifications

---

### Scenario 4: Cross-Module Reporting

**Test Flow:**
1. Create sample data across all modules:
   - 10 Contacts, 5 Companies, 8 Deals
   - 15 Products, 3 Warehouses, 50 stock transactions
   - 20 Invoices with varying statuses
   - 5 Workflow instances
2. Create Dashboard with KPIs from multiple sources
3. Create Report combining CRM + Invoice data
4. Test KPI calculations (revenue, inventory value, deal conversion)
5. Test date range filtering
6. Export report to PDF
7. Verify data accuracy against database

**Expected Results:**
- ✅ Dashboard loads with correct KPI values
- ✅ Reports query multiple modules successfully
- ✅ Date filters work correctly
- ✅ Calculations match expected values
- ✅ Export formats correctly (PDF, Excel)
- ✅ Scheduled reports can be configured
- ✅ No performance issues with complex queries

**APIs to Test:**
- POST /api/reports
- POST /api/reports/[id]/run
- GET /api/reports/[id]/export
- POST /api/kpis/[id]/calculate
- GET /api/stats/crm
- GET /api/stats/inventory
- GET /api/stats/invoices

---

### Scenario 5: Data Consistency & Integrity

**Test Flow:**
1. Create related records across modules
2. Update parent record (e.g., Company name)
3. Verify child records reflect changes (e.g., Invoices show new name)
4. Test soft delete on Contact with existing Invoices
5. Verify deleted records don't appear in lists
6. Test cascade behavior on relationships
7. Check multi-tenant isolation (userId filtering)
8. Verify audit timestamps (createdAt, updatedAt)

**Expected Results:**
- ✅ Related records maintain referential integrity
- ✅ Updates propagate where appropriate
- ✅ Soft deletes work correctly (deletedAt set)
- ✅ Cascade rules respected
- ✅ No data leaks between tenants
- ✅ Audit fields updated automatically
- ✅ Historical data preserved (e.g., invoice snapshot)

**APIs to Test:**
- PATCH /api/crm/companies/[id]
- DELETE /api/crm/contacts/[id]
- GET /api/invoices?customerId=[id]
- Verify userId filtering on all endpoints

---

## API Endpoint Testing

### Authentication Testing
- ✅ All endpoints require Clerk authentication
- ✅ Unauthorized requests return 401
- ✅ Invalid tokens rejected
- ✅ userId extracted correctly from auth()

### Error Handling
- ✅ 400 for invalid input (validation errors)
- ✅ 404 for non-existent resources
- ✅ 403 for unauthorized access (wrong userId)
- ✅ 500 handled gracefully with error messages
- ✅ Consistent error response format

### Response Format Consistency
All endpoints should return:
```json
{
  "success": true/false,
  "data": { ... } or "error": { ... },
  "meta": {
    "version": "1.0",
    "timestamp": "ISO-8601"
  }
}
```

### Pagination Testing
- ✅ Page and limit parameters work
- ✅ Total count returned in metadata
- ✅ Consistent pagination across modules

---

## Dashboard UI Testing

### Navigation Flow
- ✅ All dashboard routes accessible
- ✅ Breadcrumbs work correctly
- ✅ Back buttons navigate properly
- ✅ Deep linking works for detail pages

### Design System Consistency
All pages should follow tactical design:
- ✅ Cards: `rounded-[2.5rem]`
- ✅ Backgrounds: `bg-white dark:bg-[#161b22]`
- ✅ Borders: `border-gray-200 dark:border-white/10`
- ✅ Headers: `font-black italic uppercase tracking-tighter`
- ✅ Icons: Lucide React icons
- ✅ Dark mode support throughout

### Form Testing
- ✅ All forms have validation
- ✅ Error messages display correctly
- ✅ Loading states show during submission
- ✅ Success messages or redirects work
- ✅ Cancel buttons work
- ✅ Required fields marked

### Search & Filtering
- ✅ Search works on all list pages
- ✅ Filters apply correctly
- ✅ Clear filters button works
- ✅ Multiple filters can be combined

### Status Badges
- ✅ Consistent colors across modules
- ✅ Icons match status types
- ✅ Dark mode variants work

---

## Performance Testing

### API Response Times
Target: < 200ms for single record, < 500ms for lists
- ✅ GET single record endpoints
- ✅ GET list endpoints (with pagination)
- ✅ POST/PATCH operations
- ✅ Complex reports and KPIs

### Database Query Optimization
- ✅ Indexes used for common queries
- ✅ N+1 query problems avoided
- ✅ Eager loading where appropriate
- ✅ Pagination limits large result sets

### Frontend Performance
- ✅ Initial page load < 2s
- ✅ No layout shifts (CLS)
- ✅ Images optimized
- ✅ Bundle size reasonable

---

## Security Testing

### Data Isolation
- ✅ Users can only access their own data
- ✅ userId checks on all mutations
- ✅ No data leaks in error messages

### Input Validation
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection
- ✅ Rate limiting on sensitive endpoints

### Stripe Integration
- ✅ Webhook signature verification
- ✅ Payment intent creation secure
- ✅ No sensitive data in client
- ✅ Test mode keys used appropriately

---

## Build & Deployment Testing

### TypeScript Compilation
```bash
npx tsc --noEmit
```
Expected: 0 errors

### Next.js Build
```bash
npm run build
```
Expected: All pages generate successfully

### Production Build Size
- ✅ Bundle size acceptable
- ✅ No excessive dependencies
- ✅ Tree-shaking working

---

## Test Results Template

### Test Execution Log

| Date | Scenario | Status | Issues Found | Notes |
|------|----------|--------|--------------|-------|
| 2026-01-28 | Scenario 1 | ⏳ Pending | - | - |
| 2026-01-28 | Scenario 2 | ⏳ Pending | - | - |
| 2026-01-28 | Scenario 3 | ⏳ Pending | - | - |
| 2026-01-28 | Scenario 4 | ⏳ Pending | - | - |
| 2026-01-28 | Scenario 5 | ⏳ Pending | - | - |

### Bugs & Issues Log

| ID | Module | Severity | Description | Status | Fix Commit |
|----|--------|----------|-------------|--------|------------|
| - | - | - | - | - | - |

**Severity Levels:**
- 🔴 Critical: Blocks core functionality
- 🟠 High: Major feature broken
- 🟡 Medium: Minor feature issue
- 🟢 Low: UI/UX improvement

---

## Test Data Requirements

### Sample Data to Create

**CRM Module:**
- 10 Contacts (mix of lead, prospect, customer)
- 5 Companies (various industries)
- 8 Deals (across all pipeline stages)
- 15 Interactions (calls, emails, meetings)
- 10 Tasks (mix of open/completed)

**Inventory Module:**
- 15 Products (various categories)
- 3 Warehouses (different locations)
- 50 Stock transactions (in, out, transfer, adjust)
- 5 Low-stock scenarios

**Invoicing Module:**
- 20 Invoices (draft, sent, paid, overdue, cancelled)
- 10 Payments (various methods)
- Mix of partial and full payments

**Workflow Module:**
- 3 Templates (approval, notification, automation)
- 5 Active instances (various stages)
- 2 Completed workflows
- 1 Overdue workflow

**Reporting Module:**
- 2 Dashboards
- 5 Reports (cross-module)
- 8 KPIs (revenue, inventory, conversion)

---

## Success Criteria

### Overall System Health
- ✅ All 5 modules operational
- ✅ No critical bugs blocking usage
- ✅ Data flows correctly between modules
- ✅ Performance meets targets
- ✅ Security best practices followed
- ✅ UI/UX consistent and professional

### Module Integration
- ✅ CRM → Invoice conversion works
- ✅ Inventory → Invoice line items work
- ✅ Workflow automation triggers correctly
- ✅ Reporting aggregates all data sources
- ✅ No orphaned records or broken relationships

### Production Readiness
- ✅ TypeScript compiles with 0 errors
- ✅ Next.js build succeeds
- ✅ All routes accessible
- ✅ Authentication working
- ✅ Database migrations applied

---

## Next Steps After Testing

1. **Bug Fixes**: Address all critical and high-severity issues
2. **Performance Optimization**: Improve slow queries and endpoints
3. **Documentation**: Update API docs with findings
4. **User Acceptance Testing**: Have stakeholders test workflows
5. **Phase 6 Continuation**: Proceed with integrations (Email, Accounting)

---

**Test Plan Version:** 1.0
**Last Updated:** 2026-01-28
