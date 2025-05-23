import { pgEnum } from "drizzle-orm/pg-core"


export const establishmentTypeEnum = pgEnum('establishment_type', [
    "BAR",
    "RESTAURANT_CUM_BAR",
    "LIQUOR_SHOP",
    "PUB",
    "LOUNGE",
    "RESTAURANT"
]);

export const passTypeEnum = pgEnum('pass_type', [
    'GOLD',
    "SILVER",
    'CRYSTAL'
]);

export const roleEnum = pgEnum('role', [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "USER"
])

export const accountTypeEnum = pgEnum('account_type', [
    "SAVINGS",
    "CURRENT"
])