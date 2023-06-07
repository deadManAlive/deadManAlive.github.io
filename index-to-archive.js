window.addEventListener("DOMContentLoaded", (event) => {
    const __args = window.location.hash;
    const __ikv = __args.slice(1).split('=');

    if (__ikv.length != 2 || __ikv[0] != 'category') {
        return;
    }
    const __icat = decodeURIComponent(__ikv[1]);
    const __arch = `/archive.html#category=${encodeURIComponent(__icat)}`;

    console.log(__arch);

    window.location.href = __arch;
});