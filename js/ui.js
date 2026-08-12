"use strict";

import {
    APP_CONFIG,
    STATUS_TYPE
} from "./config.js";

import {
    contexts,
    elements
} from "./dom.js";


/* ============================= */
/* STATUS MESSAGE                */
/* ============================= */

/**
 * Kullanıcıya gösterilen durum mesajını günceller.
 *
 * Mesajın türüne göre başarı veya hata sınıfı ekler.
 *
 * @param {string} message
 * Kullanıcıya gösterilecek mesaj.
 *
 * @param {"default"|"success"|"error"} type
 * Mesajın görsel türü.
 *
 * @returns {void}
 */
export function setStatus(
    message,
    type = STATUS_TYPE.DEFAULT
) {
    if (
        typeof message !== "string" ||
        message.trim() === ""
    ) {
        throw new TypeError(
            "Durum mesajı boş olmayan bir string olmalıdır."
        );
    }

    const validStatusTypes =
        Object.values(STATUS_TYPE);

    if (!validStatusTypes.includes(type)) {
        throw new RangeError(
            `Geçersiz durum mesajı türü: ${type}`
        );
    }

    elements.statusText.textContent =
        message;

    elements.statusText.classList.remove(
        STATUS_TYPE.SUCCESS,
        STATUS_TYPE.ERROR
    );

    if (type !== STATUS_TYPE.DEFAULT) {
        elements.statusText.classList.add(type);
    }
}


/* ============================= */
/* CAMERA CONTROLS               */
/* ============================= */

/**
 * Kamera açılmaya başladığında butonların görünümünü
 * ve kullanılabilirlik durumunu günceller.
 *
 * @returns {void}
 */
export function setCameraOpeningControls() {
    elements.startButton.textContent =
        "Kamera Açılıyor...";

    elements.startButton.disabled = true;
    elements.captureButton.disabled = true;
    elements.resetButton.disabled = true;
}


/**
 * Kamera kullanıma hazır olduğunda butonların durumunu
 * günceller.
 *
 * @returns {void}
 */
export function setCameraReadyControls() {
    elements.startButton.textContent =
        "Kamera Açık";

    elements.startButton.disabled = true;
    elements.captureButton.disabled = false;
    elements.resetButton.disabled = false;
}


/**
 * Kamera açılırken hata meydana geldiğinde butonları
 * yeniden kullanılabilir duruma getirir.
 *
 * @returns {void}
 */
export function setCameraErrorControls() {
    elements.startButton.textContent =
        "Kamerayı Tekrar Dene";

    elements.startButton.disabled = false;
    elements.captureButton.disabled = true;
    elements.resetButton.disabled = true;
}


/**
 * Kamera kapalı olan başlangıç görünümünü oluşturur.
 *
 * @returns {void}
 */
export function setCameraIdleControls() {
    elements.startButton.textContent =
        "Kamerayı Aç";

    elements.startButton.disabled = false;
    elements.captureButton.disabled = true;
    elements.resetButton.disabled = true;
}


/**
 * Fotoğraf çekme butonunun kullanılabilirliğini değiştirir.
 *
 * @param {boolean} isEnabled
 * Buton aktif olacaksa true, aksi durumda false.
 *
 * @returns {void}
 */
export function setCaptureEnabled(isEnabled) {
    if (typeof isEnabled !== "boolean") {
        throw new TypeError(
            "Capture butonu durumu boolean olmalıdır."
        );
    }

    elements.captureButton.disabled =
        !isEnabled;
}


/**
 * Oturum sıfırlama butonunun kullanılabilirliğini değiştirir.
 *
 * @param {boolean} isEnabled
 * Buton aktif olacaksa true, aksi durumda false.
 *
 * @returns {void}
 */
export function setResetEnabled(isEnabled) {
    if (typeof isEnabled !== "boolean") {
        throw new TypeError(
            "Reset butonu durumu boolean olmalıdır."
        );
    }

    elements.resetButton.disabled =
        !isEnabled;
}


/* ============================= */
/* CAMERA PREVIEW                */
/* ============================= */

/**
 * Canlı kamera görüntüsünü kullanıcıya gösterir.
 *
 * @returns {void}
 */
export function showCameraPreview() {
    elements.camera.style.display = "block";
}


/**
 * Canlı kamera görüntüsünü gizler.
 *
 * @returns {void}
 */
export function hideCameraPreview() {
    elements.camera.style.display = "none";
}


/* ============================= */
/* COUNTDOWN                     */
/* ============================= */

/**
 * Countdown katmanını görünür hâle getirir.
 *
 * @returns {void}
 */
export function showCountdown() {
    elements.countdownOverlay.hidden = false;
}


/**
 * Countdown katmanını gizler.
 *
 * @returns {void}
 */
export function hideCountdown() {
    elements.countdownOverlay.hidden = true;
}


/**
 * Geri sayım numarasını ekranda gösterir.
 *
 * CSS animasyonunun her sayı değişiminde yeniden
 * başlaması için animasyon geçici olarak sıfırlanır.
 *
 * @param {number} number
 * Gösterilecek geri sayım sayısı.
 *
 * @returns {void}
 */
export function showCountdownNumber(number) {
    if (
        !Number.isInteger(number) ||
        number < 1
    ) {
        throw new TypeError(
            "Countdown değeri pozitif bir tam sayı olmalıdır."
        );
    }

    elements.countdownNumber.textContent =
        String(number);

    elements.countdownNumber.style.animation =
        "none";

    void elements.countdownNumber.offsetWidth;

    elements.countdownNumber.style.animation = "";
}


/**
 * Countdown görünümünü başlangıç değerine döndürür.
 *
 * @returns {void}
 */
export function resetCountdownView() {
    elements.countdownNumber.textContent =
        String(APP_CONFIG.countdownStart);

    elements.countdownNumber.style.animation = "";

    hideCountdown();
}


/* ============================= */
/* PHOTO COUNTER                 */
/* ============================= */

/**
 * Çekilen fotoğraf sayacını günceller.
 *
 * @param {number} photoCount
 * Şu ana kadar çekilen fotoğraf sayısı.
 *
 * @returns {void}
 */
export function updatePhotoCounter(photoCount) {
    if (
        !Number.isInteger(photoCount) ||
        photoCount < 0 ||
        photoCount > APP_CONFIG.maxPhotos
    ) {
        throw new RangeError(
            "Fotoğraf sayısı geçerli sınırlar içinde olmalıdır."
        );
    }

    elements.photoCounter.textContent =
        `${photoCount} / ${APP_CONFIG.maxPhotos} fotoğraf çekildi`;
}


/**
 * Çekilen fotoğraf sayısına göre kullanıcıya uygun
 * durum mesajını gösterir.
 *
 * @param {number} photoCount
 * Şu ana kadar çekilen fotoğraf sayısı.
 *
 * @returns {void}
 */
export function updatePhotoProgressStatus(photoCount) {
    if (
        !Number.isInteger(photoCount) ||
        photoCount < 0 ||
        photoCount > APP_CONFIG.maxPhotos
    ) {
        throw new RangeError(
            "Fotoğraf ilerleme değeri geçersiz."
        );
    }

    const remainingPhotos =
        APP_CONFIG.maxPhotos - photoCount;

    if (photoCount === 0) {
        setStatus(
            "İlk fotoğrafını çekmeye hazırsın.",
            STATUS_TYPE.SUCCESS
        );

        return;
    }

    if (remainingPhotos === 0) {
        setStatus(
            "Tüm fotoğraflar başarıyla çekildi.",
            STATUS_TYPE.SUCCESS
        );

        return;
    }

    if (remainingPhotos === 1) {
        setStatus(
            "Son bir fotoğraf kaldı. Hazır olduğunda çekebilirsin.",
            STATUS_TYPE.SUCCESS
        );

        return;
    }

    setStatus(
        `${photoCount}. fotoğraf kaydedildi. ` +
        `${remainingPhotos} fotoğraf daha çekmelisin.`,
        STATUS_TYPE.SUCCESS
    );
}


/* ============================= */
/* PHOTO GALLERY                 */
/* ============================= */

/**
 * Çekilen fotoğrafı galeriye küçük önizleme olarak ekler.
 *
 * @param {string} photoDataUrl
 * Fotoğrafın data URL değeri.
 *
 * @param {number} photoNumber
 * Fotoğrafın oturum içindeki sıra numarası.
 *
 * @returns {HTMLImageElement}
 * Oluşturulan görüntü elementi.
 */
export function renderPhotoThumbnail(
    photoDataUrl,
    photoNumber
) {
    if (
        typeof photoDataUrl !== "string" ||
        photoDataUrl.trim() === ""
    ) {
        throw new TypeError(
            "Thumbnail için geçerli bir fotoğraf verisi gereklidir."
        );
    }

    if (
        !Number.isInteger(photoNumber) ||
        photoNumber < 1
    ) {
        throw new TypeError(
            "Fotoğraf sıra numarası pozitif bir tam sayı olmalıdır."
        );
    }

    const image =
        document.createElement("img");

    image.src = photoDataUrl;

    image.alt =
        `${photoNumber}. çekilen fotoğraf`;

    image.classList.add(
        "photo-thumbnail"
    );

    elements.photoGallery.appendChild(image);

    return image;
}


/**
 * Fotoğraf galerisindeki tüm thumbnail elementlerini kaldırır.
 *
 * @returns {void}
 */
export function clearPhotoGallery() {
    elements.photoGallery.replaceChildren();
}


/* ============================= */
/* PHOTO STRIP RESULT            */
/* ============================= */

/**
 * Oluşturulan photo strip sonuç alanını gösterir.
 *
 * @returns {void}
 */
export function showStripResult() {
    elements.stripResult.hidden = false;
}


/**
 * Photo strip sonuç alanını gizler.
 *
 * @returns {void}
 */
export function hideStripResult() {
    elements.stripResult.hidden = true;
}


/**
 * Photo strip canvas içeriğini temizler.
 *
 * @returns {void}
 */
export function clearStripCanvas() {
    contexts.strip.clearRect(
        0,
        0,
        elements.stripCanvas.width,
        elements.stripCanvas.height
    );
}


/* ============================= */
/* SESSION VIEW                  */
/* ============================= */

/**
 * Yeni fotoğraf oturumu için kullanıcı arayüzünü
 * başlangıç durumuna getirir.
 *
 * Bu fonksiyon kamera akışını durdurmaz ve uygulama
 * state'ini değiştirmez. Yalnızca görünümü temizler.
 *
 * @param {boolean} hasActiveCamera
 * Aktif kamera bağlantısı varsa true.
 *
 * @returns {void}
 */
export function clearSessionView(
    hasActiveCamera
) {
    if (typeof hasActiveCamera !== "boolean") {
        throw new TypeError(
            "Kamera bağlantı durumu boolean olmalıdır."
        );
    }

    clearPhotoGallery();
    clearStripCanvas();
    hideStripResult();
    resetCountdownView();
    updatePhotoCounter(0);

    setResetEnabled(hasActiveCamera);
    setCaptureEnabled(hasActiveCamera);

    if (hasActiveCamera) {
        setStatus(
            "Yeni oturum hazır. İlk fotoğrafını çekebilirsin.",
            STATUS_TYPE.SUCCESS
        );

        return;
    }

    setStatus(
        "Fotoğraf çekmeye başlamak için kameranı aç.",
        STATUS_TYPE.DEFAULT
    );
}


/**
 * Uygulama ilk yüklendiğinde başlangıç kullanıcı
 * arayüzünü oluşturur.
 *
 * @returns {void}
 */
export function initializeInterface() {
    setCameraIdleControls();
    hideStripResult();
    resetCountdownView();
    updatePhotoCounter(0);

    setStatus(
        "Fotoğraf çekmeye başlamak için kameranı aç.",
        STATUS_TYPE.DEFAULT
    );
}