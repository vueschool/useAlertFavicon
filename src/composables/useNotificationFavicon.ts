import { useFavicon, until } from "@vueuse/core";
import { watch, ref, computed } from "vue";

type Position =
  | "bottomRight"
  | "topRight"
  | "topLeft"
  | "bottomLeft"
  | "center";

type positionMapValue = [number, number];

interface UseNotificationFaviconOptions {
  size?: number;
  position?: Position;
  color?: string;
  speed?: number;
  blink?: boolean;
}

export default function useNotificationFavicon(
  src: string,
  options: UseNotificationFaviconOptions = {}
) {
  const {
    size = 8,
    position = "bottomRight",
    color = "red",
    speed = 1000,
    blink = true,
  } = options;

  let interval = 0;
  const favicon = useFavicon();
  const plainFavicon = ref(src);
  const isNotifying = ref(false);
  const imageElement = ref<HTMLImageElement | null>(null);

  const imgSize = computed(() => imageElement.value?.width || 0);
  const positions = computed(() => {
    const map: { [key: string]: positionMapValue } = {
      topLeft: [size, size],
      topRight: [imgSize.value - size, size],
      bottomLeft: [size, imgSize.value - size],
      bottomRight: [imgSize.value - size, imgSize.value - size],
      center: [imgSize.value / 2, imgSize.value / 2],
    };
    return map[position];
  });

  favicon.value = src;

  const drawNotification = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // wait for favicon image to load
    await until(imageElement).toBeTruthy();
    const img = imageElement.value as HTMLImageElement;
    canvas.width = imgSize.value;
    canvas.height = imgSize.value;
    ctx.drawImage(img, 0, 0);

    // circle specs
    const arcX = positions.value[0];
    const arcY = positions.value[1];
    const radius = size;

    // Draw circle
    ctx.beginPath();
    ctx.arc(arcX, arcY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();

    // set canvas drawing as favicon
    favicon.value = canvas.toDataURL("image/x-icon");
  };

  const drawPlainFavicon = () => {
    favicon.value = plainFavicon.value;
  };

  const notify = async () => {
    isNotifying.value = true;
    doBlink();
    interval = setInterval(doBlink, speed);
  };

  const doBlink = () => {
    if (isNotifying.value) drawNotification();
    if (!blink) return;
    setTimeout(() => drawPlainFavicon(), speed / 2);
  };

  const cancel = () => {
    isNotifying.value = false;
    setTimeout(() => drawPlainFavicon(), speed / 2);
    drawPlainFavicon();
    interval ? clearInterval(interval) : null;
  };

  const initImageElement = (src: string) => {
    const img = new Image();
    img.src = src;
    img.onload = () => (imageElement.value = img);
  };

  watch(plainFavicon, () => {
    favicon.value = plainFavicon.value;
    initImageElement(plainFavicon.value);
    if (isNotifying.value) notify();
  });

  initImageElement(src);

  return {
    notify,
    cancel,
    favicon: plainFavicon,
  };
}
