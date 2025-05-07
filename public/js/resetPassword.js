document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Reset token is missing. Please request a new password reset link.',
        });
        return;
    }

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        if (!newPassword || !confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please enter both password fields',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Passwords do not match',
            });
            return;
        }

        if (newPassword.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password must be at least 8 characters long',
            });
            return;
        }
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Resetting...';
            
            const response = await fetch(`/api/auth/reset-password?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    newPassword,
                    confirmPassword
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Your password has been reset successfully',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                });
                window.location.href = '/api/auth/login';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to reset password',
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
            submitButton.textContent = 'Reset Password';
        }
    });
});
