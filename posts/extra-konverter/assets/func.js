window.addEventListener('message', (e) => {
    const height = e.data.bconvHeight;

    if (height) {
        const frame = document.getElementById("bconv");
        if (frame) {
            frame.style.height = (1.1 * height) + 'px';
        }
    }
});