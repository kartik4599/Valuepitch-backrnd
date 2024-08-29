import express from "express";
import clientRouter from "./routes/client.routes";

const app = express();

app.use(express.json());

app.use("/client", clientRouter);

app.listen(4500, () => {
  console.log("App listening on port 3000!");
});
