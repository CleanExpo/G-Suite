# CCW-ERP/CRM Project Structure

## Document Overview

**Purpose:** Define the complete file organization and project structure for the CCW-ERP/CRM system
**Related:** UNI-170, UNI-171, UNI-172, UNI-173, UNI-174, UNI-175
**Last Updated:** 2026-01-27

---

## Complete Directory Structure

```
G-Pilot/
├── prisma/
│   ├── schema.prisma                          (Updated with ERP/CRM models)
│   └── migrations/
│       └── YYYYMMDDHHMMSS_add_erp_crm_models/
│           └── migration.sql
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── crm/                           (UNI-171: Core CRM)
│   │   │   │   ├── contacts/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   ├── import/route.ts        (POST - CSV import)
│   │   │   │   │   ├── export/route.ts        (GET - CSV export)
│   │   │   │   │   └── merge/route.ts         (POST - Merge duplicates)
│   │   │   │   ├── companies/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   └── hierarchy/route.ts     (GET - Company tree)
│   │   │   │   ├── deals/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   ├── pipeline/route.ts      (GET - Pipeline view)
│   │   │   │   │   └── forecast/route.ts      (GET - Sales forecast)
│   │   │   │   ├── interactions/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   └── timeline/route.ts      (GET - Activity timeline)
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   └── my-tasks/route.ts      (GET - Assigned to user)
│   │   │   │   └── analytics/
│   │   │   │       ├── pipeline-metrics/route.ts
│   │   │   │       ├── conversion-rates/route.ts
│   │   │   │       └── win-loss-analysis/route.ts
│   │   │   │
│   │   │   ├── inventory/                     (UNI-172: Inventory)
│   │   │   │   ├── products/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   ├── variants/route.ts      (GET, POST - Product variants)
│   │   │   │   │   ├── import/route.ts        (POST - CSV import)
│   │   │   │   │   └── barcode/route.ts       (GET - Generate barcodes)
│   │   │   │   ├── warehouses/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   └── stock-levels/route.ts  (GET - Current stock by warehouse)
│   │   │   │   ├── stock-locations/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── product/[productId]/route.ts
│   │   │   │   │   ├── transfer/route.ts      (POST - Transfer stock)
│   │   │   │   │   └── allocate/route.ts      (POST - Allocate stock to order)
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET)
│   │   │   │   │   ├── receive/route.ts       (POST - Stock in)
│   │   │   │   │   ├── fulfill/route.ts       (POST - Stock out)
│   │   │   │   │   └── adjust/route.ts        (POST - Stock adjustment)
│   │   │   │   ├── low-stock/route.ts         (GET - Low stock alerts)
│   │   │   │   ├── reorder/route.ts           (POST - Generate purchase order)
│   │   │   │   └── valuation/route.ts         (GET - Inventory valuation report)
│   │   │   │
│   │   │   ├── invoices/                      (UNI-173: Invoicing)
│   │   │   │   ├── route.ts                   (GET, POST)
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts               (GET, PATCH, DELETE)
│   │   │   │   │   ├── send/route.ts          (POST - Send invoice email)
│   │   │   │   │   ├── pdf/route.ts           (GET - Generate PDF)
│   │   │   │   │   ├── payment-link/route.ts  (POST - Create Stripe link)
│   │   │   │   │   └── convert-to-invoice/route.ts (POST - Convert quote)
│   │   │   │   ├── payments/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET)
│   │   │   │   │   └── webhook/route.ts       (POST - Stripe webhook)
│   │   │   │   ├── quotes/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   └── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   ├── recurring/
│   │   │   │   │   ├── route.ts               (GET, POST - Recurring invoices)
│   │   │   │   │   └── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   └── reports/
│   │   │   │       ├── ar-aging/route.ts      (GET - AR aging report)
│   │   │   │       ├── revenue/route.ts       (GET - Revenue report)
│   │   │   │       └── tax-summary/route.ts   (GET - Tax report)
│   │   │   │
│   │   │   ├── workflows/                     (UNI-174: Workflow)
│   │   │   │   ├── templates/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   └── clone/route.ts         (POST - Clone template)
│   │   │   │   ├── instances/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── route.ts           (GET)
│   │   │   │   │   │   ├── approve/route.ts   (POST)
│   │   │   │   │   │   ├── reject/route.ts    (POST)
│   │   │   │   │   │   ├── cancel/route.ts    (POST)
│   │   │   │   │   │   └── delegate/route.ts  (POST)
│   │   │   │   │   ├── pending/route.ts       (GET - User's pending approvals)
│   │   │   │   │   └── overdue/route.ts       (GET - Overdue workflows)
│   │   │   │   └── notifications/
│   │   │   │       ├── route.ts               (GET, POST)
│   │   │   │       ├── [id]/route.ts          (GET)
│   │   │   │       └── mark-read/route.ts     (POST)
│   │   │   │
│   │   │   ├── reports/                       (UNI-175: Reporting)
│   │   │   │   ├── dashboards/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   └── default/route.ts       (GET - User's default)
│   │   │   │   ├── custom-reports/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── route.ts           (GET, PATCH, DELETE)
│   │   │   │   │   │   ├── run/route.ts       (POST - Execute report)
│   │   │   │   │   │   ├── export/route.ts    (GET - Export to Excel/PDF)
│   │   │   │   │   │   └── schedule/route.ts  (POST - Schedule delivery)
│   │   │   │   │   └── builder/route.ts       (POST - Query builder)
│   │   │   │   ├── kpis/
│   │   │   │   │   ├── route.ts               (GET, POST)
│   │   │   │   │   ├── [id]/route.ts          (GET, PATCH, DELETE)
│   │   │   │   │   └── calculate/route.ts     (POST - Recalculate KPIs)
│   │   │   │   └── analytics/
│   │   │   │       ├── sales-forecast/route.ts
│   │   │   │       ├── inventory-turnover/route.ts
│   │   │   │       └── customer-lifetime-value/route.ts
│   │   │   │
│   │   │   └── integrations/                  (External Integrations)
│   │   │       ├── email/
│   │   │       │   ├── gmail/
│   │   │       │   │   ├── auth/route.ts      (OAuth callback)
│   │   │       │   │   ├── sync/route.ts      (POST - Sync emails)
│   │   │       │   │   └── send/route.ts      (POST - Send email)
│   │   │       │   └── outlook/
│   │   │       │       └── ...                (Similar structure)
│   │   │       ├── calendar/
│   │   │       │   ├── google/route.ts
│   │   │       │   └── outlook/route.ts
│   │   │       ├── accounting/
│   │   │       │   ├── quickbooks/
│   │   │       │   │   ├── auth/route.ts
│   │   │       │   │   └── sync/route.ts
│   │   │       │   └── xero/
│   │   │       │       └── ...
│   │   │       └── payment/
│   │   │           ├── stripe/
│   │   │           │   ├── webhook/route.ts
│   │   │           │   └── payment-intent/route.ts
│   │   │           └── paypal/
│   │   │               └── ...
│   │   │
│   │   ├── dashboard/                         (UI Pages)
│   │   │   ├── crm/
│   │   │   │   ├── page.tsx                   (CRM Overview)
│   │   │   │   ├── contacts/
│   │   │   │   │   ├── page.tsx               (Contact list)
│   │   │   │   │   ├── [id]/page.tsx          (Contact detail)
│   │   │   │   │   ├── new/page.tsx           (Create contact)
│   │   │   │   │   └── import/page.tsx        (CSV import)
│   │   │   │   ├── companies/
│   │   │   │   │   ├── page.tsx               (Company list)
│   │   │   │   │   ├── [id]/page.tsx          (Company detail)
│   │   │   │   │   └── new/page.tsx           (Create company)
│   │   │   │   ├── deals/
│   │   │   │   │   ├── page.tsx               (Pipeline kanban view)
│   │   │   │   │   ├── [id]/page.tsx          (Deal detail)
│   │   │   │   │   ├── new/page.tsx           (Create deal)
│   │   │   │   │   └── forecast/page.tsx      (Sales forecast)
│   │   │   │   └── tasks/
│   │   │   │       ├── page.tsx               (Task list)
│   │   │   │       └── [id]/page.tsx          (Task detail)
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx                   (Inventory overview)
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx               (Product catalog)
│   │   │   │   │   ├── [id]/page.tsx          (Product detail)
│   │   │   │   │   ├── new/page.tsx           (Create product)
│   │   │   │   │   └── import/page.tsx        (CSV import)
│   │   │   │   ├── warehouses/
│   │   │   │   │   ├── page.tsx               (Warehouse list)
│   │   │   │   │   ├── [id]/page.tsx          (Warehouse detail + stock)
│   │   │   │   │   └── new/page.tsx           (Create warehouse)
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── page.tsx               (Transaction log)
│   │   │   │   │   ├── receive/page.tsx       (Receive stock)
│   │   │   │   │   ├── fulfill/page.tsx       (Fulfill order)
│   │   │   │   │   ├── transfer/page.tsx      (Transfer stock)
│   │   │   │   │   └── adjust/page.tsx        (Adjust stock)
│   │   │   │   └── alerts/
│   │   │   │       └── page.tsx               (Low stock alerts)
│   │   │   │
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx                   (Invoice list)
│   │   │   │   ├── [id]/page.tsx              (Invoice detail)
│   │   │   │   ├── new/page.tsx               (Create invoice)
│   │   │   │   ├── quotes/
│   │   │   │   │   ├── page.tsx               (Quote list)
│   │   │   │   │   ├── [id]/page.tsx          (Quote detail)
│   │   │   │   │   └── new/page.tsx           (Create quote)
│   │   │   │   ├── payments/
│   │   │   │   │   ├── page.tsx               (Payment list)
│   │   │   │   │   └── record/page.tsx        (Record manual payment)
│   │   │   │   ├── recurring/
│   │   │   │   │   └── page.tsx               (Recurring invoices)
│   │   │   │   └── reports/
│   │   │   │       ├── ar-aging/page.tsx
│   │   │   │       ├── revenue/page.tsx
│   │   │   │       └── tax/page.tsx
│   │   │   │
│   │   │   ├── workflows/
│   │   │   │   ├── page.tsx                   (Workflow overview)
│   │   │   │   ├── templates/
│   │   │   │   │   ├── page.tsx               (Template list)
│   │   │   │   │   ├── [id]/page.tsx          (Template detail)
│   │   │   │   │   └── new/page.tsx           (Create template)
│   │   │   │   ├── approvals/
│   │   │   │   │   ├── page.tsx               (Pending approvals)
│   │   │   │   │   └── [id]/page.tsx          (Approval detail)
│   │   │   │   └── history/
│   │   │   │       └── page.tsx               (Workflow history)
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx                   (Reporting overview)
│   │   │   │   ├── dashboards/
│   │   │   │   │   ├── page.tsx               (Dashboard list)
│   │   │   │   │   ├── [id]/page.tsx          (Dashboard view)
│   │   │   │   │   └── new/page.tsx           (Create dashboard)
│   │   │   │   ├── custom/
│   │   │   │   │   ├── page.tsx               (Report list)
│   │   │   │   │   ├── [id]/page.tsx          (Report view)
│   │   │   │   │   └── builder/page.tsx       (Report builder)
│   │   │   │   └── analytics/
│   │   │   │       ├── sales/page.tsx
│   │   │   │       ├── inventory/page.tsx
│   │   │   │       └── financial/page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── erp/
│   │   │       │   ├── page.tsx               (ERP settings)
│   │   │       │   ├── roles/page.tsx         (Role management)
│   │   │       │   ├── permissions/page.tsx   (Permission matrix)
│   │   │       │   └── integrations/page.tsx  (Integration configs)
│   │   │       └── ...
│   │   │
│   │   └── (existing files remain)
│   │
│   ├── lib/
│   │   ├── crm/                               (CRM Business Logic)
│   │   │   ├── services/
│   │   │   │   ├── contact-service.ts         (CRUD operations)
│   │   │   │   ├── company-service.ts
│   │   │   │   ├── deal-service.ts
│   │   │   │   ├── interaction-service.ts
│   │   │   │   ├── task-service.ts
│   │   │   │   ├── duplicate-detection.ts     (Fuzzy matching)
│   │   │   │   ├── lead-scoring.ts            (Lead score calculation)
│   │   │   │   └── email-sync-service.ts      (Email integration)
│   │   │   ├── utils/
│   │   │   │   ├── csv-import.ts
│   │   │   │   ├── csv-export.ts
│   │   │   │   └── pipeline-calculator.ts     (Forecast calculations)
│   │   │   ├── types.ts                       (TypeScript types)
│   │   │   └── validation.ts                  (Zod schemas)
│   │   │
│   │   ├── inventory/                         (Inventory Business Logic)
│   │   │   ├── services/
│   │   │   │   ├── product-service.ts
│   │   │   │   ├── warehouse-service.ts
│   │   │   │   ├── stock-location-service.ts
│   │   │   │   ├── inventory-transaction-service.ts
│   │   │   │   ├── reorder-service.ts         (Auto-reorder logic)
│   │   │   │   ├── valuation-service.ts       (FIFO/LIFO/Weighted avg)
│   │   │   │   └── barcode-generator.ts
│   │   │   ├── utils/
│   │   │   │   ├── stock-calculator.ts        (Available qty calculation)
│   │   │   │   └── low-stock-detector.ts
│   │   │   ├── types.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── invoice/                           (Invoicing Business Logic)
│   │   │   ├── services/
│   │   │   │   ├── invoice-service.ts
│   │   │   │   ├── quote-service.ts
│   │   │   │   ├── payment-service.ts
│   │   │   │   ├── recurring-invoice-service.ts
│   │   │   │   ├── pdf-generator.ts           (Invoice PDF generation)
│   │   │   │   ├── payment-gateway-service.ts (Stripe integration)
│   │   │   │   └── ar-aging-calculator.ts
│   │   │   ├── templates/
│   │   │   │   ├── invoice-template-default.tsx
│   │   │   │   ├── invoice-template-modern.tsx
│   │   │   │   └── invoice-template-minimal.tsx
│   │   │   ├── utils/
│   │   │   │   ├── invoice-number-generator.ts
│   │   │   │   ├── tax-calculator.ts
│   │   │   │   └── currency-converter.ts
│   │   │   ├── types.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── workflow/                          (Workflow Engine)
│   │   │   ├── engine/
│   │   │   │   ├── workflow-engine.ts         (Core workflow execution)
│   │   │   │   ├── step-executor.ts           (Execute individual steps)
│   │   │   │   ├── condition-evaluator.ts     (Evaluate branching logic)
│   │   │   │   └── sla-tracker.ts             (SLA monitoring)
│   │   │   ├── services/
│   │   │   │   ├── workflow-template-service.ts
│   │   │   │   ├── workflow-instance-service.ts
│   │   │   │   ├── approval-service.ts
│   │   │   │   ├── notification-service.ts
│   │   │   │   └── escalation-service.ts
│   │   │   ├── actions/
│   │   │   │   ├── email-action.ts            (Send email action)
│   │   │   │   ├── webhook-action.ts          (Trigger webhook)
│   │   │   │   ├── task-action.ts             (Create task)
│   │   │   │   └── status-update-action.ts    (Update entity status)
│   │   │   ├── types.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── reporting/                         (Reporting Engine)
│   │   │   ├── services/
│   │   │   │   ├── dashboard-service.ts
│   │   │   │   ├── report-service.ts
│   │   │   │   ├── kpi-service.ts
│   │   │   │   ├── query-builder.ts           (Dynamic query generation)
│   │   │   │   └── export-service.ts          (Excel/PDF export)
│   │   │   ├── calculators/
│   │   │   │   ├── sales-forecast.ts
│   │   │   │   ├── customer-lifetime-value.ts
│   │   │   │   ├── inventory-turnover.ts
│   │   │   │   └── churn-rate.ts
│   │   │   ├── templates/
│   │   │   │   ├── dashboard-templates.ts     (Pre-built dashboards)
│   │   │   │   └── kpi-definitions.ts         (Standard KPIs)
│   │   │   ├── types.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── integrations/                      (External Integrations)
│   │   │   ├── email/
│   │   │   │   ├── gmail-client.ts
│   │   │   │   └── outlook-client.ts
│   │   │   ├── calendar/
│   │   │   │   ├── google-calendar-client.ts
│   │   │   │   └── outlook-calendar-client.ts
│   │   │   ├── accounting/
│   │   │   │   ├── quickbooks-client.ts
│   │   │   │   └── xero-client.ts
│   │   │   └── payment/
│   │   │       ├── stripe-client.ts
│   │   │       └── paypal-client.ts
│   │   │
│   │   ├── shared/                            (Shared Utilities)
│   │   │   ├── multi-tenant.ts                (Tenant isolation middleware)
│   │   │   ├── permissions.ts                 (RBAC helpers)
│   │   │   ├── audit-logger.ts                (Audit trail)
│   │   │   ├── pagination.ts                  (Cursor pagination)
│   │   │   ├── search.ts                      (Full-text search)
│   │   │   └── file-upload.ts                 (S3/R2 upload)
│   │   │
│   │   └── (existing files remain)
│   │
│   └── components/
│       ├── crm/
│       │   ├── ContactCard.tsx
│       │   ├── ContactList.tsx
│       │   ├── ContactForm.tsx
│       │   ├── CompanyCard.tsx
│       │   ├── DealCard.tsx
│       │   ├── DealPipeline.tsx               (Kanban view)
│       │   ├── ActivityTimeline.tsx
│       │   ├── InteractionForm.tsx
│       │   └── TaskList.tsx
│       │
│       ├── inventory/
│       │   ├── ProductCard.tsx
│       │   ├── ProductList.tsx
│       │   ├── ProductForm.tsx
│       │   ├── StockLevelIndicator.tsx
│       │   ├── WarehouseCard.tsx
│       │   ├── TransactionLog.tsx
│       │   └── LowStockAlert.tsx
│       │
│       ├── invoice/
│       │   ├── InvoiceCard.tsx
│       │   ├── InvoiceList.tsx
│       │   ├── InvoiceForm.tsx
│       │   ├── InvoicePDFPreview.tsx
│       │   ├── PaymentForm.tsx
│       │   ├── ARAgingChart.tsx
│       │   └── RevenueChart.tsx
│       │
│       ├── workflow/
│       │   ├── WorkflowTemplateCard.tsx
│       │   ├── WorkflowBuilder.tsx            (Drag-and-drop builder)
│       │   ├── ApprovalCard.tsx
│       │   ├── WorkflowTimeline.tsx
│       │   └── SLAIndicator.tsx
│       │
│       ├── reporting/
│       │   ├── DashboardGrid.tsx              (Layout engine)
│       │   ├── WidgetCard.tsx
│       │   ├── ReportBuilder.tsx              (Query builder UI)
│       │   ├── KPICard.tsx
│       │   ├── SalesChart.tsx
│       │   ├── InventoryChart.tsx
│       │   └── ExportButton.tsx
│       │
│       ├── shared/
│       │   ├── DataTable.tsx                  (Reusable table)
│       │   ├── SearchBar.tsx
│       │   ├── FilterPanel.tsx
│       │   ├── DateRangePicker.tsx
│       │   ├── FileUpload.tsx
│       │   ├── RichTextEditor.tsx             (For notes/descriptions)
│       │   └── PermissionGate.tsx             (RBAC wrapper)
│       │
│       └── (existing components remain)
│
├── tests/
│   ├── unit/
│   │   ├── crm/
│   │   │   ├── contact-service.test.ts
│   │   │   ├── deal-service.test.ts
│   │   │   └── lead-scoring.test.ts
│   │   ├── inventory/
│   │   │   ├── stock-calculator.test.ts
│   │   │   └── valuation-service.test.ts
│   │   ├── invoice/
│   │   │   ├── invoice-service.test.ts
│   │   │   └── tax-calculator.test.ts
│   │   └── workflow/
│   │       ├── workflow-engine.test.ts
│   │       └── condition-evaluator.test.ts
│   │
│   ├── integration/
│   │   ├── crm/
│   │   │   └── contact-api.test.ts
│   │   ├── inventory/
│   │   │   └── stock-transaction-api.test.ts
│   │   └── invoice/
│   │       └── invoice-payment-flow.test.ts
│   │
│   └── e2e/
│       ├── crm/
│       │   ├── lead-to-customer.spec.ts
│       │   └── deal-pipeline.spec.ts
│       ├── inventory/
│       │   └── stock-fulfillment.spec.ts
│       └── invoice/
│           └── invoice-payment.spec.ts
│
├── docs/
│   ├── architecture/
│   │   ├── ccw-erp-crm.md                     ✅ (This document)
│   │   ├── business-processes.md              ✅ (Process flows)
│   │   └── project-structure.md               ✅ (This file)
│   ├── api/
│   │   ├── crm/
│   │   │   ├── contacts.md                    (API docs)
│   │   │   ├── companies.md
│   │   │   └── deals.md
│   │   ├── inventory/
│   │   │   └── ...
│   │   └── invoices/
│   │       └── ...
│   └── user-guides/
│       ├── crm-guide.md
│       ├── inventory-guide.md
│       ├── invoicing-guide.md
│       └── workflow-guide.md
│
└── (existing files remain)
```

---

## Module File Count Summary

| Module | API Routes | UI Pages | Services | Components | Tests |
|--------|-----------|----------|----------|------------|-------|
| CRM (UNI-171) | 24 | 12 | 7 | 8 | 5 |
| Inventory (UNI-172) | 18 | 13 | 7 | 7 | 4 |
| Invoicing (UNI-173) | 17 | 12 | 8 | 7 | 4 |
| Workflow (UNI-174) | 11 | 8 | 9 | 5 | 3 |
| Reporting (UNI-175) | 11 | 9 | 6 | 7 | 2 |
| Integrations | 10 | 1 | 9 | 0 | 0 |
| **TOTAL** | **91** | **55** | **46** | **34** | **18** |

**Estimated Total New Files:** ~244 files

---

## Key Organizational Principles

### 1. Domain-Driven Organization
- Each module (CRM, Inventory, Invoice, Workflow, Reporting) is self-contained
- Clear separation of concerns: API routes, services, UI, components
- Shared utilities in `lib/shared/`

### 2. Consistent Naming Conventions
- **API Routes**: Plural nouns (`/contacts`, `/products`, `/invoices`)
- **Services**: Descriptive names with `-service` suffix (`contact-service.ts`)
- **Components**: PascalCase with domain prefix (`ContactCard.tsx`, `InvoiceList.tsx`)
- **Types**: Domain-specific type files (`crm/types.ts`, `invoice/types.ts`)

### 3. Separation of Concerns
```
api/                  (HTTP handlers, validation, auth)
  └─> services/       (Business logic, database queries)
        └─> utils/    (Helper functions, calculations)
```

### 4. Component Hierarchy
```
components/
├── <domain>/         (Domain-specific components)
│   ├── *Card.tsx     (Display single entity)
│   ├── *List.tsx     (Display multiple entities)
│   └── *Form.tsx     (Create/edit entity)
└── shared/           (Reusable cross-domain components)
```

### 5. Testing Structure
```
tests/
├── unit/             (Pure function tests, no DB)
├── integration/      (API endpoint tests with DB)
└── e2e/              (Full user flows with Playwright)
```

---

## File Templates

### API Route Template

```typescript
// src/app/api/crm/contacts/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { contactService } from '@/lib/crm/services/contact-service';
import { CreateContactSchema } from '@/lib/crm/validation';

// GET /api/crm/contacts
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const contacts = await contactService.list(userId, { page, limit });
    return NextResponse.json({ success: true, data: contacts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/crm/contacts
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = CreateContactSchema.parse(body);
    const contact = await contactService.create(userId, validated);
    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Service Template

```typescript
// src/lib/crm/services/contact-service.ts
import prisma from '@/prisma';
import { Contact } from '@prisma/client';
import { CreateContactInput, UpdateContactInput } from '../types';

export class ContactService {
  async list(userId: string, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: { userId, deletedAt: null },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { company: true },
      }),
      prisma.contact.count({ where: { userId, deletedAt: null } }),
    ]);

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(userId: string, data: CreateContactInput): Promise<Contact> {
    return prisma.contact.create({
      data: {
        ...data,
        userId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findById(userId: string, id: string): Promise<Contact | null> {
    return prisma.contact.findFirst({
      where: { id, userId, deletedAt: null },
      include: { company: true, interactions: true },
    });
  }

  async update(
    userId: string,
    id: string,
    data: UpdateContactInput
  ): Promise<Contact> {
    return prisma.contact.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const contactService = new ContactService();
```

### Component Template

```typescript
// src/components/crm/ContactCard.tsx
'use client';

import { Contact } from '@prisma/client';
import Link from 'next/link';
import { Mail, Phone, Building } from 'lucide-react';

interface ContactCardProps {
  contact: Contact & {
    company?: { name: string } | null;
  };
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Link
      href={`/dashboard/crm/contacts/${contact.id}`}
      className="block p-4 border rounded-lg hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {contact.firstName} {contact.lastName}
          </h3>
          {contact.title && (
            <p className="text-sm text-gray-600">{contact.title}</p>
          )}
        </div>
        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(contact.status)}`}>
          {contact.status}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building size={14} />
            <span>{contact.company.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'customer':
      return 'bg-green-100 text-green-800';
    case 'prospect':
      return 'bg-blue-100 text-blue-800';
    case 'lead':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
```

---

## Migration Strategy

### Phase-by-Phase Implementation

#### Phase 1: Core Infrastructure (Week 1)
1. Add Prisma models to `prisma/schema.prisma`
2. Run migration: `npx prisma migrate dev --name add_erp_crm_models`
3. Create shared utilities (`lib/shared/`)
4. Set up RBAC middleware

#### Phase 2: CRM Module (Week 1-2)
1. Create service layer (`lib/crm/services/`)
2. Create API routes (`app/api/crm/`)
3. Create UI components (`components/crm/`)
4. Create dashboard pages (`app/dashboard/crm/`)
5. Write unit tests (`tests/unit/crm/`)

#### Phase 3: Inventory Module (Week 3-4)
1. Service layer
2. API routes
3. UI components
4. Dashboard pages
5. Tests

#### Phase 4: Invoicing Module (Week 5-6)
1. Service layer + PDF generation
2. API routes + Stripe integration
3. UI components
4. Dashboard pages
5. Tests

#### Phase 5: Workflow Module (Week 7-8)
1. Workflow engine (`lib/workflow/engine/`)
2. Service layer
3. API routes
4. UI components
5. Dashboard pages

#### Phase 6: Reporting Module (Week 9-10)
1. Query builder (`lib/reporting/services/query-builder.ts`)
2. Dashboard engine
3. API routes
4. UI components
5. Tests

#### Phase 7: Integrations (Week 11-12)
1. Email integration (Gmail/Outlook)
2. Calendar integration
3. Accounting integration (QuickBooks/Xero)
4. Payment gateway (Stripe/PayPal)

---

## Development Guidelines

### 1. Code Style
- Follow existing G-Pilot conventions
- Use TypeScript strict mode
- All components are functional (no class components)
- Use Server Components by default, Client Components only when needed

### 2. Database Queries
- Always filter by `userId` for multi-tenant isolation
- Use soft deletes (`deletedAt`) instead of hard deletes
- Include audit fields (`createdBy`, `updatedBy`, `createdAt`, `updatedAt`)

### 3. Error Handling
- Use try-catch blocks in all API routes
- Return consistent error format:
  ```json
  { "error": "Error message", "code": "ERROR_CODE" }
  ```
- Log errors to console (upgrade to external logging later)

### 4. Security
- All API routes must use `auth()` from Clerk
- Validate input with Zod schemas
- Sanitize user input to prevent XSS
- Use parameterized queries (Prisma handles this)

### 5. Performance
- Implement pagination on all list endpoints (default: 20 items)
- Use database indexes on frequently queried fields
- Cache frequently accessed data in Redis
- Lazy load heavy components

### 6. Testing
- Write unit tests for all services
- Write integration tests for API endpoints
- Write E2E tests for critical user flows
- Target: 80% code coverage

---

## Summary

This project structure provides:

1. **Modularity**: Each domain (CRM, Inventory, Invoice, Workflow, Reporting) is self-contained
2. **Scalability**: Clear separation allows teams to work independently on different modules
3. **Maintainability**: Consistent naming and organization makes code easy to navigate
4. **Testability**: Dedicated test directories with clear separation of unit/integration/E2E
5. **Extensibility**: Easy to add new modules or integrations without affecting existing code

**Total Estimated Files:** ~244 new files across 5 modules

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Related Documents:**
- [System Architecture](./ccw-erp-crm.md)
- [Business Processes](./business-processes.md)
