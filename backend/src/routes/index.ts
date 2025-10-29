import { Router } from "express";

import helloRoutes from "./hello/routes";
import usersRoutes from "./users/routes";

const router = Router();

// Mount all route modules
router.use("/v1/hello", helloRoutes);
router.use("/v1/users", usersRoutes);

export default router;