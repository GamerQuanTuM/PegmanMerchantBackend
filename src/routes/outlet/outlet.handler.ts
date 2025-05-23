import * as HttpStatusCode from "stoker/http-status-codes"
import { AppRouteHandler } from "@/types";
import { db } from "@/db";
import { OutletCreationSchema } from "./outlet.route";
import { outlet, outletBartender, outletLegalDocument, outletManager, outletsDetails, outletTiming } from "@/db/schema";

export const createOutlet: AppRouteHandler<OutletCreationSchema> = async (c) => {
    const { details, legalDocument, manager, outlet: outletBody, timing, bartender, outletImages, fssaiImages, offShopLicenseImages, onShopLicenseImages, panCardImages } = c.req.valid('form');

    const [uploadedDetails] = await db.insert(outletsDetails).values({
        address: details.address,
        contactNumber: details.contactNumber,
        country: details.country,
        latitude: details.latitude,
        longitude: details.longitude,
        name: details.name,
        pincode: details.pincode,
        outlet_image_url: [""],
    }).returning();

    const [uploadedLegalDocuments] = await db.insert(outletLegalDocument).values({
        fssaiNumber: legalDocument.fssaiNumber,
        fssaiUrl: "",
        offShopLicenseUrl: "",
        onShopLicenseUrl: "",
        panCardNumber: legalDocument.panCardNumber,
        panCardUrl: "",
        bankAccountNumber: legalDocument.bankAccountNumber,
        bankAccountType: legalDocument.bankAccountType,
        bankIfscCode: legalDocument.bankIfscCode,
        gstNumber: legalDocument.gstNumber,
    }).returning();

    const [uploadedManager] = await db.insert(outletManager).values({
        email: manager.email,
        contactNumber: manager.contactNumber,
        name: manager.name,
    }).returning();

    const [uploadedTiming] = await db.insert(outletTiming).values({
        establishmentType: timing.establishmentType,
        weekDayOpeningTime: timing.weekDayOpeningTime,
        weekDayClosingTime: timing.weekDayClosingTime,
        weekendOpeningTime: timing.weekendOpeningTime,
        weekendClosingTime: timing.weekendClosingTime,
        eventSpace: timing.eventSpace,
        hotelStay: timing.hotelStay,
    }).returning();

    const [uploadedBartender] = await db.insert(outletBartender).values({
        contactNumber: bartender?.contactNumber,
        name: bartender?.name,
    }).returning();

    const [uploadedOutlet] = await db.insert(outlet).values({
        detailsId: uploadedDetails.id,
        legalDocumentId: uploadedLegalDocuments.id,
        managerId: uploadedManager.id,
        timingId: uploadedTiming.id,
        bartenderId: uploadedBartender.id,
        name: outletBody.name,
        isVerified: false,
        ownerId: outletBody.ownerId
    }).returning();

    const response = {
        message: "Outlet created successfully",
        data: uploadedOutlet
    }

    return c.json(response, HttpStatusCode.CREATED)
}
