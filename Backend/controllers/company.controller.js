import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloud.js";

export const registerCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required",
        success: false,
      });
    }

    let company = await Company.findOne({ name: companyName });
    if (company) {
      return res.status(409).json({
        message: "Company already exists",
        success: false,
      });
    }

    company = await Company.create({
      name: companyName,
      userId: req.id,
    });

    return res.status(201).json({
      message: "Company registered successfully.",
      company,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCompanies = async (req, res, next) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId });
    return res.status(200).json({
      companies: companies || [],
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    const company = req.company || (await Company.findById(companyId));
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    if (company.userId.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "Forbidden: you do not have permission to access this company",
        success: false,
      });
    }

    return res.status(200).json({
      company,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;

    const company = req.company || (await Company.findById(req.params.id));
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    if (company.userId.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "Forbidden: you do not have permission to modify this company",
        success: false,
      });
    }

    let logo = company.logo;
    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      logo = cloudResponse.secure_url;
    }

    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(website !== undefined && { website }),
      ...(location !== undefined && { location }),
      ...(logo && { logo }),
    };

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      message: "Company updated successfully",
      company: updatedCompany,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
