document.getElementById('submitBtn').addEventListener('click', async () => {
    const hero_section_image = document.getElementById('hero_section_image');
    const hero_section_description = document.getElementById('hero_section_description').textContent;

    const formData = new FormData();
    formData.append('hero_section_image', hero_section_image.files[0]);
    formData.append('hero_section_description', hero_section_description);

    try {
        const response = await fetch('/profile', {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.error('Error:', error);
    }
});
