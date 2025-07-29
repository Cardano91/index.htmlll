// Oyun değişkenleri
let score = 0;
let gameInterval;
let player = document.getElementById("player");
let stars = document.getElementById("stars");
let scoreDisplay = document.getElementById("score");
let resultDiv = document.getElementById("result");
let irys;

// Yıldız oluşturma
function createStar() {
    const star = document.createElement("div");
    star.style.left = Math.random() * 800 + "px";
    star.style.top = Math.random() * 400 + "px";
    stars.appendChild(star);
    return star;
}

// Yıldız hareketi
function moveStars() {
    const starElements = stars.getElementsByTagName("div");
    for (let star of starElements) {
        let top = parseInt(star.style.top) + 5;
        if (top > 400) {
            star.remove();
            score += 1;
            scoreDisplay.textContent = `Skor: ${score}`;
            createStar();
        } else {
            star.style.top = top + "px";
        }
    }
}

// Oyuncuyu hareket ettirme
document.addEventListener("keydown", (e) => {
    let left = parseInt(player.style.left) || 380; // Orta başlangıç
    if (e.key === "ArrowRight" && left < 760) {
        player.style.left = `${left + 10}px`;
    }
    if (e.key === "ArrowLeft" && left > 0) {
        player.style.left = `${left - 10}px`;
    }
});

// Irys bağlantısını başlat
async function initIrys() {
    if (!window.ethereum) {
        alert("Lütfen MetaMask kurun!");
        return null;
    }
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const url = "https://node1.irys.xyz";
        const token = "ethereum"; // Ethereum ağını kullanıyoruz
        const provider = window.ethereum;
        const wallet = { provider };
        irys = new window.Irys({ url, token, wallet });
        return irys;
    } catch (error) {
        console.error("Irys başlatma hatası:", error);
        alert("Irys bağlantısı kurulamadı. Lütfen cüzdanınızı kontrol edin.");
        return null;
    }
}

// Skoru kaydet
async function saveScore() {
    if (!irys) irys = await initIrys();
    if (!irys) return;
    try {
        const tags = [
            { name: "Content-Type", value: "text/plain" },
            { name: "App-Name", value: "Uzay-Gemisi-Oyunu" },
            { name: "Score", value: score.toString() },
        ];
        const receipt = await irys.upload(`Skor: ${score}`, { tags });
        console.log("Skor kaydedildi, ID:", receipt.id);
        resultDiv.textContent = `Oyun bitti! Skor: ${score}. Blockchain ID: ${receipt.id}`;
    } catch (error) {
        console.error("Skor kaydetme hatası:", error);
        resultDiv.textContent = "Skor kaydedilemedi!";
    }
}

// Oyunu başlat
function startGame() {
    score = 0;
    scoreDisplay.textContent = `Skor: ${score}`;
    resultDiv.style.display = "none";
    for (let i = 0; i < 20; i++) createStar();
    gameInterval = setInterval(moveStars, 50);
}

// Oyunu bitir
function endGame() {
    clearInterval(gameInterval);
    resultDiv.style.display = "block";
    saveScore();
}

// Başlangıç
window.onload = () => {
    player.style.left = "380px"; // Orta başlangıç
    startGame();
    // Çarpışma testi (basit bir örnek)
    setInterval(() => {
        if (parseInt(player.style.left) < 50 && score > 50) {
            endGame();
        }
    }, 100);
};
