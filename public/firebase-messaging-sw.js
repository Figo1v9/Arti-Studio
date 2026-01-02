importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCoGhUm6ASdWLwXhI2oUd2egGOlGLNzVAc",
    authDomain: "arti-studio.firebaseapp.com",
    projectId: "arti-studio",
    storageBucket: "arti-studio.firebasestorage.app",
    messagingSenderId: "1099249852498",
    appId: "1:1099249852498:web:47ebbb66013b5d2768bf8b",
    measurementId: "G-WGXX9N6HK2"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png', // Fallback icon
        image: payload.notification.image
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
