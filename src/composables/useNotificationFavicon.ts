import { useFavicon } from "@vueuse/core";
import { watch, ref, computed } from "vue";

type Position =
  | "bottomRight"
  | "topRight"
  | "topLeft"
  | "bottomLeft"
  | "center";

export default function useNotificationFavicon(src: string) {
  const options: {
    size: number;
    position: Position;
    color: string;
    speed: number;
    blink: boolean;
  } = {
    size: 8,
    position: "bottomRight",
    color: "red",
    speed: 500,
    blink: true,
  };

  let interval = 0;
  const favicon = useFavicon();
  const plainFavicon = ref(src);
  const isNotifying = ref(false);
  const imgSize = ref(0);

  const positions = computed((): number[] => {
    const map = {
      topLeft: [options.size, options.size],
      topRight: [imgSize.value - options.size, options.size],
      bottomLeft: [options.size, imgSize.value - options.size],
      bottomRight: [imgSize.value - options.size, imgSize.value - options.size],
      center: [imgSize.value / 2, imgSize.value / 2],
    };
    return map[options.position];
  });

  favicon.value = src;

  const drawNotification = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const img = new Image();
    img.src = favicon.value || "";
    img.onload = function () {
      imgSize.value = img.width;
      canvas.width = img.width;
      canvas.height = img.width;
      ctx.drawImage(img, 0, 0);
      const radius = options.size;

      ctx.beginPath();
      ctx.arc(
        positions.value[0],
        positions.value[1],
        radius,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = options.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = options.color;
      ctx.stroke();
      favicon.value = canvas.toDataURL("image/x-icon");
    };
  };

  const drawPlainFavicon = () => {
    favicon.value = plainFavicon.value;
  };

  const notify = () => {
    isNotifying.value = true;
    drawNotification();
    if (!options.blink) return;
    interval = setInterval(() => {
      drawPlainFavicon();
      setTimeout(() => {
        if (isNotifying.value) drawNotification();
      }, options.speed / 2);
    }, options.speed);
  };
  const cancel = () => {
    isNotifying.value = false;
    setTimeout(() => drawPlainFavicon(), options.speed / 2);
    drawPlainFavicon();
    interval ? clearInterval(interval) : null;
  };

  watch(plainFavicon, () => {
    favicon.value = plainFavicon.value;
    if (isNotifying.value) notify();
  });

  return {
    notify,
    cancel,
    favicon: plainFavicon,
  };
}
