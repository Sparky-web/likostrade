type YandexMetrikaFn = (counterId: number, method: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    ym?: YandexMetrikaFn;
  }
}

export const YANDEX_METRIKA_COUNTER_ID = 93008812;

export const YANDEX_METRIKA_INIT_SCRIPT = `
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
  })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');

  ym(${YANDEX_METRIKA_COUNTER_ID}, 'init', {webvisor:true, clickmap:true, referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
`;

export const YANDEX_METRIKA_GOALS = {
  requestSent: "requestSent",
  /** Клик по кнопке копирования email. */
  emailCopy: "emailCopy",
} as const;

export function reachYandexMetrikaGoal(goal: (typeof YANDEX_METRIKA_GOALS)[keyof typeof YANDEX_METRIKA_GOALS]) {
  window.ym?.(YANDEX_METRIKA_COUNTER_ID, "reachGoal", goal);
}
