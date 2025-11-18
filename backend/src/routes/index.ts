import { Router } from "express";

import aiDemoRoutes from "./ai-demo/routes";
import authRoutes from "./auth/routes";
import helloRoutes from "./hello/routes";
import usersRoutes from "./users/routes";
import companiesRoutes from "./companies/routes";
import projectsRoutes from "./projects/routes";
import milestonesRoutes from "./milestones/routes";
import eventsRoutes from "./events/routes";
import chatRoutes from "./chat/routes";

const router = Router();

router.use("/v1/hello", helloRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/users", usersRoutes);
router.use("/v1/companies", companiesRoutes);
router.use("/v1/projects", projectsRoutes);
router.use("/v1/milestones", milestonesRoutes);
router.use("/v1/events", eventsRoutes);
router.use("/v1/ai-demo", aiDemoRoutes);
router.use("/v1/chat", chatRoutes);

export default router;
