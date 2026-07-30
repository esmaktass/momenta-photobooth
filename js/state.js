"use strict";

/**
 * Momenta uygulamasının çalışma sırasındaki değişken durumu.
 *
 * State, uygulamanın o anda hangi durumda olduğunu belirleyen
 * verileri içerir.
 *
 * capturedPhotos:
 * Kullanıcının çektiği fotoğrafların data URL değerlerini tutar.
 *
 * cameraStream:
 * Tarayıcıdan alınan aktif MediaStream nesnesini tutar.
 *
 * isCountingDown:
 * Fotoğraf çekme geri sayımının devam edip etmediğini belirtir.
 */
export const appState = {
    capturedPhotos: [],
    cameraStream: null,
    isCountingDown: false
};

/**
 * Yakalanan fotoğrafların tamamını state içinden kaldırır.
 *
 * Diziyi yeni bir diziyle değiştirmek yerine mevcut diziyi
 * temizler. Böylece aynı dizi referansını kullanan diğer
 * modüller güncel durumu görmeye devam eder.
 *
 * @returns {void}
 */
export function clearCapturedPhotos() {
    appState.capturedPhotos.length = 0;
}

/**
 * Yeni çekilen fotoğrafı uygulama state'ine ekler.
 *
 * @param {string} photoDataUrl
 * Fotoğrafın base64 data URL değeri.
 *
 * @returns {number}
 * Fotoğraf eklendikten sonraki toplam fotoğraf sayısı.
 */
export function addCapturedPhoto(photoDataUrl) {
    if (
        typeof photoDataUrl !== "string" ||
        photoDataUrl.trim() === ""
    ) {
        throw new TypeError(
            "Eklenen fotoğraf geçerli bir data URL olmalıdır."
        );
    }

    appState.capturedPhotos.push(photoDataUrl);

    return appState.capturedPhotos.length;
}

/**
 * Aktif kamera akışını state içine kaydeder.
 *
 * @param {MediaStream | null} stream
 * Kaydedilecek kamera akışı.
 *
 * @returns {void}
 */
export function setCameraStream(stream) {
    appState.cameraStream = stream;
}

/**
 * Geri sayım durumunu günceller.
 *
 * @param {boolean} isCountingDown
 * Geri sayım devam ediyorsa true, aksi durumda false.
 *
 * @returns {void}
 */
export function setCountdownState(isCountingDown) {
    if (typeof isCountingDown !== "boolean") {
        throw new TypeError(
            "Geri sayım durumu boolean olmalıdır."
        );
    }

    appState.isCountingDown = isCountingDown;
}