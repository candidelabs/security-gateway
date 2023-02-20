import express from "express";
import { validate } from "../../middlewares";
import * as guardianValidation from "../../validations/guardian.validation";
import * as guardianController from "../../controller/guardian.controller";

const router = express.Router();

router.route("/create").post(validate(guardianValidation.create), guardianController.post);

router
  .route("/submit")
  .post(validate(guardianValidation.submit), guardianController.submit);

router
  .route("/sign")
  .post(validate(guardianValidation.sign), guardianController.sign);

router
  .route("/fetchByAddress")
  .get(validate(guardianValidation.fetchByAddress), guardianController.fetchByAddress);

router
  .route("/fetchById")
  .get(validate(guardianValidation.fetchById), guardianController.fetchById);

router
    .route("/finalize")
    .post(validate(guardianValidation.finalize), guardianController.finalize);

export default router;
