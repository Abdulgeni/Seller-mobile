export const SaveFormat = {
  JPEG: "jpeg",
  PNG: "png",
  WEBP: "webp",
};

export const manipulateAsync = async (
  uri: string,
  actions?: { resize?: { width?: number; height?: number } }[],
  _options?: unknown
) => {
  const resizeAction = actions?.find((a) => a.resize);
  return {
    uri: uri.includes("thumb") ? uri : `${uri}_compressed.jpg`,
    width: resizeAction?.resize?.width ?? 800,
    height: resizeAction?.resize?.height ?? 600,
  };
};

export const Image = {
  compress: async (uri: string, _options?: unknown) => `${uri}_compressed.jpg`,
};

export default {
  SaveFormat,
  manipulateAsync,
  Image,
};
