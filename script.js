const PASSWORD = 'yourpassword';  // Set your password here

function login() {
    const passwordInput = document.getElementById('password').value;
    if (passwordInput === PASSWORD) {
        localStorage.setItem('authenticated', 'true');
        showUploadSection();
    } else {
        alert('Incorrect password');
    }
}

function showUploadSection() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    loadFileList();
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const files = JSON.parse(localStorage.getItem('files')) || [];
            files.push({ name: file.name, content: e.target.result });
            localStorage.setItem('files', JSON.stringify(files));
            loadFileList();
        };
        reader.readAsDataURL(file);
    }
}

function loadFileList() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    const files = JSON.parse(localStorage.getItem('files')) || [];
    files.forEach((file, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${file.content}" download="${file.name}">${file.name}</a>
                        <button onclick="deleteFile(${index})">Delete</button>`;
        fileList.appendChild(li);
    });
}

function deleteFile(index) {
    const files = JSON.parse(localStorage.getItem('files')) || [];
    files.splice(index, 1);
    localStorage.setItem('files', JSON.stringify(files));
    loadFileList();
}

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('authenticated') === 'true') {
        showUploadSection();
    }
});
