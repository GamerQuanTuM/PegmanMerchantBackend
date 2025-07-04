import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler } from "../../types";
import { db } from "../../db";
import { outlet, outletBartender, outletLegalDocument, outletManager, outletsDetails, outletTiming, outletTimingSlot } from "../../db/schema";
import { CreateOutletLegalDocumentsSchema, CreateOutletDetailsSchema, CreateOutletTimingSchema, CreateOutletSchema, GetOutletSchemaById, VerifyOutletSchema, AddOutletTimingSlotSchema, UpdateOutletTimingSlotSchema, UpdateOutletDetailsSchema, UpdateOutletLegalDocumentsSchema } from "./outlet.route";
import { uploadFiles } from "../../lib/storage"
import { eq } from "drizzle-orm";

export const createOutletLegalDocuments: AppRouteHandler<CreateOutletLegalDocumentsSchema> = async (c) => {
    const { bankAccountType, fssaiNumber, gstNumber, bankAccountNumber, bankIfscCode, panCardNumber, fssaiImage, offShopLicenseImage, onShopLicenseImage, panCardImage } = c.req.valid("form");

    //TODO: UPLOAD FILES TO S3 STORAGE AND GET THE URLS

    let fssaiUrl = "";
    let offShopLicenseUrl = "";
    let onShopLicenseUrl = "";
    let panCardUrl = "";

    if (fssaiImage) {
        const [url] = await uploadFiles([fssaiImage]);
        fssaiUrl = url;
    }

    if (offShopLicenseImage) {
        const [url] = await uploadFiles([offShopLicenseImage]);
        offShopLicenseUrl = url;
    }

    if (onShopLicenseImage) {
        const [url] = await uploadFiles([onShopLicenseImage]);
        onShopLicenseUrl = url;
    }

    if (panCardImage) {
        const [url] = await uploadFiles([panCardImage]);
        panCardUrl = url;
    }

    const [outletLegalDocumentData] = await db.insert(outletLegalDocument).values({
        bankAccountType, fssaiNumber, gstNumber, bankAccountNumber, bankIfscCode, panCardNumber, fssaiUrl, offShopLicenseUrl, onShopLicenseUrl, panCardUrl
    }).returning();

    const response = {
        message: "Outlet legal document created successfully",
        data: outletLegalDocumentData
    }

    return c.json(response, HttpStatusCode.CREATED);
}

export const createOutletDetails: AppRouteHandler<CreateOutletDetailsSchema> = async (c) => {
    const { address, contactNumber, country, latitude, longitude, name, pincode, outlet_images, bartenderContactNumber, bartenderName, managerContactNumber, managerEmail, managerName } = c.req.valid("form");

    if (outlet_images?.length > 2) {
        return c.json({
            message: "Outlet images cannot be more than 2",
        }, HttpStatusCode.BAD_REQUEST);
    }

    let image_urls: string[] = [];

    //TODO: UPLOAD FILES TO S3 STORAGE AND GET THE URLS
    if (outlet_images) {
        image_urls = await uploadFiles(outlet_images);
    }

    const [outletDetailsData] = await db.insert(outletsDetails).values({
        address, contactNumber, country, latitude, longitude, name, pincode,
        outletImageUrls: image_urls,
    }).returning();

    const [outletBartenderData] = await db.insert(outletBartender).values({
        name: bartenderName,
        contactNumber: bartenderContactNumber,
    }).returning();

    const [outletManagerData] = await db.insert(outletManager).values({
        name: managerName,
        contactNumber: managerContactNumber,
        email: managerEmail,
    }).returning();


    const response = {
        message: "Outlet details created successfully",
        data: {
            details: outletDetailsData,
            bartender: outletBartenderData,
            manager: outletManagerData ?? null,
        }
    }

    return c.json(response, HttpStatusCode.CREATED);
}

export const createOutletTiming: AppRouteHandler<CreateOutletTimingSchema> = async (c) => {

    const { establishmentType, eventSpace, hotelStay, slots } = c.req.valid("json");


    if (!slots || slots.length === 0) {
        return c.json(
            {
                message: "At least one time slot is required"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    for (const slot of slots) {
        if (!slot.day || !slot.openingTime || !slot.closingTime) {
            return c.json(
                {
                    message: "Each slot must have day, openingTime, and closingTime"
                },
                HttpStatusCode.BAD_REQUEST
            );
        }

        // Validate time logic (opening time should be before closing time)
        if (slot.openingTime >= slot.closingTime) {
            return c.json(
                {
                    message: `Opening time must be before closing time for ${slot.day}`
                },
                HttpStatusCode.BAD_REQUEST
            );
        }
    }

    // Check for duplicate days
    const days = slots.map(slot => slot.day);
    const uniqueDays = new Set(days);
    if (days.length !== uniqueDays.size) {
        return c.json(
            {
                message: "Each day can only have one time slot"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    // Execute in transaction for data consistency
    const result = await db.transaction(async (tx) => {
        // Insert outlet timing
        const [outletTimingData] = await tx.insert(outletTiming).values({
            establishmentType,
            eventSpace,
            hotelStay,
        }).returning();

        // Batch insert slots for better performance
        const insertedSlots = await tx.insert(outletTimingSlot).values(
            slots.map((slot) => ({
                day: slot.day,
                openingTime: slot.openingTime,
                closingTime: slot.closingTime,
                outletTimingId: outletTimingData.id,
            }))
        ).returning();

        return { outletTimingData, insertedSlots };
    });

    const response = {
        message: "Outlet timing created successfully",
        data: {
            ...result.outletTimingData,
            slots: result.insertedSlots,
        },
    };

    return c.json(response, HttpStatusCode.CREATED);

};


export const createOutlet: AppRouteHandler<CreateOutletSchema> = async (c) => {
    const { bartenderId, detailsId, legalDocumentId, managerId, ownerId, timingId } = c.req.valid("json");

    // Check if bartender exists
    if (bartenderId) {
        const bartenderExists = await db.query.outletBartender.findFirst({
            where: (bartender, { eq }) => eq(bartender.id, bartenderId)
        });

        if (!bartenderExists) {
            return c.json({
                message: "Bartender not found",
            }, HttpStatusCode.NOT_FOUND);
        }
    }

    // Check if outlet details exists
    const detailsExists = await db.query.outletsDetails.findFirst({
        where: (details, { eq }) => eq(details.id, detailsId)
    });
    if (!detailsExists) {
        return c.json({
            message: "Outlet details not found",
        }, HttpStatusCode.NOT_FOUND);
    }

    // Check if legal document exists
    const legalDocumentExists = await db.query.outletLegalDocument.findFirst({
        where: (doc, { eq }) => eq(doc.id, legalDocumentId)
    });
    if (!legalDocumentExists) {
        return c.json({
            message: "Legal document not found",
        }, HttpStatusCode.NOT_FOUND);
    }

    // Check if manager exists
    const managerExists = await db.query.outletManager.findFirst({
        where: (manager, { eq }) => eq(manager.id, managerId)
    });
    if (!managerExists) {
        return c.json({
            message: "Manager not found",
        }, HttpStatusCode.NOT_FOUND);
    }

    // Check if timing exists
    const timingExists = await db.query.outletTiming.findFirst({
        where: (timing, { eq }) => eq(timing.id, timingId)
    });
    if (!timingExists) {
        throw new Error("Timing not found");
    }

    // Check if owner exists
    const ownerExists = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.id, ownerId)
    });
    if (!ownerExists) {
        return c.json({
            message: "Owner not found",
        }, HttpStatusCode.NOT_FOUND);
    }



    const [outletData] = await db.insert(outlet).values({
        bartenderId,
        detailsId,
        legalDocumentId,
        managerId,
        ownerId,
        timingId
    }).returning();

    const response = {
        message: "Outlet created successfully",
        data: outletData
    }

    return c.json(response, HttpStatusCode.CREATED);
}

export const getOutletById: AppRouteHandler<GetOutletSchemaById> = async (c) => {
    const { id } = c.req.valid("param");
    const { bartender, details, legalDocument, manager, timing, owner } = c.req.valid("query");

    const outletData = await db.query.outlet.findFirst({
        where: (outlet, { eq }) => eq(outlet.id, id),
        columns: {
            id: true,
            createdAt: true,
            updatedAt: true,
            isVerified: true,
        },
        with: {
            bartender: bartender ? true : undefined,
            details: details ? true : undefined,
            legalDocument: legalDocument ? true : undefined,
            manager: manager ? true : undefined,
            owner: owner ? true : undefined,
            timing: timing ? {
                with: {
                    slots: true
                }
            } : undefined,
        }
    });

    if (!outletData) {
        return c.json({ message: "Outlet not found" }, HttpStatusCode.NOT_FOUND);
    }

    const normalizedData = {
        ...outletData,
        timing: outletData.timing ? {
            ...outletData.timing,
            slots: 'slots' in outletData.timing ? outletData.timing.slots : []
        } : null
    };

    const response = {
        message: "Outlet fetched successfully",
        data: normalizedData
    };

    return c.json(response, HttpStatusCode.OK);
};

export const verifyOutlet: AppRouteHandler<VerifyOutletSchema> = async (c) => {
    const { id } = c.req.valid("param");
    const { isVerified } = c.req.valid("json");

    // Check if the outlet exists
    const dbOutlet = await db.query.outlet.findFirst({
        where: (outlet, { eq }) => eq(outlet.id, id),
    });

    if (!dbOutlet) {
        return c.json({ message: "Outlet not found" }, HttpStatusCode.NOT_FOUND);
    }

    const [updatedOutlet] = await db
        .update(outlet)
        .set({ isVerified })
        .where(eq(outlet.id, id))
        .returning()

    return c.json({
        message: `Outlet ${isVerified ? "verified" : "unverified"} successfully`,
        data: updatedOutlet,
    }, HttpStatusCode.OK);
};

export const addOutletTiming: AppRouteHandler<AddOutletTimingSlotSchema> = async (c) => {
    const { id } = c.req.valid("param");
    const { day, openingTime, closingTime } = c.req.valid("json");

    const outletTimingData = await db.query.outletTiming.findFirst({
        where: (outletTiming, { eq }) => eq(outletTiming.id, id),
    });

    if (!outletTimingData) {
        return c.json({ message: "Outlet timing not found" }, HttpStatusCode.NOT_FOUND);
    }

    if (openingTime >= closingTime) {
        return c.json(
            {
                message: "Opening time must be before closing time"
            },
            HttpStatusCode.BAD_REQUEST
        );
    }

    const [outletTimingSlotData] = await db.insert(outletTimingSlot).values({
        day,
        openingTime,
        closingTime,
        outletTimingId: id,
    }).returning();

    const response = {
        message: "Outlet timing slot created successfully",
        data: outletTimingSlotData
    }

    return c.json(response, HttpStatusCode.CREATED);
}


export const updateOutletTimingSlot: AppRouteHandler<UpdateOutletTimingSlotSchema> = async (c) => {
    const { id } = c.req.valid("param");
    const { day, openingTime, closingTime } = c.req.valid("json");

    const outletTimingSlotData = await db.query.outletTimingSlot.findFirst({
        where: (outletTimingSlot, { eq }) => eq(outletTimingSlot.id, id),
    });

    if (!outletTimingSlotData) {
        return c.json({ message: "Outlet timing slot not found" }, HttpStatusCode.NOT_FOUND);
    }

    const [updatedOutletTimingSlot] = await db
        .update(outletTimingSlot)
        .set({ day, openingTime, closingTime })
        .where(eq(outletTimingSlot.id, id))
        .returning()

    const response = {
        message: "Outlet timing slot updated successfully",
        data: updatedOutletTimingSlot
    }

    return c.json(response, HttpStatusCode.OK);
}


export const updateOutletDetails: AppRouteHandler<UpdateOutletDetailsSchema> = async (c) => {
    const { id, bartenderId, managerId } = c.req.valid("query");
    const {
        address, contactNumber, country, latitude, longitude, name, pincode, outlet_images, bartenderContactNumber, bartenderName, managerContactNumber, managerEmail, managerName
    } = c.req.valid("form");

    if (id) {
        const existingOutletDetails = await db.query.outletsDetails.findFirst({
            where: (outletsDetails, { eq }) => eq(outletsDetails.id, id),
        });

        if (!existingOutletDetails) {
            return c.json({ message: "Outlet details not found" }, HttpStatusCode.NOT_FOUND);
        }

        const updateData: Partial<typeof outletsDetails.$inferInsert> = {};


        if (outlet_images && outlet_images?.length > 2) {
            return c.json({
                message: "Outlet images cannot be more than 2",
            }, HttpStatusCode.BAD_REQUEST);
        }

        let image_urls: string[] = [];

        //TODO: UPLOAD FILES TO S3 STORAGE AND GET THE URLS
        if (outlet_images) {
            image_urls = await uploadFiles(outlet_images);
        }

        if (address) updateData.address = address;
        if (contactNumber) updateData.contactNumber = contactNumber;
        if (country) updateData.country = country;
        if (latitude) updateData.latitude = latitude;
        if (longitude) updateData.longitude = longitude;
        if (name) updateData.name = name;
        if (pincode) updateData.pincode = pincode;
        if (outlet_images) updateData.outletImageUrls = image_urls;

        const [updatedOutletDetails] = await db
            .update(outletsDetails)
            .set(updateData)
            .where(eq(outletsDetails.id, id))
            .returning();

        if (!updatedOutletDetails) {
            return c.json({ message: "Failed to update outlet details" }, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    if (bartenderId) {
        const existingBartenderDetails = await db.query.outletBartender.findFirst({
            where: (outletBartender, { eq }) => eq(outletBartender.id, bartenderId)
        });

        if (!existingBartenderDetails) {
            return c.json({ message: "Bartender details not found" }, HttpStatusCode.NOT_FOUND);
        }

        const updateData: Partial<typeof outletsDetails.$inferInsert> = {};

        if (bartenderContactNumber) updateData.contactNumber = bartenderContactNumber;
        if (bartenderName) updateData.name = bartenderName;

        const [updatedBartenderDetails] = await db
            .update(outletBartender)
            .set(updateData)
            .where(eq(outletBartender.id, bartenderId))
            .returning();

        if (!updatedBartenderDetails) {
            return c.json({ message: "Failed to update bartender details" }, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    if (managerId) {
        const existingManagerDetails = await db.query.outletManager.findFirst({
            where: (outletManager, { eq }) => eq(outletManager.id, managerId)
        });

        if (!existingManagerDetails) {
            return c.json({
                message: "Manager details not found"
            }, HttpStatusCode.NOT_FOUND);
        }

        const updateData: Partial<typeof outletManager.$inferInsert> = {};

        if (managerContactNumber) updateData.contactNumber = managerContactNumber;
        if (managerName) updateData.name = managerName;
        if (managerEmail) updateData.email = managerEmail;

        const [updatedManagerDetails] = await db
            .update(outletManager)
            .set(updateData)
            .where(eq(outletManager.id, managerId))
            .returning();

        if (!updatedManagerDetails) {
            return c.json({
                message: "Failed to update manager details"
            }, HttpStatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    // Get the outlet details, bartender, manager
    const outletDetailsData = await db.query.outletsDetails.findFirst({
        where: (outletsDetails, { eq }) => id ? eq(outletsDetails.id, id) : undefined,
    });

    const bartenderDetailsData = bartenderId ? await db.query.outletBartender.findFirst({
        where: (outletBartender, { eq }) => eq(outletBartender?.id, bartenderId),
    }) : undefined;

    const managerDetailsData = await db.query.outletManager.findFirst({
        where: (outletManager, { eq }) => managerId ? eq(outletManager?.id, managerId) : undefined,
    });

    const resp = {
        message: "Outlet details updated successfully",
        data: {
            details: outletDetailsData ?? undefined,
            bartender: bartenderDetailsData ?? undefined,
            manager: managerDetailsData ?? undefined,
        }
    }

    // Return success response
    return c.json(resp, HttpStatusCode.OK);
};

export const updateLegalDocuments: AppRouteHandler<UpdateOutletLegalDocumentsSchema> = async (c) => {
    const { id } = c.req.valid("param");

    const { bankAccountType, fssaiNumber, gstNumber, bankAccountNumber, bankIfscCode, panCardNumber, fssaiImage, offShopLicenseImage, onShopLicenseImage, panCardImage } = c.req.valid("form");

    // Check if the document exists
    const [existingDocument] = await db
        .select()
        .from(outletLegalDocument)
        .where(eq(outletLegalDocument.id, id))
        .limit(1);

    if (!existingDocument) {
        return c.json(
            { message: "Outlet legal document not found" },
            HttpStatusCode.NOT_FOUND
        );
    }

    //TODO: UPLOAD FILES TO S3 STORAGE AND GET THE URLS

    let fssaiUrl = "";
    let offShopLicenseUrl = "";
    let onShopLicenseUrl = "";
    let panCardUrl = "";

    if (fssaiImage) {
        const [url] = await uploadFiles([fssaiImage]);
        fssaiUrl = url;
    }

    if (offShopLicenseImage) {
        const [url] = await uploadFiles([offShopLicenseImage]);
        offShopLicenseUrl = url;
    }

    if (onShopLicenseImage) {
        const [url] = await uploadFiles([onShopLicenseImage]);
        onShopLicenseUrl = url;
    }

    if (panCardImage) {
        const [url] = await uploadFiles([panCardImage]);
        panCardUrl = url;
    }

    const updateData: Partial<typeof outletLegalDocument.$inferInsert> = {};

    if (bankAccountType !== undefined) updateData.bankAccountType = bankAccountType;
    if (fssaiNumber !== undefined) updateData.fssaiNumber = fssaiNumber;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber;
    if (bankIfscCode !== undefined) updateData.bankIfscCode = bankIfscCode;
    if (panCardNumber !== undefined) updateData.panCardNumber = panCardNumber;
    if (fssaiUrl) updateData.fssaiUrl = fssaiUrl;
    if (offShopLicenseUrl) updateData.offShopLicenseUrl = offShopLicenseUrl;
    if (onShopLicenseUrl) updateData.onShopLicenseUrl = onShopLicenseUrl;
    if (panCardUrl) updateData.panCardUrl = panCardUrl;

    // Update the document in the database
    const [updatedDocument] = await db
        .update(outletLegalDocument)
        .set(updateData)
        .where(eq(outletLegalDocument.id, id))
        .returning();

    if (!updatedDocument) {
        return c.json(
            { message: "Failed to update outlet legal document" },
            HttpStatusCode.INTERNAL_SERVER_ERROR
        );
    }

    return c.json(
        {
            message: "Outlet legal document updated successfully",
            data: updatedDocument
        },
        HttpStatusCode.OK // Note: Using OK instead of CREATED for updates
    );

}