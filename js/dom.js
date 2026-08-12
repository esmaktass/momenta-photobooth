"use strict";

/**
 * ID değeri verilen zorunlu HTML elementini bulur.
 *
 * Element bulunamazsa uygulamanın daha sonra anlamsız bir
 * "null" hatası vermesi yerine sorunun kaynağını doğrudan söyler.
 *
 * @param {string} id - HTML elementinin ID değeri.
 * @returns {HTMLElement} Bulunan HTML elementi.
 * @throws {Error} Element bulunamazsa hata fırlatır.
 */
function getRequiredElement(id) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(
            `Gerekli DOM elementi bulunamadı: #${id}`
        );
    }

    return element;
}

/**
 * Uygulamanın kullandığı bütün DOM elementleri.
 *
 * DOM sorgularını farklı dosyalara dağıtmak yerine tek bir
 * merkezde toplar.
 */
export const elements = Object.freeze({
    startButton: getRequiredElement("start-camera"),
    captureButton: getRequiredElement("capture-photo"),
    resetButton: getRequiredElement("reset-session"),

    camera: getRequiredElement("camera"),
    statusText: getRequiredElement("camera-status"),
    photoCounter: getRequiredElement("photo-counter"),
    photoGallery: getRequiredElement("photo-gallery"),

    captureCanvas: getRequiredElement("photo-canvas"),
    stripResult: getRequiredElement("strip-result"),
    stripCanvas: getRequiredElement("strip-canvas"),

    countdownOverlay: getRequiredElement("countdown-overlay"),
    countdownNumber: getRequiredElement("countdown-number")
});

/**
 * Uygulamada kullanılan canvas çizim context'leri.
 *
 * Canvas elementi üzerinde çizim yapabilmek için
 * 2D context alınması gerekir.
 */
export const contexts = Object.freeze({
    capture: elements.captureCanvas.getContext("2d"),
    strip: elements.stripCanvas.getContext("2d")
});

/**
 * Tarayıcı 2D canvas context oluşturamazsa uygulama
 * fotoğraf yakalayamaz veya photo strip çizemez.
 */
if (!contexts.capture || !contexts.strip) {
    throw new Error(
        "Canvas 2D context oluşturulamadı."
    );
}