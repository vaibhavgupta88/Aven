import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const callGeminiWithFallback = async (params) => {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError;
  for (const model of models) {
    try {
      return await AI.chat.completions.create({
        ...params,
        model,
      });
    } catch (err) {
      console.log(`Gemini model [${model}] failed (${err?.status}): ${err?.message}`);
      lastError = err;
      const isTransient = err?.status === 503 || err?.status === 429 || err?.status === 404 || err?.status === 500;
      if (!isTransient) throw err;
    }
  }
  throw lastError;
};

const getUserId = (req) =>
  req.userId ||
  (typeof req.auth === "function" ? req.auth()?.userId : req.auth?.userId);

export const generateArticle = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free Plan usage limit reached (10 generations). Upgrade to Premium Plan for unlimited access!",
      });
    }

    const maxTokens = Math.min(3500, Math.max(2000, (Number(length) || 1000) * 2));

    const response = await callGeminiWithFallback({
      messages: [
        {
          role: "system",
          content:
            "You are a professional article writer. Write a comprehensive, well-structured, complete article with headings, paragraphs, and a clear conclusion. Every sentence and section must be 100% complete. Never truncate or leave the response incomplete.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("generateArticle error:", error.status, error.message);
    const isRateLimit = error?.status === 429 || error?.status === 503;
    const userMsg = isRateLimit
      ? "AI service is temporarily busy or rate-limited. Please wait 30 seconds and try again."
      : error.message;
    res.json({ success: false, message: userMsg });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free Plan usage limit reached (10 generations). Upgrade to Premium Plan for unlimited access!",
      });
    }

    const response = await callGeminiWithFallback({
      messages: [
        {
          role: "system",
          content:
            "You are an expert copywriter and content strategist. Generate 5 catchy, high-converting blog post titles based on the user's topic. Format them strictly as a numbered list from 1 to 5. Every single title must be 100% fully written, complete, compelling, and grammatically whole. Never cut off, truncate, or leave any title incomplete.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("generateBlogTitle error:", error.status, error.message);
    const isRateLimit = error?.status === 429 || error?.status === 503;
    const userMsg = isRateLimit
      ? "AI service is temporarily busy or rate-limited. Please wait 30 seconds and try again."
      : error.message;
    res.json({ success: false, message: userMsg });
  }
};

export const generateImage = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free Plan image limit reached. Upgrade to Premium Plan for unlimited 4K generation!",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${
      publish ?? false
    }) `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = getUserId(req);
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Background Removal is a Pro feature. Upgrade to Premium Plan to continue!",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Generative Object Removal is a Pro feature. Upgrade to Premium Plan to continue!",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const cleanObject = object ? object.trim() : "";
    const effectStr = cleanObject.startsWith("prompt_")
      ? `gen_remove:${cleanObject}`
      : `gen_remove:prompt_${cleanObject}`;

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: effectStr }],
      resource_type: "image",
      secure: true,
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const resume = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Full ATS Resume Review is a Pro feature. Upgrade to Premium Plan to continue!",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const currentYear = new Date().getFullYear();
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    const response = await callGeminiWithFallback({
      messages: [
        {
          role: "system",
          content: `You are an expert ATS resume reviewer and career coach. Note: The current year is ${currentYear}. Do NOT mark dates in or before ${currentYear} as future dates. Provide a complete, fully detailed review covering: 1) Overall ATS & Structure Score (out of 100), 2) Key Strengths, 3) Weaknesses & Areas for Improvement, and 4) Actionable Recommendations. Always finish your review cleanly with a complete concluding summary. Never truncate or leave your output cut off.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review') `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
