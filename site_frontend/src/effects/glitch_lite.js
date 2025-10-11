/**
 * Glitch Art Payload Lite
 */

(function(window) {
    const main = () => {
        if (window.GlitchArt && window.GlitchArt.isActive) {
            return;
        }

        const style = document.createElement('style');
        style.textContent = `
            .text-corrupt { position: relative; display: inline-block; }
            .text-corrupt::before, .text-corrupt::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; }
            .text-corrupt::before { left: 8px; text-shadow: -5px 0 #ff00ff, 3px 2px #ff0000; clip: rect(44px, 450px, 56px, 0); animation: corrupt-anim-1 0.4s infinite linear alternate-reverse; }
            .text-corrupt::after { left: -8px; text-shadow: -5px 0 #00ffff, -3px 2px #00ff00; clip: rect(44px, 450px, 56px, 0); animation: corrupt-anim-2 0.4s infinite linear alternate-reverse; }
            @keyframes corrupt-anim-1 { 0% { clip: rect(42px, 9999px, 44px, 0); } 10% { clip: rect(12px, 9999px, 59px, 0); } 20% { clip: rect(66px, 9999px, 89px, 0); } 30% { clip: rect(17px, 9999px, 34px, 0); } 40% { clip: rect(87px, 9999px, 40px, 0); } 50% { clip: rect(50px, 9999px, 75px, 0); } 60% { clip: rect(23px, 9999px, 55px, 0); } 70% { clip: rect(70px, 9999px, 95px, 0); } 80% { clip: rect(8px, 9999px, 28px, 0); } 90% { clip: rect(45px, 9999px, 60px, 0); } 100% { clip: rect(32px, 9999px, 48px, 0); } }
            @keyframes corrupt-anim-2 { 0% { clip: rect(65px, 9999px, 100px, 0); } 10% { clip: rect(25px, 9999px, 45px, 0); } 20% { clip: rect(78px, 9999px, 88px, 0); } 30% { clip: rect(5px, 9999px, 15px, 0); } 40% { clip: rect(52px, 9999px, 72px, 0); } 50% { clip: rect(38px, 9999px, 58px, 0); } 60% { clip: rect(82px, 9999px, 92px, 0); } 70% { clip: rect(15px, 9999px, 35px, 0); } 80% { clip: rect(60px, 9999px, 80px, 0); } 90% { clip: rect(28px, 9999px, 48px, 0); } 100% { clip: rect(70px, 9999px, 85px, 0); } }
        `;
        document.head.appendChild(style);

        const applyTextCorruption = () => {
            const textElements = document.querySelectorAll('h1, h2, h3, p, a, button, span, li');
            if (textElements.length === 0) return;
            const el = textElements[~~(Math.random() * textElements.length)];
            if (!el.innerText || el.innerText.length < 3) return;
            const originalHTML = el.innerHTML;
            el.setAttribute('data-text', el.innerText);
            el.classList.add('text-corrupt');
            setTimeout(() => {
                el.classList.remove('text-corrupt');
                el.removeAttribute('data-text');
                el.innerHTML = originalHTML;
            }, 500);
        };
        
        window.GlitchArt = {
            isActive: true,
            textCorrupt: applyTextCorruption,
        };

        const effectConfig = {
            textCorrupt: { func: window.GlitchArt.textCorrupt, cooldown: 4400, chance: 0.8, lastRun: 0 },
        };

        let isTabActive = !document.hidden;
        let lastFrameTime = 0;
        let animationFrameId = null;

        function glitchLoop(currentTime) {
            animationFrameId = requestAnimationFrame(glitchLoop);
            if (currentTime - lastFrameTime < 1000) return;

            lastFrameTime = currentTime;
            if (!isTabActive) return;

            for (const key in effectConfig) {
                const effect = effectConfig[key];
                if (currentTime - effect.lastRun > effect.cooldown) {
                    if (Math.random() < effect.chance) {
                        effect.func();
                        effect.lastRun = currentTime;
                    }
                }
            }
        }

        document.addEventListener('visibilitychange', () => {
            isTabActive = !document.hidden;
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                const now = performance.now();
                for (const key in effectConfig) {
                    effectConfig[key].lastRun = now;
                }
                lastFrameTime = now;
                glitchLoop(now);
            }
        });

        glitchLoop(performance.now());
    };

    main();

})(window);