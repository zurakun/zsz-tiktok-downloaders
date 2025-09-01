document.addEventListener('DOMContentLoaded', function() {
    
    const yourContactLink = "https://wa.me/6283819371450?text=min+web+nya+eror+benerin+lah"; 
    const yourDonateLink = "https://trakteer.id/zuraofc"; 

    
    const searchButton = document.getElementById('search-button');
    const urlInput = document.getElementById('url-input');
    const loader = document.getElementById('loader');
    const errorBox = document.getElementById('error-box');
    const errorText = document.getElementById('error-text');
    const resultCard = document.getElementById('result-card');
    const mediaTitle = document.getElementById('media-title');
    const videoBtn = document.getElementById('video-btn');
    const mp3Btn = document.getElementById('mp3-btn');
    
    // Atur link donasi & kontak
    document.getElementById('contact-owner-link').href = yourContactLink;
    document.getElementById('donate-link').href = yourDonateLink;
    document.getElementById('chat-link').href = yourContactLink;

    // Atur copyright
    document.getElementById('copyright-year').textContent = new Date().getFullYear();

    // Tambahkan event listener ke tombol search
    searchButton.addEventListener('click', handleSearch);

    async function handleSearch() {
        const url = urlInput.value.trim();
        if (!url) {
            showError("Please paste a TikTok URL first.");
            return;
        }

        // 1. Reset tampilan
        hideError();
        resultCard.classList.add('hidden');
        loader.classList.remove('hidden');
        searchButton.disabled = true;
        searchButton.innerText = 'Fetching...';

        try {
            // 2. Hubungi backend
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const result = await response.json();
            if (!response.ok || result.error) {
                throw new Error(result.error || 'Failed to get download links.');
            }

            // 3. Tampilkan hasil
            displayResult(result);

        } catch (error) {
            showError(error.message);
        } finally {
            // 4. Selalu kembalikan UI ke kondisi normal
            loader.classList.add('hidden');
            searchButton.disabled = false;
            searchButton.innerText = 'Fetch';
        }
    }

    function displayResult(data) {
        mediaTitle.textContent = data.title;
        
        const videoFilename = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
        const audioFilename = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;

        // Atur tombol Video MP4
        videoBtn.href = data.noWatermarkUrl || '#';
        videoBtn.setAttribute('download', videoFilename);
        // Gunakan display none/flex daripada class hidden untuk tombol individual
        videoBtn.style.display = data.noWatermarkUrl ? 'block' : 'none';

        // Atur tombol Audio MP3
        mp3Btn.href = data.mp3Url || '#';
        mp3Btn.setAttribute('download', audioFilename);
        mp3Btn.style.display = data.mp3Url ? 'block' : 'none';

        // Tampilkan kartu hasil dengan transisi
        resultCard.classList.remove('hidden');
    }

    function showError(message) {
        errorText.textContent = `Error: ${message}`;
        errorBox.classList.remove('hidden');
    }

    function hideError() {
        errorBox.classList.add('hidden');
    }
});