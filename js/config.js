"use strict";

/**
 * Uygulama genelinde kullanılan yapılandırma değerleri.
 *
 * Bu değerler uygulamanın farklı bölümlerinde tekrar tekrar
 * yazılmak yerine tek bir merkezi noktadan yönetilir.
 */
export const APP_CONFIG = Object.freeze({
    maxPhotos: 4,
    countdownStart: 3,
    cameraLoadTimeoutMs: 10000,
    countdownStepMs: 1000
});

/**
 * Kullanıcıya gösterilen durum mesajlarının görsel türleri.
 *
 * Magic string kullanımını azaltır ve yazım hatalarının
 * önüne geçer.
 */
export const STATUS_TYPE = Object.freeze({
    DEFAULT: "default",
    SUCCESS: "success",
    ERROR: "error"
});

/**
 * Tarayıcıdan istenecek kamera özellikleri.
 *
 * facingMode:
 * Kullanıcının ön kamerasını tercih eder.
 *
 * width ve height:
 * Tarayıcıdan mümkünse 1280 × 960 çözünürlük ister.
 * Bunlar kesin zorunluluk değil, ideal değerlerdir.
 *
 * audio:
 * Momenta yalnızca fotoğraf çektiği için mikrofon erişimi istemez.
 */
export const CAMERA_CONSTRAINTS = Object.freeze({
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