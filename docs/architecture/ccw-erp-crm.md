# CCW-ERP/CRM System Architecture

## Project: UNI-170 - Requirements & Architecture Design

**Last Updated:** 2026-01-27
**Status:** Architecture Design Phase
**Project Code:** CCW-ERP/CRM

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Requirements](#business-requirements)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Module Specifications](#module-specifications)
7. [Integration Patterns](#integration-patterns)
8. [Security & Compliance](#security--compliance)
9. [Performance & Scalability](#performance--scalability)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

The CCW-ERP/CRM system is a comprehensive business management platform designed to integrate Customer Relationship Management (CRM), Enterprise Resource Planning (ERP), and workflow automation capabilities. The system will be built as a modular extension to the existing G-Pilot platform, leveraging its authentication, database infrastructure, and agent orchestration capabilities.

### Key Objectives

- **Unified Business Management**: Single platform for customer relationships, inventory, and financial operations
- **Workflow Automation**: Streamline approval processes, notifications, and SLA tracking
- **Real-time Analytics**: Comprehensive reporting and forecasting capabilities
- **Multi-tenant Architecture**: Support multiple organizations with data isolation
- **API-First Design**: Enable third-party integrations and mobile applications

### Core Modules (UNI-171 to UNI-175)

1. **Core CRM Module** (UNI-171): Contacts, Companies, Relationships
2. **Inventory & Stock Management** (UNI-172): Products, Stock, Warehouses
3. **Invoicing & Financial Module** (UNI-173): Invoices, Payments, Accounting
4. **Workflow Automation** (UNI-174): Approval Chains, Notifications, SLA
5. **Reporting & Analytics** (UNI-175): KPIs, Forecasting, Custom Reports

---

## Business Requirements

### Functional Requirements

#### FR-1: Customer Relationship Management
- **FR-1.1**: Manage customer contacts with full profile information
- **FR-1.2**: Track company hierarchies and relationships
- **FR-1.3**: Record interactions (calls, emails, meetings, notes)
- **FR-1.4**: Pipeline management with customizable stages
- **FR-1.5**: Lead scoring and qualification tracking
- **FR-1.6**: Email integration and templating
- **FR-1.7**: Activity timeline and history

#### FR-2: Inventory Management
- **FR-2.1**: Product catalog with variants and pricing tiers
- **FR-2.2**: Multi-location warehouse management
- **FR-2.3**: Real-time stock level tracking
- **FR-2.4**: Inventory transactions (in/out/transfer/adjustment)
- **FR-2.5**: Low-stock alerts and reorder automation
- **FR-2.6**: Barcode/SKU management
- **FR-2.7**: Batch and serial number tracking
- **FR-2.8**: Inventory valuation (FIFO/LIFO/Weighted Average)

#### FR-3: Financial Operations
- **FR-3.1**: Invoice generation with customizable templates
- **FR-3.2**: Quote/estimate management
- **FR-3.3**: Payment tracking and reconciliation
- **FR-3.4**: Multi-currency support
- **FR-3.5**: Tax calculation and compliance
- **FR-3.6**: Expense tracking
- **FR-3.7**: Financial reporting (P&L, Balance Sheet, Cash Flow)
- **FR-3.8**: Integration with accounting systems (QuickBooks, Xero)

#### FR-4: Workflow Automation
- **FR-4.1**: Configurable approval workflows
- **FR-4.2**: Automated email notifications
- **FR-4.3**: SLA tracking with escalation
- **FR-4.4**: Task assignment and delegation
- **FR-4.5**: Document approval chains
- **FR-4.6**: Conditional workflow branching
- **FR-4.7**: Workflow templates and cloning

#### FR-5: Reporting & Analytics
- **FR-5.1**: Pre-built dashboard templates
- **FR-5.2**: Custom report builder (drag-and-drop)
- **FR-5.3**: Real-time KPI monitoring
- **FR-5.4**: Sales forecasting
- **FR-5.5**: Customer lifetime value (CLV) analysis
- **FR-5.6**: Inventory turnover metrics
- **FR-5.7**: Export to Excel/PDF
- **FR-5.8**: Scheduled report delivery

### Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1**: Page load time < 2 seconds
- **NFR-1.2**: API response time < 500ms (p95)
- **NFR-1.3**: Support 1000+ concurrent users
- **NFR-1.4**: Database queries optimized with proper indexing

#### NFR-2: Security
- **NFR-2.1**: Row-level security (RLS) for multi-tenant data isolation
- **NFR-2.2**: Role-based access control (RBAC)
- **NFR-2.3**: Audit logging for all financial transactions
- **NFR-2.4**: Encryption at rest (AES-256) and in transit (TLS 1.3)
- **NFR-2.5**: GDPR compliance for customer data

#### NFR-3: Scalability
- **NFR-3.1**: Horizontal scaling via serverless architecture
- **NFR-3.2**: Database sharding strategy for large datasets
- **NFR-3.3**: CDN for static assets
- **NFR-3.4**: Redis caching for frequently accessed data

#### NFR-4: Availability
- **NFR-4.1**: 99.9% uptime SLA
- **NFR-4.2**: Automated backups (daily + point-in-time recovery)
- **NFR-4.3**: Disaster recovery plan (RTO < 4 hours, RPO < 1 hour)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │  Mobile App  │  │  Third-Party │         │
│  │  (Next.js)   │  │  (Future)    │  │     APIs     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌─────────────────────────────┴─────────────────────────────────┐
│                     API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  /api/crm/*      /api/inventory/*     /api/invoices/*   │ │
│  │  Authentication, Rate Limiting, Request Validation      │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌─────────────────────────────┴─────────────────────────────────┐
│                   APPLICATION LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │    CRM     │  │ Inventory  │  │  Invoice   │             │
│  │   Module   │  │   Module   │  │   Module   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Workflow  │  │ Reporting  │  │ Notification│            │
│  │   Engine   │  │   Engine   │  │   Service   │            │
│  └────────────┘  └────────────┘  └────────────┘             │
└────────────────────────────┬───────────────────────────────────┘
                             │
┌─────────────────────────────┴─────────────────────────────────┐
│                     DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL (Prisma ORM)                                 │ │
│  │  - Multi-tenant data with userId isolation               │ │
│  │  - Transactional consistency                             │ │
│  │  - Full-text search (pg_trgm)                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Redis (Upstash)                                          │ │
│  │  - Session caching                                        │ │
│  │  - Real-time metrics                                      │ │
│  │  - Task queue (BullMQ)                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

#### 1. Multi-Tenant Data Isolation
- **Pattern**: Row-Level Security (RLS) with `userId` column
- **Implementation**: Every table includes `userId` (mapped to Clerk `clerkId`)
- **Access Control**: Middleware enforces tenant isolation at query level

```typescript
// Example: Automatic tenant filtering
const contacts = await prisma.contact.findMany({
  where: { userId: session.userId }
});
```

#### 2. Domain-Driven Design (DDD)
- **Modules**: CRM, Inventory, Invoice, Workflow, Reporting
- **Bounded Contexts**: Each module has its own service layer
- **Shared Kernel**: Common utilities (auth, validation, logging)

#### 3. API Gateway Pattern
- **Purpose**: Single entry point for all client requests
- **Features**:
  - Authentication via Clerk middleware
  - Rate limiting via RateLimitBucket
  - Request validation via Zod schemas
  - CORS configuration

#### 4. Event-Driven Architecture
- **Webhook Integration**: Trigger external systems on key events
- **Event Types**:
  - `crm.contact.created`
  - `inventory.stock.low`
  - `invoice.paid`
  - `workflow.approved`

#### 5. CQRS-Lite Pattern
- **Read Models**: Optimized views for reporting (materialized views)
- **Write Models**: Transactional operations with audit trails
- **Separation**: Heavy analytical queries don't impact transactional performance

---

## Technology Stack

### Core Technologies (Existing Infrastructure)

#### Frontend
- **Next.js 16.1.3** (React 19.2.3)
  - App Router with Server Components
  - Server Actions for mutations
  - Streaming SSR for dashboards
- **Tailwind CSS 4.1.18**
  - Scientific Luxury design system
  - Responsive grid layouts
  - Custom component library
- **Framer Motion 12.26.2**
  - Page transitions
  - Micro-interactions
  - Loading states

#### Backend
- **Next.js API Routes**
  - RESTful endpoints
  - GraphQL via GraphQL Yoga 5.18.0
  - Server Actions for form handling
- **Prisma ORM 6.4.1**
  - Type-safe database queries
  - Migration management
  - Connection pooling

#### Database
- **PostgreSQL** (via Supabase or direct connection)
  - JSONB for flexible metadata
  - Full-text search (pg_trgm, pg_search)
  - Materialized views for reporting
- **Redis** (Upstash)
  - Session management
  - Real-time metrics
  - Task queue (BullMQ 5.66.5)

#### Authentication & Authorization
- **Clerk 6.36.8**
  - OAuth providers (Google, Microsoft)
  - Role-based access control (RBAC)
  - Session management
  - Webhook integration for user events

#### AI & Automation
- **Google Gemini** (via @google/generative-ai)
  - Email summarization
  - Document classification
  - Smart recommendations
- **LangChain + LangGraph**
  - Workflow orchestration
  - Agent-based automation

### New Dependencies (ERP/CRM-Specific)

#### Document Generation
- **React-PDF** or **PDFKit**
  - Invoice PDF generation
  - Report exports

#### Charts & Visualization
- **Recharts** (already in use for monitoring dashboard)
  - Sales charts
  - Inventory trends
  - Financial dashboards

#### Excel Export
- **ExcelJS**
  - Export data to XLSX
  - Template-based invoice generation

#### Currency & Localization
- **dinero.js** or **currency.js**
  - Precise decimal arithmetic
  - Multi-currency support

#### Date/Time Handling
- **date-fns 4.1.0** (already available)
  - Date formatting
  - Fiscal year calculations

---

## Database Schema

### Schema Design Principles

1. **Multi-Tenancy**: Every table includes `userId` for tenant isolation
2. **Audit Trail**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on all entities
3. **Soft Deletes**: `deletedAt` column instead of hard deletes (for compliance)
4. **Optimistic Locking**: `version` field for concurrent update handling
5. **Flexible Metadata**: JSONB columns for extensibility without schema changes

### Core CRM Schema (UNI-171)

#### Contact Model
```prisma
model Contact {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  firstName       String
  lastName        String
  email           String?
  phone           String?
  mobile          String?
  title           String?   // Job title
  department      String?

  // Company Relationship
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  isPrimary       Boolean   @default(false)  // Primary contact for company

  // Address
  addressLine1    String?
  addressLine2    String?
  city            String?
  state           String?
  postalCode      String?
  country         String?

  // Metadata
  source          String?   // Website, Referral, Cold Call, etc.
  leadScore       Int       @default(0)
  status          String    @default("lead")  // lead, prospect, customer, inactive
  tags            String[]

  // Relationships
  dealId          String?
  deal            Deal?     @relation(fields: [dealId], references: [id])
  interactions    Interaction[]
  tasks           Task[]

  // Custom Fields (JSONB for flexibility)
  customFields    Json?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  updatedBy       String
  deletedAt       DateTime?

  @@unique([email, userId])
  @@index([userId, status])
  @@index([companyId])
  @@index([leadScore])
  @@index([deletedAt])
}
```

#### Company Model
```prisma
model Company {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  name            String
  legalName       String?
  industry        String?
  website         String?
  employeeCount   String?   // "1-10", "11-50", "51-200", etc.
  annualRevenue   String?

  // Contact Info
  phone           String?
  email           String?

  // Address (Headquarters)
  addressLine1    String?
  addressLine2    String?
  city            String?
  state           String?
  postalCode      String?
  country         String?

  // Metadata
  status          String    @default("active")  // active, inactive, prospect
  parentCompanyId String?
  parentCompany   Company?  @relation("CompanyHierarchy", fields: [parentCompanyId], references: [id])
  childCompanies  Company[] @relation("CompanyHierarchy")

  // Relationships
  contacts        Contact[]
  deals           Deal[]
  invoices        Invoice[]

  // Custom Fields
  customFields    Json?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  updatedBy       String
  deletedAt       DateTime?

  @@index([userId, status])
  @@index([parentCompanyId])
  @@index([industry])
  @@index([deletedAt])
}
```

#### Deal (Pipeline) Model
```prisma
model Deal {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  name            String
  description     String?
  value           Int       // Stored in cents
  currency        String    @default("USD")

  // Pipeline
  stage           String    // lead, qualified, proposal, negotiation, closed_won, closed_lost
  probability     Int       @default(0)  // 0-100
  expectedCloseDate DateTime?
  actualCloseDate DateTime?

  // Relationships
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  contacts        Contact[]
  ownerId         String    // Assigned sales rep

  // Products/Services
  lineItems       DealLineItem[]

  // Metadata
  source          String?
  lostReason      String?
  tags            String[]
  customFields    Json?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  updatedBy       String
  deletedAt       DateTime?

  @@index([userId, stage])
  @@index([ownerId])
  @@index([companyId])
  @@index([expectedCloseDate])
  @@index([deletedAt])
}
```

#### Interaction Model
```prisma
model Interaction {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  type            String    // call, email, meeting, note, task
  subject         String
  description     String?
  outcome         String?

  // Timing
  scheduledAt     DateTime?
  completedAt     DateTime?
  duration        Int?      // Duration in minutes

  // Relationships
  contactId       String?
  contact         Contact?  @relation(fields: [contactId], references: [id])
  companyId       String?
  dealId          String?

  // Participants
  participants    String[]  // Array of user IDs

  // Metadata
  status          String    @default("completed")  // scheduled, completed, cancelled
  direction       String?   // inbound, outbound
  attachments     Json?     // File URLs

  // Audit
  createdAt       DateTime  @default(now())
  createdBy       String
  deletedAt       DateTime?

  @@index([userId, type])
  @@index([contactId])
  @@index([scheduledAt])
  @@index([deletedAt])
}
```

#### Task Model
```prisma
model Task {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  title           String
  description     String?
  priority        String    @default("medium")  // low, medium, high, urgent
  status          String    @default("todo")    // todo, in_progress, completed, cancelled

  // Timing
  dueDate         DateTime?
  completedAt     DateTime?
  reminderAt      DateTime?

  // Relationships
  contactId       String?
  contact         Contact?  @relation(fields: [contactId], references: [id])
  companyId       String?
  dealId          String?
  assigneeId      String

  // Metadata
  tags            String[]
  customFields    Json?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  deletedAt       DateTime?

  @@index([userId, status])
  @@index([assigneeId])
  @@index([dueDate])
  @@index([contactId])
  @@index([deletedAt])
}
```

### Inventory Schema (UNI-172)

#### Product Model
```prisma
model Product {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  sku             String
  name            String
  description     String?
  category        String?
  brand           String?

  // Variants (for products with size/color options)
  hasVariants     Boolean   @default(false)
  parentProductId String?
  parentProduct   Product?  @relation("ProductVariants", fields: [parentProductId], references: [id])
  variants        Product[] @relation("ProductVariants")

  // Pricing
  costPrice       Int       // Stored in cents
  salePrice       Int
  currency        String    @default("USD")
  taxRate         Float     @default(0)

  // Inventory Tracking
  trackInventory  Boolean   @default(true)
  stockLevel      Int       @default(0)
  reorderPoint    Int       @default(0)
  reorderQuantity Int       @default(0)

  // Physical Attributes
  weight          Float?    // in kg
  length          Float?    // in cm
  width           Float?
  height          Float?

  // Metadata
  barcode         String?
  supplierSku     String?
  imageUrls       String[]
  tags            String[]
  isActive        Boolean   @default(true)
  customFields    Json?

  // Relationships
  stockLocations  StockLocation[]
  inventoryTransactions InventoryTransaction[]
  dealLineItems   DealLineItem[]
  invoiceLineItems InvoiceLineItem[]

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  updatedBy       String
  deletedAt       DateTime?

  @@unique([sku, userId])
  @@index([userId, isActive])
  @@index([category])
  @@index([parentProductId])
  @@index([deletedAt])
}
```

#### Warehouse Model
```prisma
model Warehouse {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  name            String
  code            String    // Short identifier (e.g., "WH-NYC")
  type            String    @default("warehouse")  // warehouse, store, distribution_center

  // Address
  addressLine1    String
  addressLine2    String?
  city            String
  state           String?
  postalCode      String
  country         String

  // Contact
  phone           String?
  email           String?
  managerId       String?

  // Metadata
  isActive        Boolean   @default(true)
  customFields    Json?

  // Relationships
  stockLocations  StockLocation[]
  inventoryTransactions InventoryTransaction[]

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  deletedAt       DateTime?

  @@unique([code, userId])
  @@index([userId, isActive])
  @@index([deletedAt])
}
```

#### StockLocation Model
```prisma
model StockLocation {
  id              String    @id @default(uuid())
  userId          String

  // Relationships
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  warehouseId     String
  warehouse       Warehouse @relation(fields: [warehouseId], references: [id])

  // Stock Info
  quantity        Int       @default(0)
  allocatedQty    Int       @default(0)  // Allocated to orders but not shipped
  availableQty    Int       @default(0)  // quantity - allocatedQty

  // Location Details
  binLocation     String?   // e.g., "A-12-3" (Aisle-Rack-Shelf)

  // Batch Tracking
  batchNumber     String?
  serialNumbers   String[]
  expirationDate  DateTime?

  // Audit
  updatedAt       DateTime  @updatedAt

  @@unique([productId, warehouseId, batchNumber])
  @@index([userId])
  @@index([productId])
  @@index([warehouseId])
}
```

#### InventoryTransaction Model
```prisma
model InventoryTransaction {
  id              String    @id @default(uuid())
  userId          String

  // Transaction Type
  type            String    // in, out, transfer, adjustment

  // Relationships
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  warehouseId     String
  warehouse       Warehouse @relation(fields: [warehouseId], references: [id])

  // Transfer Details (if type = transfer)
  toWarehouseId   String?

  // Quantity
  quantity        Int
  unitCost        Int?      // Cost per unit in cents

  // Reference
  referenceType   String?   // order, return, adjustment
  referenceId     String?   // ID of related order/invoice
  reason          String?

  // Metadata
  notes           String?
  batchNumber     String?
  serialNumbers   String[]

  // Audit
  createdAt       DateTime  @default(now())
  createdBy       String

  @@index([userId, type])
  @@index([productId])
  @@index([warehouseId])
  @@index([createdAt])
}
```

### Invoicing & Financial Schema (UNI-173)

#### Invoice Model
```prisma
model Invoice {
  id              String    @id @default(uuid())
  userId          String

  // Invoice Details
  invoiceNumber   String    @unique
  type            String    @default("invoice")  // invoice, quote, credit_note
  status          String    @default("draft")    // draft, sent, viewed, paid, overdue, cancelled

  // Relationships
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  contactId       String?

  // Dates
  issueDate       DateTime  @default(now())
  dueDate         DateTime
  paidDate        DateTime?

  // Amounts (in cents)
  subtotal        Int
  taxAmount       Int       @default(0)
  discountAmount  Int       @default(0)
  shippingAmount  Int       @default(0)
  total           Int

  // Currency
  currency        String    @default("USD")
  exchangeRate    Float     @default(1)

  // Payment Info
  paymentTerms    String?   // "Net 30", "Due on Receipt", etc.
  paymentMethod   String?   // credit_card, bank_transfer, check, cash
  paymentReference String?  // Transaction ID from payment gateway

  // Line Items
  lineItems       InvoiceLineItem[]
  payments        Payment[]

  // Metadata
  notes           String?
  terms           String?   // Terms & conditions
  attachments     Json?
  customFields    Json?

  // Template
  templateId      String?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  updatedBy       String
  deletedAt       DateTime?

  @@index([userId, status])
  @@index([companyId])
  @@index([dueDate])
  @@index([issueDate])
  @@index([deletedAt])
}
```

#### InvoiceLineItem Model
```prisma
model InvoiceLineItem {
  id              String    @id @default(uuid())
  userId          String

  // Relationships
  invoiceId       String
  invoice         Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  productId       String?
  product         Product?  @relation(fields: [productId], references: [id])

  // Item Details
  description     String
  quantity        Int
  unitPrice       Int       // In cents
  taxRate         Float     @default(0)
  discountPercent Float     @default(0)

  // Calculated
  lineTotal       Int       // (quantity * unitPrice) - discount + tax

  // Metadata
  sortOrder       Int       @default(0)

  @@index([invoiceId])
  @@index([productId])
}
```

#### Payment Model
```prisma
model Payment {
  id              String    @id @default(uuid())
  userId          String

  // Relationships
  invoiceId       String
  invoice         Invoice   @relation(fields: [invoiceId], references: [id])

  // Payment Details
  amount          Int       // In cents
  currency        String    @default("USD")
  method          String    // credit_card, bank_transfer, check, cash, other

  // Gateway Info
  gatewayProvider String?   // stripe, paypal, square
  gatewayTransactionId String?
  gatewayFee      Int?      // Payment processing fee in cents

  // Dates
  paymentDate     DateTime  @default(now())
  clearedDate     DateTime?

  // Status
  status          String    @default("completed")  // completed, pending, failed, refunded

  // Metadata
  reference       String?
  notes           String?

  // Audit
  createdAt       DateTime  @default(now())
  createdBy       String

  @@index([userId])
  @@index([invoiceId])
  @@index([paymentDate])
  @@index([status])
}
```

#### DealLineItem Model
```prisma
model DealLineItem {
  id              String    @id @default(uuid())
  userId          String

  // Relationships
  dealId          String
  deal            Deal      @relation(fields: [dealId], references: [id], onDelete: Cascade)
  productId       String?
  product         Product?  @relation(fields: [productId], references: [id])

  // Item Details
  description     String
  quantity        Int
  unitPrice       Int       // In cents
  discountPercent Float     @default(0)

  // Calculated
  lineTotal       Int

  // Metadata
  sortOrder       Int       @default(0)

  @@index([dealId])
  @@index([productId])
}
```

### Workflow Automation Schema (UNI-174)

#### WorkflowTemplate Model
```prisma
model WorkflowTemplate {
  id              String    @id @default(uuid())
  userId          String

  // Basic Info
  name            String
  description     String?
  type            String    // approval, notification, automation
  triggerEvent    String    // invoice.created, deal.won, inventory.low

  // Workflow Definition (JSONB)
  steps           Json      // Array of workflow steps
  /**
   * Example steps structure:
   * [
   *   {
   *     stepId: "step-1",
   *     type: "approval",
   *     name: "Manager Approval",
   *     assigneeRole: "manager",
   *     condition: { field: "invoice.total", operator: "gt", value: 100000 },
   *     actions: [
   *       { type: "email", template: "approval-request" }
   *     ]
   *   },
   *   {
   *     stepId: "step-2",
   *     type: "notification",
   *     name: "Notify Finance",
   *     actions: [
   *       { type: "email", to: "finance@company.com" }
   *     ]
   *   }
   * ]
   */

  // Settings
  slaHours        Int?      // SLA in hours for completion
  escalationRules Json?     // Escalation logic
  isActive        Boolean   @default(true)

  // Instances
  instances       WorkflowInstance[]

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  deletedAt       DateTime?

  @@index([userId, isActive])
  @@index([type])
  @@index([deletedAt])
}
```

#### WorkflowInstance Model
```prisma
model WorkflowInstance {
  id              String    @id @default(uuid())
  userId          String

  // Relationships
  templateId      String
  template        WorkflowTemplate @relation(fields: [templateId], references: [id])

  // Instance Info
  referenceType   String    // invoice, deal, etc.
  referenceId     String    // ID of the related entity
  status          String    @default("pending")  // pending, in_progress, completed, cancelled
  currentStepId   String?

  // Steps Status
  stepsStatus     Json      // Track completion status of each step
  /**
   * Example:
   * {
   *   "step-1": { status: "approved", approvedBy: "user-123", approvedAt: "..." },
   *   "step-2": { status: "pending" }
   * }
   */

  // SLA Tracking
  slaDeadline     DateTime?
  isOverdue       Boolean   @default(false)

  // Completion
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancelReason    String?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, status])
  @@index([templateId])
  @@index([referenceType, referenceId])
  @@index([slaDeadline, isOverdue])
}
```

#### Notification Model
```prisma
model Notification {
  id              String    @id @default(uuid())
  userId          String

  // Notification Details
  type            String    // email, in_app, sms, webhook
  channel         String?   // For email: recipient email
  subject         String
  body            String
  templateId      String?

  // Trigger
  triggerEvent    String    // workflow.approved, invoice.overdue, etc.
  referenceType   String?
  referenceId     String?

  // Delivery Status
  status          String    @default("pending")  // pending, sent, failed, delivered, bounced
  sentAt          DateTime?
  deliveredAt     DateTime?
  failureReason   String?
  retryCount      Int       @default(0)

  // Metadata
  metadata        Json?     // Additional context

  // Audit
  createdAt       DateTime  @default(now())

  @@index([userId, status])
  @@index([type])
  @@index([sentAt])
}
```

### Reporting & Analytics Schema (UNI-175)

#### Dashboard Model
```prisma
model Dashboard {
  id              String    @id @default(uuid())
  userId          String

  // Dashboard Info
  name            String
  description     String?
  type            String    @default("custom")  // custom, template, system

  // Layout (JSONB)
  layout          Json      // Grid layout configuration
  /**
   * Example:
   * {
   *   columns: 12,
   *   widgets: [
   *     { id: "widget-1", x: 0, y: 0, w: 6, h: 4, type: "sales_chart" },
   *     { id: "widget-2", x: 6, y: 0, w: 6, h: 4, type: "pipeline_status" }
   *   ]
   * }
   */

  // Access
  isPublic        Boolean   @default(false)
  sharedWith      String[]  // User IDs who can access

  // Metadata
  isDefault       Boolean   @default(false)
  sortOrder       Int       @default(0)

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  deletedAt       DateTime?

  @@index([userId, type])
  @@index([deletedAt])
}
```

#### Report Model
```prisma
model Report {
  id              String    @id @default(uuid())
  userId          String

  // Report Info
  name            String
  description     String?
  type            String    // sales, inventory, financial, custom

  // Query Definition (JSONB)
  query           Json      // Report query configuration
  /**
   * Example:
   * {
   *   dataSource: "invoices",
   *   filters: [
   *     { field: "status", operator: "eq", value: "paid" },
   *     { field: "issueDate", operator: "gte", value: "2025-01-01" }
   *   ],
   *   groupBy: ["companyId"],
   *   aggregations: [
   *     { field: "total", function: "sum", alias: "totalRevenue" }
   *   ],
   *   orderBy: [{ field: "totalRevenue", direction: "desc" }]
   * }
   */

  // Visualization
  chartType       String?   // line, bar, pie, table
  chartConfig     Json?     // Chart-specific settings

  // Scheduling
  isScheduled     Boolean   @default(false)
  schedule        String?   // Cron expression
  recipients      String[]  // Email addresses for scheduled delivery
  lastRunAt       DateTime?
  nextRunAt       DateTime?

  // Cache
  cachedResult    Json?
  cachedAt        DateTime?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  deletedAt       DateTime?

  @@index([userId, type])
  @@index([isScheduled, nextRunAt])
  @@index([deletedAt])
}
```

#### KPI Model
```prisma
model KPI {
  id              String    @id @default(uuid())
  userId          String

  // KPI Info
  name            String
  description     String?
  category        String    // sales, inventory, financial, operations

  // Calculation
  metric          String    // revenue, conversion_rate, inventory_turnover, etc.
  formula         Json      // Calculation logic

  // Targets
  targetValue     Float?
  targetPeriod    String?   // daily, weekly, monthly, quarterly, yearly

  // Current Value (cached)
  currentValue    Float?
  previousValue   Float?
  changePercent   Float?
  lastCalculatedAt DateTime?

  // Display
  unit            String?   // currency, percentage, count
  format          String?   // Formatting rules
  isVisible       Boolean   @default(true)
  sortOrder       Int       @default(0)

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String
  deletedAt       DateTime?

  @@index([userId, category])
  @@index([isVisible])
  @@index([deletedAt])
}
```

---

## Module Specifications

### UNI-171: Core CRM Module

#### Features
1. **Contact Management**
   - Create/read/update/delete contacts
   - Email and phone validation
   - Duplicate detection (fuzzy matching)
   - Contact segmentation (tags, filters)
   - Bulk import from CSV
   - Export to CSV/Excel

2. **Company Management**
   - Company profiles with hierarchies
   - Relationship mapping (parent/subsidiary)
   - Industry classification
   - Company enrichment (external data APIs)

3. **Deal Pipeline**
   - Customizable pipeline stages
   - Drag-and-drop stage transitions
   - Win/loss analysis
   - Forecasting based on probability
   - Deal history and audit trail

4. **Interactions & Activities**
   - Log calls, emails, meetings, notes
   - Activity timeline view
   - Email integration (Gmail, Outlook)
   - Calendar sync (Google Calendar, Outlook)
   - Task management with reminders

#### API Endpoints
```
GET    /api/crm/contacts
POST   /api/crm/contacts
GET    /api/crm/contacts/:id
PATCH  /api/crm/contacts/:id
DELETE /api/crm/contacts/:id

GET    /api/crm/companies
POST   /api/crm/companies
GET    /api/crm/companies/:id
PATCH  /api/crm/companies/:id
DELETE /api/crm/companies/:id

GET    /api/crm/deals
POST   /api/crm/deals
GET    /api/crm/deals/:id
PATCH  /api/crm/deals/:id
DELETE /api/crm/deals/:id

GET    /api/crm/interactions
POST   /api/crm/interactions
GET    /api/crm/interactions/:id
PATCH  /api/crm/interactions/:id

GET    /api/crm/tasks
POST   /api/crm/tasks
PATCH  /api/crm/tasks/:id
DELETE /api/crm/tasks/:id
```

---

### UNI-172: Inventory & Stock Management

#### Features
1. **Product Catalog**
   - Product variants (size, color, etc.)
   - Multi-tiered pricing (wholesale, retail, bulk)
   - Product images and documents
   - Category hierarchies
   - Barcode/SKU generation

2. **Stock Management**
   - Real-time stock levels across warehouses
   - Stock allocation for pending orders
   - Stock reservations
   - Batch and serial number tracking
   - Expiration date management

3. **Inventory Transactions**
   - Stock in (purchase, production)
   - Stock out (sales, wastage)
   - Stock transfers between warehouses
   - Stock adjustments (cycle counts, corrections)
   - Transaction history and audit trail

4. **Reorder Automation**
   - Low-stock alerts
   - Automatic purchase order generation
   - Reorder point and quantity configuration
   - Supplier management integration

5. **Valuation**
   - FIFO (First In, First Out)
   - LIFO (Last In, First Out)
   - Weighted Average Cost
   - Inventory value reporting

#### API Endpoints
```
GET    /api/inventory/products
POST   /api/inventory/products
GET    /api/inventory/products/:id
PATCH  /api/inventory/products/:id
DELETE /api/inventory/products/:id

GET    /api/inventory/warehouses
POST   /api/inventory/warehouses
GET    /api/inventory/warehouses/:id
PATCH  /api/inventory/warehouses/:id

GET    /api/inventory/stock-locations
GET    /api/inventory/stock-locations/product/:productId
POST   /api/inventory/stock-locations/transfer

GET    /api/inventory/transactions
POST   /api/inventory/transactions
GET    /api/inventory/transactions/:id

GET    /api/inventory/low-stock
POST   /api/inventory/reorder
```

---

### UNI-173: Invoicing & Financial Module

#### Features
1. **Invoice Management**
   - Create invoices from deals/orders
   - Customizable invoice templates (PDF)
   - Multi-currency support
   - Recurring invoices
   - Credit notes and refunds
   - Invoice numbering (auto-increment, custom formats)

2. **Quote/Estimate Generation**
   - Convert quotes to invoices
   - Quote expiration dates
   - Quote versioning

3. **Payment Tracking**
   - Payment recording (full/partial)
   - Payment method tracking
   - Payment gateway integration (Stripe, PayPal)
   - Payment reminders (automated emails)
   - Overdue tracking

4. **Financial Reporting**
   - Accounts Receivable (AR) aging
   - Revenue reports (by period, customer, product)
   - Tax reports (sales tax summary)
   - Profit & Loss (P&L) statement
   - Cash flow projection

5. **Integrations**
   - QuickBooks sync
   - Xero integration
   - Stripe payment gateway
   - Bank reconciliation (Plaid API)

#### API Endpoints
```
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PATCH  /api/invoices/:id
DELETE /api/invoices/:id
POST   /api/invoices/:id/send
POST   /api/invoices/:id/convert-to-invoice (from quote)

GET    /api/payments
POST   /api/payments
GET    /api/payments/:id

GET    /api/invoices/:id/pdf
POST   /api/invoices/:id/payment-link (Stripe)

GET    /api/reports/ar-aging
GET    /api/reports/revenue
GET    /api/reports/tax-summary
```

---

### UNI-174: Workflow Automation

#### Features
1. **Approval Workflows**
   - Multi-step approval chains
   - Conditional branching (if total > $10k, require CFO approval)
   - Parallel approvals (AND/OR logic)
   - Approval delegation
   - Approval history and audit trail

2. **Automated Notifications**
   - Email notifications (via SendGrid or Resend)
   - In-app notifications
   - SMS notifications (via Twilio)
   - Webhook triggers

3. **SLA Management**
   - SLA definition per workflow
   - SLA breach detection
   - Escalation rules (if not approved in 24h, escalate to VP)
   - SLA reporting

4. **Workflow Templates**
   - Pre-built templates (invoice approval, expense approval)
   - Drag-and-drop workflow builder (future enhancement)
   - Workflow cloning and versioning

5. **Event-Driven Actions**
   - Trigger workflows on database events (invoice.created, deal.won)
   - Scheduled workflows (daily inventory check)
   - Webhook-triggered workflows

#### API Endpoints
```
GET    /api/workflows/templates
POST   /api/workflows/templates
GET    /api/workflows/templates/:id
PATCH  /api/workflows/templates/:id
DELETE /api/workflows/templates/:id

GET    /api/workflows/instances
POST   /api/workflows/instances
GET    /api/workflows/instances/:id
POST   /api/workflows/instances/:id/approve
POST   /api/workflows/instances/:id/reject
POST   /api/workflows/instances/:id/cancel

GET    /api/notifications
POST   /api/notifications
GET    /api/notifications/:id/mark-read
```

---

### UNI-175: Reporting & Analytics

#### Features
1. **Pre-Built Dashboards**
   - Sales Dashboard (revenue, pipeline, conversion rates)
   - Inventory Dashboard (stock levels, turnover, low-stock alerts)
   - Financial Dashboard (AR aging, cash flow, P&L)
   - Operational Dashboard (task completion, SLA adherence)

2. **Custom Report Builder**
   - Drag-and-drop field selection
   - Filter builder (AND/OR logic)
   - Aggregations (sum, avg, count, min, max)
   - Grouping and sorting
   - Saved reports

3. **Visualizations**
   - Line charts (trends over time)
   - Bar charts (comparisons)
   - Pie charts (distribution)
   - Tables (detailed data)
   - Heatmaps (activity patterns)

4. **KPI Tracking**
   - Pre-defined KPIs (MRR, CAC, LTV, inventory turnover)
   - Custom KPI definitions
   - Target setting and tracking
   - Trend analysis (vs. previous period)

5. **Scheduled Reports**
   - Email delivery (daily, weekly, monthly)
   - PDF exports
   - Excel exports
   - Cron-based scheduling

6. **Forecasting**
   - Sales forecasting (based on pipeline)
   - Revenue projections
   - Inventory demand forecasting (ML-based, future)

#### API Endpoints
```
GET    /api/dashboards
POST   /api/dashboards
GET    /api/dashboards/:id
PATCH  /api/dashboards/:id
DELETE /api/dashboards/:id

GET    /api/reports
POST   /api/reports
GET    /api/reports/:id
PATCH  /api/reports/:id
DELETE /api/reports/:id
POST   /api/reports/:id/run
POST   /api/reports/:id/export

GET    /api/kpis
POST   /api/kpis
GET    /api/kpis/:id
PATCH  /api/kpis/:id
GET    /api/kpis/:id/calculate
```

---

## Integration Patterns

### External Integrations

#### 1. Email Integration
- **Gmail API**: Sync emails, send emails, track interactions
- **Outlook API** (Microsoft Graph): Similar functionality
- **Implementation**: OAuth 2.0, webhook for real-time sync

#### 2. Calendar Integration
- **Google Calendar**: Sync meetings and tasks
- **Outlook Calendar**: Similar functionality
- **Implementation**: Bidirectional sync, conflict resolution

#### 3. Accounting Software
- **QuickBooks Online API**: Sync invoices, payments, customers
- **Xero API**: Similar functionality
- **Implementation**: Scheduled sync (daily), webhook for real-time updates

#### 4. Payment Gateways
- **Stripe**: Payment processing, subscription billing
- **PayPal**: Alternative payment method
- **Implementation**: Hosted payment pages, webhook for payment status

#### 5. Communication
- **SendGrid / Resend**: Transactional emails
- **Twilio**: SMS notifications
- **Slack**: Workflow notifications

#### 6. File Storage
- **AWS S3 / Cloudflare R2**: Invoice PDFs, product images, attachments
- **Implementation**: Pre-signed URLs for secure uploads

### Internal Integrations

#### 1. AI Agent Orchestration
- **Use Case**: Automated email classification, document extraction
- **Implementation**: Trigger LangGraph workflows from CRM events

#### 2. Webhook System
- **Use Case**: Notify external systems of CRM events
- **Implementation**: Leverage existing UNI-169 webhook framework

#### 3. Queue System
- **Use Case**: Background processing (PDF generation, email sending, report scheduling)
- **Implementation**: BullMQ for async job processing

---

## Security & Compliance

### Data Security

#### 1. Multi-Tenant Isolation
- **Implementation**: `userId` column on all tables
- **Enforcement**: Prisma middleware to auto-inject `where: { userId }` filter
- **Verification**: Unit tests for tenant isolation

#### 2. Role-Based Access Control (RBAC)
- **Roles**: Admin, Manager, Sales Rep, Read-Only
- **Permissions**: Granular permissions per module (create, read, update, delete)
- **Implementation**: Clerk custom claims + database permissions table

#### 3. Audit Logging
- **Scope**: All financial transactions, data modifications
- **Implementation**: Prisma middleware to log changes
- **Storage**: Separate `AuditLog` table with retention policy

#### 4. Data Encryption
- **At Rest**: Database-level encryption (PostgreSQL encryption)
- **In Transit**: TLS 1.3 for all API requests
- **Sensitive Fields**: Encrypted via Vault system (existing UNI-168 infrastructure)

### Compliance

#### 1. GDPR
- **Right to Access**: Export all user data
- **Right to Erasure**: Soft delete with `deletedAt` flag
- **Data Portability**: Export to CSV/JSON
- **Consent Management**: Track consent for data processing

#### 2. SOC 2
- **Access Controls**: RBAC, MFA via Clerk
- **Change Management**: Audit logs, version control
- **Monitoring**: Real-time alerts (existing monitoring dashboard)

#### 3. PCI DSS (if handling credit cards)
- **Scope**: Use Stripe/PayPal for card processing (no card data stored)
- **Tokenization**: Store only payment method tokens

---

## Performance & Scalability

### Database Optimization

#### 1. Indexing Strategy
- **Primary Keys**: UUID with `@default(uuid())`
- **Foreign Keys**: Indexed automatically by Prisma
- **Query Indexes**:
  - `userId` on all tables (multi-tenant queries)
  - `status`, `createdAt`, `dueDate` on transactional tables
  - Composite indexes for common query patterns

#### 2. Query Optimization
- **N+1 Prevention**: Use Prisma `include` for eager loading
- **Pagination**: Cursor-based pagination for large datasets
- **Caching**: Redis cache for frequently accessed data (product catalog, KPIs)

#### 3. Connection Pooling
- **Prisma Connection Pool**: Default 10 connections
- **Supabase Pooler**: Use PgBouncer for serverless environments

#### 4. Read Replicas
- **Strategy**: Read-heavy queries (reports) routed to replicas
- **Implementation**: Prisma read replica configuration

### Caching Strategy

#### 1. Application-Level Cache (Redis)
- **Product Catalog**: 1-hour TTL
- **KPI Values**: 5-minute TTL
- **Dashboard Data**: 30-second TTL
- **User Sessions**: Session-based expiration

#### 2. HTTP Caching
- **Static Assets**: CDN with long expiration (1 year)
- **API Responses**: `Cache-Control` headers for GET requests

### Scalability

#### 1. Horizontal Scaling
- **Stateless API**: No server-side session storage
- **Load Balancing**: Vercel Edge Network

#### 2. Background Processing
- **BullMQ**: For PDF generation, email sending, report scheduling
- **Cron Jobs**: For scheduled workflows, SLA checks

#### 3. Database Sharding (Future)
- **Strategy**: Shard by `userId` for very large deployments
- **Implementation**: Vitess or Citus for PostgreSQL sharding

---

## Implementation Roadmap

### Phase 1: Core CRM (UNI-171) - Week 1-2
- [ ] Database schema migration (Contact, Company, Deal, Interaction, Task)
- [ ] API routes for CRUD operations
- [ ] Prisma service layer with tenant isolation
- [ ] UI components (contact list, contact detail, company list)
- [ ] Search and filtering
- [ ] CSV import/export

### Phase 2: Inventory Management (UNI-172) - Week 3-4
- [ ] Database schema (Product, Warehouse, StockLocation, InventoryTransaction)
- [ ] API routes for inventory operations
- [ ] Stock level tracking and updates
- [ ] Low-stock alerts
- [ ] Warehouse management UI
- [ ] Product catalog UI

### Phase 3: Invoicing (UNI-173) - Week 5-6
- [ ] Database schema (Invoice, InvoiceLineItem, Payment)
- [ ] Invoice generation logic
- [ ] PDF template system
- [ ] Payment tracking
- [ ] Stripe integration
- [ ] Invoice UI (list, detail, PDF preview)

### Phase 4: Workflow Automation (UNI-174) - Week 7-8
- [ ] Database schema (WorkflowTemplate, WorkflowInstance, Notification)
- [ ] Workflow engine implementation
- [ ] Approval logic (multi-step, conditional)
- [ ] SLA tracking and escalation
- [ ] Email notification integration
- [ ] Workflow UI (template builder, instance tracking)

### Phase 5: Reporting (UNI-175) - Week 9-10
- [ ] Database schema (Dashboard, Report, KPI)
- [ ] Report query builder
- [ ] Dashboard layout engine
- [ ] KPI calculation engine
- [ ] Chart visualization (Recharts)
- [ ] Export functionality (PDF, Excel)
- [ ] Scheduled report delivery

### Phase 6: Integration & Polish - Week 11-12
- [ ] Email integration (Gmail, Outlook)
- [ ] Calendar sync
- [ ] Accounting software integration (QuickBooks, Xero)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] User training materials

---

## Appendix

### Naming Conventions

#### Database Tables
- **Singular**: `Contact`, `Company`, `Invoice` (not Contacts, Companies, Invoices)
- **PascalCase**: Prisma convention

#### API Routes
- **Plural**: `/api/contacts`, `/api/companies`, `/api/invoices`
- **kebab-case**: `/api/stock-locations`, `/api/invoice-line-items`

#### File Structure
```
src/
├── app/
│   ├── api/
│   │   ├── crm/
│   │   │   ├── contacts/
│   │   │   │   ├── route.ts          (GET, POST)
│   │   │   │   └── [id]/route.ts     (GET, PATCH, DELETE)
│   │   │   ├── companies/...
│   │   │   └── deals/...
│   │   ├── inventory/...
│   │   ├── invoices/...
│   │   ├── workflows/...
│   │   └── reports/...
│   └── dashboard/
│       ├── crm/...
│       ├── inventory/...
│       ├── invoices/...
│       ├── workflows/...
│       └── reports/...
├── lib/
│   ├── crm/
│   │   ├── services/
│   │   │   ├── contact-service.ts
│   │   │   ├── company-service.ts
│   │   │   └── deal-service.ts
│   │   └── types.ts
│   ├── inventory/...
│   ├── invoice/...
│   ├── workflow/...
│   └── reporting/...
└── prisma/
    └── schema.prisma
```

### Technology References

- **Next.js 16**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Clerk**: https://clerk.com/docs
- **BullMQ**: https://docs.bullmq.io
- **Recharts**: https://recharts.org/en-US
- **Stripe**: https://stripe.com/docs/api
- **Zod**: https://zod.dev

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Next Review:** After Phase 1 completion
