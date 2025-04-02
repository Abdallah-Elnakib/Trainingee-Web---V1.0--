const resetPasswordForm = document.getElementById('sendMyPassword');

resetPasswordForm.addEventListener('click', async () => {
    const email = document.getElementsByClassName('passInput')[0].value;
    // const response = await fetch('/forgot-password', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ email }), 
    // }); 
    console.log(email);
});