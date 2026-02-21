const audio = document.getElementById("bgmusic");
const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");
const enterScreen = document.getElementById("enter-screen");
const typingElement = document.getElementById("typing-text");

// აკრეფის ანიმაციის პარამეტრები
const text = "NikMax";
let index = 0;
let isDeleting = false;
let speed = 200;

function typeEffect() {
    const currentText = isDeleting ? text.substring(0, index - 1) : text.substring(0, index + 1);
    typingElement.textContent = currentText;

    if (!isDeleting && currentText === text) {
        // როცა დაამთავრებს წერას, დაელოდოს 2 წამი
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && currentText === "") {
        // როცა წაშლის, დაიწყოს თავიდან
        isDeleting = false;
        speed = 500;
        index = 0;
    } else {
        // წერის და წაშლის სიჩქარე
        speed = isDeleting ? 100 : 200;
        index = isDeleting ? index - 1 : index + 1;
    }

    setTimeout(typeEffect, speed);
}

// ანიმაციის გაშვება
document.addEventListener("DOMContentLoaded", typeEffect);

// მუსიკის ლოგიკა
let savedVolume = localStorage.getItem("musicVolume");
let savedMuted = localStorage.getItem("musicMuted") === "true";

if (savedVolume === null || parseFloat(savedVolume) <= 0 || savedMuted) {
    audio.volume = 0.1;
    savedMuted = false;
} else {
    audio.volume = parseFloat(savedVolume);
}

volumeSlider.value = audio.volume * 100;
audio.muted = savedMuted;
updateIcon(audio.volume);

function updateIcon(volumeValue) {
    if (audio.muted || volumeValue === 0) {
        volumeIcon.className = "fas fa-volume-mute";
    } else if (volumeValue <= 0.5) {
        volumeIcon.className = "fas fa-volume-down";
    } else {
        volumeIcon.className = "fas fa-volume-up";
    }
}

function startExperience() {
    if (enterScreen.style.display === "none") return;
    if (audio.volume <= 0) {
        audio.volume = 0.1;
        volumeSlider.value = 10;
    }
    audio.muted = false;
    audio.play().catch(() => console.log("Audio blocked by browser"));
    enterScreen.style.opacity = "0";
    setTimeout(() => { enterScreen.style.display = "none"; }, 700);
    updateIcon(audio.volume);
}

enterScreen.addEventListener("click", startExperience);
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startExperience();
});

// ხმის გლუვი ცვლილებისთვის საჭირო ცვლადები
let fadeInterval;
let preMuteVolume = 0.5; // ინახავს ხმას დადუმებამდე

volumeSlider.addEventListener("input", function () {
    const volumeValue = this.value / 100;
    audio.volume = volumeValue;
    audio.muted = (volumeValue === 0);
    
    if (volumeValue > 0) preMuteVolume = volumeValue; // ვიმახსოვრებთ ბოლო ხმას
    
    localStorage.setItem("musicVolume", volumeValue);
    localStorage.setItem("musicMuted", audio.muted);
    updateIcon(volumeValue);
});

volumeIcon.addEventListener("click", () => {
    clearInterval(fadeInterval); // ვაჩერებთ წინა ანიმაციას თუ მიმდინარეობს

    if (audio.muted || audio.volume <= 0.01) {
        // ხმის ჩართვა (Fade In)
        audio.muted = false;
        let target = preMuteVolume > 0.01 ? preMuteVolume : 0.5;
        animateVolume(target);
    } else {
        // ხმის გამორთვა (Fade Out)
        preMuteVolume = audio.volume;
        animateVolume(0, true);
    }
});

function animateVolume(target, muteAfter = false) {
    fadeInterval = setInterval(() => {
        let current = audio.volume;
        // თუ მიზანთან ახლოსაა, ვასრულებთ
        if (Math.abs(target - current) < 0.02) {
            audio.volume = target;
            volumeSlider.value = target * 100;
            if (muteAfter) audio.muted = true;
            updateIcon(audio.volume);
            localStorage.setItem("musicMuted", audio.muted);
            localStorage.setItem("musicVolume", audio.volume);
            clearInterval(fadeInterval);
        } else {
            // ნელ-ნელა ვუახლოვდებით მიზანს
            let step = target > current ? 0.02 : -0.02;
            let next = current + step;
            
            // საზღვრების დაცვა
            if (next < 0) next = 0;
            if (next > 1) next = 1;

            audio.volume = next;
            volumeSlider.value = next * 100;
            updateIcon(audio.volume);
        }
    }, 10); // 10 მილიწამი ყოველ ნაბიჯზე
}