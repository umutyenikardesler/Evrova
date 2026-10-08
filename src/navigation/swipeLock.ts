/**
 * Yatay kaydırılan alanlar (chip satırı, fotoğraf slider'ı) parmak üstündeyken sayfa değiştiren
 * kaydırma hareketini (MainShell) devre dışı bırakır; böylece hızlı çekişte sayfa değişmez.
 */
let active = false;
let timer: ReturnType<typeof setTimeout> | undefined;

export const isSwipeLocked = () => active;

/** Yatay kaydırılan alanın üstüne konulacak dokunma olayları. */
export const swipeLockProps = {
  onTouchStart: () => {
    if (timer) clearTimeout(timer);
    active = true;
  },
  // Bırakma olayı sayfa kaydırma işleyicisinden sonra gelebilir; kilidi kısa süre sonra kaldır.
  onTouchEnd: () => {
    timer = setTimeout(() => { active = false; }, 120);
  },
  onTouchCancel: () => {
    timer = setTimeout(() => { active = false; }, 120);
  },
};
