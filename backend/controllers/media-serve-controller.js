import db from "../clients/database-client";

const Media = db.Media;

const getMediaById = async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.mediaId, {
      attributes: ['media', 'mimeType']
    });

    if (!media) {
      return res.status(404).send({ message: "Media not found." });
    }

    res.set('Content-Type', media.mimeType);
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(media.media);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: "Error retrieving media." });
  }
};

export default { getMediaById };
