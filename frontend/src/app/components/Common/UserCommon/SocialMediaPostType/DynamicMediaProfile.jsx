import { useRef, useEffect } from "react";
import "./DynamicMediaProfile.css";

const DynamicMediaProfile = ({ attachedMedia, customCSS }) => {
  // we only handle cases for author image profile in this component
  const imageRef = useRef(null);
  const isPhoto = attachedMedia ? attachedMedia.mimeType.indexOf('image') !== -1 : false;

  useEffect(() => {
    if (attachedMedia && isPhoto && imageRef.current) {
      imageRef.current.src = `/api/user/facebook/media/${attachedMedia._id}`;
    }
  }, [attachedMedia]);

  return (
    <>
      {attachedMedia &&
        isPhoto && <img ref={imageRef} key={attachedMedia._id} className={customCSS} />
      }
    </>
  );
}

export default DynamicMediaProfile;
