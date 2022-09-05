import express from "express";
import { validate } from "../../middlewares";
import * as guardianValidation from "../../validations/guardian.validation";
import * as guardianController from "../../controller/guardian.controller";

const router = express.Router();

router.route("/create").post(validate(guardianValidation.post), guardianController.post);

router
  .route("/sign")
  .post(validate(guardianValidation.sign), guardianController.sign);

router
  .route("/fetch")
  .get(validate(guardianValidation.fetch), guardianController.fetch);

export default router;
