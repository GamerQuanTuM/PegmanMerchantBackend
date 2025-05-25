import { serve } from "@hono/node-server";
import app from "./app";
import httpServer from "./socket";

httpServer.listen(4000,()=>{
    console.log("Socket server is running on port 5000");
})

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

