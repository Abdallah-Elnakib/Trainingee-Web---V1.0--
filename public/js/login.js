const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    togglePassword.querySelector('i').classList.toggle('fa-eye');
    togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
});

const loginForm = document.getElementById("submit");
loginForm.addEventListener("click", async (event) => {
    event.preventDefault();
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    fetch("http://127.0.0.1:3000/api/auth/Login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })
        .then(async (response) => {
            if (response.status === 200) {
                await Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Login successful!",
                    showConfirmButton: false,
                    timer: 1500,
                    confirmButtonText: "OK",
                });
                window.location.href = "http://127.0.0.1:3000/api/auth/home";
                return;
            }
            else {
                return response.json().then((data) => {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: data.message,
                        confirmButtonText: "OK",
                    });
                });
            }
        })

        .catch((error) => {
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
                confirmButtonText: "OK",
            });
        });
});

