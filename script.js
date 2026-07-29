"use strict";


/* ============================= */
/* APPLICATION CONFIGURATION     */
/* ============================= */

const MAX_PHOTOS = 4;
const COUNTDOWN_START = 3;


/* ============================= */
/* DOM ELEMENTS                  */
/* ============================= */

const startButton =
    document.getElementById("start-camera");

const captureButton =
    document.getElementById("capture-photo");

const resetButton =
    document.getElementById("reset-session");

const camera =
    document.getElementById("camera");

const statusText =
    document.getElementById("camera-status");

const photoCounter =
    document.getElementById("photo-counter");

const photoGallery =
    document.getElementById("photo-gallery");

const captureCanvas =
    document.getElementById("photo-canvas");

const stripResult =
    document.getElementById("strip-result");

const stripCanvas =
    document.getElementById("strip-canvas");

const countdownOverlay =
    document.getElementById("countdown-overlay");

const countdownNumber =
    document.getElementById("countdown-number");


/* ============================= */
/* CANVAS CONTEXTS               */
/* ============================= */

const captureContext =
    captureCanvas.getContext("2d");

const stripContext =
    stripCanvas.getContext("2d");


/* ============================= */
/* APPLICATION STATE             */
/* ============================= */

const capturedPhotos = [];

let cameraStream = null;
let isCountingDown = false;


/* ============================= */
/* STATUS MESSAGE                */
/* ============================= */

/**
 * Kullanıcıya gösterilen durum mesajını günceller.
 *
 * @param {string} message
 * @param {"default"|"success"|"error"} type
 */
function setStatus(message, type = "default") {
    statusText.textContent = message;

    statusText.classList.remove(
        "success",
        "error"
    );

    if (type === "success") {
        statusText.classList.add("success");
    }

    if (type === "error") {
        statusText.classList.add("error");
    }
}


/* ============================= */
/* CAMERA                        */
/* ============================= */

/**
 * Kullanıcının kamerasına erişir.
 */
async function startCamera() {
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        setStatus(
            "Tarayıcın kamera erişimini desteklemiyor.",
            "error"
        );

        return;
    }

    setStatus("Kamera açılıyor...");

    startButton.disabled = true;

    try {
        stopCameraStream();

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 960
                    }
                },
                audio: false
            });

        camera.srcObject = cameraStream;

        await waitForCamera();

        camera.style.display = "block";

        startButton.textContent = "Kamera Açık";
        startButton.disabled = true;

        captureButton.disabled = false;
        resetButton.disabled = false;

        setStatus(
            "Kamera hazır. İlk fotoğrafını çekebilirsin.",
            "success"
        );
    } catch (error) {
        console.error(
            "Kamera açılamadı:",
            error
        );

        cameraStream = null;

        startButton.disabled = false;
        startButton.textContent =
            "Kamerayı Tekrar Dene";

        captureButton.disabled = true;

        setStatus(
            getCameraErrorMessage(error),
            "error"
        );
    }
}


/**
 * Video görüntüsünün gerçekten hazır olmasını bekler.
 *
 * @returns {Promise<void>}
 */
function waitForCamera() {
    return new Promise((resolve, reject) => {
        if (
            camera.readyState >= 2 &&
            camera.videoWidth > 0
        ) {
            resolve();
            return;
        }

        const timeoutId = setTimeout(() => {
            reject(
                new Error(
                    "Kamera görüntüsü zamanında yüklenemedi."
                )
            );
        }, 10000);

        camera.addEventListener(
            "loadedmetadata",
            () => {
                clearTimeout(timeoutId);

                camera
                    .play()
                    .then(resolve)
                    .catch(reject);
            },
            {
                once: true
            }
        );
    });
}


/**
 * Aktif kamera akışını durdurur.
 */
function stopCameraStream() {
    if (!cameraStream) {
        return;
    }

    cameraStream
        .getTracks()
        .forEach((track) => {
            track.stop();
        });

    cameraStream = null;
    camera.srcObject = null;
}


/**
 * Tarayıcı kamera hatalarını kullanıcı dostu
 * mesajlara dönüştürür.
 *
 * @param {Error} error
 * @returns {string}
 */
function getCameraErrorMessage(error) {
    switch (error.name) {
        case "NotAllowedError":
            return (
                "Kamera izni verilmedi. Tarayıcı " +
                "ayarlarından kamera iznine izin vermelisin."
            );

        case "NotFoundError":
            return (
                "Bu cihazda kullanılabilir bir kamera " +
                "bulunamadı."
            );

        case "NotReadableError":
            return (
                "Kamera başka bir uygulama tarafından " +
                "kullanılıyor olabilir."
            );

        case "OverconstrainedError":
            return (
                "Kamera istenen görüntü ayarlarını " +
                "desteklemiyor."
            );

        case "SecurityError":
            return (
                "Tarayıcı güvenlik ayarları kamera " +
                "erişimini engelledi."
            );

        default:
            return (
                "Kamera açılamadı. Kamera iznini ve " +
                "tarayıcı ayarlarını kontrol et."
            );
    }
}


/* ============================= */
/* COUNTDOWN                     */
/* ============================= */

/**
 * Fotoğraf çekilmeden önce geri sayımı başlatır.
 */
async function startCountdown() {
    if (isCountingDown) {
        return;
    }

    if (!cameraStream) {
        setStatus(
            "Fotoğraf çekmeden önce kamerayı açmalısın.",
            "error"
        );

        return;
    }

    if (capturedPhotos.length >= MAX_PHOTOS) {
        setStatus(
            "Bu oturumdaki tüm fotoğraflar çekildi."
        );

        return;
    }

    if (
        camera.videoWidth === 0 ||
        camera.videoHeight === 0
    ) {
        setStatus(
            "Kamera henüz hazır değil. Birkaç saniye bekleyip tekrar dene.",
            "error"
        );

        return;
    }

    isCountingDown = true;
    captureButton.disabled = true;
    countdownOverlay.hidden = false;

    setStatus(
        "Hazır ol! Fotoğraf çekiliyor..."
    );

    try {
        for (
            let number = COUNTDOWN_START;
            number >= 1;
            number -= 1
        ) {
            showCountdownNumber(number);

            await delay(1000);
        }

        countdownOverlay.hidden = true;

        capturePhoto();
    } finally {
        isCountingDown = false;
        countdownOverlay.hidden = true;

        if (
            cameraStream &&
            capturedPhotos.length < MAX_PHOTOS
        ) {
            captureButton.disabled = false;
        }
    }
}


/**
 * Geri sayım numarasını gösterir ve animasyonu
 * yeniden başlatır.
 *
 * @param {number} number
 */
function showCountdownNumber(number) {
    countdownNumber.textContent =
        String(number);

    countdownNumber.style.animation =
        "none";

    void countdownNumber.offsetWidth;

    countdownNumber.style.animation = "";
}


/**
 * Belirtilen süre kadar bekleyen Promise oluşturur.
 *
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}


/* ============================= */
/* PHOTO CAPTURE                 */
/* ============================= */

/**
 * Kameradaki mevcut görüntüyü fotoğraf olarak kaydeder.
 */
function capturePhoto() {
    if (!cameraStream) {
        setStatus(
            "Kamera bağlantısı bulunamadı.",
            "error"
        );

        return;
    }

    if (capturedPhotos.length >= MAX_PHOTOS) {
        return;
    }

    const photoData =
        captureCurrentFrame();

    capturedPhotos.push(photoData);

    renderPhotoThumbnail(
        photoData,
        capturedPhotos.length
    );

    updateSessionInterface();

    if (
        capturedPhotos.length === MAX_PHOTOS
    ) {
        captureButton.disabled = true;

        setStatus(
            "Tüm fotoğraflar çekildi. Photo strip hazırlanıyor..."
        );

        createPhotoStrip();
    }
}


/**
 * Kameradaki mevcut kareyi canvas üzerine çizer.
 *
 * Canlı kamera görüntüsü CSS ile aynalandığı için
 * kaydedilen fotoğraf da canvas üzerinde aynalanır.
 *
 * @returns {string}
 */
function captureCurrentFrame() {
    captureCanvas.width =
        camera.videoWidth;

    captureCanvas.height =
        camera.videoHeight;

    captureContext.clearRect(
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
    );

    captureContext.save();

    captureContext.translate(
        captureCanvas.width,
        0
    );

    captureContext.scale(-1, 1);

    captureContext.drawImage(
        camera,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
    );

    captureContext.restore();

    return captureCanvas.toDataURL(
        "image/png"
    );
}


/* ============================= */
/* PHOTO GALLERY                 */
/* ============================= */

/**
 * Çekilen fotoğrafı küçük önizleme olarak gösterir.
 *
 * @param {string} photoData
 * @param {number} photoNumber
 */
function renderPhotoThumbnail(
    photoData,
    photoNumber
) {
    const image =
        document.createElement("img");

    image.src = photoData;

    image.alt =
        `${photoNumber}. çekilen fotoğraf`;

    image.classList.add(
        "photo-thumbnail"
    );

    photoGallery.appendChild(image);
}


/**
 * Sayaç ve kullanıcı mesajlarını günceller.
 */
function updateSessionInterface() {
    const photoCount =
        capturedPhotos.length;

    const remainingPhotos =
        MAX_PHOTOS - photoCount;

    photoCounter.textContent =
        `${photoCount} / ${MAX_PHOTOS} fotoğraf çekildi`;

    if (photoCount === 1) {
        setStatus(
            "İlk fotoğraf kaydedildi. 3 fotoğraf daha çekmelisin.",
            "success"
        );

        return;
    }

    if (photoCount === 2) {
        setStatus(
            "Harika! Oturumun yarısını tamamladın. 2 fotoğraf kaldı.",
            "success"
        );

        return;
    }

    if (photoCount === 3) {
        setStatus(
            "Son bir fotoğraf kaldı. Hazır olduğunda çekebilirsin.",
            "success"
        );

        return;
    }

    if (remainingPhotos === 0) {
        setStatus(
            "Tüm fotoğraflar başarıyla çekildi.",
            "success"
        );
    }
}


/* ============================= */
/* PHOTO STRIP                   */
/* ============================= */

/**
 * Çekilen dört fotoğrafı dikey photo strip hâline getirir.
 */
async function createPhotoStrip() {
    try {
        const images =
            await Promise.all(
                capturedPhotos.map(loadImage)
            );

        const stripWidth = 600;
        const photoHeight = 450;

        const outerPadding = 40;
        const gap = 24;

        const titleAreaHeight = 120;
        const footerAreaHeight = 100;

        stripCanvas.width =
            stripWidth +
            outerPadding * 2;

        stripCanvas.height =
            titleAreaHeight +
            footerAreaHeight +
            outerPadding * 2 +
            photoHeight * MAX_PHOTOS +
            gap * (MAX_PHOTOS - 1);

        drawStripBackground();

        drawStripHeader();

        let currentY =
            titleAreaHeight +
            outerPadding;

        images.forEach((image) => {
            drawImageCover(
                stripContext,
                image,
                outerPadding,
                currentY,
                stripWidth,
                photoHeight
            );

            currentY +=
                photoHeight + gap;
        });

        drawStripFooter();

        stripResult.hidden = false;

        setStatus(
            "Photo strip başarıyla oluşturuldu.",
            "success"
        );

        stripResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        console.error(
            "Photo strip oluşturulamadı:",
            error
        );

        setStatus(
            "Photo strip oluşturulurken bir hata oluştu.",
            "error"
        );
    }
}


/**
 * Photo strip arka planını çizer.
 */
function drawStripBackground() {
    stripContext.fillStyle =
        "#fcf5e5";

    stripContext.fillRect(
        0,
        0,
        stripCanvas.width,
        stripCanvas.height
    );
}


/**
 * Photo strip üst başlığını çizer.
 */
function drawStripHeader() {
    stripContext.fillStyle =
        "#810b38";

    stripContext.textAlign =
        "center";

    stripContext.font =
        "bold 40px Arial";

    stripContext.fillText(
        "MOMENTA",
        stripCanvas.width / 2,
        65
    );

    stripContext.font =
        "20px Arial";

    stripContext.fillText(
        "create memories in strips",
        stripCanvas.width / 2,
        96
    );
}


/**
 * Photo strip alt kısmını çizer.
 */
function drawStripFooter() {
    stripContext.fillStyle =
        "#810b38";

    stripContext.textAlign =
        "center";

    stripContext.font =
        "18px Arial";

    stripContext.fillText(
        new Date().toLocaleDateString(
            "tr-TR"
        ),
        stripCanvas.width / 2,
        stripCanvas.height - 50
    );
}


/**
 * Base64 fotoğraf verisini Image nesnesine dönüştürür.
 *
 * @param {string} source
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(source) {
    return new Promise(
        (resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                resolve(image);
            };

            image.onerror = () => {
                reject(
                    new Error(
                        "Fotoğraf yüklenemedi."
                    )
                );
            };

            image.src = source;
        }
    );
}


/**
 * Görüntüyü oranını bozmadan hedef alanı tamamen
 * dolduracak şekilde canvas üzerine çizer.
 */
function drawImageCover(
    context,
    image,
    destinationX,
    destinationY,
    destinationWidth,
    destinationHeight
) {
    const imageRatio =
        image.width / image.height;

    const destinationRatio =
        destinationWidth /
        destinationHeight;

    let sourceX = 0;
    let sourceY = 0;

    let sourceWidth =
        image.width;

    let sourceHeight =
        image.height;

    if (
        imageRatio > destinationRatio
    ) {
        sourceWidth =
            image.height *
            destinationRatio;

        sourceX =
            (image.width - sourceWidth) / 2;
    } else {
        sourceHeight =
            image.width /
            destinationRatio;

        sourceY =
            (image.height - sourceHeight) / 2;
    }

    context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destinationX,
        destinationY,
        destinationWidth,
        destinationHeight
    );
}


/* ============================= */
/* RESET SESSION                 */
/* ============================= */

/**
 * Fotoğraf oturumunu sıfırlar.
 *
 * Kamera açıksa açık kalır; yalnızca çekilen
 * fotoğraflar ve oluşturulan strip temizlenir.
 */
function resetSession() {
    capturedPhotos.length = 0;

    photoGallery.innerHTML = "";

    stripContext.clearRect(
        0,
        0,
        stripCanvas.width,
        stripCanvas.height
    );

    stripResult.hidden = true;

    photoCounter.textContent =
        `0 / ${MAX_PHOTOS} fotoğraf çekildi`;

    countdownOverlay.hidden = true;

    isCountingDown = false;

    resetButton.disabled =
        !cameraStream;

    captureButton.disabled =
        !cameraStream;

    if (cameraStream) {
        setStatus(
            "Yeni oturum hazır. İlk fotoğrafını çekebilirsin.",
            "success"
        );
    } else {
        setStatus(
            "Fotoğraf çekmeye başlamak için kameranı aç."
        );
    }
}


/* ============================= */
/* EVENT LISTENERS               */
/* ============================= */

startButton.addEventListener(
    "click",
    startCamera
);

captureButton.addEventListener(
    "click",
    startCountdown
);

resetButton.addEventListener(
    "click",
    resetSession
);


/* ============================= */
/* PAGE CLEANUP                  */
/* ============================= */

/**
 * Kullanıcı sayfadan ayrıldığında kamerayı kapatır.
 */
window.addEventListener(
    "beforeunload",
    stopCameraStream
);