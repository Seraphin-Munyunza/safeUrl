import { Router } from "express";
import { checkUrlController } from "../controllers/url.controller";

const router = Router();

router.post("/check", checkUrlController);

export default router;