import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ocrRouter from "./ocr";
import insightsRouter from "./insights";
import emailRouter from "./email";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ocrRouter);
router.use(insightsRouter);
router.use(emailRouter);

export default router;
