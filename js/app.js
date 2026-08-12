"use strict";

import {
    APP_CONFIG,
    CAMERA_CONSTRAINTS,
    STATUS_TYPE
} from "./config.js";

import {
    contexts,
    elements
} from "./dom.js";

import {
    addCapturedPhoto,
    appState,
    clearCapturedPhotos,
    setCameraStream,
    setCountdownState
} from "./state.js";

import {
    clearSessionView,
    hideCountdown,
    initializeInterface,
    renderPhotoThumbnail,
    resetCountdownView,
    setCameraErrorControls,
    setCameraOpeningControls,
    setCameraReadyControls,
    setCaptureEnabled,
    setResetEnabled,
    setStatus,
    showCountdown,
    showCountdownNumber,
    showStripResult,
    updatePhotoCounter,
    updatePhotoProgressStatus
} from "./ui.js";

import {
    delay,
    loadImage
} from "./utils.js";


/* ============================= */
/* CAMERA                        */
/* ============================= */

/**
 * Tarayıcıdan kamera erişimi ister ve canlı görüntüyü
 * video elementine bağlar.
 *
 * @returns {Promise<void>}
 */
async function startCamera() {
    if (appState.cameraStream) {
        return;
    }

    if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
        setStatus(
            "Tarayıcın kamera erişimini desteklemiyor.",
            STATUS_TYPE.ERROR
        );

        setCameraErrorControls();

        return;
    }

    setCameraOpeningControls();

    setStatus(
        "Kamera izni bekleniyor...",
        STATUS_TYPE.DEFAULT
    );

    try {
        const stream =
            await navigator.mediaDevices.getUserMedia(
                CAMERA_CONSTRAINTS
            );

        setCameraStream(stream);

        elements.camera.srcObject = stream;

        await waitForCameraMetadata();

        await elements.camera.play();

        setCameraReadyControls();

        setStatus(
            "Kamera hazır. İlk fotoğrafını çekebilirsin.",
            STATUS_TYPE.SUCCESS
        );
    } catch (error) {
        stopCamera();

        setCameraErrorControls();

        setStatus(
            getCameraErrorMessage(error),
            STATUS_TYPE.ERROR
        );

        console.error(
            "Kamera başlatılamadı:",
            error
        );
    }
}


/**
 * Video elementinin kamera bilgilerini yüklemesini bekler.
 *
 * Metadata yüklenmeden videoWidth ve videoHeight değerleri
 * sıfır olabilir.
 *
 * @returns {Promise<void>}
 */
function waitForCameraMetadata() {
    if (
        elements.camera.readyState >=
        HTMLMediaElement.HAVE_METADATA
    ) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        let timeoutId;

        const handleLoadedMetadata = () => {
            window.clearTimeout(timeoutId);
            resolve();
        };

        const handleVideoError = () => {
            window.clearTimeout(timeoutId);

            reject(
                new Error(
                    "Kamera görüntüsü yüklenemedi."
                )
            );
        };

        elements.camera.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata,
            {
                once: true
            }
        );

        elements.camera.addEventListener(
            "error",
            handleVideoError,
            {
                once: true
            }
        );

        timeoutId = window.setTimeout(
            () => {
                reject(
                    new Error(
                        "Kamera görüntüsü zamanında yüklenemedi."
                    )
                );
            },
            APP_CONFIG.cameraLoadTimeoutMs
        );
    });
}


/**
 * Aktif kamera akışındaki bütün video track'lerini
 * durdurur ve state'i temizler.
 *
 * @returns {void}
 */
function stopCamera() {
    if (!appState.cameraStream) {
        elements.camera.srcObject = null;

        return;
    }

    const tracks =
        appState.cameraStream.getTracks();

    tracks.forEach((track) => {
        track.stop();
    });

    elements.camera.srcObject = null;

    setCameraStream(null);
}


/**
 * Kamera erişimi sırasında oluşan hatayı kullanıcı
 * dostu bir mesaja dönüştürür.
 *
 * @param {unknown} error
 * Oluşan hata.
 *
 * @returns {string}
 */
function getCameraErrorMessage(error) {
    if (!(error instanceof DOMException)) {
        return "Kamera başlatılırken beklenmeyen bir hata oluştu.";
    }

    const errorMessages = {
        NotAllowedError:
            "Kamera izni verilmedi. Tarayıcı ayarlarından kamera iznini açıp tekrar dene.",

        PermissionDeniedError:
            "Kamera izni verilmedi. Tarayıcı ayarlarından kamera iznini açıp tekrar dene.",

        NotFoundError:
            "Cihazında kullanılabilir bir kamera bulunamadı.",

        DevicesNotFoundError:
            "Cihazında kullanılabilir bir kamera bulunamadı.",

        NotReadableError:
            "Kamera başka bir uygulama tarafından kullanılıyor olabilir.",

        TrackStartError:
            "Kamera başka bir uygulama tarafından kullanılıyor olabilir.",

        OverconstrainedError:
            "Kamera istenen görüntü özelliklerini sağlayamadı.",

        SecurityError:
            "Tarayıcı güvenlik nedeniyle kamera erişimini engelledi.",

        AbortError:
            "Kamera bağlantısı başlatılırken işlem kesildi."
    };

    return (
        errorMessages[error.name] ??
        "Kamera başlatılamadı. Kamera izinlerini kontrol edip tekrar dene."
    );
}


/* ============================= */
/* COUNTDOWN                     */
/* ============================= */

/**
 * Fotoğraf çekilmeden önce geri sayımı çalıştırır.
 *
 * @returns {Promise<void>}
 */
async function runCountdown() {
    setCountdownState(true);

    showCountdown();

    try {
        for (
            let number = APP_CONFIG.countdownStart;
            number >= 1;
            number -= 1
        ) {
            showCountdownNumber(number);

            await delay(
                APP_CONFIG.countdownStepMs
            );
        }
    } finally {
        setCountdownState(false);

        hideCountdown();
    }
}


/* ============================= */
/* PHOTO CAPTURE                 */
/* ============================= */

/**
 * Fotoğraf çekme sürecini yönetir.
 *
 * Geri sayım başlatır, video görüntüsünü canvas üzerine
 * çizer ve fotoğrafı uygulama state'ine kaydeder.
 *
 * @returns {Promise<void>}
 */
async function capturePhoto() {
    if (!appState.cameraStream) {
        setStatus(
            "Fotoğraf çekmeden önce kamerayı açmalısın.",
            STATUS_TYPE.ERROR
        );

        return;
    }

    if (appState.isCountingDown) {
        return;
    }

    if (
        appState.capturedPhotos.length >=
        APP_CONFIG.maxPhotos
    ) {
        setStatus(
            "Bu oturum için gerekli tüm fotoğraflar çekildi.",
            STATUS_TYPE.DEFAULT
        );

        return;
    }

    setCaptureEnabled(false);
    setResetEnabled(false);

    try {
        await runCountdown();

        const photoDataUrl =
            captureVideoFrame();

        const photoCount =
            addCapturedPhoto(photoDataUrl);

        renderPhotoThumbnail(
            photoDataUrl,
            photoCount
        );

        updatePhotoCounter(photoCount);
        updatePhotoProgressStatus(photoCount);

        if (
            photoCount ===
            APP_CONFIG.maxPhotos
        ) {
            setStatus(
                "Photo strip oluşturuluyor...",
                STATUS_TYPE.DEFAULT
            );

            await generatePhotoStrip();

            setStatus(
                "Photo strip hazır.",
                STATUS_TYPE.SUCCESS
            );

            setCaptureEnabled(false);
            setResetEnabled(true);

            return;
        }

        setCaptureEnabled(true);
        setResetEnabled(true);
    } catch (error) {
        setStatus(
            "Fotoğraf çekilirken bir hata oluştu.",
            STATUS_TYPE.ERROR
        );

        setCaptureEnabled(
            Boolean(appState.cameraStream)
        );

        setResetEnabled(
            Boolean(appState.cameraStream)
        );

        console.error(
            "Fotoğraf çekilemedi:",
            error
        );
    } finally {
        resetCountdownView();
    }
}


/**
 * Video elementindeki mevcut görüntüyü capture canvas
 * üzerine çizer ve PNG data URL olarak döndürür.
 *
 * @returns {string}
 */
function captureVideoFrame() {
    const videoWidth =
        elements.camera.videoWidth;

    const videoHeight =
        elements.camera.videoHeight;

    if (
        videoWidth <= 0 ||
        videoHeight <= 0
    ) {
        throw new Error(
            "Kamera görüntü boyutları alınamadı."
        );
    }

    elements.captureCanvas.width =
        videoWidth;

    elements.captureCanvas.height =
        videoHeight;

    contexts.capture.save();

    /*
     * Ön kamera görüntüsünün kullanıcıya video üzerinde
     * göründüğü gibi kaydedilmesi için yatay çevirme uygulanır.
     */
    contexts.capture.translate(
        videoWidth,
        0
    );

    contexts.capture.scale(
        -1,
        1
    );

    contexts.capture.drawImage(
        elements.camera,
        0,
        0,
        videoWidth,
        videoHeight
    );

    contexts.capture.restore();

    return elements.captureCanvas.toDataURL(
        "image/png"
    );
}


/* ============================= */
/* PHOTO STRIP                   */
/* ============================= */

/**
 * Yakalanan fotoğrafları dikey bir photo strip
 * tasarımı içinde birleştirir.
 *
 * @returns {Promise<void>}
 */
async function generatePhotoStrip() {
    if (
        appState.capturedPhotos.length !==
        APP_CONFIG.maxPhotos
    ) {
        throw new Error(
            "Photo strip oluşturmak için gerekli fotoğraf sayısı tamamlanmadı."
        );
    }

    const stripLayout = {
        width: 600,
        sidePadding: 40,
        topPadding: 40,
        photoWidth: 520,
        photoHeight: 390,
        photoGap: 24,
        footerHeight: 150
    };

    const photosHeight =
        stripLayout.photoHeight *
        APP_CONFIG.maxPhotos;

    const gapsHeight =
        stripLayout.photoGap *
        (APP_CONFIG.maxPhotos - 1);

    const canvasHeight =
        stripLayout.topPadding +
        photosHeight +
        gapsHeight +
        stripLayout.footerHeight;

    elements.stripCanvas.width =
        stripLayout.width;

    elements.stripCanvas.height =
        canvasHeight;

    drawStripBackground(
        stripLayout.width,
        canvasHeight
    );

    const loadedImages =
        await Promise.all(
            appState.capturedPhotos.map(
                (photoDataUrl) =>
                    loadImage(photoDataUrl)
            )
        );

    loadedImages.forEach(
        (image, index) => {
            const x =
                stripLayout.sidePadding;

            const y =
                stripLayout.topPadding +
                index *
                (
                    stripLayout.photoHeight +
                    stripLayout.photoGap
                );

            drawImageCover(
                contexts.strip,
                image,
                x,
                y,
                stripLayout.photoWidth,
                stripLayout.photoHeight
            );
        }
    );

    drawStripFooter(
        stripLayout,
        canvasHeight
    );

    showStripResult();

    elements.stripResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/**
 * Photo strip'in arka planını çizer.
 *
 * @param {number} width
 * Canvas genişliği.
 *
 * @param {number} height
 * Canvas yüksekliği.
 *
 * @returns {void}
 */
function drawStripBackground(
    width,
    height
) {
    contexts.strip.save();

    contexts.strip.fillStyle =
        "#f8f4ee";

    contexts.strip.fillRect(
        0,
        0,
        width,
        height
    );

    contexts.strip.restore();
}


/**
 * Bir görüntüyü hedef alanı tamamen kaplayacak şekilde,
 * görüntü oranını bozmadan canvas üzerine çizer.
 *
 * Görüntünün taşan kısımları kırpılır.
 *
 * @param {CanvasRenderingContext2D} context
 * Çizim yapılacak canvas context'i.
 *
 * @param {HTMLImageElement} image
 * Çizilecek görüntü.
 *
 * @param {number} targetX
 * Hedef alanın x konumu.
 *
 * @param {number} targetY
 * Hedef alanın y konumu.
 *
 * @param {number} targetWidth
 * Hedef alanın genişliği.
 *
 * @param {number} targetHeight
 * Hedef alanın yüksekliği.
 *
 * @returns {void}
 */
function drawImageCover(
    context,
    image,
    targetX,
    targetY,
    targetWidth,
    targetHeight
) {
    const sourceRatio =
        image.width / image.height;

    const targetRatio =
        targetWidth / targetHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.width;
    let sourceHeight = image.height;

    if (sourceRatio > targetRatio) {
        sourceWidth =
            image.height * targetRatio;

        sourceX =
            (image.width - sourceWidth) / 2;
    } else {
        sourceHeight =
            image.width / targetRatio;

        sourceY =
            (image.height - sourceHeight) / 2;
    }

    context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        targetX,
        targetY,
        targetWidth,
        targetHeight
    );
}


/**
 * Photo strip'in alt kısmına marka ve tarih bilgisini çizer.
 *
 * @param {{
 *     width: number,
 *     sidePadding: number,
 *     topPadding: number,
 *     photoWidth: number,
 *     photoHeight: number,
 *     photoGap: number,
 *     footerHeight: number
 * }} stripLayout
 * Strip ölçüleri.
 *
 * @param {number} canvasHeight
 * Canvas toplam yüksekliği.
 *
 * @returns {void}
 */
function drawStripFooter(
    stripLayout,
    canvasHeight
) {
    const footerStartY =
        canvasHeight -
        stripLayout.footerHeight;

    contexts.strip.save();

    contexts.strip.textAlign = "center";
    contexts.strip.textBaseline = "middle";

    contexts.strip.fillStyle =
        "#1e1e1e";

    contexts.strip.font =
        "700 42px Arial, sans-serif";

    contexts.strip.fillText(
        "MOMENTA",
        stripLayout.width / 2,
        footerStartY + 52
    );

    contexts.strip.fillStyle =
        "#666666";

    contexts.strip.font =
        "18px Arial, sans-serif";

    contexts.strip.fillText(
        formatCurrentDate(),
        stripLayout.width / 2,
        footerStartY + 96
    );

    contexts.strip.restore();
}


/**
 * Güncel tarihi photo strip üzerinde gösterilecek biçimde
 * formatlar.
 *
 * @returns {string}
 */
function formatCurrentDate() {
    const dateFormatter =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    return dateFormatter
        .format(new Date())
        .toUpperCase();
}


/* ============================= */
/* SESSION RESET                 */
/* ============================= */

/**
 * Kullanıcının mevcut fotoğraf oturumunu temizler.
 *
 * Kamera açıksa kamera akışı devam eder ve kullanıcı
 * yeni fotoğraflar çekmeye başlayabilir.
 *
 * @returns {void}
 */
function resetSession() {
    if (appState.isCountingDown) {
        return;
    }

    clearCapturedPhotos();

    clearSessionView(
        Boolean(appState.cameraStream)
    );
}


/* ============================= */
/* APPLICATION LIFECYCLE         */
/* ============================= */

/**
 * Uygulama kapatılırken aktif kamera bağlantısını
 * güvenli şekilde durdurur.
 *
 * @returns {void}
 */
function handlePageExit() {
    stopCamera();
}


/**
 * Uygulamadaki kullanıcı etkileşimlerini ilgili
 * fonksiyonlara bağlar.
 *
 * @returns {void}
 */
function registerEventListeners() {
    elements.startButton.addEventListener(
        "click",
        startCamera
    );

    elements.captureButton.addEventListener(
        "click",
        capturePhoto
    );

    elements.resetButton.addEventListener(
        "click",
        resetSession
    );

    window.addEventListener(
        "pagehide",
        handlePageExit
    );
}


/**
 * Momenta uygulamasını başlatır.
 *
 * @returns {void}
 */
function initializeApplication() {
    initializeInterface();
    registerEventListeners();
}

initializeApplication();