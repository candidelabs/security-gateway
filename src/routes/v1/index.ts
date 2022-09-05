import express, { Router } from "express";
import guardianRoute from "./guardian.route";

const router = express.Router();

type Route = {
  path: string;
  route: Router;
};

const defaultRoutes: Array<Route> = [{ path: "/guardian", route: guardianRoute }];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
