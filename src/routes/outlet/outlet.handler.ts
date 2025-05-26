import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler } from "@/types";
import { db } from "@/db";
import { outlet, outletBartender, outletLegalDocument, outletManager, outletsDetails, outletTiming } from "@/db/schema";
import { CreateOutletLegalDocumentsSchema, CreateOutletDetailsSchema, CreateOutletTimingSchema, CreateOutletSchema, GetOutletSchemaById, VerifyOutletSchema } from "./outlet.route";
import { eq } from "drizzle-orm";
import { uploadFiles } from "@/lib/storage"

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
        outlet_image_url: image_urls,
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
    const { weekDayClosingTime, weekDayOpeningTime, weekendClosingTime, weekendOpeningTime, establishmentType, eventSpace, hotelStay } = c.req.valid("json");

    const [outletTimingData] = await db.insert(outletTiming).values({
        weekDayOpeningTime, weekDayClosingTime, weekendOpeningTime, weekendClosingTime, establishmentType, eventSpace, hotelStay
    }).returning();

    const response = {
        message: "Outlet timing created successfully",
        data: outletTimingData
    }

    return c.json(response, HttpStatusCode.CREATED);
}

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
            timing: timing ? true : undefined,
        }
    });

    if (!outletData) {
        return c.json({ message: "Outlet not found" }, HttpStatusCode.NOT_FOUND);
    }


    const response = {
        message: "Outlet fetched successfully",
        data: outletData
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
