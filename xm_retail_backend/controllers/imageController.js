import { Image } from "../models/imageModel.js";

export const uploadImage = async (req, res) => {
  try {
    const { buffer, mimetype } = req.file;

    const newImage = await Image.create({
      data: buffer,
      mimetype,
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      id: newImage.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

export const getImages = async (req, res) => {
  try {
    const images = await Image.findAll();
    const imagesWithSrc = images.map((img) => ({
      id: img.id, // Add this line
      src: `data:${img.mimetype};base64,${img.data.toString("base64")}`,
    }));
    res.json(imagesWithSrc);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findByPk(id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    await image.destroy();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
