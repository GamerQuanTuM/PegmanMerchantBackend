export const outletIdx = "outlets";
export const passesIdx = "passes";

export const outletMapping = {
    "properties": {
        "outletId": { "type": "keyword" },
        "outletName": { "type": "text" },
        "address": {
            "properties": {
                "street": { "type": "text" },
                "city": { "type": "keyword" },
                "state": { "type": "keyword" },
                "zipCode": { "type": "keyword" },
                "country": { "type": "keyword" }
            }
        },
        "location": { "type": "geo_point" },
        "openingTimeWeekday": { "type": "keyword" },
        "closingTimeWeekday": { "type": "keyword" },
        "openingTimeWeekend": { "type": "keyword" },
        "closingTimeWeekend": { "type": "keyword" },
        "availablePassTypes": { "type": "keyword" },
        "startingPrice": { "type": "double" },
        "images": { "type": "text" },
        "establishmentType": { "type": "keyword" }
    }
}


export const passesMapping = {
    "properties": {
        "passId": { "type": "keyword" },
        "passKey": { "type": "keyword" },
        "outletId": { "type": "keyword" },
        "passType": { "type": "keyword" },
        "startDateMillis": { "type": "date" },
        "startTimeMillis": { "type": "date" },
        "endTimeMillis": { "type": "date" },
        "pricePerLitre": { "type": "double" },
        "qtyPerPass": { "type": "integer" },
        "specialOffer": { "type": "text" },
        "offerDescription": { "type": "text" },
        "offerLabelOne": { "type": "text" },
        "offerLabelTwo": { "type": "text" },
        "dailyLimit": { "type": "integer" },
        "monthlyLimit": { "type": "integer" },
        "alcoholTypes": {
            "properties": {
                "alcoholType": { "type": "keyword" },
                "brands": { "type": "text" }
            }
        },
        "cuisines": { "type": "keyword" },
        "beerBrands": { "type": "keyword" }
    }

}
