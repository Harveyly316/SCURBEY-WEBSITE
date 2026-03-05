document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.terminal-section');
    const typingElements = document.querySelectorAll('.typing-effect');
    let typingDelay = 0;

    // --- Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('data-target');

            // Remove active from all links and sections
            navLinks.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Add active to clicked link
            e.target.classList.add('active');

            // Show the target section
            document.getElementById(targetId).classList.add('active');

            // Scroll to the active section (optional, can be smooth)
            document.getElementById(targetId).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // --- Typing Effect Logic ---
    const typeWriter = (element, text, delay) => {
        return new Promise(resolve => {
            let i = 0;
            element.classList.add('active-cursor'); // Show cursor
            const interval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(interval);
                    element.classList.remove('active-cursor'); // Hide cursor
                    resolve();
                }
            }, delay);
        });
    };

    const startTypingEffects = async () => {
        for (const el of typingElements) {
            const text = el.getAttribute('data-text');
            const delay = parseInt(el.getAttribute('data-delay') || 0); // Delay before starting this line
            const charDelay = 70; // Speed of typing each character

            // Clear initial text (if any) and wait for the line's specific delay
            el.textContent = '';
            await new Promise(resolve => setTimeout(resolve, delay));

            // Start typing
            await typeWriter(el, text, charDelay);

            // Add a small pause after each line is fully typed
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        // After all typing effects are done, activate the last cursor
        const lastTypingElement = typingElements[typingElements.length - 1];
        if (lastTypingElement) {
            lastTypingElement.classList.add('active-cursor');
            lastTypingElement.classList.remove('blink'); // Ensure it stays visible
        }
    };

    // Only start typing effect on the hero section when it's first loaded
    if (document.getElementById('hero').classList.contains('active')) {
        startTypingEffects();
    }


    // --- Placeholder for Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Sending message...';
            // In a real scenario, you'd send this data to a backend or a service like Formspree.io
            // For example:
            /*
            const formData = new FormData(contactForm);
            try {
                const response = await fetch('YOUR_FORM_SUBMISSION_ENDPOINT', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (response.ok) {
                    formStatus.textContent = 'Message sent successfully! Thank you.';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        formStatus.textContent = data.errors.map(error => error.message).join(', ');
                    } else {
                        formStatus.textContent = 'Oops! There was a problem sending your message.';
                    }
                }
            } catch (error) {
                formStatus.textContent = 'Network error. Please try again later.';
            }
            */
            // Simulate a delay for the terminal feel
            await new Promise(resolve => setTimeout(resolve, 1500));
            formStatus.textContent = '>>> Message received. Thank you for connecting. <<<';
            contactForm.reset();
        });
    }

    // --- Initial Active State ---
    // Ensure the first section and nav link are active on load
    document.querySelector('.nav-link[data-target="hero"]').classList.add('active');
    document.getElementById('hero').classList.add('active');
});
