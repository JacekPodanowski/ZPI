(function(window) {
    const initializeButtonShrink = () => {
        const buttons = document.querySelectorAll('button, [role="button"], .btn, .button');

        const handleShrinkClick = (event) => {
            event.preventDefault();
            const button = event.currentTarget;

            // Remove the listener to prevent multiple rapid clicks during the animation
            button.removeEventListener('click', handleShrinkClick);

            button.classList.add('glitching');

            // Timeout to allow the shrink animation to play
            setTimeout(() => {
                // Programmatically click the button to trigger its original action
                button.click();

                // Timeout to allow the original action to complete and then reset the button's state
                setTimeout(() => {
                    button.classList.remove('glitching');
                    // Re-add the event listener for future clicks
                    button.addEventListener('click', handleShrinkClick);
                }, 400);

            }, 350);
        };

        buttons.forEach(button => {
            button.classList.add('button-shrink-effect');
            button.addEventListener('click', handleShrinkClick);
        });
    };

    // Initialize the effect when the script loads
    initializeButtonShrink();

})(window);