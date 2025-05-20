import * as HttpStatusCode from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { db } from "@/db";
import { AuthenicatedContext } from "@/types";
import { Owner } from "@/db/schema";


const getAuthUser = async (c: AuthenicatedContext): Promise<Owner> => {
    const jwtUser = c.get("user");
    
    if (!jwtUser) {
        throw c.json(
            { 
                error: HttpStatusPhrases.UNAUTHORIZED,
                message: "Authentication required" 
            }, 
            HttpStatusCode.UNAUTHORIZED
        );
    }
    
    const user = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.id, jwtUser.sub)
    });
    
    if (!user) {
        throw c.json(
            { 
                error: HttpStatusPhrases.NOT_FOUND,
                message: "User not found" 
            }, 
            HttpStatusCode.NOT_FOUND
        );
    }
    
    return user;
};

export default getAuthUser