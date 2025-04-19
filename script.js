import { mapClasses, previews } from "./data.js";

document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");
    const previewBg = document.querySelector(".preview-bg");
    const items = document.querySelectorAll(".item");
    let activePreview = document.querySelector(".preview.default");

    let isMouseOverItem = false;
    const defaultClipPaths = {
        "variant-1": "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        "variant-2": "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        "variant-3": "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
    };

    const variantTransforms = {
        "variant-1": {
            title: { x: 75, opacity: 0 },
            tags: { x: -75, opacity: 0 },
            opacity: { x: -75, opacity: 0 },
        },
        "variant-2": {
            title: { x: -75, opacity: 0 },
            tags: { x: -75, opacity: 0 },
            opacity: { x: 75, opacity: 0 },
        },
        "variant-3": {
            title: { x: 75, opacity: 0 },
            tags: { x: 75, opacity: 0 },
            opacity: { x: 75, opacity: 0 },
        },
    };

    function getDefaultClipPath(previewElement) {
        for (const variant in defaultClipPaths) {
            if (previewElement.classList.contains(variant)) {
                return defaultClipPaths[variant];
            }
        }
        return "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)";
    }

    function applyVariantStyles(previewElement) {
        const variant = previewElement.className.split(" ").find(className => className.startsWith("variant-"));
        if (variant && variantTransforms[variant]) {
            Object.entries(variantTransforms[variant]).forEach(([elementClass, transform]) => {
                const element = previewElement.querySelector(`.preview-${elementClass}`);
                if (element) {
                    gsap.set(element, transform);
                }
            });
        }
    }

    function changeBg(newSrc, isVideo = false, title = "", tags = "") {
        // Remove existing content from previewBg
        while (previewBg.firstChild) {
            previewBg.removeChild(previewBg.firstChild);
        }
    
        let mediaElement;
        if (isVideo) {
            // Create video element
            mediaElement = document.createElement("video");
            mediaElement.src = newSrc;
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.muted = true;
        } else {
            // Create image element
            mediaElement = document.createElement("img");
            mediaElement.src = newSrc;
        }
    
        // Apply common styles
        mediaElement.style.position = "absolute";
        mediaElement.style.top = "0";
        mediaElement.style.left = "0";
        mediaElement.style.width = "100%";
        mediaElement.style.height = "100%";
        mediaElement.style.objectFit = "cover";
        mediaElement.style.opacity = "0"; // Start invisible
        mediaElement.style.zIndex = "1";
    
        // Append media element
        previewBg.appendChild(mediaElement);
    
        // Create Title & Tags
        const textContainer = document.createElement("div");
        textContainer.className = "preview-text";
        textContainer.style.position = "absolute";
        textContainer.style.bottom = "50%";
        textContainer.style.left = "30%";
        textContainer.style.color = "white";
        textContainer.style.textShadow = "2px 2px 10px rgba(0,0,0,0.7)";
        textContainer.style.opacity = "0";
        textContainer.style.zIndex = "10";
    
        const titleElement = document.createElement("h1");
        titleElement.textContent = title;
        titleElement.style.fontSize = "4rem";
        titleElement.style.marginBottom = "20px";
    
        const tagsElement = document.createElement("p");
        tagsElement.textContent = tags;
        tagsElement.style.fontSize = "1.2rem";
        tagsElement.style.opacity = "1";
        tagsElement.style.marginLeft = "10px";

        // Append text elements
        textContainer.appendChild(titleElement);
        textContainer.appendChild(tagsElement);
        previewBg.appendChild(textContainer);
    
        // Fade in animation
        gsap.to(mediaElement, {  opacity: 1, duration: 1 });
        gsap.to(textContainer, { opacity: 1, duration: 1, delay: 0.5 });
    }

    previews.forEach((preview, index) => {
        const previewElement = document.createElement("div");
        previewElement.className = `preview ${mapClasses[index]} preview-${index + 1}`;
        previewElement.innerHTML = `
            <div class="preview-img"><img src="${preview.img}" alt=""/></div>
            <div class="preview-title"><h1>${preview.title}</h1></div>
            <div class="preview-tags"><p>${preview.tags}</p></div>
            <div class="preview-description"><p>${preview.description}</p></div>`;
    
        container.appendChild(previewElement);
        applyVariantStyles(previewElement);
    
        // Hide all previews except the default one
        if (!previewElement.classList.contains("default")) {
            gsap.set(previewElement, { opacity: 0 });
        }
    });
    

    items.forEach((item, index) => {
        item.addEventListener("mouseenter", () => {
            isMouseOverItem = true;
            const newBg = `./assets/bg-${index + 1}.jpg`;
            changeBg(newBg);

            const newActivePreview = document.querySelector(`.preview-${index + 1}`);
            if (activePreview && activePreview !== newActivePreview) {
                const previousActivePreviewImg = activePreview.querySelector(".preview-img");
                const previousDefaultClipPath = getDefaultClipPath(activePreview);
                gsap.to(previousActivePreviewImg, { clipPath: previousDefaultClipPath, duration: 0.75,ease:"power3.out", });

                gsap.to(activePreview, { opacity: 0, duration: 0.3, delay: 0.2 });
                applyVariantStyles(activePreview, true);
            }

            gsap.to(newActivePreview, { opacity: 1, duration: 0.1 });
            activePreview = newActivePreview;

            const elementsToAnimate = ["title", "tags", "opacity"];
            elementsToAnimate.forEach((el) => {
                const element = newActivePreview.querySelector(`.preview-${el}`);
                if (element) {
                    gsap.to(element, { x: 0, y: 0, duration: 0.5, opacity: 1 });
                }
            });

            const activePreviewImg = activePreview.querySelector(".preview-img");
            gsap.to(activePreviewImg, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1, ease: "power3.out" });
        });

        item.addEventListener("mouseleave", () => {
            isMouseOverItem = false;
            applyVariantStyles(activePreview, true);
        
            setTimeout(() => {
                if (!isMouseOverItem) {
                    changeBg("./assets/bg.mp4", true, "Welcome to Our Lab", "Explore | Discover | Enjoy"); // Use video on mouse leave
        
                    if (activePreview) {
                        gsap.to(activePreview, { opacity: 0, duration: 0.1 });
                        const defaultPreview = document.querySelector(".preview.default");
                        gsap.to(defaultPreview, { opacity: 1, duration: 0.1 });
                        activePreview = defaultPreview;
        
                        const activePreviewImg = activePreview.querySelector(".preview-img");
                        const defaultClipPath = getDefaultClipPath(activePreview);
                        gsap.to(activePreviewImg, { clipPath: defaultClipPath, duration: 1, ease: "power3.out" });
                    }
                }
            }, 10);
        });
    });
});
