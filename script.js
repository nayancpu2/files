const PASSWORD = 'yourpassword';  // Set your password here
const GITHUB_TOKEN = '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';  // Set your GitHub token here
const REPO_OWNER = 'nayancpu2';
const REPO_NAME = 'files';

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

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const content = await fileToBase64(file);
        const path = `uploads/${file.name}`;
        const message = `Add ${file.name}`;
        const sha = await getFileSHA(path);

        const body = {
            message: message,
            content: content,
            sha: sha
        };

        fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(response => {
            if (response.ok) {
                loadFileList();
            } else {
                alert('File upload failed');
            }
        });
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(btoa(reader.result));
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
}

async function getFileSHA(path) {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        return data.sha;
    }
    return null;
}

function loadFileList() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/uploads`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`
        }
    }).then(response => response.json()).then(files => {
        files.forEach(file => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>
                            <button onclick="copyLink('${file.download_url}')">Copy Link</button>`;
            fileList.appendChild(li);
        });
    });
}

function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard');
    }, () => {
        alert('Failed to copy link');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('authenticated') === 'true') {
        showUploadSection();
    }
});
