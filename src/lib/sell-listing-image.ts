/** 목록·상세에 쓰는 대표/추가 상품 사진 규격 (정사각 1:1) */
export const SELL_LISTING_IMAGE_SIZE = 800;
export const SELL_LISTING_IMAGE_MIME = 'image/jpeg';
const SELL_LISTING_IMAGE_QUALITY = 0.88;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };
    image.src = url;
  });
}

/** 원본 전체가 들어가도록 정사각 캔버스(여백 포함)에 맞춘 JPEG로 변환 */
export async function normalizeSellListingImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 넣을 수 있습니다.');
  }

  const image = await loadImage(file);
  const { naturalWidth: width, naturalHeight: height } = image;
  if (width < 1 || height < 1) {
    throw new Error('이미지를 처리할 수 없습니다.');
  }

  const scale = Math.min(SELL_LISTING_IMAGE_SIZE / width, SELL_LISTING_IMAGE_SIZE / height);
  const drawWidth = Math.round(width * scale);
  const drawHeight = Math.round(height * scale);
  const offsetX = Math.floor((SELL_LISTING_IMAGE_SIZE - drawWidth) / 2);
  const offsetY = Math.floor((SELL_LISTING_IMAGE_SIZE - drawHeight) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = SELL_LISTING_IMAGE_SIZE;
  canvas.height = SELL_LISTING_IMAGE_SIZE;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('이미지를 처리할 수 없습니다.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, SELL_LISTING_IMAGE_SIZE, SELL_LISTING_IMAGE_SIZE);
  context.drawImage(image, 0, 0, width, height, offsetX, offsetY, drawWidth, drawHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('이미지를 처리할 수 없습니다.'))),
      SELL_LISTING_IMAGE_MIME,
      SELL_LISTING_IMAGE_QUALITY,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'product';
  return new File([blob], `${baseName}.jpg`, { type: SELL_LISTING_IMAGE_MIME, lastModified: Date.now() });
}
