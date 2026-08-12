const startButton = document.getElementById("start-camera");
const camera = document.getElementById("camera");
const statusText = document.getElementById("camera-status");

console.log("JavaScript dosyası çalıştı.");

startButton.addEventListener("click", async function () {
    console.log("Kamera butonuna basıldı.");

    statusText.textContent = "Kamera açılıyor...";

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        camera.srcObject = stream;
        camera.style.display = "block";

        statusText.textContent = "Kamera başarıyla açıldı.";
        startButton.textContent = "Kamera Açık";
        startButton.disabled = true;
    } catch (error) {
        console.error("Kamera hatası:", error);

        statusText.textContent =
            "Kamera açılamadı. Tarayıcı kamera iznini kontrol et.";
    }
});
const captureButton =
document.getElementById("capture-photo");

const canvas =
document.getElementById("photo-canvas");

const preview =
document.getElementById("photo-preview");
const context =
canvas.getContext("2d");
captureButton.addEventListener(
    "click",
    function(){

        canvas.width =
        camera.videoWidth;

        canvas.height =
        camera.videoHeight;

        context.drawImage(

            camera,

            0,

            0,

            canvas.width,

            canvas.height

        );

        preview.src =
        canvas.toDataURL("image/png");

        preview.style.display =
        "block";

    }

);