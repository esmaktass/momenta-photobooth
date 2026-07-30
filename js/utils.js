"use strict";

/**
 * Belirtilen süre boyunca bekleyen bir Promise döndürür.
 *
 * Geri sayım gibi zaman kontrollü işlemleri daha okunabilir
 * biçimde yazmak için kullanılır.
 *
 * @param {number} milliseconds
 * Beklenecek süre, milisaniye cinsinden.
 *
 * @returns {Promise<void>}
 */
export function delay(milliseconds) {
    if (
        !Number.isFinite(milliseconds) ||
        milliseconds < 0
    ) {
        return Promise.reject(
            new TypeError(
                "Bekleme süresi sıfır veya pozitif bir sayı olmalıdır."
            )
        );
    }

    return new Promise((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });
}

/**
 * Verilen kaynaktan bir HTMLImageElement oluşturur ve
 * görüntü yüklenene kadar bekler.
 *
 * Canvas üzerine fotoğraf çizmeden önce görüntünün tamamen
 * yüklenmiş olması gerekir.
 *
 * @param {string} source
 * Görüntünün URL veya data URL değeri.
 *
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(source) {
    if (
        typeof source !== "string" ||
        source.trim() === ""
    ) {
        return Promise.reject(
            new TypeError(
                "Görüntü kaynağı geçerli bir string olmalıdır."
            )
        );
    }

    return new Promise((resolve, reject) => {
        const image = new Image();

        image.addEventListener(
            "load",
            () => {
                resolve(image);
            },
            {
                once: true
            }
        );

        image.addEventListener(
            "error",
            () => {
                reject(
                    new Error(
                        "Fotoğraf yüklenemedi."
                    )
                );
            },
            {
                once: true
            }
        );

        image.src = source;
    });
}

/**
 * Bir sayısal değeri belirlenen minimum ve maksimum
 * sınırlar arasında tutar.
 *
 * Örneğin:
 * clamp(15, 0, 10) sonucu 10 olur.
 *
 * @param {number} value
 * Sınırlandırılacak sayı.
 *
 * @param {number} minimum
 * İzin verilen en küçük değer.
 *
 * @param {number} maximum
 * İzin verilen en büyük değer.
 *
 * @returns {number}
 */
export function clamp(value, minimum, maximum) {
    if (
        !Number.isFinite(value) ||
        !Number.isFinite(minimum) ||
        !Number.isFinite(maximum)
    ) {
        throw new TypeError(
            "Clamp değerlerinin tamamı sayı olmalıdır."
        );
    }

    if (minimum > maximum) {
        throw new RangeError(
            "Minimum değer maksimum değerden büyük olamaz."
        );
    }

    return Math.min(
        Math.max(value, minimum),
        maximum
    );
}

/**
 * Verilen canvas elementini PNG data URL değerine dönüştürür.
 *
 * @param {HTMLCanvasElement} canvas
 * Dönüştürülecek canvas elementi.
 *
 * @returns {string}
 */
export function canvasToPngDataUrl(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new TypeError(
            "PNG dönüşümü için geçerli bir canvas gereklidir."
        );
    }

    return canvas.toDataURL("image/png");
}

/**
 * Bir data URL değerini kullanıcının cihazına dosya
 * olarak indirmek için geçici bir bağlantı oluşturur.
 *
 * @param {string} dataUrl
 * İndirilecek dosyanın data URL değeri.
 *
 * @param {string} fileName
 * İndirilecek dosyanın adı.
 *
 * @returns {void}
 */
export function downloadDataUrl(
    dataUrl,
    fileName
) {
    if (
        typeof dataUrl !== "string" ||
        dataUrl.trim() === ""
    ) {
        throw new TypeError(
            "İndirilecek veri geçerli bir data URL olmalıdır."
        );
    }

    if (
        typeof fileName !== "string" ||
        fileName.trim() === ""
    ) {
        throw new TypeError(
            "Dosya adı boş bırakılamaz."
        );
    }

    const downloadLink =
        document.createElement("a");

    downloadLink.href = dataUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.remove();
}