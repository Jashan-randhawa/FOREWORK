import mongoose from "mongoose";
import { JobAlert } from "../models/jobAlert.model.js";

export const createAlert = async (req, res, next) => {
  try {
    const userId = req.id;
    const { title, criteria, frequency = "daily" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Alert title is required",
      });
    }

    const alert = await JobAlert.create({
      user: userId,
      title: title.trim(),
      criteria: criteria || {},
      frequency,
    });

    return res.status(201).json({
      success: true,
      message: "Job alert created successfully",
      data: { alert },
    });
  } catch (error) {
    next(error);
  }
};

export const getAlerts = async (req, res, next) => {
  try {
    const userId = req.id;
    const alerts = await JobAlert.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Job alerts fetched successfully",
      data: { alerts: alerts || [] },
      alerts: alerts || [],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const userId = req.id;
    const alertId = req.params.id;

    if (!alertId || !mongoose.Types.ObjectId.isValid(alertId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid alert ID format",
      });
    }

    const deleted = await JobAlert.findOneAndDelete({
      _id: alertId,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Job alert not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job alert deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
