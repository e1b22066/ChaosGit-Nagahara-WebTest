document.getElementById('chaosButton').addEventListener('click', () => {
    fetch('/rmGitdir', {
        method: 'POST'
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to destroy .git directory');
    });
});
