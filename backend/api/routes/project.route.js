import express from "express";
import Project from "../models/project.model.js";
import { validate } from "../middleware/validate.js";
import createError from "../utils/createError.js";

const router = express.Router();

/*  CREATE – POST /api/projects/createProject                   */

router.post(
  "/createProject",
  validate, // <-- your auth / JWT middleware
  async (req, res, next) => {
    try {
      // Only buyers (non‑sellers) can create projects; tweak as needed.
      if (req.user.isSeller) {
        return next(createError(403, "Sellers cannot post projects"));
      }

      const newProject = new Project({
        clientId: req.user._id,
        ...req.body,
      });

      const savedProject = await newProject.save();
      return res.status(201).json(savedProject);
    } catch (err) {
      console.error("Error in createProject:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/*  DELETE – DELETE /api/projects/deleteProject/:projectId      */

router.delete("/deleteProject/:projectId", validate, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(createError(404, "Project not found"));
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return next(createError(403, "You can only delete projects you created"));
    }

    await project.deleteOne();
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProject:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*  READ ONE – GET /api/projects/getProject/single/:projectId   */

router.get(
  "/getProject/single/:projectId",
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.projectId).populate(
        "clientId",
        "username email profilePic country"
      );
      if (!project) {
        return next(createError(404, "Project not found"));
      }
      return res.status(200).json(project);
    } catch (err) {
      console.error("Error in getProject:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/* ------------------------------------------------------------ */
/*  READ MANY – GET /api/projects/getProjects                   */
/*  Query params:                                               */
/*    minBudget, maxBudget, status, category, search, page,     */
/*    limit, sortBy(newest|budgetAsc|budgetDesc)                */
/* ------------------------------------------------------------ */
router.get("/getProjects", validate, async (req, res, next) => {
  try {
    const {
      minBudget,
      maxBudget,
      status,
      category,
      search = "",
      page = 1,
      limit = 12,
      sortBy,
    } = req.query;

    /* ------------ build Mongo filter ------------- */
    const query = {};

    // Text search against title
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Budget range
    if (minBudget || maxBudget) {
      query.budgetMax = {}; // assume bidding up to max
      if (minBudget) query.budgetMax.$gte = Number(minBudget);
      if (maxBudget) query.budgetMax.$lte = Number(maxBudget);
    }

    // Status & category
    if (status) query.status = status;
    if (category) query.category = category;

    /* ------------- sort options ------------------ */
    let sort = { createdAt: -1 }; // default newest first
    switch (sortBy) {
      case "budgetAsc":
        sort = { budgetMax: 1 };
        break;
      case "budgetDesc":
        sort = { budgetMax: -1 };
        break;
      case "newest":
      default:
        sort = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const projects = await Project.find(query)
      .populate("clientId", "username profilePic country")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Project.countDocuments(query);

    return res.status(200).json({
      projects,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Error in getProjects:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/*  UPDATE – PUT /api/projects/editProject/:projectId           */

router.put("/editProject/:projectId", validate, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return next(createError(404, "Project not found"));
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return next(createError(403, "You can only edit projects you created"));
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json(updatedProject);
  } catch (err) {
    console.error("Error in editProject:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
