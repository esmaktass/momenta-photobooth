const MAX_PHOTOS = 4;

const startButton = document.getElementById("start-camera");
const captureButton = document.getElementById("capture-photo");
const resetButton = document.getElementById("reset-session");

const camera = document.getElementById("camera");
const statusText = document.getElementById("camera-status");
const photoCounter = document.getElementById("photo-counter");

const captureCanvas = document.getElementById("photo-canvas");
const captureContext = captureCanvas.getContext("2d");

const photoGallery = document.getElementById("photo-gallery");

const stripResult = document.getElementById("strip-result");
const stripCanvas = document.getElementById("strip-canvas");
const stripContext = stripCanvas.getContext("2d");

const capturedPhotos = [];

let cameraStream = null;


/**
 * Kullanıcının kamerasına erişir ve canlı görüntüyü başlatır.
 */
async function startCamera() {
    statusText.textContent = "Kamera açılıyor...";
    startButton.disabled = true;

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        camera.srcObject = cameraStream;
        camera.style.display = "block";

        captureButton.disabled = false;
        resetButton.disabled = false;

        startButton.textContent = "Kamera Açık";
        statusText.textContent =
            "Kamera hazır. İlk fotoğrafını çekebilirsin.";
    } catch (error) {
        console.error("Kamera açılamadı:", error);

        startButton.disabled = false;
        startButton.textContent = "Kamerayı Tekrar Dene";
        statusText.textContent = getCameraErrorMessage(error);
    }
}


/**
 * Kamera hatasını kullanıcı dostu bir mesaja dönüştürür.
 */
function getCameraErrorMessage(error) {
    if (error.name === "NotAllowedError") {
        return "Kamera izni verilmedi. Tarayıcı ayarlarından kamera erişimine izin vermelisin.";
    }

    if (error.name === "NotFoundError") {
        return "Bu cihazda kullanılabilir bir kamera bulunamadı.";
    }

    if (error.name === "NotReadableError") {
        return "Kamera başka bir uygulama tarafından kullanılıyor olabilir.";
    }

    return "Kamera açılamadı. Lütfen bağlantını ve kamera ayarlarını kontrol et.";
}


/**
 * Kameradaki mevcut kareyi canvas üzerine çizer
 * ve PNG formatında döndürür.
 */
function captureCurrentFrame() {
    captureCanvas.width = camera.videoWidth;
    captureCanvas.height = camera.videoHeight;

    captureContext.save();

    /*
     * Canlı önizleme aynalı olduğu için fotoğrafı da
     * yatay eksende çeviriyoruz.
     */
    captureContext.translate(captureCanvas.width, 0);
    captureContext.scale(-1, 1);

    captureContext.drawImage(
        camera,
        0,
        0,
        captureCanvas.width,
        captureCanvas.height
    );

    captureContext.restore();

    return captureCanvas.toDataURL("image/png");
}


/**
 * Bir fotoğraf çeker ve oturuma ekler.
 */
function capturePhoto() {
    if (!cameraStream) {
        statusText.textContent =
            "Fotoğraf çekmeden önce kamerayı açmalısın.";
        return;
    }

    if (camera.videoWidth === 0 || camera.videoHeight === 0) {
        statusText.textContent =
            "Kamera henüz hazır değil. Birkaç saniye bekleyip tekrar dene.";
        return;
    }

    if (capturedPhotos.length >= MAX_PHOTOS) {
        statusText.textContent =
            "Bu oturum için gereken tüm fotoğraflar çekildi.";
        return;
    }

    const photoData = captureCurrentFrame();

    capturedPhotos.push(photoData);

    renderPhotoThumbnail(photoData, capturedPhotos.length);
    updateSessionInterface();

    if (capturedPhotos.length === MAX_PHOTOS) {
        captureButton.disabled = true;
        statusText.textContent =
            "Tüm fotoğraflar çekildi. Photo strip hazırlanıyor...";

        createPhotoStrip();
    }
}


/**
 * Çekilen fotoğrafı küçük bir önizleme olarak gösterir.
 */
function renderPhotoThumbnail(photoData, photoNumber) {
    const image = document.createElement("img");

    image.src = photoData;
    image.alt = `${photoNumber}. çekilen fotoğraf`;
    image.classList.add("photo-thumbnail");

    photoGallery.appendChild(image);
}


/**
 * Sayaç ve durum mesajını günceller.
 */
function updateSessionInterface() {
    const photoCount = capturedPhotos.length;
    const remainingPhotos = MAX_PHOTOS - photoCount;

    photoCounter.textContent =
        `${photoCount} / ${MAX_PHOTOS} fotoğraf çekildi`;

    if (remainingPhotos > 0) {
        statusText.textContent =
            `${photoCount}. fotoğraf kaydedildi. ` +
            `${remainingPhotos} fotoğraf daha çekmelisin.`;
    }
}


/**
 * Dört fotoğrafı dikey bir photo strip hâline getirir.
 */
async function createPhotoStrip() {
    try {
        const images = await Promise.all(
            capturedPhotos.map(loadImage)
        );

        const stripWidth = 600;
        const photoHeight = 450;

        const outerPadding = 40;
        const gap = 24;
        const titleAreaHeight = 100;
        const footerAreaHeight = 90;

        stripCanvas.width =
            stripWidth + outerPadding * 2;

        stripCanvas.height =
            titleAreaHeight +
            footerAreaHeight +
            outerPadding * 2 +
            photoHeight * MAX_PHOTOS +
            gap * (MAX_PHOTOS - 1);

        /*
         * Strip arka planı.
         */
        stripContext.fillStyle = "#fffaf5";
        stripContext.fillRect(
            0,
            0,
            stripCanvas.width,
            stripCanvas.height
        );

        /*
         * Üst başlık.
         */
        stripContext.fillStyle = "#1f1f1f";
        stripContext.textAlign = "center";
        stripContext.font = "bold 38px Arial";
        stripContext.fillText(
            "MOMENTA",
            stripCanvas.width / 2,
            65
        );

        stripContext.font = "20px Arial";
        stripContext.fillText(
            "create memories in strips",
            stripCanvas.width / 2,
            95
        );

        /*
         * Fotoğrafların başlangıç yüksekliği.
         */
        let currentY = titleAreaHeight + outerPadding;

        images.forEach((image) => {
            drawImageCover(
                stripContext,
                image,
                outerPadding,
                currentY,
                stripWidth,
                photoHeight
            );

            currentY += photoHeight + gap;
        });

        /*
         * Alt bölüm.
         */
        stripContext.fillStyle = "#1f1f1f";
        stripContext.font = "18px Arial";
        stripContext.fillText(
            new Date().toLocaleDateString("tr-TR"),
            stripCanvas.width / 2,
            stripCanvas.height - 45
        );

        stripResult.hidden = false;

        statusText.textContent =
            "Photo strip başarıyla oluşturuldu.";

        stripResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        console.error("Photo strip oluşturulamadı:", error);

        statusText.textContent =
            "Photo strip oluşturulurken bir hata oluştu.";
    }
}


/**
 * Base64 fotoğraf verisini kullanılabilir Image nesnesine çevirir.
 */
function loadImage(source) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = function () {
            resolve(image);
        };

        image.onerror = function () {
            reject(
                new Error("Fotoğraf yüklenemedi.")
            );
        };

        image.src = source;
    });
}


/**
 * Görüntüyü oranını bozmadan belirtilen alanı tamamen
 * kaplayacak şekilde canvas üzerine çizer.
 */
function drawImageCover(
    context,
    image,
    destinationX,
    destinationY,
    destinationWidth,
    destinationHeight
) {
    const imageRatio = image.width / image.height;
    const destinationRatio =
        destinationWidth / destinationHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.width;
    let sourceHeight = image.height;

    if (imageRatio > destinationRatio) {
        sourceWidth = image.height * destinationRatio;
        sourceX = (image.width - sourceWidth) / 2;
    } else {
        sourceHeight = image.width / destinationRatio;
        sourceY = (image.height - sourceHeight) / 2;
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


/**
 * Çekim oturumunu sıfırlar.
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

    captureButton.disabled = !cameraStream;

    statusText.textContent = cameraStream
        ? "Yeni oturum hazır. İlk fotoğrafını çekebilirsin."
        : "Fotoğraf çekmeye başlamak için kameranı aç.";
}


startButton.addEventListener("click", startCamera);
captureButton.addEventListener("click", startCountdown);
resetButton.addEventListener("click", resetSession);

const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumber = document.getElementById("countdown-number");
console.log("Capture butonu:", captureButton);

async function startCountdown() {
console.log("Geri sayım başladı");

    captureButton.disabled = true;
    countdownOverlay.hidden = false;

    for (let i = 3; i >= 1; i--) {

        countdownNumber.textContent = i;

        countdownNumber.style.animation = "none";
        countdownNumber.offsetHeight; // Animasyonu yeniden başlatır.
        countdownNumber.style.animation = "";

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    countdownOverlay.hidden = true;

    capturePhoto();

    if (capturedPhotos.length < MAX_PHOTOS) {
        captureButton.disabled = false;
    }
}