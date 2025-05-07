document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit');
    const emailInput = document.getElementById('email');

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter your email address',
            });
            return;
        }
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            const response = await fetch('/api/auth/forgot-Password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            
            const data = await response.json();
            
            if (data.message === "Reset password email sent successfully") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password reset link has been sent to your email',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                });
                window.location.href = "/api/auth/login";
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to send reset link',
                    showConfirmButton: true,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
            });
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reset Link';
        }
    });
});
