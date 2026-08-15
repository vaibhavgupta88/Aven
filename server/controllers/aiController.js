import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { saveCreation } from "../configs/creationsStore.js";

// Active Gemini model cascade
const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-3-flash-preview",
  "gemini-pro-latest",
];

const getUserId = (req) =>
  req.userId ||
  (typeof req.auth === "function" ? req.auth()?.userId : req.auth?.userId) ||
  "user_demo_guest";

const ensureCompleteEnding = (rawText) => {
  if (!rawText) return "";
  let text = rawText.trim();

  // If already ends with sentence-ending punctuation
  if (/[.!?]["'”)]?\s*$/.test(text)) {
    return text;
  }

  // Find the last sentence-ending punctuation mark
  const lastPeriod = Math.max(
    text.lastIndexOf("."),
    text.lastIndexOf("!"),
    text.lastIndexOf("?")
  );

  // If the last complete sentence is in the last 25% of the text, cleanly trim to it
  if (lastPeriod > text.length * 0.75) {
    return text.substring(0, lastPeriod + 1).trim();
  }

  // Otherwise append a closing period
  return text + ".";
};

// Core live AI call with multi-model auto-rotation
const callGeminiAI = async (params) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "dummy_key_for_init" || apiKey.trim().length < 10) {
    throw new Error("GEMINI_API_KEY is not configured in server environment.");
  }

  const isBlogTitle = params.messages?.some(
    (m) =>
      m.content?.toLowerCase().includes("blog post titles") ||
      m.content?.toLowerCase().includes("catchy, high-converting") ||
      m.content?.toLowerCase().includes("copywriter")
  );
  const isResumeReview = params.messages?.some(
    (m) =>
      m.content?.toLowerCase().includes("ats resume auditor") ||
      m.content?.toLowerCase().includes("resume content")
  );

  const minAcceptableWords = isBlogTitle ? 10 : isResumeReview ? 100 : 350;

  // Strategy 1: Google Gemini Native REST Endpoint (Fast, precise token allocation)
  for (const model of GEMINI_MODELS) {
    try {
      const systemPrompt = params.messages?.find((m) => m.role === "system")?.content || "";
      const userPromptText = params.messages?.find((m) => m.role === "user")?.content || "";
      const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${userPromptText}` : userPromptText;

      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          contents: [{ parts: [{ text: combinedPrompt }] }],
          generationConfig: {
            maxOutputTokens: params.max_tokens || 4000,
            temperature: params.temperature ?? 0.7,
          },
        },
        { headers: { "Content-Type": "application/json" }, timeout: 45000 }
      );

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        if (wordCount >= minAcceptableWords) {
          return {
            choices: [
              {
                message: {
                  content: text,
                },
              },
            ],
          };
        }
      }
    } catch (restErr) {
      console.log(`Native REST model [${model}] status: ${restErr?.response?.status || restErr?.message}`);
    }
  }

  // Strategy 2: OpenAI Compatibility Endpoint
  for (const model of GEMINI_MODELS) {
    try {
      const client = new OpenAI({
        apiKey: apiKey.trim(),
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
      const completion = await client.chat.completions.create({
        ...params,
        model,
      });
      const content = completion?.choices?.[0]?.message?.content;
      if (content) {
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        if (wordCount >= minAcceptableWords) {
          return completion;
        }
      }
    } catch (err) {
      console.log(`OpenAI format model [${model}] status: ${err?.status || err?.message}`);
    }
  }

  throw new Error("All Gemini AI model endpoints are currently busy. Please retry in a few moments.");
};

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

    const targetWords = Number(length) || 800;

    let targetLabel = "Short (500-800 words)";
    let wordInstruction = "Your target length is strictly between 550 and 750 words. Do NOT exceed 800 words, and do not write fewer than 500 words.";
    let maxTokens = 4000;

    if (targetWords > 800 && targetWords <= 1200) {
      targetLabel = "Medium (800-1200 words)";
      wordInstruction = "Your target length is strictly between 850 and 1100 words. Do NOT exceed 1200 words, and do not write fewer than 800 words.";
      maxTokens = 5000;
    } else if (targetWords > 1200) {
      targetLabel = "Long (1200+ words)";
      wordInstruction = "Your target length is an in-depth comprehensive piece of 1300 to 1800 words.";
      maxTokens = 7500;
    }

    const response = await callGeminiAI({
      targetLength: targetWords,
      messages: [
        {
          role: "system",
          content: `You are an elite, professional content creator and subject matter expert.
Your job is to write a well-structured, engaging article about "${prompt}".

LENGTH SPECIFICATION (${targetLabel}):
- ${wordInstruction}
- Structure with standard markdown headings (# for main title, ## for major sections, ### for subsections).
- Do NOT use emojis or decorative symbols in headings.
- CRITICAL: You MUST write a complete final concluding paragraph that reaches a definitive closing thought and ends with a complete final sentence with a period. Never stop mid-sentence.`,
        },
        { role: "user", content: `Write a complete ${targetLabel} article about: ${prompt}`, targetLength: targetWords },
      ],
      temperature: 0.65,
      max_tokens: maxTokens,
    });

    const rawContent = response.choices[0].message.content;
    const content = ensureCompleteEnding(rawContent);
    saveCreation(userId, prompt, content, "article");

    try {
      await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article') `;
    } catch (dbErr) {
      console.warn("DB save note:", dbErr.message);
    }

    if (plan !== "premium") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: free_usage + 1 },
        });
      } catch (clerkErr) {
        console.warn("Clerk metadata note:", clerkErr.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("generateArticle error:", error?.message);
    res.json({ success: false, message: error?.message || "Generation error" });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { prompt, category } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free Plan usage limit reached (10 generations). Upgrade to Premium Plan for unlimited access!",
      });
    }

    const response = await callGeminiAI({
      messages: [
        {
          role: "system",
          content: `You are an expert copywriter and content strategist. Generate 5 catchy, high-converting blog post titles for topic "${prompt}" in category "${category || "General"}". Format them strictly as a markdown bulleted list using standard dashes (e.g. "- Title"). Do NOT use numbered lists. Do NOT use emojis or special decorative symbols in the titles.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    let rawContent = response.choices[0].message.content || "";
    // Clean and normalize into standard bullet points
    let content = rawContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const cleaned = line.replace(/^(\d+[\.\)]\s*|[-*•]\s*)/, "").trim();
        return `- ${cleaned}`;
      })
      .join("\n\n");

    saveCreation(userId, prompt, content, "blog-title");

    try {
      await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title') `;
    } catch (dbErr) {
      console.warn("DB save note:", dbErr.message);
    }

    if (plan !== "premium") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: free_usage + 1 },
        });
      } catch (clerkErr) {
        console.warn("Clerk metadata note:", clerkErr.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("generateBlogTitle error:", error?.message);
    res.json({ success: false, message: error?.message || "Title generation error" });
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

    let secure_url = "";
    const isPublish = Boolean(publish === true || publish === "true" || publish === 1);

    if (process.env.CLIPDROP_API_KEY && process.env.CLIPDROP_API_KEY !== "undefined") {
      const formData = new FormData();
      formData.append("prompt", prompt);
      const { data } = await axios.post(
        "https://clipdrop-api.co/text-to-image/v1",
        formData,
        {
          headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
          responseType: "arraybuffer",
          validateStatus: () => true,
        }
      );

      if (data && data.length > 100) {
        const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
        const uploadRes = await cloudinary.uploader.upload(base64Image);
        if (uploadRes?.secure_url) {
          secure_url = uploadRes.secure_url;
        }
      }
    }

    if (!secure_url) {
      return res.json({
        success: false,
        message: "Image generation service is temporarily unavailable. Please check your ClipDrop API key.",
      });
    }

    saveCreation(userId, prompt, secure_url, "image", isPublish);

    try {
      await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${isPublish}) `;
    } catch (dbErr) {
      console.warn("DB save note:", dbErr.message);
    }

    if (plan !== "premium") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: free_usage + 1 },
        });
      } catch (clerkErr) {
        console.warn("Clerk metadata note:", clerkErr.message);
      }
    }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("generateImage error:", error?.message);
    res.json({ success: false, message: error?.message || "Image generation error" });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = getUserId(req);
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium") {
      return res.json({
        success: false,
        isProRequired: true,
        message: "AI Background Removal is a Pro feature. Upgrade to the Premium Plan ($19/mo) to unlock!",
      });
    }

    if (!image?.path) {
      return res.json({ success: false, message: "Please upload an image file." });
    }

    let secure_url = "";
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const uploadRes = await cloudinary.uploader.upload(image.path, {
        transformation: [
          {
            effect: "background_removal",
            background_removal: "remove_the_background",
          },
        ],
      });
      secure_url = uploadRes.secure_url;
    }

    if (!secure_url) {
      return res.json({
        success: false,
        message: "Cloudinary background removal failed. Please check your Cloudinary configuration.",
      });
    }

    saveCreation(userId, "Remove background from image", secure_url, "image");

    try {
      await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image') `;
    } catch (dbErr) {
      console.warn("DB save note:", dbErr.message);
    }

    if (plan !== "premium") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: free_usage + 1 },
        });
      } catch (clerkErr) {
        console.warn("Clerk metadata note:", clerkErr.message);
      }
    }

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("removeImageBackground error:", error?.message);
    res.json({ success: false, message: error?.message || "Background removal error" });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium") {
      return res.json({
        success: false,
        isProRequired: true,
        message: "AI Object Removal is a Pro feature. Upgrade to the Premium Plan ($19/mo) to unlock!",
      });
    }

    if (!image?.path || !object) {
      return res.json({ success: false, message: "Please provide both an image and object description." });
    }

    let imageUrl = "";
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const { public_id } = await cloudinary.uploader.upload(image.path);
      const cleanObject = object ? object.trim() : "";
      const effectStr = cleanObject.startsWith("prompt_")
        ? `gen_remove:${cleanObject}`
        : `gen_remove:prompt_${cleanObject}`;

      imageUrl = cloudinary.url(public_id, {
        transformation: [{ effect: effectStr }],
        resource_type: "image",
        secure: true,
      });
    }

    if (!imageUrl) {
      return res.json({
        success: false,
        message: "Object removal failed. Please check Cloudinary AI add-on status.",
      });
    }

    saveCreation(userId, `Removed ${object || "object"} from image`, imageUrl, "image");

    try {
      await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image') `;
    } catch (dbErr) {
      console.warn("DB save note:", dbErr.message);
    }

    if (plan !== "premium") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: free_usage + 1 },
        });
      } catch (clerkErr) {
        console.warn("Clerk metadata note:", clerkErr.message);
      }
    }

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log("removeImageObject error:", error?.message);
    res.json({ success: false, message: error?.message || "Object removal error" });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const resume = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium") {
      return res.json({
        success: false,
        isProRequired: true,
        message: "Full ATS Resume Review is a Pro feature. Upgrade to the Premium Plan ($19/mo) to unlock!",
      });
    }

    if (!resume?.path) {
      return res.json({ success: false, message: "Please upload a resume file (.pdf)." });
    }

    let resumeText = "";
    try {
      const dataBuffer = fs.readFileSync(resume.path);
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text || "";
    } catch (pdfErr) {
      console.warn("PDF parse note:", pdfErr.message);
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.json({ success: false, message: "Could not extract text from the uploaded PDF resume." });
    }

    const currentYear = new Date().getFullYear();
    const prompt = `Review the following resume content:\n\n${resumeText}`;

    const response = await callGeminiAI({
      messages: [
        {
          role: "system",
          content: `You are an ATS resume auditor and career strategist. Note: Current year is ${currentYear}. Analyze the resume thoroughly and output a highly detailed, professional report using clean Markdown with NO emojis or special symbols. Use consistent standard headings (# for title, ## for major sections, ### for subsections):
1. Overall ATS Compatibility Score (out of 100) with a breakdown table comparing Parseability, Keyword Density, Metric Quantification, and Layout Consistency.
2. Contact Information and Header Audit.
3. Work Experience and Action Verb Impact (with Before and After bullet point rewrites).
4. Skill Keyword Breakdown (missing technical skills).
5. Priority Action Plan.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3500,
    });

    const content = response.choices[0].message.content;
    saveCreation(userId, "Review the uploaded resume", content, "resume-review");

    try {
      await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review') `;
    } catch (dbErr) {
      console.warn("DB save note:", dbErr.message);
    }

    if (plan !== "premium") {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: { free_usage: free_usage + 1 },
        });
      } catch (clerkErr) {
        console.warn("Clerk metadata note:", clerkErr.message);
      }
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("resumeReview error:", error?.message);
    res.json({ success: false, message: error?.message || "Resume review error" });
  }
};
