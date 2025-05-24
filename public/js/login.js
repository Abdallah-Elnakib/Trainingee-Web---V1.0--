let isAdminLogin = true;

const adminLoginBtn = document.getElementById('adminLoginBtn');
const studentLoginBtn = document.getElementById('studentLoginBtn');

adminLoginBtn.addEventListener('click', function () {
    setLoginMode(true);
});

studentLoginBtn.addEventListener('click', function () {
    setLoginMode(false);
});

function setLoginMode(isAdmin) {
    isAdminLogin = isAdmin;

    if (isAdmin) {
        adminLoginBtn.classList.add('active');
        studentLoginBtn.classList.remove('active');
        document.getElementById('username').placeholder = 'Email or Username';
    } else {
        adminLoginBtn.classList.remove('active');
        studentLoginBtn.classList.add('active');
        document.getElementById('username').placeholder = 'Student Username';
    }
}

const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    togglePassword.querySelector('i').classList.toggle('fa-eye');
    togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
});

const loginForm = document.getElementById("submit");
loginForm.addEventListener("click", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Please enter your username and password",
            confirmButtonText: "OK",
        });
        return;
    }

    const endpoint = isAdminLogin ?
        "http://127.0.0.1:3000/api/auth/Login" :
        "http://127.0.0.1:3000/api/auth/student-login";

    // إعداد بيانات الطلب بناءً على وضع تسجيل الدخول
    const loginData = isAdminLogin ?
        { email: username, password } :
        { username, password };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.status === 200) {
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('accessToken', data.ACCESS_TOKEN);
            localStorage.setItem('refreshToken', data.REFRESH_TOKEN);

            await Swal.fire({
                icon: "success",
                title: "Success",
                text: "Successfully logged in!",
                showConfirmButton: false,
                timer: 1500,
                confirmButtonText: "Okay",
            });

            window.location.href = isAdminLogin ?
                "http://127.0.0.1:3000/api/auth/home" :
                "http://127.0.0.1:3000/api/auth/student-dashboard";

        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: data.message || "Login failed",
                confirmButtonText: "OK",
            });
        }
    } catch (error) {
        console.error('Error during login:', error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "An error occurred while connecting to the server",
            confirmButtonText: "OK",
        });
    }
});

