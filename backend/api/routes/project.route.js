import express from "express";
import Project from "../models/project.model.js";
import { validate } from "../middleware/validate.js";
import createError from "../utils/createError.js";

const router = express.Router();

/*  CREATE – POST /api/project/createProject                   */

router.post("/createProject", validate, async (req, res, next) => {
  console.log("Creating project with data:", req.body);
  try {
    // Only buyers (non‑sellers) can create projects
    if (req.user.isSeller) {
      return next(createError(403, "Sellers cannot post projects"));
    }

    // Validate expiry days (1-7 days)
    const expiryDays = parseInt(req.body.expiryDays);
    if (isNaN(expiryDays) || expiryDays < 1 || expiryDays > 7) {
      return next(createError(400, "Expiry days must be between 1 and 7"));
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const newProject = new Project({
      clientId: req.user._id,
      title: req.body.title,
      description: req.body.description,
      budgetMin: req.body.budgetMin,
      budgetMax: req.body.budgetMax,
      category: req.body.category,
      attachments: req.body.attachments || [],
      expectedDurationDays: req.body.expectedDurationDays,
      status: "open",
      expiryDate: expiryDate,
    });

    const savedProject = await newProject.save();
    console.log("Project saved successfully:", savedProject);
    return res.status(201).json(savedProject);
  } catch (err) {
    console.error("Error in createProject:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

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

/* GET /api/project/getProjects - Get all projects with filtering and sorting */
router.get("/getProjects", validate, async (req, res, next) => {
  try {
    const {
      search = "",
      category = "",
      minBudget = "",
      maxBudget = "",
      sortBy = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    // Check and update expired projects
    const now = new Date();
    await Project.updateMany(
      {
        status: "open",
        expiryDate: { $lt: now },
      },
      { $set: { status: "cancelled" } }
    );

    // Build query
    const query = { status: "open" }; // Only show open projects

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by budget range
    if (minBudget || maxBudget) {
      query.budgetMax = {};
      if (minBudget) query.budgetMax.$gte = Number(minBudget);
      if (maxBudget) query.budgetMax.$lte = Number(maxBudget);
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "budgetHigh":
        sort = { budgetMax: -1 };
        break;
      case "budgetLow":
        sort = { budgetMax: 1 };
        break;
      case "durationShort":
        sort = { expectedDurationDays: 1 };
        break;
      case "durationLong":
        sort = { expectedDurationDays: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get projects with filters
    const projects = await Project.find(query)
      .populate("clientId", "username profilePic country")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    // Get unique categories for filter options
    const categories = await Project.distinct("category");

    return res.status(200).json({
      projects,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      categories,
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
