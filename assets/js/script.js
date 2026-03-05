document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const buttons = document.querySelectorAll('[data-section]');
    const downloadResumeBtn = document.getElementById('download-resume-btn'); // New: Get download button

    // Function to show section
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => section.classList.remove('active'));

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            window.scrollTo(0, 0); // Scroll to top
        }

        // Update nav items
        navItems.forEach(item => item.classList.remove('active'));
        const activeNav = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNav) activeNav.classList.add('active');
    }

    // Navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Button click handlers (for internal navigation)
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (button.tagName === 'BUTTON' && button.hasAttribute('data-section')) {
                e.preventDefault();
                const sectionId = button.getAttribute('data-section');
                showSection(sectionId);
            }
        });
    });

    // New: Download Resume functionality
    if (downloadResumeBtn) {
        downloadResumeBtn.addEventListener('click', () => {
            // This URL needs to point to where the PDF is hosted.
            // On GitHub Pages, it would typically be in your repo's root or a subfolder.
            // Assuming it's in the root of your published GitHub Pages site:
            const resumeUrl = 'Harvey Ly Resume.docx.pdf'; // Adjust this path if the PDF is in 'assets/' or another folder
            const link = document.createElement('a');
            link.href = resumeUrl;
            link.download = 'Harvey_Ly_Resume.pdf'; // Name the downloaded file
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            const formStatus = document.getElementById('form-status');

            formStatus.textContent = 'Sending...';

            // IMPORTANT: Replace 'https://formspree.io/f/YOUR_FORM_ID' with your actual Formspree endpoint.
            // You'll need to create an account on Formspree.io and set up a form to get this URL.
            const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID'; 

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('subject', subject);
            formData.append('message', message);

            try {
                const response = await fetch(formspreeEndpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = '✓ Message sent successfully!';
                    formStatus.style.color = '#10a37f';
                    contactForm.reset();
                    setTimeout(() => {
                        formStatus.textContent = '';
                    }, 5000);
                } else {
                    const data = await response.json();
                    if (data && data.errors) {
                        formStatus.textContent = `✗ Error: ${data.errors.map(err => err.message).join(', ')}`;
                    } else {
                        formStatus.textContent = '✗ Failed to send message. Please try again.';
                    }
                    formStatus.style.color = '#e94560';
                }
            } catch (error) {
                formStatus.textContent = '✗ Error sending message. Please try again later.';
                formStatus.style.color = '#e94560';
            }
        });
    }

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Active nav indicator on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Adjust this offset based on your navbar height to make sure the active state changes correctly
            if (pageYOffset >= sectionTop - 150) { 
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === current) {
                item.classList.add('active');
            }
        });
    });
});
