# CCW-ERP/CRM Business Processes & Workflows

## Document Overview

**Purpose:** Define standard business processes and user workflows for the CCW-ERP/CRM system
**Related:** UNI-170, UNI-171, UNI-172, UNI-173, UNI-174, UNI-175
**Last Updated:** 2026-01-27

---

## Table of Contents

1. [Sales Process Workflows](#sales-process-workflows)
2. [Inventory Management Workflows](#inventory-management-workflows)
3. [Financial Workflows](#financial-workflows)
4. [Approval Workflows](#approval-workflows)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Integration Touchpoints](#integration-touchpoints)

---

## Sales Process Workflows

### 1. Lead to Customer Journey

```
┌─────────────┐
│ Lead Entry  │ (Website form, trade show, cold outreach)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Lead Qualification                                   │
│ - Sales rep reviews lead details                    │
│ - Assigns lead score (1-100)                        │
│ - Categorizes lead (hot, warm, cold)                │
│ - Assigns to sales rep                              │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Initial Contact                                      │
│ - Log first call/email interaction                  │
│ - Schedule discovery meeting                        │
│ - Update contact status to "Contacted"              │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Discovery & Needs Assessment                        │
│ - Conduct needs analysis meeting                    │
│ - Log meeting notes and outcomes                    │
│ - Identify decision makers                          │
│ - Create deal in "Qualified" stage                  │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Proposal/Quote Generation                           │
│ - Create quote with products/services               │
│ - Apply pricing and discounts                       │
│ - Generate PDF quote                                │
│ - Send quote via email (track opens)                │
│ - Move deal to "Proposal" stage                     │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Negotiation                                          │
│ - Log negotiation interactions                      │
│ - Update quote with revised pricing                 │
│ - Send revised quotes                               │
│ - Move deal to "Negotiation" stage                  │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Deal Closure                                         │
│ - Get verbal/written agreement                      │
│ - Convert quote to invoice                          │
│ - Move deal to "Closed Won" stage                   │
│ - Update contact status to "Customer"               │
│ - Trigger onboarding workflow                       │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Post-Sale Activities                                 │
│ - Send welcome email                                │
│ - Schedule onboarding call                          │
│ - Assign account manager                            │
│ - Create support tickets (if needed)                │
└─────────────────────────────────────────────────────┘
```

#### Key Metrics Tracked
- Lead conversion rate (Lead → Qualified → Customer)
- Average sales cycle length
- Win rate by sales rep
- Average deal value
- Pipeline velocity

---

### 2. Contact Management Workflow

#### Adding a New Contact

```
1. Navigate to CRM > Contacts
2. Click "Add Contact"
3. Fill in required fields:
   - First Name*
   - Last Name*
   - Email
   - Phone
   - Company (auto-suggest from existing companies)
4. Optional fields:
   - Title/Position
   - Department
   - Address
   - Tags
   - Lead Source
   - Custom Fields
5. Click "Save"
6. System Actions:
   - Checks for duplicates (fuzzy matching on email/phone)
   - If duplicate found, prompts to merge or create new
   - Assigns lead score (0 initially)
   - Creates activity timeline
   - Sends notification to assigned sales rep (if assigned)
```

#### Logging an Interaction

```
1. From contact detail page, click "Log Activity"
2. Select interaction type:
   - Call
   - Email
   - Meeting
   - Note
3. Fill in details:
   - Subject*
   - Description
   - Outcome
   - Date/Time
   - Duration (for calls/meetings)
   - Participants
4. Optionally attach files
5. Click "Save"
6. System Actions:
   - Updates contact's "Last Activity" timestamp
   - Triggers automation (if configured):
     - Auto-create follow-up task
     - Update lead score
     - Move deal stage
```

#### Email Integration Flow

```
┌─────────────────────────────────────────────────────┐
│ User sends email to prospect@company.com            │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Email Provider (Gmail/Outlook) via API              │
│ - Webhook triggers on sent email                    │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ CRM System Processing                                │
│ - Identifies contact by email address               │
│ - Creates interaction record (type: email)          │
│ - Extracts subject and body                         │
│ - Links to related deal (if found)                  │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Activity Timeline Updated                            │
│ - Displays in contact's activity feed               │
│ - Notification to other team members (if watching)  │
└─────────────────────────────────────────────────────┘
```

---

## Inventory Management Workflows

### 3. Stock Receiving Process

```
┌─────────────────────────────────────────────────────┐
│ Purchase Order Arrives                               │
│ - Physical goods delivered to warehouse             │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Warehouse Manager Logs Receipt                       │
│ 1. Navigate to Inventory > Receive Stock            │
│ 2. Scan barcode or enter SKU                        │
│ 3. Enter quantity received                          │
│ 4. Assign to warehouse location                     │
│ 5. Enter batch number (if applicable)               │
│ 6. Confirm receipt                                  │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions                                       │
│ - Creates InventoryTransaction (type: "in")         │
│ - Updates StockLocation.quantity                    │
│ - Updates Product.stockLevel                        │
│ - Checks if below reorder point, clears alert       │
│ - Triggers webhook: inventory.stock.received        │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Notifications                                        │
│ - Notify purchasing team: stock received            │
│ - Update pending orders using this stock            │
└─────────────────────────────────────────────────────┘
```

### 4. Stock Fulfillment Process

```
┌─────────────────────────────────────────────────────┐
│ Order Placed (via Invoice or External System)       │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Stock Allocation                                     │
│ - System checks stock availability                  │
│ - Allocates stock (StockLocation.allocatedQty++)    │
│ - Reduces availableQty                              │
│ - Creates picking task for warehouse                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Warehouse Picking                                    │
│ - Warehouse staff receives picking list             │
│ - Locates items (bin locations provided)            │
│ - Scans items to verify                             │
│ - Packs items for shipment                          │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Confirm Shipment                                     │
│ - Click "Confirm Shipment"                          │
│ - Enter tracking number                             │
│ - Enter carrier info                                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions                                       │
│ - Creates InventoryTransaction (type: "out")        │
│ - Reduces StockLocation.quantity                    │
│ - Reduces allocatedQty to 0                         │
│ - Updates Product.stockLevel                        │
│ - Checks if below reorder point, triggers alert     │
│ - Updates invoice status to "Fulfilled"             │
│ - Sends shipping notification to customer           │
│ - Triggers webhook: inventory.stock.fulfilled       │
└─────────────────────────────────────────────────────┘
```

### 5. Low Stock Alert Workflow

```
┌─────────────────────────────────────────────────────┐
│ Trigger: Stock Level ≤ Reorder Point                │
│ - Detected during inventory transaction             │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Creates Alert                                 │
│ - Creates notification record                       │
│ - Flags product as "low stock"                      │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Notification Dispatch                                │
│ - Email to inventory manager                        │
│ - In-app notification                               │
│ - Dashboard widget update                           │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Manager Reviews Alert                                │
│ - Views low-stock report                            │
│ - Decides on reorder                                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌──────┴──────┐
│ Auto-Reorder│──────────────┐
│ Enabled?    │              │
└──────┬──────┘              │
    Yes│               No    │
       ▼                     ▼
┌─────────────────┐   ┌──────────────────────┐
│ System Creates  │   │ Manager Manually     │
│ Purchase Order  │   │ Creates PO or        │
│ Automatically   │   │ Dismisses Alert      │
└──────┬──────────┘   └──────┬───────────────┘
       │                     │
       └──────────┬──────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│ Purchase Order Sent to Supplier                      │
│ - Email with PO details                             │
│ - Track PO status                                   │
└─────────────────────────────────────────────────────┘
```

### 6. Inventory Transfer Between Warehouses

```
┌─────────────────────────────────────────────────────┐
│ Initiate Transfer                                    │
│ - Navigate to Inventory > Transfer Stock            │
│ - Select product                                    │
│ - Select source warehouse                           │
│ - Select destination warehouse                      │
│ - Enter quantity                                    │
│ - Enter reason                                      │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Validation                                    │
│ - Check if source has sufficient stock              │
│ - Allocate stock at source                          │
│ - Create transfer task                              │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Source Warehouse Actions                             │
│ - Pick items                                        │
│ - Pack for transfer                                 │
│ - Scan items and confirm dispatch                   │
│ - Enter tracking number                             │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions on Dispatch                           │
│ - Create InventoryTransaction (type: "transfer")    │
│ - Reduce StockLocation.quantity at source           │
│ - Status: "in_transit"                              │
│ - Notify destination warehouse                      │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Destination Warehouse Actions                        │
│ - Receive notification of incoming transfer         │
│ - Receive physical goods                            │
│ - Scan items and confirm receipt                    │
│ - Assign bin location                               │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions on Receipt                            │
│ - Create InventoryTransaction (type: "in")          │
│ - Increase StockLocation.quantity at destination    │
│ - Update product.stockLevel (global)                │
│ - Mark transfer as "completed"                      │
│ - Trigger webhook: inventory.transfer.completed     │
└─────────────────────────────────────────────────────┘
```

---

## Financial Workflows

### 7. Invoice Generation & Payment Collection

```
┌─────────────────────────────────────────────────────┐
│ Trigger: Deal Closed Won / Manual Invoice Creation │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Create Invoice                                       │
│ 1. Navigate to Invoices > Create New                │
│ 2. Select customer (company)                        │
│ 3. Add line items:                                  │
│    - From product catalog OR                        │
│    - Custom line items                              │
│ 4. Apply discounts (percentage or fixed)            │
│ 5. Set payment terms ("Net 30", "Due on Receipt")   │
│ 6. Add notes and terms & conditions                 │
│ 7. Review PDF preview                               │
│ 8. Save as draft or send immediately                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions on Invoice Save                       │
│ - Generates invoice number (auto-increment)         │
│ - Calculates subtotal, tax, total                   │
│ - Sets due date (based on payment terms)            │
│ - Status: "draft"                                   │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Send Invoice                                         │
│ - Click "Send Invoice"                              │
│ - Select delivery method:                           │
│   • Email (default)                                 │
│   • Download PDF                                    │
│   • Generate payment link (Stripe)                  │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions on Send                               │
│ - Status: "sent"                                    │
│ - Sends email with PDF attachment                   │
│ - Includes payment link (if applicable)             │
│ - Triggers webhook: invoice.sent                    │
│ - Tracks email opens                                │
│ - Creates reminder tasks (based on due date)        │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Customer Receives Invoice                            │
│ - Opens email                                       │
│ - Views invoice PDF                                 │
│ - Clicks payment link (if applicable)               │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Payment Processing                                   │
│ Option A: Online Payment                            │
│ - Customer enters payment info on Stripe page       │
│ - Stripe processes payment                          │
│ - Webhook received: payment.succeeded               │
│                                                     │
│ Option B: Manual Payment Entry                      │
│ - Finance team receives check/wire transfer         │
│ - Navigate to invoice detail                        │
│ - Click "Record Payment"                            │
│ - Enter amount, date, method, reference             │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions on Payment Received                   │
│ - Creates Payment record                            │
│ - Updates invoice status:                           │
│   • "paid" (if full payment)                        │
│   • "partially_paid" (if partial payment)           │
│ - Updates invoice.paidDate                          │
│ - Reduces outstanding amount                        │
│ - Sends payment confirmation email to customer      │
│ - Triggers webhook: invoice.paid                    │
│ - Updates AR aging report                           │
│ - Cancels overdue reminders                         │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Accounting Integration (Optional)                    │
│ - Syncs to QuickBooks/Xero                          │
│ - Creates invoice record in accounting system       │
│ - Records payment                                   │
│ - Reconciles with bank transactions                 │
└─────────────────────────────────────────────────────┘
```

### 8. Overdue Invoice Management

```
┌─────────────────────────────────────────────────────┐
│ Daily Cron Job: Check Overdue Invoices              │
│ - Runs at 9:00 AM daily                            │
│ - Queries invoices where:                           │
│   • status = "sent" OR "partially_paid"            │
│   • dueDate < today                                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Update Invoice Status                                │
│ - Status: "overdue"                                 │
│ - Calculate days overdue                            │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Automated Reminder Sequence                          │
│ Day 1 Overdue:                                      │
│ - Send polite reminder email                        │
│ - Subject: "Friendly Reminder: Invoice #INV-001"    │
│                                                     │
│ Day 7 Overdue:                                      │
│ - Send second reminder                              │
│ - CC account manager                                │
│                                                     │
│ Day 14 Overdue:                                     │
│ - Send final notice                                 │
│ - CC finance manager                                │
│ - Create escalation task for collections team       │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Escalation Workflow (Day 14+)                        │
│ - Task assigned to collections specialist          │
│ - Collections specialist contacts customer          │
│ - Logs interaction in CRM                           │
│ - Negotiates payment plan (if needed)               │
│ - May pause services (if applicable)                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Payment Resolution                                   │
│ - Customer makes payment                            │
│ - Invoice marked as paid                            │
│ - Services restored (if paused)                     │
│ - Case closed                                       │
└─────────────────────────────────────────────────────┘
```

### 9. Quote to Invoice Conversion

```
┌─────────────────────────────────────────────────────┐
│ Quote Created (status: "draft")                     │
│ - Quote sent to customer                            │
│ - Customer reviews and approves                     │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Convert Quote to Invoice                             │
│ 1. Navigate to quote detail page                    │
│ 2. Click "Convert to Invoice"                       │
│ 3. System pre-fills invoice with quote data:        │
│    - Customer                                       │
│    - Line items                                     │
│    - Pricing                                        │
│    - Discounts                                      │
│    - Notes                                          │
│ 4. Adjust any fields if needed                      │
│ 5. Set payment terms                                │
│ 6. Click "Create Invoice"                           │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ System Actions                                       │
│ - Creates new Invoice record                        │
│ - Links invoice to original quote                   │
│ - Updates quote status to "converted"               │
│ - Generates invoice number                          │
│ - Copies all line items                             │
│ - Maintains pricing and discounts                   │
│ - Links to same deal (if applicable)                │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Send Invoice to Customer                             │
│ - Follow standard invoice send workflow             │
└─────────────────────────────────────────────────────┘
```

---

## Approval Workflows

### 10. Multi-Step Invoice Approval

```
┌─────────────────────────────────────────────────────┐
│ Invoice Created (amount > $10,000)                  │
│ - Triggers approval workflow                        │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Workflow Instance Created                            │
│ - Template: "Invoice Approval - High Value"         │
│ - Steps:                                            │
│   1. Manager Approval                               │
│   2. Finance Director Approval                      │
│   3. CFO Approval (if amount > $50,000)             │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Step 1: Manager Approval                             │
│ - Notification sent to invoice creator's manager    │
│ - Email: "Approval Required: Invoice #INV-001"      │
│ - In-app notification                               │
│ - Dashboard shows pending approval                  │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Manager Reviews Invoice                              │
│ - Clicks notification link                          │
│ - Views invoice details                             │
│ - Options:                                          │
│   • Approve                                         │
│   • Reject (with reason)                            │
│   • Request Changes (with notes)                    │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌──────┴──────┐
│ Approved?   │
└──────┬──────┘
    Yes│               No
       ▼                     ▼
┌─────────────────┐   ┌──────────────────────┐
│ Move to Step 2  │   │ Workflow Rejected    │
└──────┬──────────┘   │ - Invoice creator    │
       │              │   notified           │
       │              │ - Invoice status:    │
       │              │   "changes_required" │
       │              └──────────────────────┘
       ▼
┌─────────────────────────────────────────────────────┐
│ Step 2: Finance Director Approval                    │
│ - Same approval process as Step 1                   │
│ - If approved, move to Step 3 (if amount > $50k)    │
│   OR mark workflow as completed                     │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Workflow Completed                                   │
│ - Invoice status: "approved"                        │
│ - Invoice can now be sent to customer               │
│ - Notification to invoice creator                   │
│ - Trigger webhook: workflow.approved                │
└─────────────────────────────────────────────────────┘
```

### 11. SLA Tracking & Escalation

```
┌─────────────────────────────────────────────────────┐
│ Workflow Instance Created                            │
│ - SLA: 24 hours for each approval step              │
│ - slaDeadline calculated: createdAt + 24 hours      │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Hourly Cron Job: Check SLA Status                   │
│ - Queries WorkflowInstance where:                   │
│   • status = "pending" OR "in_progress"            │
│   • slaDeadline < now                              │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ SLA Breach Detected                                  │
│ - Update isOverdue = true                           │
│ - Calculate hours overdue                           │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Escalation Action                                    │
│ If < 12 hours overdue:                              │
│ - Send reminder to current approver                 │
│ - CC their manager                                  │
│                                                     │
│ If >= 12 hours overdue:                             │
│ - Escalate to approver's manager                    │
│ - Manager can approve on behalf of direct report    │
│                                                     │
│ If >= 24 hours overdue:                             │
│ - Escalate to VP level                              │
│ - Create high-priority task                         │
│ - Send Slack notification (if integrated)           │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Approval Action Taken                                │
│ - Workflow continues or completes                   │
│ - SLA breach logged for reporting                   │
└─────────────────────────────────────────────────────┘
```

---

## User Roles & Permissions

### Role Definitions

#### 1. Admin
**Full System Access**
- All CRUD operations across all modules
- User management
- System configuration
- Workflow template creation
- Report configuration

#### 2. Sales Manager
**CRM + Reporting**
- Full access to CRM module
- View all contacts, companies, deals
- Edit own team's records
- Approve deals > $50k
- View sales reports and dashboards
- Cannot access inventory or financial data

#### 3. Sales Representative
**Limited CRM Access**
- View/edit own contacts and deals
- View own company records
- Create quotes and invoices
- Cannot delete records
- Cannot access other reps' data (unless shared)

#### 4. Inventory Manager
**Inventory + Products**
- Full access to inventory module
- Manage products, warehouses, stock levels
- Process stock transactions
- View inventory reports
- Cannot access CRM or financial data

#### 5. Finance Manager
**Financial Operations**
- Full access to invoicing module
- View all invoices and payments
- Process payments
- Generate financial reports
- Approve invoices > $10k
- Integration with accounting software

#### 6. Accountant
**Read-Only Financial Access**
- View invoices and payments
- View financial reports
- Export data for accounting
- Cannot create or modify invoices
- Cannot process payments

#### 7. Workflow Administrator
**Workflow Management**
- Create and edit workflow templates
- Monitor workflow instances
- Override approvals (emergency)
- Configure SLA rules
- View workflow analytics

#### 8. Read-Only User
**View-Only Access**
- View records across modules (based on permissions)
- Cannot create, edit, or delete
- Cannot approve workflows
- Can generate reports

### Permission Matrix

| Action | Admin | Sales Manager | Sales Rep | Inventory Manager | Finance Manager | Accountant | Workflow Admin | Read-Only |
|--------|-------|---------------|-----------|-------------------|-----------------|------------|----------------|-----------|
| **CRM Module** | | | | | | | | |
| Create Contact | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Own Contact | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Any Contact | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Contact | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Deals | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Inventory Module** | | | | | | | | |
| Manage Products | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Process Stock Transactions | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Stock Levels | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Invoicing Module** | | | | | | | | |
| Create Invoice | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Edit Invoice | ✅ | ✅ | ✅ (own) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Process Payment | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Financial Reports | ✅ | ✅ (sales only) | ✅ (own only) | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Workflow Module** | | | | | | | | |
| Create Workflow Template | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Approve Workflow | ✅ | ✅ (if assigned) | ✅ (if assigned) | ✅ (if assigned) | ✅ (if assigned) | ❌ | ✅ | ❌ |
| Override Workflow | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **System Admin** | | | | | | | | |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Role Assignment

```typescript
// Clerk custom claims in JWT
{
  "userId": "user_123",
  "email": "sales@company.com",
  "metadata": {
    "role": "sales_rep",
    "department": "sales",
    "managerId": "user_456",
    "permissions": [
      "crm:contacts:create",
      "crm:contacts:read:own",
      "crm:contacts:update:own",
      "crm:deals:create",
      "crm:deals:read:own",
      "invoices:create"
    ]
  }
}
```

---

## Integration Touchpoints

### Email Integration Points

1. **Contact Created** → Send welcome email (if enabled)
2. **Deal Stage Changed** → Notify team members
3. **Invoice Sent** → Email with PDF attachment
4. **Payment Received** → Send receipt email
5. **Workflow Approval Needed** → Notification email
6. **Overdue Invoice** → Reminder emails (automated sequence)
7. **Low Stock Alert** → Notification to inventory manager

### Webhook Events

```javascript
// Example webhook payloads

// CRM Events
{
  "event": "crm.contact.created",
  "data": {
    "contactId": "contact_123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "companyId": "company_456"
  },
  "timestamp": "2026-01-27T10:30:00Z",
  "userId": "user_789"
}

// Inventory Events
{
  "event": "inventory.stock.low",
  "data": {
    "productId": "product_123",
    "sku": "WIDGET-001",
    "currentStock": 5,
    "reorderPoint": 10,
    "warehouseId": "warehouse_456"
  },
  "timestamp": "2026-01-27T10:30:00Z",
  "userId": "user_789"
}

// Financial Events
{
  "event": "invoice.paid",
  "data": {
    "invoiceId": "invoice_123",
    "invoiceNumber": "INV-2026-001",
    "amount": 150000,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "companyId": "company_456"
  },
  "timestamp": "2026-01-27T10:30:00Z",
  "userId": "user_789"
}

// Workflow Events
{
  "event": "workflow.approved",
  "data": {
    "workflowId": "workflow_123",
    "templateName": "Invoice Approval - High Value",
    "referenceType": "invoice",
    "referenceId": "invoice_456",
    "approvedBy": "user_789",
    "completedInHours": 18
  },
  "timestamp": "2026-01-27T10:30:00Z",
  "userId": "user_789"
}
```

### Calendar Integration

1. **Meeting Logged in CRM** → Create calendar event
2. **Task with Due Date** → Create calendar reminder
3. **Invoice Due Date** → Create calendar event for follow-up
4. **Workflow SLA Deadline** → Create calendar alert

### Accounting Software Integration

**Sync Direction: ERP/CRM → QuickBooks/Xero**

1. **Invoice Created** → Sync to accounting system
2. **Payment Received** → Record in accounting system
3. **Customer Created** → Sync to accounting system as customer
4. **Product Created** → Sync as item/service

**Sync Frequency:** Real-time via webhooks (fallback: hourly batch)

---

## Summary

This document outlines the core business processes and user workflows for the CCW-ERP/CRM system. The workflows are designed to:

1. **Streamline Operations**: Reduce manual data entry and repetitive tasks
2. **Ensure Compliance**: Audit trails, approvals, and role-based access
3. **Improve Visibility**: Real-time dashboards, notifications, and reporting
4. **Enable Integrations**: Webhooks, APIs, and third-party connectors

### Next Steps

1. Review workflows with stakeholders
2. Identify custom workflow requirements
3. Define automation triggers
4. Configure approval hierarchies
5. Set up integrations (email, calendar, accounting)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Related Documents:**
- [System Architecture](./ccw-erp-crm.md)
- Database Schema (see Architecture doc)
- API Specifications (see Architecture doc)
