// Redimensiona e comprime uma foto no navegador antes do upload — mantém o
// payload pequeno (rápido no wifi de academia, e bem abaixo do limite de
// corpo de requisição da Vercel) sem depender de nenhuma lib extra.

const MAX_DIMENSION = 1440; // lado maior, em px — de sobra pra comparação visual
const JPEG_QUALITY = 0.82;

/** Converte um arquivo de imagem em uma data URL JPEG já redimensionada/comprimida. */
export async function compressImage(file: File): Promise<string> {
  const source = await loadImageSource(file);
  const { width: srcWidth, height: srcHeight } = getDimensions(source);
  const { width, height } = scaleDown(srcWidth, srcHeight, MAX_DIMENSION);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador");
  ctx.drawImage(source, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

async function loadImageSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      // "from-image" aplica a rotação EXIF automaticamente — sem isso, fotos
      // tiradas na vertical em muitos celulares saem deitadas no canvas.
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Navegador sem suporte à opção — cai pro fallback via <img> abaixo.
    }
  }
  return loadImageElement(file);
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível carregar a imagem"));
    };
    img.src = url;
  });
}

function getDimensions(source: ImageBitmap | HTMLImageElement) {
  if (source instanceof HTMLImageElement) {
    return { width: source.naturalWidth, height: source.naturalHeight };
  }
  return { width: source.width, height: source.height };
}

function scaleDown(width: number, height: number, maxDimension: number) {
  const largest = Math.max(width, height);
  if (largest <= maxDimension) return { width, height };
  const scale = maxDimension / largest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
