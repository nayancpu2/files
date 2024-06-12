const PASSWORD = 'yourpassword';  // Set your password here
const GITHUB_TOKEN = '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';  // Set your GitHub token here
const REPO_OWNER = 'nayancpu2';
const REPO_NAME = 'files';
const GITHUB_PAGES_URL = `https://${REPO_OWNER}.github.io/${REPO_NAME}/uploads/`;

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
            const fileUrl = `${GITHUB_PAGES_URL}${file.name}`;
            const li = document.createElement('li');
            li.innerHTML = `<a href="${fileUrl}" target="_blank">${file.name}</a>
                            <button onclick="copyLink('${fileUrl}')">Copy Link</button>`;
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
