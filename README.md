# Vendor Platform Database Schema

This document describes the database schema and relationships for the Vendor Platform.

## Database Schema Overview

The schema consists of several main entities:

1. **User**: Represents system users with authentication details
2. **Owner**: Represents business owners who manage outlets
3. **Outlet**: Represents physical business locations
4. **Manager**: Represents staff managing specific outlets
5. **Bartender**: Represents bar staff at outlets
6. **Address/Location**: Geographic information for outlets
7. **ContactInfo**: Contact details for various entities
8. **LegalDocuments**: Business documentation and verification
9. **OutletImages**: Media associated with outlets

## Key Relationships

### 1. User ↔ Owner
- One-to-one relationship
- Each user can be associated with one owner account
- Owner records reference the user ID

### 2. Owner ↔ Outlet
- One-to-many relationship
- An owner can have multiple outlets (one owner → many outlets)
- Each outlet references its owner via `owner_id` foreign key
- The relationship is defined in both directions:
  - Owner has many Outlets (`ownerRelations`)
  - Outlet belongs to one Owner (`outletRelations`)

### 3. Outlet ↔ OutletPrimaryDetails
- One-to-one relationship
- Contains core information about the outlet including:
  - Address
  - Contact info
  - Location coordinates
  - Manager details
  - Bartender details

### 4. Outlet ↔ OutletTimings
- One-to-one relationship
- Contains operating hours and establishment type

### 5. Outlet ↔ OutletImages
- One-to-many relationship
- An outlet can have multiple images
- Images are stored with metadata including S3 links

### 6. Outlet ↔ LegalDocuments
- One-to-one relationship
- Contains all required business documentation

### 7. Manager ↔ ContactInfo
- One-to-one relationship
- Managers have their own contact information

## Technical Notes

- All tables include `created_at` and `updated_at` timestamps
- Primary keys are UUIDs unless otherwise specified
- Foreign key relationships are explicitly defined
- The schema supports both relational queries and document-style nested data where appropriate
- The Owner-Outlet relationship is properly modeled as one-to-many with proper foreign key constraints

## Essential Foreign Key Dependency Order

The following describes which entities must exist before others, based on foreign key constraints:

- **Owner** must exist before an **Outlet** can be created (`outlet.owner_id → owner.id`).
- **OutletPrimaryDetails**, **OutletTimings**, **OutletImages**, and **LegalDocuments** must exist before an **Outlet** can be created, as `outlet` references their IDs.
- **Address**, **ContactInfo**, **Location**, **Manager**, and **Bartender** must exist before **OutletPrimaryDetails** can be created, as `outlet_primary_details` references their IDs.
- **ContactInfo** must exist before a **Manager** can be created (`manager.contact_info_id → contact_info.id`).
- **ImageMetadata** must exist before it can be linked to **OutletImages** (if such a relation exists).

**Summary Table of Foreign Key Dependencies:**

| Child Table              | Foreign Key Field           | Parent Table           |
|-------------------------|----------------------------|------------------------|
| outlet                  | owner_id                   | owner                  |
| outlet                  | outlet_primary_details_id   | outlet_primary_details |
| outlet                  | outlet_timings_id           | outlet_timings         |
| outlet                  | outlet_images_id            | outlet_images          |
| outlet                  | legal_documents_id          | legal_documents        |
| outlet_primary_details  | address_id                  | address                |
| outlet_primary_details  | contact_info_id             | contact_info           |
| outlet_primary_details  | location_id                 | location               |
| outlet_primary_details  | manager_id                  | manager                |
| outlet_primary_details  | bartender_id                | bartender              |
| manager                 | contact_info_id             | contact_info           |

**Note:** Attempting to create a child record before its parent will result in a foreign key constraint error. Always create parent entities first, then their dependents.