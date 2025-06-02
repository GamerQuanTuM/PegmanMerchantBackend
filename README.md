# Pegman Backend Database Schema

This document provides an overview of the database schema used in the Pegman backend application. It includes details about all tables, their fields, and relationships.

## Table of Contents

- [Enumerations](#enumerations)
- [Tables](#tables)
  - [Users](#users)
  - [Owner](#owner)
  - [Outlet](#outlet)
  - [Outlet Details](#outlet-details)
  - [Outlet Legal Document](#outlet-legal-document)
  - [Outlet Manager](#outlet-manager)
  - [Outlet Bartender](#outlet-bartender)
  - [Outlet Timing](#outlet-timing)
  - [Outlet Timing Slot](#outlet-timing-slot)
  - [Collection](#collection)
  - [Liquor](#liquor)
  - [Infinity Pass](#infinity-pass)
  - [Ticket](#ticket)
  - [Ticket Item](#ticket-item)
- [Relationships](#relationships)

## Enumerations

The application uses several PostgreSQL enumerations to enforce data consistency:

### `establishment_type`
- BAR
- RESTAURANT_CUM_BAR
- LIQUOR_SHOP
- PUB
- LOUNGE
- RESTAURANT

### `tier`
- GOLD
- SILVER
- CRYSTAL

### `role`
- SUPER_ADMIN
- ADMIN
- MANAGER
- USER

### `account_type`
- SAVINGS
- CURRENT

### `day_of_week`
- MONDAY
- TUESDAY
- WEDNESDAY
- THURSDAY
- FRIDAY
- SATURDAY
- SUNDAY

### `collection_type`
- GOLD
- SILVER
- CRYSTAL

## Tables

### Users

Stores user authentication and role information.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | User email (unique) |
| password | VARCHAR(255) | Hashed password |
| role | role | User role enum |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Owner

Stores information about outlet owners.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Owner name |
| email | VARCHAR | Owner email |
| mobileNumber | VARCHAR(10) | Mobile number (unique) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet

Central table that connects all outlet-related information.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| ownerId | UUID | Reference to owner |
| isVerified | BOOLEAN | Verification status |
| detailsId | UUID | Reference to outlet details |
| legalDocumentId | UUID | Reference to legal documents |
| managerId | UUID | Reference to outlet manager |
| timingId | UUID | Reference to outlet timing |
| bartenderId | UUID | Reference to outlet bartender |
| goldCollectionId | UUID | Reference to gold collection |
| silverCollectionId | UUID | Reference to silver collection |
| crystalCollectionId | UUID | Reference to crystal collection |
| infinityPassId | UUID | Reference to infinity pass |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Details

Stores basic information about an outlet.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Outlet name |
| address | TEXT | Full address |
| contactNumber | VARCHAR(10) | Contact number |
| latitude | DOUBLE PRECISION | Geographic latitude |
| longitude | DOUBLE PRECISION | Geographic longitude |
| country | VARCHAR(100) | Country |
| pincode | VARCHAR(6) | Postal code |
| outletImageUrls | TEXT[] | Array of image URLs |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Legal Document

Stores legal and financial information about an outlet.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| fssaiNumber | VARCHAR(14) | Food safety license number |
| fssaiUrl | TEXT | FSSAI document URL |
| onShopLicenseUrl | TEXT | On-shop license document URL |
| offShopLicenseUrl | TEXT | Off-shop license document URL |
| panCardNumber | VARCHAR(10) | PAN card number |
| panCardUrl | TEXT | PAN card document URL |
| gstNumber | VARCHAR(15) | GST registration number |
| bankAccountNumber | VARCHAR(30) | Bank account number |
| bankAccountType | account_type | Type of bank account |
| bankIfscCode | VARCHAR(11) | Bank IFSC code |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Manager

Stores information about outlet managers.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Manager name |
| contactNumber | VARCHAR(10) | Contact number |
| email | VARCHAR(320) | Email address |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Bartender

Stores information about outlet bartenders.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Bartender name |
| contactNumber | VARCHAR(10) | Contact number |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Timing

Stores general timing information about an outlet.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| establishmentType | establishment_type | Type of establishment |
| hotelStay | BOOLEAN | Whether hotel stay is available |
| eventSpace | BOOLEAN | Whether event space is available |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Outlet Timing Slot

Stores specific opening and closing times for each day of the week.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| outletTimingId | UUID | Reference to outlet timing |
| day | day_of_week | Day of the week |
| openingTime | TIME | Opening time |
| closingTime | TIME | Closing time |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Collection

Stores information about collections (Gold, Silver, Crystal).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| type | tier | Collection tier |
| pegsPerDay | INTEGER | Number of pegs allowed per day |
| labelOne | VARCHAR(255) | First label |
| labelTwo | VARCHAR(255) | Second label |
| startDate | DATE | Start date of validity |
| endDate | DATE | End date of validity |
| bookingPrice | INTEGER | Booking price |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Liquor

Stores information about liquor options in collections.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| collectionId | UUID | Reference to collection |
| category | VARCHAR(256) | Liquor category |
| startingPrice | INTEGER | Starting price |
| brandNames | VARCHAR(256)[] | Array of brand names |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Infinity Pass

Stores information about infinity passes.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| startTime | TIME | Start time |
| endTime | TIME | End time |
| specialOffer | VARCHAR(255) | Special offer description |
| cuisine | VARCHAR(255) | Cuisine type |
| liquorType | VARCHAR(255) | Liquor type |
| days | day_of_week[] | Array of days |
| price | INTEGER | Price |
| commission | INTEGER | Commission amount |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Ticket

Stores information about user tickets for collections.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Reference to user |
| collectionId | UUID | Reference to collection |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

### Ticket Item

Stores details about items in a ticket.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| ticketId | UUID | Reference to ticket |
| category | VARCHAR(100) | Item category |
| brandNames | VARCHAR(255) | Brand names |
| pegs | INTEGER | Number of pegs |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

## Relationships

### User Relationships
- A user can have many tickets

### Owner Relationships
- An owner can have many outlets

### Outlet Relationships
- An outlet belongs to one owner
- An outlet has one details record
- An outlet has one legal document record
- An outlet has one manager
- An outlet has one timing record
- An outlet has one bartender (optional)
- An outlet can have one gold collection
- An outlet can have one silver collection
- An outlet can have one crystal collection
- An outlet can have one infinity pass

### Outlet Timing Relationships
- An outlet timing can have many timing slots

### Collection Relationships
- A collection can have many liquors
- A collection can have many tickets

### Ticket Relationships
- A ticket belongs to one user
- A ticket belongs to one collection
- A ticket can have many ticket items

### Liquor Relationships
- A liquor belongs to one collection