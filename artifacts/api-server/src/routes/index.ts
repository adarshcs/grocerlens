import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ocrRouter from "./ocr";
import insightsRouter from "./insights";
import emailRouter from "./email";
import householdsRouter from "./households";
import privacyRouter from "./privacy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ocrRouter);
router.use(insightsRouter);
router.use(emailRouter);
router.use(householdsRouter);
router.use(privacyRouter);

export default router;
